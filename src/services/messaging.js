// DONE — Messaging Service & Provider Abstraction
// Handles delivery link construction (WhatsApp, SMS, Email)
// Architected for direct QSURA / Meta WhatsApp Cloud API connection in production

export class MessagingProvider {
  async sendRequestLink(request, recipient, channel = 'whatsapp') {
    throw new Error('Not implemented');
  }
  async sendReminder(request, recipient, channel = 'whatsapp') {
    throw new Error('Not implemented');
  }
}

export class MockMessagingProvider extends MessagingProvider {
  constructor() {
    super();
    this.mode = 'DEMO';
  }

  formatMessageText(request, recipient, link) {
    const org = request.organization_name || 'Northstar Consulting';
    const dueStr = request.due_at ? new Date(request.due_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'soon';
    
    return `*${org}* has sent you a secure Request on DONE:\n\n` +
      `📌 *${request.title}*\n` +
      `⏳ Due: *${dueStr}*\n\n` +
      `Complete the requested action(s) securely here (no app required):\n` +
      `👉 ${link}\n\n` +
      `_Encrypted link • Tracked to completion_`;
  }

  buildWhatsAppUrl(phone, text) {
    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    // Standardize Indian 10-digit numbers: 9876543210 -> 919876543210
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      cleanPhone = '91' + cleanPhone.slice(1);
    }
    const encoded = encodeURIComponent(text);
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  }

  buildSmsUrl(phone, text) {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    return `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
  }

  buildEmailUrl(email, subject, text) {
    return `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  }

  async sendRequestLink(request, recipient, channel = 'whatsapp', link) {
    const text = this.formatMessageText(request, recipient, link);
    return {
      success: true,
      mode: 'DEMO',
      channel,
      recipient: recipient?.phone || recipient?.email || recipient?.name,
      formattedText: text,
      actionUrl: channel === 'whatsapp' ? this.buildWhatsAppUrl(recipient?.phone, text) :
                 channel === 'sms' ? this.buildSmsUrl(recipient?.phone, text) :
                 this.buildEmailUrl(recipient?.email, `Action Required: ${request.title}`, text),
      event: {
        eventType: 'MESSAGE_SENT',
        channel,
        at: new Date().toISOString(),
        disclaimer: 'Dispatched via Demo Messaging Service (QSURA connector ready)'
      }
    };
  }

  async sendReminder(request, recipient, channel = 'whatsapp', link) {
    const org = request.organization_name || 'Northstar Consulting';
    const text = `⚠️ Reminder from *${org}*:\n` +
      `Your request *${request.title}* is pending completion.\n\n` +
      `👉 Complete it here: ${link}`;
    return {
      success: true,
      mode: 'DEMO',
      channel,
      formattedText: text,
      actionUrl: channel === 'whatsapp' ? this.buildWhatsAppUrl(recipient?.phone, text) :
                 channel === 'sms' ? this.buildSmsUrl(recipient?.phone, text) :
                 this.buildEmailUrl(recipient?.email, `Reminder: ${request.title}`, text),
      event: {
        eventType: 'REMINDER_SENT',
        channel,
        at: new Date().toISOString()
      }
    };
  }
}

export class QsuraMessagingProvider extends MessagingProvider {
  constructor(apiKey, senderId) {
    super();
    this.apiKey = apiKey;
    this.senderId = senderId;
  }
  async sendRequestLink(request, recipient, channel) {
    throw new Error('QSURA API key not configured. Please set VITE_QSURA_API_KEY.');
  }
}

export class MessagingService {
  constructor(provider = new MockMessagingProvider()) {
    this.provider = provider;
  }
  setProvider(provider) {
    this.provider = provider;
  }
  async dispatch(request, recipient, channel, link) {
    return this.provider.sendRequestLink(request, recipient, channel, link);
  }
  async dispatchReminder(request, recipient, channel, link) {
    return this.provider.sendReminder(request, recipient, channel, link);
  }
  buildLinks(request, recipient, link) {
    const text = (this.provider instanceof MockMessagingProvider)
      ? this.provider.formatMessageText(request, recipient, link)
      : `Action required for ${request.title}: ${link}`;
    return {
      text,
      whatsapp: `https://wa.me/${(recipient?.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`,
      sms: `sms:${(recipient?.phone || '').replace(/[^0-9]/g, '')}?body=${encodeURIComponent(text)}`,
      email: `mailto:${recipient?.email || ''}?subject=${encodeURIComponent('Request: ' + request.title)}&body=${encodeURIComponent(text)}`
    };
  }
}

export const messagingService = new MessagingService();
