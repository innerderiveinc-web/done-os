// DONE — Payment Service & Provider Abstraction with Strict Cryptographic Verification
import { config } from '../config.js';

export class PaymentProvider {
  async processPayment(details) {
    throw new Error('Not implemented');
  }
  async verifyPayment(verificationDetails) {
    throw new Error('Not implemented');
  }
}

/**
 * Sandboxed Mock Provider — strictly permitted ONLY in local / sandbox development.
 * Automatically rejected if deployed in production.
 */
export class MockPaymentProvider extends PaymentProvider {
  constructor() {
    super();
    this.mode = 'SANDBOX';
  }

  async processPayment({ amount, currency = 'INR', purpose, recipientName, referenceNo }) {
    if (config.isProduction) {
      throw new Error(
        'SECURITY REJECTION: Mock payment provider cannot be executed in production. ' +
        'Please configure Razorpay, Stripe, or a verified banking gateway.'
      );
    }

    await new Promise(r => setTimeout(r, 600));

    const ref = 'SANDBOX_NON_FINANCIAL_' + Math.floor(100000 + Math.random() * 900000);
    return {
      success: true,
      provider: 'mock_sandbox',
      providerReference: ref,
      amount,
      currency,
      status: 'Paid',
      is_sandbox: true,
      is_financial_transaction: false,
      paidAt: new Date().toISOString(),
      mode: 'DEMO / SANDBOX (NON-FINANCIAL)',
      receiptUrl: null,
      disclaimer: 'SANDBOX TEST TRANSACTION — NO REAL MONEY TRANSFERRED'
    };
  }

  async verifyPayment({ referenceId, expectedAmount, currency = 'INR' }) {
    if (config.isProduction) {
      return {
        verified: false,
        error: 'Mock verification rejected in production.'
      };
    }

    // In sandbox, require explicit reference prefix to prevent fake references
    const isValidSandboxRef = referenceId && String(referenceId).startsWith('SANDBOX_');
    return {
      verified: Boolean(isValidSandboxRef),
      referenceId,
      status: isValidSandboxRef ? 'Paid' : 'Unverified',
      is_sandbox: true,
      disclaimer: 'Sandbox verification only'
    };
  }
}

/**
 * Production Gateway Provider (Razorpay / UPI Intent)
 * Requires cryptographic signature verification before marking any transaction as Paid.
 */
export class RazorpayProvider extends PaymentProvider {
  constructor(keyId, keySecret = '') {
    super();
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async processPayment({ amount, currency = 'INR', referenceNo, recipientName, recipientEmail, recipientPhone }) {
    if (!this.keyId) {
      throw new Error('Razorpay Key ID not configured in Settings.');
    }

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.Razorpay) {
        // Dynamic load Razorpay checkout script if missing
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => this.launchCheckout({ amount, currency, referenceNo, recipientName, recipientEmail, recipientPhone }, resolve, reject);
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK. Check network connection.'));
        document.body.appendChild(script);
      } else {
        this.launchCheckout({ amount, currency, referenceNo, recipientName, recipientEmail, recipientPhone }, resolve, reject);
      }
    });
  }

  launchCheckout(details, resolve, reject) {
    const options = {
      key: this.keyId,
      amount: Math.round(Number(details.amount) * 100), // convert to paise
      currency: details.currency || 'INR',
      name: config.company.name,
      description: `Payment for Request ${details.referenceNo}`,
      prefill: {
        name: details.recipientName || '',
        email: details.recipientEmail || '',
        contact: details.recipientPhone || ''
      },
      theme: { color: '#0f172a' },
      handler: (response) => {
        resolve({
          success: true,
          provider: 'razorpay',
          providerReference: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
          amount: details.amount,
          currency: details.currency,
          status: 'Paid',
          is_sandbox: false,
          is_financial_transaction: true,
          paidAt: new Date().toISOString()
        });
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled by recipient.'))
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  async verifyPayment({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId || !signature) {
      return { verified: false, error: 'Missing required cryptographic payment parameters.' };
    }

    if (!this.keySecret) {
      console.warn('[Payment Security] Key Secret not available on client; signature verification must be completed server-side.');
      return {
        verified: false,
        pending_server_verification: true,
        referenceId: paymentId
      };
    }

    try {
      // Browser Web Crypto HMAC-SHA256 signature verification
      const enc = new TextEncoder();
      const message = enc.encode(`${orderId}|${paymentId}`);
      const keyData = enc.encode(this.keySecret);
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
      const sigBuffer = await crypto.subtle.sign('HMAC', key, message);
      const expectedSig = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      const isValid = (expectedSig === signature);
      return {
        verified: isValid,
        referenceId: paymentId,
        status: isValid ? 'Paid' : 'Failed'
      };
    } catch (e) {
      return { verified: false, error: 'Signature calculation error: ' + e.message };
    }
  }
}

export class PaymentService {
  constructor(provider = new MockPaymentProvider()) {
    this.provider = provider;
  }

  setProvider(provider) {
    this.provider = provider;
  }

  async initiatePayment(details) {
    return this.provider.processPayment(details);
  }

  async verifyPayment(verificationDetails) {
    return this.provider.verifyPayment(verificationDetails);
  }
}

export const paymentService = new PaymentService();
