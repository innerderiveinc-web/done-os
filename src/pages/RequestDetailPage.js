// DONE — Request Detail Page (React 19 Component)
import { React, useState, useEffect, html } from '../react-helpers.js';
import { db } from '../services/db.js';
import { AUDIT_ACTIONS } from '../services/stateMachine.js';
import { messagingService } from '../services/messaging.js';
import { showToast } from '../components/toast.js';

function formatMoney(amount) {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatActionName(action) {
  return String(action || 'EVENT').replace(/_/g, ' ');
}

export function RequestDetailPage({ requestId, navigate, onOpenShare }) {
  const [request, setRequest] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const req = db.getRequestById(requestId);
    if (req) {
      setRequest({ ...req });
    }
  }, [requestId]);

  if (!request) {
    return html`
      <section className="page narrow">
        <div className="empty-state-card card">
          <div className="empty-icon">!</div>
          <h2>Request Not Found</h2>
          <p>The request you are looking for does not exist or has been removed.</p>
          <button className="btn btn-primary" onClick=${() => navigate('/requests')}>
            ← Back to Requests
          </button>
        </div>
      </section>
    `;
  }

  const origin = window.location.origin;
  const recipientUrl = `${origin}/r/${request.public_token}`;
  const totalActions = request.actions?.length || 1;
  const completedActions = (request.actions || []).filter(a =>
    ['Completed', 'Uploaded', 'Paid', 'Approved', 'Confirmed'].includes(a.status)
  ).length;

  const isCompleted = request.status === 'Completed';
  const isOverdue = request.status === 'Overdue';
  const progressPercent = Math.round((completedActions / totalActions) * 100);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(recipientUrl);
      showToast('Recipient link copied to clipboard!', 'success');
    } catch (e) {
      showToast(recipientUrl, 'default');
    }
  };

  const handleSendReminder = async () => {
    try {
      const recipient = {
        name: request.recipient_name,
        phone: request.recipient_phone,
        email: request.recipient_email
      };
      const res = await messagingService.dispatchReminder(request, recipient, 'whatsapp', recipientUrl);

      // Record reminder in request timeline & audit log
      const updated = db.recordReminder(request.id, 'whatsapp');
      if (updated) {
        setRequest({ ...updated });
      }

      if (res && res.actionUrl) {
        window.open(res.actionUrl, '_blank', 'noopener,noreferrer');
        showToast(`Opening WhatsApp with reminder for ${request.recipient_name}...`, 'success');
      } else {
        showToast(`Reminder recorded for ${request.recipient_name}!`, 'success');
      }
    } catch (e) {
      showToast('Could not dispatch reminder: ' + e.message, 'error');
    }
  };

  const handleDuplicate = () => {
    const dup = db.duplicateRequest(request.id);
    if (dup) {
      showToast('Request duplicated successfully!', 'success');
      navigate(`/requests/${encodeURIComponent(dup.id)}`);
    }
  };

  const handleClose = () => {
    const updated = db.closeRequest(request.id);
    if (updated) {
      setRequest({ ...updated });
      showToast('Request marked as Closed', 'default');
      setMenuOpen(false);
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${request.reference_no}?`)) {
      db.deleteRequest(request.id);
      showToast('Request deleted', 'default');
      navigate('/requests');
    }
  };

  return html`
    <section className="page narrow request-detail-page">
      
      <div className="breadcrumb-row">
        <a href="/requests" className="link-back" onClick=${(e) => { e.preventDefault(); navigate('/requests'); }}>
          ← All Requests
        </a>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">${request.reference_no}</span>
      </div>

      
      <div className="detail-header card">
        <div className="detail-header-top">
          <div className="detail-title-block">
            <div className="eyebrow">${request.reference_no} • ${request.request_type}</div>
            <h1>${request.title}</h1>
            <div className="detail-meta-row">
              <span>Recipient: <strong>${request.recipient_name}</strong></span>
              ${request.recipient_email ? html`<span>• ${request.recipient_email}</span>` : null}
              ${request.recipient_phone ? html`<span>• ${request.recipient_phone}</span>` : null}
            </div>
          </div>

          <div className="detail-status-block">
            <span className=${`status status-large status-${request.status.toLowerCase().replace(/\s+/g, '-')}`}>
              ${request.status}
            </span>
            <div className=${`due-tag ${isOverdue ? 'text-danger' : ''}`}>
              ${isCompleted
                ? `Completed ${new Date(request.completed_at || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`
                : `Due: ${request.due_at ? new Date(request.due_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No deadline'}`
              }
            </div>
          </div>
        </div>

        
        <div className="detail-toolbar">
          <button className="btn btn-primary" onClick=${() => onOpenShare(request, recipientUrl)}>
            <span>💬</span> Share Link
          </button>

          <button className="btn btn-secondary" onClick=${handleCopyLink}>
            <span>🔗</span> Copy Link
          </button>

          <a href=${`/r/${request.public_token}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
            <span>↗</span> Open Recipient View
          </a>

          ${!isCompleted && request.status !== 'Closed' ? html`
            <button className="btn btn-secondary" onClick=${handleSendReminder}>
              <span>⏰</span> Send Reminder
            </button>
          ` : null}

          <div className="toolbar-dropdown-wrap" style="position: relative;">
            <button className="btn btn-secondary icon-only" onClick=${() => setMenuOpen(!menuOpen)} title="More options">
              ⋯
            </button>
            ${menuOpen ? html`
              <div className="detail-dropdown-menu" style="position: absolute; right: 0; top: 40px; z-index: 50;">
                <button className="dropdown-item" onClick=${handleDuplicate}>⧉ Duplicate Request</button>
                ${request.status !== 'Closed' ? html`
                  <button className="dropdown-item" onClick=${handleClose}>✓ Mark as Closed</button>
                ` : null}
                <button className="dropdown-item danger-text" onClick=${handleDelete}>🗑 Delete Request</button>
              </div>
            ` : null}
          </div>
        </div>
      </div>

      
      <div className="detail-layout-grid mt-20">
        
        <div className="detail-main-col">
          <div className="card detail-actions-card">
            <div className="card-head">
              <div>
                <h2>Action Items</h2>
                <p>Checklist required from ${request.recipient_name}</p>
              </div>
              <div className="progress-badge">
                ${completedActions}/${totalActions} Complete (${progressPercent}%)
              </div>
            </div>

            
            <div className="detail-progress-bar">
              <div className="detail-progress-fill" style="width: ${progressPercent}%;"></div>
            </div>

            
            <div className="actions-checklist">
              ${(request.actions || []).map((action, idx) => {
                const actionDone = ['Completed', 'Uploaded', 'Paid', 'Approved', 'Confirmed'].includes(action.status);
                const hasAttachment = action.result?.fileUrl || action.result?.dataUrl;

                return html`
                  <div key=${action.id || idx} className=${`action-card-item ${actionDone ? 'item-done' : ''}`}>
                    <div className="action-status-icon">
                      ${actionDone ? '✓' : idx + 1}
                    </div>
                    <div className="action-content">
                      <div className=${`action-type-pill type-${action.type.toLowerCase()}`}>
                        ${action.type}
                      </div>
                      <h3>${action.title}</h3>
                      ${action.description ? html`<p className="action-desc">${action.description}</p>` : null}

                      ${action.type === 'Payment' && action.amount ? html`
                        <div className="action-payment-box mt-10">
                          Amount: <strong>${formatMoney(action.amount)}</strong>
                          <span className=${`pill ${action.status === 'Paid' ? 'pill-success' : ''}`}>${action.status}</span>
                        </div>
                      ` : null}

                      ${action.result ? html`
                        <div className="action-evidence-box mt-10">
                          <div><strong>Evidence:</strong> ${action.result.note || action.result.originalFilename || 'Action Recorded'}</div>
                          ${hasAttachment ? html`
                            <a
                              href=${hasAttachment}
                              target="_blank"
                              download=${action.result.originalFilename || 'document'}
                              className="doc-download-btn"
                            >
                              📥 Download ${action.result.originalFilename || 'Document'}
                            </a>
                          ` : null}
                        </div>
                      ` : null}
                    </div>

                    <div className="action-side-status">
                      <span className=${`status status-${action.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        ${action.status}
                      </span>
                    </div>
                  </div>
                `;
              })}
            </div>
          </div>
        </div>

        
        <div className="detail-side-col">
          
          <div className="card timeline-card">
            <div className="card-head">
              <div>
                <h2>Audit Timeline</h2>
                <p>Tamper-evident record of all events</p>
              </div>
            </div>

            <div className="timeline-stream">
              ${(request.timeline || []).slice().reverse().map((item, idx) => html`
                <div key=${idx} className="timeline-node">
                  <span className=${`timeline-dot ${item.action === AUDIT_ACTIONS.REQUEST_COMPLETED ? 'done-dot' : ''}`}>●</span>
                  <div className="timeline-content">
                    <div className="timeline-event-name">${formatActionName(item.action)}</div>
                    <div className="timeline-note">${item.note || ''}</div>
                    <small className="timeline-timestamp">
                      ${new Date(item.at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                </div>
              `)}
            </div>
          </div>

          
          <div className="card reminders-card mt-16">
            <div className="card-head">
              <div>
                <h2>Reminders Schedule</h2>
                <p>Automated follow-up rules</p>
              </div>
            </div>
            <div className="reminders-list">
              <div className="reminder-item">
                <span className="reminder-icon">⏰</span>
                <div>
                  <b>48 Hours Before Due Date</b>
                  <small>Automated WhatsApp & Email alert</small>
                </div>
                <span className="badge badge-success">Scheduled</span>
              </div>
              <div className="reminder-item">
                <span className="reminder-icon">⚠️</span>
                <div>
                  <b>Due Date Morning (9:00 AM)</b>
                  <small>Final day action reminder</small>
                </div>
                <span className="badge badge-success">Scheduled</span>
              </div>
              <div className="reminder-item">
                <span className="reminder-icon">🚨</span>
                <div>
                  <b>1 Day Overdue</b>
                  <small>Urgent follow-up dispatch</small>
                </div>
                <span className="badge">Rule Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
