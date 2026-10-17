// DONE — Webhook Ingestion & Idempotency Handler (Section 54)
// Handles incoming webhooks from Razorpay, Cashfree, QSURA, and Meta WhatsApp Cloud API

import { db } from './db.js';
import { AUDIT_ACTIONS } from './stateMachine.js';

export class WebhookService {
  constructor() {
    this.processedKeys = new Set();
  }

  async handleWebhook({ provider, eventType, idempotencyKey, payload }) {
    // 1. Idempotency Check
    if (this.processedKeys.has(idempotencyKey)) {
      return { status: 'ignored', reason: 'Duplicate event already processed' };
    }
    this.processedKeys.add(idempotencyKey);

    // 2. Dispatch according to event type
    switch (eventType) {
      case 'PAYMENT_COMPLETED': {
        const { requestId, actionId, amount, providerReference } = payload;
        const req = db.completeAction(requestId, actionId, {
          status: 'Paid',
          providerReference,
          note: `Payment of ₹${amount} confirmed via ${provider} webhook`
        });
        return { status: 'processed', requestId, actionId };
      }

      case 'MESSAGE_DELIVERED': {
        const { requestId, recipientPhone } = payload;
        const req = db.getRequestById(requestId);
        if (req) {
          req.timeline = req.timeline || [];
          req.timeline.push({
            action: 'MESSAGE_DELIVERED',
            note: `WhatsApp message delivered to ${recipientPhone}`,
            at: new Date().toISOString()
          });
          db.updateRequest(req.id, req);
        }
        return { status: 'processed', requestId };
      }

      case 'MESSAGE_FAILED': {
        const { requestId, error } = payload;
        db.recordAuditLog(requestId, 'MESSAGE_FAILED', { error });
        return { status: 'processed', error };
      }

      default:
        return { status: 'unhandled_event', eventType };
    }
  }
}

export const webhookService = new WebhookService();
