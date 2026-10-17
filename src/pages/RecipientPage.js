// DONE — Recipient Experience & Viral Growth Engine (React 19 Component)
// Zero login required. Mobile-first. Maximum completion conversion.
import { React, useState, useEffect, html } from '../react-helpers.js';
import { db } from '../services/db.js';
import { storageService } from '../services/storage.js';
import { paymentService } from '../services/payment.js';
import { showToast } from '../components/toast.js';

export function RecipientPage({ token, navigate }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentAction, setActivePaymentAction] = useState(null);
  const [uploadingActionId, setUploadingActionId] = useState(null);
  const [approvalComments, setApprovalComments] = useState({});

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const req = db.getRequestByPublicToken(token);
    if (req) {
      db.markRequestOpened(req.id);
      setRequest({ ...req });
    }
    setLoading(false);
  }, [token]);

  if (loading) {
    return html`
      <div className="recipient-shell">
        <div className="recipient-card text-center">
          <div className="loading-spinner"></div>
          <p className="mt-12">Loading secure request...</p>
        </div>
      </div>
    `;
  }

  if (!request) {
    return html`
      <div className="recipient-shell">
        <div className="recipient-card text-center">
          <div className="empty-icon danger">!</div>
          <h2>Request Link Expired or Invalid</h2>
          <p>We could not locate this request. Please contact the sender for an updated link.</p>
          <a href="/" className="btn btn-secondary mt-16" onClick=${(e) => { e.preventDefault(); navigate('/'); }}>
            Visit DONE Home
          </a>
        </div>
      </div>
    `;
  }

  const actions = request.actions || [];
  const totalActions = actions.length || 1;
  const completedActions = actions.filter(a =>
    ['Completed', 'Uploaded', 'Paid', 'Approved', 'Confirmed'].includes(a.status)
  ).length;

  const isCancelledOrClosed = ['Cancelled', 'Closed'].includes(request.status);
  const isAllComplete = !isCancelledOrClosed && (completedActions === totalActions || request.status === 'Completed');
  const progressPercent = Math.round((completedActions / totalActions) * 100);
  const orgName = request.organization_name || 'Northstar Consulting';

  // Handle Document Upload
  const handleFileUpload = async (actionId, file) => {
    if (!file) return;
    try {
      setUploadingActionId(actionId);
      const uploadRes = await storageService.uploadFile(file, `req_${request.id}`);
      const updatedReq = db.completeAction(request.id, actionId, {
        originalFilename: file.name,
        fileUrl: uploadRes.url,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      });
      setRequest({ ...updatedReq });
      showToast(`Uploaded ${file.name} successfully!`, 'success');
    } catch (err) {
      console.error('File upload error:', err);
      showToast('File upload failed. Please try again.', 'error');
    } finally {
      setUploadingActionId(null);
    }
  };

  // Handle Payment Sandbox
  const handleStartPayment = (action) => {
    setActivePaymentAction(action);
    setPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!activePaymentAction) return;
    const ref = 'PAY_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const updatedReq = db.completeAction(request.id, activePaymentAction.id, {
      status: 'Paid',
      providerReference: ref,
      amount: activePaymentAction.amount,
      currency: activePaymentAction.currency || 'INR',
      method: 'UPI / Demo Gateway',
      paidAt: new Date().toISOString()
    });
    setRequest({ ...updatedReq });
    setPaymentModalOpen(false);
    setActivePaymentAction(null);
    showToast(`Payment of ₹${activePaymentAction.amount?.toLocaleString('en-IN')} confirmed!`, 'success');
  };

  // Handle Approval
  const handleApproval = (actionId, decision) => {
    const comment = approvalComments[actionId] || '';
    const updatedReq = db.completeAction(request.id, actionId, {
      decision,
      comment,
      status: decision === 'Approved' ? 'Approved' : 'Rejected',
      decidedAt: new Date().toISOString()
    });
    setRequest({ ...updatedReq });
    showToast(`Marked as ${decision}`, decision === 'Approved' ? 'success' : 'default');
  };

  // Handle Confirmation
  const handleConfirmation = (actionId, response) => {
    const updatedReq = db.completeAction(request.id, actionId, {
      response,
      status: response === 'Confirmed' ? 'Confirmed' : 'Declined',
      respondedAt: new Date().toISOString()
    });
    setRequest({ ...updatedReq });
    showToast(`Response recorded: ${response}`, 'success');
  };

  // Viral referral click
  const handleViralConvert = () => {
    db.recordReferral(request.id, request.recipient_name);
    navigate('/signup');
  };

  const dueDateStr = request.due_at
    ? new Date(request.due_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'As soon as possible';

  return html`
    <div className="recipient-shell">
      
      <header className="recipient-top-bar">
        <div className="recipient-brand">
          <div className="logo">✓</div>
          <div>
            <b>DONE</b>
            <span className="sub-trust">Secure Action Protocol</span>
          </div>
        </div>
        <div className="security-indicator">
          <span>🔒 256-bit Encrypted Link</span>
          <span className="no-app-badge">No App Required</span>
        </div>
      </header>

      
      <main className="recipient-main">
        ${isCancelledOrClosed ? html`
          <div className="recipient-card card text-center">
            <div style=${{ fontSize: '44px', marginBottom: '12px' }}>🚫</div>
            <h1 style=${{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Request ${request.status}</h1>
            <p className="text-muted" style=${{ fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              This request was marked as <strong>${request.status.toLowerCase()}</strong> by <strong>${orgName}</strong>. No further actions or submissions are required from you.
            </p>
            <a href="/" className="btn btn-secondary btn-sm" onClick=${(e) => { e.preventDefault(); navigate('/'); }}>
              Visit DONE Home
            </a>
          </div>
        ` : isAllComplete ? html`
          
          <div className="recipient-card card done-celebration-card text-center">
            <div className="done-check-badge">✓</div>
            <h1>DONE</h1>
            <p className="lead">Everything has been successfully completed.</p>

            <div className="done-summary-box">
              <div className="summary-line">
                <span>Request:</span>
                <strong>${request.title}</strong>
              </div>
              <div className="summary-line">
                <span>Sender:</span>
                <strong>${orgName}</strong>
              </div>
              <div className="summary-line">
                <span>Reference ID:</span>
                <strong className="font-mono">${request.reference_no}</strong>
              </div>
              <div className="summary-line">
                <span>Completed At:</span>
                <strong>${new Date().toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <p className="done-sub-msg">
              The sender has been notified automatically with a complete audit record.
            </p>
          </div>
        ` : html`
          
          <div className="recipient-card card">
            <div className="rec-card-header">
              <div className="eyebrow">${request.reference_no} • FROM ${orgName.toUpperCase()}</div>
              <h1>${request.title}</h1>
              <p className="rec-intro">
                Hello <strong>${request.recipient_name}</strong>, please complete the ${totalActions} requested item${totalActions > 1 ? 's' : ''} below.
              </p>

              <div className="due-deadline-box">
                <span>Deadline</span>
                <b>${dueDateStr}</b>
              </div>
            </div>

            
            <div className="progress-section">
              <div className="progress-label-row">
                <span>Overall Progress</span>
                <strong>${completedActions} of ${totalActions} actions completed</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>

            
            <div className="recipient-actions-list mt-20">
              ${actions.map((action, idx) => {
                const isDone = ['Completed', 'Uploaded', 'Paid', 'Approved', 'Confirmed'].includes(action.status);
                return html`
                  <div key=${action.id || idx} className=${`rec-action-card ${isDone ? 'rec-action-done' : ''}`}>
                    <div className="rec-action-head">
                      <div className="action-badge-row">
                        <span className="action-num">${isDone ? '✓' : idx + 1}</span>
                        <span className=${`type-pill type-${action.type.toLowerCase()}`}>${action.type}</span>
                        ${action.is_required ? html`<span className="required-tag">Required</span>` : html`<span className="optional-tag">Optional</span>`}
                      </div>
                      <span className=${`action-status-tag ${isDone ? 'status-completed' : 'status-pending'}`}>
                        ${isDone ? 'Completed' : 'Action Required'}
                      </span>
                    </div>

                    <div className="rec-action-body">
                      <h3>${action.title}</h3>
                      ${action.description ? html`<p className="rec-action-desc">${action.description}</p>` : null}

                      
                      ${action.type === 'Document' ? html`
                        ${isDone ? html`
                          <div className="action-success-box">
                            <span className="success-icon">✓</span>
                            <div>
                              <b>Document submitted securely</b>
                              <small>${action.result?.originalFilename || 'Verified PDF document'}</small>
                            </div>
                          </div>
                        ` : html`
                          <div className="document-upload-zone">
                            <div className="upload-drop-content">
                              <span className="upload-cloud-icon">📂</span>
                              <div className="upload-text">
                                <b>Click to upload or drag & drop</b>
                                <small>Supported formats: PDF, JPG, PNG (Max 10 MB)</small>
                              </div>
                              <label className="btn btn-secondary btn-sm upload-input-btn">
                                ${uploadingActionId === action.id ? 'Uploading...' : 'Select File'}
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                                  hidden
                                  disabled=${uploadingActionId === action.id}
                                  onChange=${(e) => {
                                    if (e.target.files?.[0]) handleFileUpload(action.id, e.target.files[0]);
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        `}
                      ` : null}

                      
                      ${action.type === 'Payment' ? html`
                        ${isDone ? html`
                          <div className="action-success-box">
                            <span className="success-icon">✓</span>
                            <div>
                              <b>Payment Recorded: ₹${(action.amount || 0).toLocaleString('en-IN')} (Demo Sandbox)</b>
                              <small>Reference: ${action.result?.providerReference || 'PAY_DEMO_COMPLETED'} • Test simulation, no bank deduction</small>
                            </div>
                          </div>
                        ` : html`
                          <div className="payment-action-box">
                            <div className="pay-amount-callout">
                              <span className="pay-label">Amount Due:</span>
                              <strong className="pay-val">₹${(action.amount || 0).toLocaleString('en-IN')}</strong>
                            </div>
                            <button
                              className="btn btn-primary"
                              onClick=${() => handleStartPayment(action)}
                            >
                              Pay ₹${(action.amount || 0).toLocaleString('en-IN')} (Demo Sandbox) →
                            </button>
                          </div>
                        `}
                      ` : null}

                      
                      ${action.type === 'Approval' ? html`
                        ${isDone ? html`
                          <div className="action-success-box">
                            <span className="success-icon">✓</span>
                            <div>
                              <b>Decision: ${action.result?.decision || 'Approved'}</b>
                              ${action.result?.comment ? html`<small>"${action.result.comment}"</small>` : null}
                            </div>
                          </div>
                        ` : html`
                          <div className="approval-action-box">
                            <div className="approval-preview-card">
                              <div className="app-icon">📄</div>
                              <div>
                                <b>Scope of Work & Commercial Quotation</b>
                                <small>Click to review detailed document items</small>
                              </div>
                            </div>
                            <div className="approval-comment-input mt-10">
                              <input
                                type="text"
                                className="approval-comment-field"
                                placeholder="Optional comments or change requests..."
                                value=${approvalComments[action.id] || ''}
                                onInput=${(e) => setApprovalComments({ ...approvalComments, [action.id]: e.target.value })}
                              />
                            </div>
                            <div className="approval-btn-group mt-12">
                              <button className="btn btn-primary" onClick=${() => handleApproval(action.id, 'Approved')}>
                                ✓ Approve
                              </button>
                              <button className="btn btn-secondary" onClick=${() => handleApproval(action.id, 'Changes Requested')}>
                                Request Changes
                              </button>
                              <button className="btn btn-secondary text-danger" onClick=${() => handleApproval(action.id, 'Rejected')}>
                                Reject
                              </button>
                            </div>
                          </div>
                        `}
                      ` : null}

                      
                      ${action.type === 'Confirmation' ? html`
                        ${isDone ? html`
                          <div className="action-success-box">
                            <span className="success-icon">✓</span>
                            <div>
                              <b>Response Recorded: ${action.result?.response || 'Confirmed'}</b>
                              ${action.result?.comment ? html`<small>"${action.result.comment}"</small>` : null}
                            </div>
                          </div>
                        ` : html`
                          <div className="confirmation-action-box">
                            <p className="confirm-prompt">Please confirm whether you accept the schedule or service delivery.</p>
                            <div className="confirmation-btn-group mt-10">
                              <button className="btn btn-primary" onClick=${() => handleConfirmation(action.id, 'Confirmed')}>
                                ✓ Confirm
                              </button>
                              <button className="btn btn-secondary" onClick=${() => handleConfirmation(action.id, 'Rescheduled')}>
                                Reschedule
                              </button>
                              <button className="btn btn-secondary" onClick=${() => handleConfirmation(action.id, 'Declined')}>
                                Decline
                              </button>
                            </div>
                          </div>
                        `}
                      ` : null}
                    </div>
                  </div>
                `;
              })}
            </div>
          </div>
        `}
      </main>

      
      <section className="recipient-viral-box card">
        <div className="viral-content">
          <div className="viral-icon">💡</div>
          <div>
            <b>Need documents, approvals, or payments from someone?</b>
            <p>Stop chasing people manually. Send a structured request in 60 seconds.</p>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick=${handleViralConvert}>
          Create Free Request →
        </button>
      </section>

      
      <footer className="recipient-footer-note">
        <p>🔒 Privacy by Design: DONE never collects bank OTPs, UPI PINs, CVVs or passwords. Powered by Qsura India Pvt Ltd.</p>
      </footer>

      
      ${paymentModalOpen && activePaymentAction ? html`
        <div className="modal-backdrop" onClick=${(e) => { if (e.target === e.currentTarget) setPaymentModalOpen(false); }}>
          <div className="payment-modal-card card">
            <div className="modal-head">
              <div>
                <div className="eyebrow">DEMO PAYMENT GATEWAY</div>
                <h3>Pay to ${orgName}</h3>
              </div>
              <button className="icon-btn" onClick=${() => setPaymentModalOpen(false)}>✕</button>
            </div>

            <div className="payment-modal-body">
              <div className="pay-amount-display">₹${(activePaymentAction.amount || 0).toLocaleString('en-IN')}</div>
              <p className="pay-purpose">${activePaymentAction.title}</p>

              <div className="payment-methods-select">
                <label className="pay-method-opt selected">
                  <input type="radio" name="paymethod" defaultChecked />
                  <span>UPI Apps & QR Code (Demo)</span>
                </label>
                <label className="pay-method-opt">
                  <input type="radio" name="paymethod" />
                  <span>NetBanking / Cards (Demo)</span>
                </label>
              </div>

              <div className="sandbox-disclaimer">
                <span>⚠️ SANDBOX SIMULATION</span>
                <small>No real money will be deducted. Razorpay / Cashfree integration ready.</small>
              </div>
            </div>

            <div className="modal-foot">
              <button className="btn btn-secondary" onClick=${() => setPaymentModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick=${handleConfirmPayment}>
                Confirm & Pay (Demo) →
              </button>
            </div>
          </div>
        </div>
      ` : null}
    </div>
  `;
}
