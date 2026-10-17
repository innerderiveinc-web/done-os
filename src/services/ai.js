import { safeUUID } from '../config.js';

export class AIParserProvider {
  async parseNaturalRequest(text) {
    throw new Error('Not implemented');
  }
}

export class MockAIParserProvider extends AIParserProvider {
  async parseNaturalRequest(text) {
    if (!text || !text.trim()) {
      return null;
    }
    const clean = text.trim();
    const lower = clean.toLowerCase();

    // 1. Recipient extraction
    // Patterns: "Rahul se", "Amit ko", "from Sara", "for Orbit Foods", "Vikram se mangwana"
    let recipient = '';
    const recipientPatterns = [
      /(?:from|for|to|with)\s+([A-Z][a-zA-Z0-9\s]{1,30}?)(?:\s+(?:by|due|on|before|se|ko|GST|PAN|₹|invoice|amount|advance|approval|confirm)|$)/i,
      /([A-Z][a-zA-Z0-9\s]{1,30}?)\s+(?:se|ko|from)\s+/i,
      /([A-Z][a-zA-Z0-9]{1,25})\s+(?:needs to|should|must)/i
    ];

    for (const pat of recipientPatterns) {
      const match = clean.match(pat);
      if (match && match[1]) {
        recipient = match[1].trim();
        break;
      }
    }
    if (!recipient) {
      // Fallback: extract first capitalized word
      const capMatch = clean.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/);
      if (capMatch && !['GST', 'PAN', 'KYC', 'FY26', 'FY25', 'Friday', 'Monday'].includes(capMatch[1])) {
        recipient = capMatch[1];
      } else {
        recipient = 'Recipient';
      }
    }

    // 2. Due date extraction
    let dueDate = '';
    const dateMatch = clean.match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?/i);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
      const monthPrefix = dateMatch[2].toLowerCase().slice(0, 3);
      const monthIdx = months.indexOf(monthPrefix);
      const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : new Date().getFullYear();
      if (monthIdx !== -1) {
        const d = new Date(year, monthIdx, day);
        dueDate = d.toISOString().slice(0, 10);
      }
    }
    if (!dueDate) {
      // Relative dates: today, tomorrow, friday, etc.
      const today = new Date();
      if (lower.includes('today') || lower.includes('aaj')) {
        dueDate = today.toISOString().slice(0, 10);
      } else if (lower.includes('tomorrow') || lower.includes('kal')) {
        const tom = new Date(today);
        tom.setDate(tom.getDate() + 1);
        dueDate = tom.toISOString().slice(0, 10);
      } else if (lower.includes('next week')) {
        const nw = new Date(today);
        nw.setDate(nw.getDate() + 7);
        dueDate = nw.toISOString().slice(0, 10);
      } else {
        // Default 7 days from now
        const def = new Date(today);
        def.setDate(def.getDate() + 7);
        dueDate = def.toISOString().slice(0, 10);
      }
    }

    // 3. Multi-actions identification
    const actions = [];
    let detectedType = 'Multi-Action';
    let totalAmount = 0;

    // Detect Payment
    const moneyMatch = clean.match(/(?:₹|rs\.?|inr)\s?([\d,]+(?:\.\d{1,2})?)/i) || clean.match(/([\d,]+)\s?(?:rupees|advance|payment)/i);
    if (moneyMatch || lower.includes('payment') || lower.includes('advance') || lower.includes('pay') || lower.includes('paisa')) {
      let amount = 0;
      if (moneyMatch && moneyMatch[1]) {
        amount = parseFloat(moneyMatch[1].replace(/,/g, ''));
      }
      totalAmount = amount;
      const purpose = lower.includes('advance') ? 'Advance payment' : lower.includes('milestone') ? 'Milestone payment' : 'Invoice payment';
      actions.push({
        id: safeUUID(),
        type: 'Payment',
        title: purpose,
        amount: amount,
        currency: 'INR',
        is_required: true,
        status: 'Pending',
        description: amount ? `Pay ₹${amount.toLocaleString('en-IN')}` : 'Complete requested payment'
      });
    }

    // Detect Documents
    const docKeywords = [
      { key: 'gst', title: 'GST Certificate' },
      { key: 'pan', title: 'PAN Card' },
      { key: 'bank statement', title: 'Bank Statement (Last 6 Months)' },
      { key: 'cancelled cheque', title: 'Cancelled Cheque' },
      { key: 'invoice', title: 'Tax Invoice' },
      { key: 'kyc', title: 'KYC Verification Documents' },
      { key: 'aadhaar', title: 'Aadhaar Card' },
      { key: 'contract', title: 'Signed Contract' }
    ];

    let foundDoc = false;
    for (const item of docKeywords) {
      if (lower.includes(item.key)) {
        foundDoc = true;
        actions.push({
          id: safeUUID(),
          type: 'Document',
          title: item.title,
          is_required: true,
          status: 'Pending',
          description: `Upload clear PDF, JPG or PNG of ${item.title}`
        });
      }
    }
    if (!foundDoc && (lower.includes('document') || lower.includes('docs') || lower.includes('file') || lower.includes('certificate'))) {
      actions.push({
        id: safeUUID(),
        type: 'Document',
        title: 'Requested Documents',
        is_required: true,
        status: 'Pending',
        description: 'Upload the requested files'
      });
    }

    // Detect Approval
    if (lower.includes('approve') || lower.includes('approval') || lower.includes('sign off') || lower.includes('quotation') || lower.includes('design')) {
      const itemTitle = lower.includes('quotation') ? 'Quotation Approval' : lower.includes('design') ? 'Design Sign-off' : 'Proposal Approval';
      actions.push({
        id: safeUUID(),
        type: 'Approval',
        title: itemTitle,
        is_required: true,
        status: 'Pending',
        description: 'Review and approve, reject, or request modifications'
      });
    }

    // Detect Confirmation
    if (lower.includes('confirm') || lower.includes('confirmation') || lower.includes('appointment') || lower.includes('meeting') || lower.includes('schedule')) {
      actions.push({
        id: safeUUID(),
        type: 'Confirmation',
        title: 'Appointment / Service Confirmation',
        is_required: true,
        status: 'Pending',
        description: 'Confirm presence, delivery, or schedule'
      });
    }

    // Fallback if no specific action detected
    if (actions.length === 0) {
      actions.push({
        id: safeUUID(),
        type: 'Document',
        title: 'Action Item',
        is_required: true,
        status: 'Pending',
        description: clean
      });
    }

    if (actions.length === 1) {
      detectedType = actions[0].type;
    }

    // Generate smart title
    let title = '';
    if (actions.length > 1) {
      title = `${recipient} — ${actions.map(a => a.type).join(' + ')}`;
    } else {
      title = actions[0].title;
    }

    return {
      title,
      recipient,
      request_type: detectedType,
      due_at: dueDate,
      amount: totalAmount,
      actions,
      confidence: 0.94,
      parsed_from: clean
    };
  }
}

export class AIService {
  constructor(provider = new MockAIParserProvider()) {
    this.provider = provider;
  }
  setProvider(provider) {
    this.provider = provider;
  }
  async parseNaturalRequest(text) {
    return this.provider.parseNaturalRequest(text);
  }
}

export const aiService = new AIService();
