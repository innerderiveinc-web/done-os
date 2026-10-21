// DONE — Hardened Webhook Ingestion & Cryptographic Idempotency Handler
import { db } from './db.js';
import { AUDIT_ACTIONS } from './stateMachine.js';
import { config } from '../config.js';

const STORAGE_KEY_WEBHOOKS = 'done_v1_processed_webhooks';

export class WebhookService {
  constructor() {
    this.initDurableStorage();
  }

  initDurableStorage() {
    try {
      if (!localStorage.getItem(STORAGE_KEY_WEBHOOKS)) {
        localStorage.setItem(STORAGE_KEY_WEBHOOKS, JSON.stringify([]));
      }
    } catch (e) {}
  }

  getProcessedKeys() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_WEBHOOKS);
      return data ? new Set(JSON.parse(data)) : new Set();
    } catch (e) {
      return new Set();
    }
  }

  markKeyProcessed(key) {
    try {
      const keys = this.getProcessedKeys();
      keys.add(key);
      // Keep most recent 500 keys to prevent unbounded growth
      const arr = Array.from(keys).slice(-500);
      localStorage.setItem(STORAGE_KEY_WEBHOOKS, JSON.stringify(arr));
    } catch (e) {}
  }

  /**
   * Cryptographically verifies incoming webhook signature (HMAC-SHA256)
   * Supports Razorpay (X-Razorpay-Signature) and Meta WhatsApp (X-Hub-Signature-256)
   */
  async verifySignature(rawBody, signature, secret) {
    if (!secret) {
      if (config.isProduction) {
        throw new Error('SECURITY REJECTION: Webhook secret not configured in production.');
      }
      return false;
    }

    if (!rawBody || !signature) return false;

    try {
      const enc = new TextEncoder();
      const cleanSig = signature.replace(/^sha256=/, '').trim();
      const keyData = enc.encode(secret);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );

      // Convert hex signature string to ArrayBuffer
      const sigBytes = new Uint8Array(
        cleanSig.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );

      return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(rawBody));
    } catch (e) {
      console.error('[Webhook Signature Verification Error]:', e);
      return false;
    }
  }

  async handleWebhook({ provider, eventType, idempotencyKey, payload, rawBody, signature, secret }) {
    // 1. Authenticity Guard: Verify Cryptographic Signature
    if (config.isProduction || secret) {
      const isAuthentic = await this.verifySignature(rawBody || JSON.stringify(payload), signature, secret);
      if (!isAuthentic) {
        console.warn(`[Webhook Rejected]: Invalid cryptographic signature from provider: ${provider}`);
        return { status: 'rejected', error: '401 Unauthorized: Invalid or missing webhook signature' };
      }
    }

    // 2. Durable Idempotency Check (Survives process restart & page reload)
    const durableKeys = this.getProcessedKeys();
    if (durableKeys.has(idempotencyKey)) {
      return { status: 'ignored', reason: 'Duplicate event already processed (idempotency key matched)' };
    }
    this.markKeyProcessed(idempotencyKey);

    // 3. Dispatch according to event type with state machine checks
    switch (eventType) {
      case 'PAYMENT_COMPLETED': {
        const { requestId, actionId, amount, providerReference } = payload;
        if (!requestId || !actionId || !providerReference) {
          return { status: 'rejected', error: 'Incomplete payment payload' };
        }

        const req = db.completeAction(requestId, actionId, {
          status: 'Paid',
          providerReference,
          note: `Payment of ₹${amount} confirmed via verified ${provider} webhook`
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
        if (requestId) {
          db.recordAuditLog(requestId, 'MESSAGE_FAILED', { error });
        }
        return { status: 'processed', error };
      }

      default:
        return { status: 'unhandled_event', eventType };
    }
  }
}

export const webhookService = new WebhookService();
