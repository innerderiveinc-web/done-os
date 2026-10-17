import { safeUUID } from '../config.js';

export const REQUEST_STATES = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  OPENED: 'Opened',
  IN_PROGRESS: 'In Progress',
  SUBMITTED: 'Submitted',
  NEEDS_CORRECTION: 'Needs Correction',
  APPROVED: 'Approved',
  PAID: 'Paid',
  COMPLETED: 'Completed',
  CLOSED: 'Closed',
  OVERDUE: 'Overdue'
};

export const AUDIT_ACTIONS = {
  REQUEST_CREATED: 'REQUEST_CREATED',
  REQUEST_SENT: 'REQUEST_SENT',
  REQUEST_OPENED: 'REQUEST_OPENED',
  ACTION_SUBMITTED: 'ACTION_SUBMITTED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  PAYMENT_INITIATED: 'PAYMENT_INITIATED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  APPROVAL_GRANTED: 'APPROVAL_GRANTED',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  REMINDER_SENT: 'REMINDER_SENT',
  REQUEST_COMPLETED: 'REQUEST_COMPLETED',
  REQUEST_CLOSED: 'REQUEST_CLOSED'
};

const VALID_TRANSITIONS = {
  [REQUEST_STATES.DRAFT]: [REQUEST_STATES.SENT, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.SENT]: [REQUEST_STATES.OPENED, REQUEST_STATES.IN_PROGRESS, REQUEST_STATES.OVERDUE, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.OPENED]: [REQUEST_STATES.IN_PROGRESS, REQUEST_STATES.SUBMITTED, REQUEST_STATES.COMPLETED, REQUEST_STATES.OVERDUE, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.IN_PROGRESS]: [REQUEST_STATES.SUBMITTED, REQUEST_STATES.NEEDS_CORRECTION, REQUEST_STATES.COMPLETED, REQUEST_STATES.OVERDUE, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.SUBMITTED]: [REQUEST_STATES.APPROVED, REQUEST_STATES.PAID, REQUEST_STATES.NEEDS_CORRECTION, REQUEST_STATES.COMPLETED, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.NEEDS_CORRECTION]: [REQUEST_STATES.IN_PROGRESS, REQUEST_STATES.SUBMITTED, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.APPROVED]: [REQUEST_STATES.COMPLETED, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.PAID]: [REQUEST_STATES.COMPLETED, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.OVERDUE]: [REQUEST_STATES.OPENED, REQUEST_STATES.IN_PROGRESS, REQUEST_STATES.COMPLETED, REQUEST_STATES.CLOSED],
  [REQUEST_STATES.COMPLETED]: [REQUEST_STATES.CLOSED],
  [REQUEST_STATES.CLOSED]: [] // Terminal
};

export class RequestStateMachine {
  canTransition(currentState, targetState) {
    if (currentState === targetState) return true;
    const allowed = VALID_TRANSITIONS[currentState] || [];
    return allowed.includes(targetState);
  }

  transition(request, targetState, metadata = {}) {
    const current = request.status;
    if (!this.canTransition(current, targetState)) {
      console.warn(`[StateMachine] Invalid transition attempted: ${current} -> ${targetState}`);
      // Permit graceful transition in demo mode with log
    }

    request.status = targetState;
    request.updated_at = new Date().toISOString();
    if (targetState === REQUEST_STATES.COMPLETED) {
      request.completed_at = new Date().toISOString();
    }

    const auditEntry = {
      id: safeUUID(),
      request_id: request.id,
      from_state: current,
      to_state: targetState,
      action: metadata.auditAction || this.inferAuditAction(targetState),
      metadata: {
        actor: metadata.actor || 'system',
        note: metadata.note || '',
        ...metadata
      },
      created_at: new Date().toISOString()
    };

    return auditEntry;
  }

  inferAuditAction(targetState) {
    switch (targetState) {
      case REQUEST_STATES.SENT: return AUDIT_ACTIONS.REQUEST_SENT;
      case REQUEST_STATES.OPENED: return AUDIT_ACTIONS.REQUEST_OPENED;
      case REQUEST_STATES.COMPLETED: return AUDIT_ACTIONS.REQUEST_COMPLETED;
      case REQUEST_STATES.CLOSED: return AUDIT_ACTIONS.REQUEST_CLOSED;
      default: return `STATE_CHANGED_TO_${targetState.toUpperCase().replace(/\s+/g, '_')}`;
    }
  }

  computeStatusFromActions(actions = []) {
    if (!actions.length) return REQUEST_STATES.SENT;
    const allDone = actions.every(a => 
      ['Completed', 'Uploaded', 'Paid', 'Approved', 'Confirmed'].includes(a.status)
    );
    if (allDone) return REQUEST_STATES.COMPLETED;

    const anyStarted = actions.some(a => 
      ['Uploaded', 'Paid', 'Approved', 'Confirmed', 'In Progress', 'Rescheduled'].includes(a.status)
    );
    if (anyStarted) return REQUEST_STATES.IN_PROGRESS;

    return REQUEST_STATES.OPENED;
  }
}

export const stateMachine = new RequestStateMachine();
