// DONE — Payment Service & Provider Abstraction
// Supports mock sandbox payments for V1 and future Razorpay / Cashfree integration
// Never presents demo payments as real financial transactions

export class PaymentProvider {
  async processPayment(details) {
    throw new Error('Not implemented');
  }
  async verifyPayment(referenceId) {
    throw new Error('Not implemented');
  }
}

export class MockPaymentProvider extends PaymentProvider {
  async processPayment({ amount, currency = 'INR', purpose, recipientName, referenceNo }) {
    // Simulate real gateway processing delay
    await new Promise(r => setTimeout(r, 650));

    const ref = 'PAY_DEMO_' + Math.floor(100000 + Math.random() * 900000);
    return {
      success: true,
      provider: 'mock',
      providerReference: ref,
      amount,
      currency,
      status: 'Paid',
      paidAt: new Date().toISOString(),
      mode: 'DEMO / SANDBOX',
      receiptUrl: null,
      message: `Demo payment of ₹${amount.toLocaleString('en-IN')} completed in Sandbox mode.`
    };
  }

  async verifyPayment(referenceId) {
    return {
      verified: true,
      referenceId,
      status: 'Paid'
    };
  }
}

export class RazorpayProvider extends PaymentProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }
  async processPayment(details) {
    throw new Error('Razorpay production keys not yet configured. Please set VITE_RAZORPAY_KEY.');
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
  async verifyPayment(ref) {
    return this.provider.verifyPayment(ref);
  }
}

export const paymentService = new PaymentService();
