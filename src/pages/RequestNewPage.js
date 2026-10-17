import { React, useState, useEffect, html } from '../react-helpers.js';
import { aiService } from '../services/ai.js';
import { db } from '../services/db.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { showToast } from '../components/toast.js';

export function RequestNewPage({ navigate, onOpenShare, presetType = '', presetTemplateId = '' }) {
  const { organization, plan } = useWorkspace();
  const planLimits = { free: 10, starter: 100, growth: 500, business: 2000 };
  const currentPlan = (plan || organization?.plan || 'growth').toLowerCase();
  const currentLimit = planLimits[currentPlan] || 500;
  const currentRequestsCount = db.getRequests().length;
  const isQuotaExceeded = currentRequestsCount >= currentLimit;

  const defaultDue = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [naturalText, setNaturalText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('Ready to parse natural request');

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [title, setTitle] = useState('');
  const [requestType, setRequestType] = useState(presetType || 'Multi-Action');
  const [dueDate, setDueDate] = useState(defaultDue);

  const [actions, setActions] = useState([
    { id: '1', type: 'Document', title: 'GST Certificate (Form REG-06)', is_required: true, description: 'Clear PDF or image' }
  ]);

  const [remind48h, setRemind48h] = useState(true);
  const [remindDue, setRemindDue] = useState(true);
  const [remindOverdue, setRemindOverdue] = useState(true);

  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (presetTemplateId) {
      const template = db.getTemplates().find(t => t.id === presetTemplateId);
      if (template) {
        setTitle(template.name);
        setRequestType(template.type || 'Multi-Action');
        if (template.actions && template.actions.length > 0) {
          setActions(template.actions.map((a, i) => ({ ...a, id: String(i + 1) })));
        }
      }
    } else if (presetType) {
      setRequestType(presetType);
      if (presetType === 'Payment') {
        setActions([{ id: '1', type: 'Payment', title: 'Milestone Advance Payment', amount: 15000, currency: 'INR', is_required: true }]);
      } else if (presetType === 'Approval') {
        setActions([{ id: '1', type: 'Approval', title: 'Scope of Work & Quotation', is_required: true }]);
      } else if (presetType === 'Confirmation') {
        setActions([{ id: '1', type: 'Confirmation', title: 'Confirm Site Inspection Schedule', is_required: true }]);
      }
    }
  }, [presetType, presetTemplateId]);

  // Natural Language AI Parsing
  const handleParseNatural = async () => {
    if (!naturalText.trim()) {
      showToast('Please type something to parse first', 'default');
      return;
    }
    setParsing(true);
    setParseStatus('AI is parsing your request...');
    try {
      const parsed = await aiService.parseNaturalRequest(naturalText);
      if (parsed.recipient_name) setRecipientName(parsed.recipient_name);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.due_at) setDueDate(parsed.due_at);
      if (parsed.request_type) setRequestType(parsed.request_type);
      if (parsed.actions && parsed.actions.length > 0) {
        setActions(parsed.actions.map((a, i) => ({ ...a, id: String(i + 1) })));
      }
      setParseStatus('Parsed & autofilled successfully! ✓');
      showToast('Autofilled fields from your description!', 'success');
    } catch (e) {
      console.error(e);
      setParseStatus('Could not parse completely. Please review fields.');
    } finally {
      setParsing(false);
    }
  };

  const handleAddAction = () => {
    const nextId = String(Date.now());
    setActions([...actions, {
      id: nextId,
      type: 'Document',
      title: 'Additional Requirement',
      description: '',
      is_required: true,
      amount: 0
    }]);
  };

  const handleUpdateAction = (id, patch) => {
    setActions(actions.map(a => a.id === id ? { ...a, ...patch } : a));
  };

  const handleRemoveAction = (id) => {
    if (actions.length <= 1) {
      showToast('At least one action is required', 'default');
      return;
    }
    setActions(actions.filter(a => a.id !== id));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (isQuotaExceeded) {
      showToast(`You have reached your ${currentPlan.toUpperCase()} plan limit of ${currentLimit} requests. Please upgrade.`, 'error');
      navigate('/billing');
      return;
    }
    if (!recipientName.trim()) {
      showToast('Recipient name is required', 'error');
      return;
    }
    if (!title.trim()) {
      showToast('Request title is required', 'error');
      return;
    }

    const totalAmount = actions.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);

    const newRequest = db.createRequest({
      title,
      description: `Request created for ${recipientName}`,
      recipient_name: recipientName,
      recipient_phone: recipientPhone.trim(),
      recipient_email: recipientEmail.trim(),
      request_type: requestType,
      due_at: dueDate,
      amount: totalAmount,
      actions: actions.map(a => ({
        type: a.type,
        title: a.title,
        description: a.description || '',
        is_required: a.is_required,
        amount: Number(a.amount) || 0,
        currency: 'INR'
      }))
    });

    showToast('Request created successfully! ✓', 'success');
    const link = `${window.location.origin}/r/${newRequest.public_token}`;
    onOpenShare(newRequest, link);
    navigate(`/requests/${encodeURIComponent(newRequest.id)}`);
  };

  return html`
    <section className="page narrow request-new-page">
      <div className="breadcrumb-row">
        <a href="/requests" className="link-back" onClick=${(e) => { e.preventDefault(); navigate('/requests'); }}>
          ← Cancel & Back
        </a>
      </div>

      <div className="hero compact">
        <div>
          <div className="eyebrow">NEW REQUEST</div>
          <h1>Create a Request</h1>
          <p className="lead">Describe what you need in plain words, or configure actions step-by-step.</p>
        </div>
      </div>

      ${isQuotaExceeded ? html`
        <div className="card quota-alert-banner mb-16" style=${{ background: '#fef2f2', borderColor: '#fca5a5', padding: '16px 20px', borderRadius: '12px' }}>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong style=${{ color: '#991b1b', fontSize: '15px' }}>Plan Request Limit Reached (${currentRequestsCount} / ${currentLimit})</strong>
              <p style=${{ fontSize: '13px', color: '#7f1d1d', margin: '4px 0 0' }}>
                You have reached your <strong>${currentPlan.toUpperCase()}</strong> plan allowance. Upgrade to maintain continuous request workflows.
              </p>
            </div>
            <a href="/billing" className="btn btn-primary btn-sm" onClick=${(e) => { e.preventDefault(); navigate('/billing'); }}>
              Upgrade Plan →
            </a>
          </div>
        </div>
      ` : null}

      
      <div className="card ai-composer-card">
        <div className="ai-composer-header">
          <div className="ai-spark-icon">✦</div>
          <div>
            <h3>Describe it naturally</h3>
            <p>Type in English or Hinglish. DONE extracts the recipient, actions, payment amount, and deadline.</p>
          </div>
        </div>

        <div className="ai-input-wrap">
          <textarea
            value=${naturalText}
            onInput=${(e) => setNaturalText(e.target.value)}
            placeholder="Example: Rahul se GST certificate, quotation approval aur ₹15,000 advance 30 September tak lena hai."
            rows="3"
          />

          <div className="natural-suggestions">
            <span className="sugg-label">Try example:</span>
            <button
              type="button"
              className="sugg-chip"
              onClick=${() => setNaturalText('Rahul se GST certificate, quotation approval aur ₹15,000 advance 30 September tak lena hai.')}
            >
              Multi-action (GST + Quote + ₹15k)
            </button>
            <button
              type="button"
              className="sugg-chip"
              onClick=${() => setNaturalText('Sara Mehta ko homepage design approve karwana hai Friday tak')}
            >
              Design Approval
            </button>
            <button
              type="button"
              className="sugg-chip"
              onClick=${() => setNaturalText('Amit Patel se ₹45,000 milestone 2 payment 28 September tak chahiye')}
            >
              Milestone Payment ₹45,000
            </button>
          </div>
        </div>

        <div className="ai-action-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick=${handleParseNatural}
            disabled=${parsing}
          >
            <span>✦</span> ${parsing ? 'Parsing...' : 'Parse & Autofill Fields'}
          </button>
          <span className="ai-disclaimer">${parseStatus}</span>
        </div>
      </div>

      <div className="or-divider">
        <span>OR CONFIGURE MANUALLY</span>
      </div>

      
      <form onSubmit=${handleSubmit} className="card form-card">
        
        <div className="form-section">
          <div className="section-title-sm">
            <span className="sec-num">1</span>
            <b>Who needs to complete this?</b>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Recipient Name / Business <span className="req-star">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma or Sharma Logistics"
                value=${recipientName}
                onInput=${(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>WhatsApp / Phone <span className="text-muted">(optional)</span></label>
              <input
                type="tel"
                placeholder="+91 98201 12345"
                value=${recipientPhone}
                onInput=${(e) => setRecipientPhone(e.target.value)}
              />
            </div>

            <div className="form-group form-col-span-2">
              <label>Email Address <span className="text-muted">(optional)</span></label>
              <input
                type="email"
                placeholder="client@company.in"
                value=${recipientEmail}
                onInput=${(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        
        <div className="form-section mt-20">
          <div className="section-title-sm">
            <span className="sec-num">2</span>
            <b>What is this request about?</b>
          </div>

          <div className="form-grid">
            <div className="form-group form-col-span-2">
              <label>Request Title <span className="req-star">*</span></label>
              <input
                type="text"
                required
                placeholder="e.g. FY26 Tax Filing Documents & Advance"
                value=${title}
                onInput=${(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Primary Type</label>
              <select value=${requestType} onChange=${(e) => setRequestType(e.target.value)}>
                <option value="Multi-Action">Multi-Action (Documents + Payment + Approval)</option>
                <option value="Document">Document Request</option>
                <option value="Payment">Payment Request</option>
                <option value="Approval">Approval Request</option>
                <option value="Confirmation">Confirmation Request</option>
              </select>
            </div>

            <div className="form-group">
              <label>Due Date <span className="req-star">*</span></label>
              <input
                type="date"
                required
                value=${dueDate}
                onChange=${(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        
        <div className="form-section mt-20">
          <div className="section-title-sm flex-between">
            <div>
              <span className="sec-num">3</span>
              <b>Actions required from recipient</b>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick=${handleAddAction}>
              ＋ Add Action
            </button>
          </div>

          <div className="actions-builder-list mt-12">
            ${actions.map((act, index) => html`
              <div key=${act.id || index} className="action-builder-row card">
                <div className="action-row-head">
                  <div className="action-type-selector">
                    <span className="builder-num">${index + 1}</span>
                    <select
                      value=${act.type}
                      onChange=${(e) => handleUpdateAction(act.id, { type: e.target.value })}
                    >
                      <option value="Document">Document Upload</option>
                      <option value="Payment">Payment Collection</option>
                      <option value="Approval">Quote / Approval</option>
                      <option value="Confirmation">Yes/No Confirmation</option>
                    </select>
                  </div>
                  <div className="action-row-actions">
                    <label className="checkbox-mini">
                      <input
                        type="checkbox"
                        checked=${act.is_required}
                        onChange=${(e) => handleUpdateAction(act.id, { is_required: e.target.checked })}
                      />
                      <span>Required</span>
                    </label>
                    <button
                      type="button"
                      className="icon-btn-danger"
                      onClick=${() => handleRemoveAction(act.id)}
                      title="Remove action"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="action-row-inputs mt-8">
                  <input
                    type="text"
                    placeholder="Action Title (e.g. Upload PAN Card)"
                    value=${act.title}
                    onInput=${(e) => handleUpdateAction(act.id, { title: e.target.value })}
                  />
                  ${act.type === 'Payment' ? html`
                    <div className="input-group-row mt-6">
                      <span className="input-prefix">₹</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value=${act.amount || ''}
                        onInput=${(e) => handleUpdateAction(act.id, { amount: Number(e.target.value) })}
                      />
                    </div>
                  ` : null}
                  <input
                    type="text"
                    className="mt-6"
                    placeholder="Helper instructions for recipient (optional)"
                    value=${act.description || ''}
                    onInput=${(e) => handleUpdateAction(act.id, { description: e.target.value })}
                  />
                </div>
              </div>
            `)}
          </div>
        </div>

        
        <div className="form-section mt-20">
          <div className="section-title-sm">
            <span className="sec-num">4</span>
            <b>Automated Reminders</b>
          </div>

          <div className="reminders-checkboxes">
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked=${remind48h}
                onChange=${(e) => setRemind48h(e.target.checked)}
              />
              <span>Remind 48 hours before due date</span>
            </label>
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked=${remindDue}
                onChange=${(e) => setRemindDue(e.target.checked)}
              />
              <span>Remind on due date morning (9:00 AM)</span>
            </label>
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked=${remindOverdue}
                onChange=${(e) => setRemindOverdue(e.target.checked)}
              />
              <span>Follow up 1 day after overdue</span>
            </label>
          </div>
        </div>

        
        <div className="form-footer-box mt-24">
          <div className="security-callout">
            <span className="sec-icon">🔒</span>
            <div>
              <b>Recipient gets a secure, encrypted link.</b>
              <small>No account or password required to complete the request.</small>
            </div>
          </div>

          <div className="form-btn-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick=${() => setPreviewOpen(true)}
            >
              Preview Recipient View
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              Create & Send Request →
            </button>
          </div>
        </div>
      </form>

      
      ${previewOpen ? html`
        <div className="modal-backdrop" onClick=${(e) => { if (e.target === e.currentTarget) setPreviewOpen(false); }}>
          <div className="preview-modal-dialog card">
            <div className="modal-head">
              <div>
                <div className="eyebrow">REVIEW REQUEST</div>
                <h2>Recipient Experience Preview</h2>
              </div>
              <button type="button" className="icon-btn" onClick=${() => setPreviewOpen(false)}>✕</button>
            </div>

            <div className="preview-recipient-box">
              <div className="preview-card-box">
                <small className="eyebrow">DEMO PREVIEW • FROM YOUR WORKSPACE</small>
                <h3>${title || 'Untitled Request'}</h3>
                <p>Hello <b>${recipientName || 'Recipient Name'}</b>, please complete the ${actions.length} action item(s) below.</p>
                <div className="preview-actions-list mt-12">
                  ${actions.map((a, i) => html`
                    <div key=${i} className="preview-action-pill">
                      <span className=${`type-pill type-${a.type.toLowerCase()}`}>${a.type}</span>
                      <b>${a.title}</b>
                      ${a.amount ? html`<span className="text-green">₹${a.amount.toLocaleString('en-IN')}</span>` : null}
                    </div>
                  `)}
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <button type="button" className="btn btn-secondary" onClick=${() => setPreviewOpen(false)}>Back to Edit</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick=${() => { setPreviewOpen(false); handleSubmit(); }}
              >
                Confirm & Send Request →
              </button>
            </div>
          </div>
        </div>
      ` : null}
    </section>
  `;
}
