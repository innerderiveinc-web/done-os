// DONE — Unified Database Service (Supabase PostgreSQL + LocalStorage Sandbox Fallback)
import { createClient } from '@supabase/supabase-js';
import { SEED_ORGANIZATION, SEED_REQUESTS, SEED_CONTACTS, SEED_TEMPLATES, SEED_VALIDATION_METRICS } from '../data/seed.js';
import { stateMachine, AUDIT_ACTIONS } from './stateMachine.js';
import { config, safeUUID, generateCryptoToken } from '../config.js';

const STORAGE_KEYS = {
  REQUESTS: 'done_v1_requests',
  CONTACTS: 'done_v1_contacts',
  TEMPLATES: 'done_v1_templates',
  ORGANIZATION: 'done_v1_org',
  AUDIT_LOGS: 'done_v1_audit',
  REFERRALS: 'done_v1_referrals',
  VALIDATION: 'done_v1_validation'
};

class DatabaseService {
  constructor() {
    this.supabase = null;
    this.initSupabase();
    this.initLocalStorage();
  }

  initSupabase() {
    if (config.supabaseUrl && config.supabaseAnonKey) {
      try {
        this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
        console.log('[DONE DB] Supabase client initialized connected to:', config.supabaseUrl);
      } catch (err) {
        console.warn('[DONE DB] Could not initialize Supabase client:', err);
      }
    } else {
      console.log('[DONE DB] Running in Local / Demo Sandbox Mode (LocalStorage active)');
    }
  }

  initLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      this.resetToSeed();
    }
  }

  resetToSeed() {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(SEED_CONTACTS));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(SEED_TEMPLATES));
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(SEED_ORGANIZATION));
    localStorage.setItem(STORAGE_KEYS.VALIDATION, JSON.stringify(SEED_VALIDATION_METRICS));

    const initialAudit = [];
    SEED_REQUESTS.forEach(r => {
      (r.timeline || []).forEach(t => {
        initialAudit.push({
          id: safeUUID(),
          request_id: r.id,
          reference_no: r.reference_no,
          action: t.action,
          metadata: { note: t.note },
          created_at: t.at
        });
      });
    });
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAudit));
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify([
      {
        id: 'ref-1',
        source_request_id: 'req-1031',
        recipient_name: 'Ananya Singh',
        converted_to_sender: true,
        source_type: 'recipient_to_sender',
        created_at: '2026-09-23T14:50:00Z'
      }
    ]));
  }

  // --- Organization & Workspace Management ---
  getOrganization() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORGANIZATION);
      return data ? JSON.parse(data) : SEED_ORGANIZATION;
    } catch (e) {
      return SEED_ORGANIZATION;
    }
  }

  updateOrganization(patch) {
    const org = this.getOrganization();
    const updated = { ...org, ...patch, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(updated));
    config.defaultOrg.name = updated.name || config.defaultOrg.name;
    config.defaultOrg.plan = updated.plan || config.defaultOrg.plan;

    if (this.supabase) {
      this.supabase.from('organizations').update(patch).eq('id', updated.id).then();
    }
    return updated;
  }

  // --- Requests CRUD ---
  getRequests() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getRequestById(id) {
    const list = this.getRequests();
    return list.find(r => r.id === id || r.reference_no === id);
  }

  getRequestByPublicToken(token) {
    if (!token || typeof token !== 'string') return null;
    const cleanToken = token.trim();
    // Enforce minimum token length to prevent enumeration
    if (cleanToken.length < 8) return null;

    const list = this.getRequests();
    // STRICT SECURITY: Public token endpoint must ONLY match public_token.
    // Internal IDs or reference numbers must NEVER grant public access!
    const req = list.find(r => r.public_token === cleanToken);
    if (!req) return null;

    // Verify token has not been revoked or expired
    if (req.is_revoked) return null;
    if (req.token_expires_at && new Date(req.token_expires_at) < new Date()) {
      return null;
    }
    return req;
  }

  createRequest(requestData) {
    const list = this.getRequests();
    const id = safeUUID();
    const refNo = 'REQ-' + (1000 + list.length + 1);
    // Cryptographically secure 192-bit token
    const token = generateCryptoToken(24);

    const newRequest = {
      id,
      reference_no: refNo,
      title: requestData.title || 'Untitled Request',
      description: requestData.description || '',
      recipient_name: requestData.recipient_name || 'Recipient',
      recipient_email: requestData.recipient_email || '',
      recipient_phone: requestData.recipient_phone || '',
      request_type: requestData.request_type || (requestData.actions?.length > 1 ? 'Multi-Action' : (requestData.actions?.[0]?.type || 'Document')),
      status: requestData.status || 'Sent',
      due_at: requestData.due_at || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      amount: requestData.amount || 0,
      currency: requestData.currency || 'INR',
      public_token: token,
      created_at: new Date().toISOString(),
      completed_at: null,
      actions: (requestData.actions || []).map((a, idx) => ({
        id: a.id || `act-${id}-${idx + 1}`,
        type: a.type || 'Document',
        title: a.title || 'Action',
        description: a.description || '',
        is_required: a.is_required ?? true,
        status: a.status || 'Pending',
        amount: a.amount || 0,
        currency: a.currency || 'INR',
        result: a.result || null,
        completed_at: null
      })),
      timeline: []
    };

    const auditAction = newRequest.status === 'Sent' ? AUDIT_ACTIONS.REQUEST_SENT : AUDIT_ACTIONS.REQUEST_CREATED;
    newRequest.timeline.push({
      action: auditAction,
      note: `Request created for ${newRequest.recipient_name}`,
      at: new Date().toISOString()
    });

    list.unshift(newRequest);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(list));

    if (newRequest.recipient_name) {
      this.upsertContact({
        name: newRequest.recipient_name,
        email: newRequest.recipient_email,
        phone: newRequest.recipient_phone
      });
    }

    this.recordAuditLog(newRequest.id, auditAction, {
      title: newRequest.title,
      recipient: newRequest.recipient_name,
      amount: newRequest.amount
    });

    // Supabase remote sync if connected
    if (this.supabase) {
      this.supabase.from('requests').insert({
        reference_no: newRequest.reference_no,
        title: newRequest.title,
        description: newRequest.description,
        request_type: newRequest.request_type,
        status: newRequest.status,
        due_at: newRequest.due_at,
        public_token: newRequest.public_token
      }).then();
    }

    return newRequest;
  }

  duplicateRequest(id) {
    const existing = this.getRequestById(id);
    if (!existing) return null;

    return this.createRequest({
      title: `${existing.title} (Copy)`,
      description: existing.description,
      recipient_name: existing.recipient_name,
      recipient_email: existing.recipient_email,
      recipient_phone: existing.recipient_phone,
      request_type: existing.request_type,
      due_at: existing.due_at,
      amount: existing.amount,
      actions: existing.actions.map(a => ({
        type: a.type,
        title: a.title,
        description: a.description,
        is_required: a.is_required,
        amount: a.amount,
        currency: a.currency,
        status: 'Pending'
      }))
    });
  }

  closeRequest(id) {
    return this.transitionRequestState(id, 'Closed', { note: 'Request manually marked Closed by sender' });
  }

  updateRequest(id, patch) {
    const list = this.getRequests();
    const idx = list.findIndex(r => r.id === id || r.reference_no === id);
    if (idx === -1) return null;

    const updated = { ...list[idx], ...patch, updated_at: new Date().toISOString() };
    list[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(list));

    if (this.supabase) {
      this.supabase.from('requests').update(patch).eq('reference_no', updated.reference_no).then();
    }

    return updated;
  }

  transitionRequestState(id, nextState, metadata = {}) {
    const r = this.getRequestById(id);
    if (!r) return null;

    const auditEntry = stateMachine.transition(r, nextState, metadata);
    r.timeline = r.timeline || [];
    r.timeline.push({
      action: auditEntry.action,
      note: metadata.note || `Status changed to ${nextState}`,
      at: auditEntry.created_at
    });

    this.updateRequest(r.id, r);
    this.recordAuditLog(r.id, auditEntry.action, metadata);
    return r;
  }

  recordReminder(requestId, channel = 'whatsapp') {
    const req = this.getRequestById(requestId);
    if (!req) return null;

    req.timeline = req.timeline || [];
    const event = {
      action: AUDIT_ACTIONS.REMINDER_SENT,
      note: `Reminder dispatched via ${channel.toUpperCase()}`,
      at: new Date().toISOString()
    };
    req.timeline.push(event);
    req.updated_at = new Date().toISOString();

    this.updateRequest(req.id, req);
    this.recordAuditLog(req.id, AUDIT_ACTIONS.REMINDER_SENT, { channel });
    return req;
  }

  completeAction(requestId, actionId, actionResult = {}) {
    const req = this.getRequestById(requestId);
    if (!req) return null;

    const action = req.actions.find(a => a.id === actionId);
    if (!action) return null;

    action.status = actionResult.status || 'Completed';
    action.completed_at = new Date().toISOString();
    action.result = actionResult;

    // Recalculate whole request status
    const newStatus = stateMachine.computeStatusFromActions(req.actions);
    
    let auditAction = AUDIT_ACTIONS.ACTION_SUBMITTED;
    if (action.type === 'Document') auditAction = AUDIT_ACTIONS.DOCUMENT_UPLOADED;
    if (action.type === 'Payment') auditAction = AUDIT_ACTIONS.PAYMENT_CONFIRMED;
    if (action.type === 'Approval') auditAction = actionResult.decision === 'Rejected' ? AUDIT_ACTIONS.APPROVAL_REJECTED : AUDIT_ACTIONS.APPROVAL_GRANTED;
    
    req.timeline = req.timeline || [];
    req.timeline.push({
      action: auditAction,
      note: `${action.title}: ${actionResult.note || action.status}`,
      at: new Date().toISOString()
    });

    if (newStatus === 'Completed' && req.status !== 'Completed') {
      req.status = 'Completed';
      req.completed_at = new Date().toISOString();
      req.timeline.push({
        action: AUDIT_ACTIONS.REQUEST_COMPLETED,
        note: 'All requested actions completed — marked DONE',
        at: new Date().toISOString()
      });
      this.incrementValidationCompleted();
    } else {
      req.status = newStatus;
    }

    this.updateRequest(req.id, req);
    this.recordAuditLog(req.id, auditAction, { actionId, ...actionResult });

    // Supabase RPC submit_public_action if live
    if (this.supabase && req.public_token) {
      this.supabase.rpc('submit_public_action', {
        p_token: req.public_token,
        p_action_id: actionId,
        p_status: action.status,
        p_result: actionResult
      }).then();
    }

    return req;
  }

  markRequestOpened(requestId) {
    const req = this.getRequestById(requestId);
    if (!req) return;
    if (req.status === 'Sent') {
      req.status = 'Opened';
      req.timeline = req.timeline || [];
      req.timeline.push({
        action: AUDIT_ACTIONS.REQUEST_OPENED,
        note: 'Recipient opened the request',
        at: new Date().toISOString()
      });
      this.updateRequest(req.id, req);
      this.recordAuditLog(req.id, AUDIT_ACTIONS.REQUEST_OPENED, { by: 'recipient' });
    }
  }

  // --- Contacts ---
  getContacts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  upsertContact(contact) {
    const list = this.getContacts();
    const existing = list.find(c => (contact.name && c.name.toLowerCase() === contact.name.toLowerCase()) || (contact.phone && c.phone === contact.phone));
    if (existing) {
      existing.requestsCount = (existing.requestsCount || 1) + 1;
      if (contact.email && !existing.email) existing.email = contact.email;
      if (contact.phone && !existing.phone) existing.phone = contact.phone;
    } else {
      list.push({
        id: 'c-' + Date.now(),
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        requestsCount: 1,
        completedCount: 0,
        status: 'Active'
      });
    }
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(list));
  }

  // --- Templates ---
  getTemplates() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  createTemplate(template) {
    const list = this.getTemplates();
    const newTmpl = {
      id: 'tmpl-' + Date.now(),
      name: template.name,
      type: template.type || 'Document',
      description: template.description || '',
      actions: template.actions || []
    };
    list.unshift(newTmpl);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list));
    return newTmpl;
  }

  // --- Validation Funnel & Viral Growth ---
  getValidationMetrics() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VALIDATION);
      return data ? JSON.parse(data) : SEED_VALIDATION_METRICS;
    } catch (e) {
      return SEED_VALIDATION_METRICS;
    }
  }

  recordReferral(sourceRequestId, recipientName) {
    const referrals = JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERRALS) || '[]');
    const newRef = {
      id: 'ref-' + Date.now(),
      source_request_id: sourceRequestId,
      recipient_name: recipientName || 'Anonymous Recipient',
      converted_to_sender: true,
      source_type: 'recipient_to_sender',
      created_at: new Date().toISOString()
    };
    referrals.unshift(newRef);
    localStorage.setItem(STORAGE_KEYS.REFERRALS, JSON.stringify(referrals));

    const metrics = this.getValidationMetrics();
    metrics.recipientsConvertedToNewSenders = (metrics.recipientsConvertedToNewSenders || 0) + 1;
    const completed = metrics.totalRequestsCompleted || 1;
    metrics.recipientToSenderConversionRate = parseFloat(((metrics.recipientsConvertedToNewSenders / completed) * 100).toFixed(1));
    localStorage.setItem(STORAGE_KEYS.VALIDATION, JSON.stringify(metrics));

    return newRef;
  }

  incrementValidationCompleted() {
    const metrics = this.getValidationMetrics();
    metrics.totalRequestsCompleted = (metrics.totalRequestsCompleted || 0) + 1;
    const completed = metrics.totalRequestsCompleted;
    const converted = metrics.recipientsConvertedToNewSenders || 16;
    metrics.recipientToSenderConversionRate = parseFloat(((converted / completed) * 100).toFixed(1));
    localStorage.setItem(STORAGE_KEYS.VALIDATION, JSON.stringify(metrics));
  }

  // --- Audit Logs ---
  getAuditLogs(requestId) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    if (requestId) {
      return all.filter(l => l.request_id === requestId);
    }
    return all.slice(0, 50);
  }

  recordAuditLog(requestId, action, metadata = {}) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
    const req = this.getRequestById(requestId);
    all.unshift({
      id: safeUUID(),
      request_id: requestId,
      reference_no: req?.reference_no || '',
      action,
      metadata,
      created_at: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(all.slice(0, 200)));
  }

  // --- Privacy & Export Controls ---
  exportAllData() {
    return {
      exported_at: new Date().toISOString(),
      organization: this.getOrganization(),
      requests: this.getRequests(),
      contacts: this.getContacts(),
      templates: this.getTemplates(),
      audit_logs: this.getAuditLogs(),
      validation_metrics: this.getValidationMetrics()
    };
  }

  deleteRequest(id) {
    let list = this.getRequests();
    list = list.filter(r => r.id !== id && r.reference_no !== id);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(list));

    if (this.supabase) {
      this.supabase.from('requests').delete().eq('id', id).then();
    }
  }

  clearAllData() {
    localStorage.clear();
    this.resetToSeed();
  }
}

export const db = new DatabaseService();
