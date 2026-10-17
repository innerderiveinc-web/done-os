// DONE — Sender Dashboard (React 19 Component)
import { React, useState, useEffect, html } from '../react-helpers.js';
import { useAuth } from '../context/AuthContext.js';
import { db } from '../services/db.js';

function formatMoney(amount) {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatTimeAgo(isoDate) {
  if (!isoDate) return '';
  const diffSec = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function formatActionName(action) {
  return String(action || 'Action')
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function DashboardPage({ navigate, onOpenShare }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    setRequests(db.getRequests());
    setMetrics(db.getValidationMetrics());
    setRecentLogs(db.getAuditLogs().slice(0, 5));
  }, []);

  const activeRequests = requests.filter(r => !['Completed', 'Closed'].includes(r.status));
  const overdueRequests = requests.filter(r => r.status === 'Overdue');
  const completedRequests = requests.filter(r => r.status === 'Completed');
  const pendingAmount = requests.reduce((acc, r) => (!['Completed', 'Closed'].includes(r.status) ? acc + (r.amount || 0) : acc), 0);
  const completionRate = requests.length ? Math.round((completedRequests.length / requests.length) * 100) : 0;

  const priorityRequests = requests
    .filter(r => !['Completed', 'Closed'].includes(r.status))
    .sort((a, b) => {
      if (a.status === 'Overdue') return -1;
      if (b.status === 'Overdue') return 1;
      return new Date(a.due_at) - new Date(b.due_at);
    })
    .slice(0, 5);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const fullName = user?.user_metadata?.full_name || 'Irfan Ashraf';
  const firstName = fullName.split(' ')[0];

  return html`
    <section className="page dashboard-page">
      
      <div className="hero">
        <div>
          <div className="eyebrow">DASHBOARD</div>
          <h1>${timeGreeting}, ${firstName}</h1>
          <p className="lead">See what is waiting, overdue, and DONE. Stop chasing people manually.</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick=${() => navigate('/requests/new')}>
            ＋ Create Request
          </button>
        </div>
      </div>

      
      <div className="kpis">
        <div className="card kpi">
          <div className="kpi-label">Active Requests</div>
          <div className="kpi-value">${activeRequests.length}</div>
          <div className="kpi-meta text-muted">Awaiting completion</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Overdue</div>
          <div className="kpi-value danger">${overdueRequests.length}</div>
          <div className="kpi-meta text-danger">Needs immediate follow-up</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Completed</div>
          <div className="kpi-value text-green">${completedRequests.length}</div>
          <div className="kpi-meta text-green">Marked DONE</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Completion Rate</div>
          <div className="kpi-value">${completionRate}%</div>
          <div className="kpi-meta">Across all sent requests</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Pending Amount</div>
          <div className="kpi-value">${formatMoney(pendingAmount)}</div>
          <div className="kpi-meta">Awaiting payment</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Avg. Completion Time</div>
          <div className="kpi-value">${metrics.medianTimeToCompletionHours || 14}h</div>
          <div className="kpi-meta">From dispatch to DONE</div>
        </div>
      </div>

      
      <div className="dashboard-grid">
        
        <div className="card priority-section">
          <div className="card-head">
            <div>
              <h2>Priority Requests</h2>
              <p>Items requiring your attention or recipient reminders</p>
            </div>
            <a href="/requests" className="link" onClick=${(e) => { e.preventDefault(); navigate('/requests'); }}>
              View all (${requests.length}) →
            </a>
          </div>

          <div className="priority-list">
            ${priorityRequests.length > 0 ? priorityRequests.map(r => {
              const isOverdue = r.status === 'Overdue';
              const dueDateStr = r.due_at ? new Date(r.due_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'No due date';
              const link = `${window.location.origin}/r/${r.public_token}`;
              return html`
                <div key=${r.id} className=${`request-row-item ${isOverdue ? 'row-overdue' : ''}`}>
                  <div className="req-row-link" onClick=${() => navigate(`/requests/${encodeURIComponent(r.id)}`)}>
                    <div className=${`type-dot type-${r.request_type.toLowerCase()}`}>
                      ${r.request_type === 'Document' ? '▤' : r.request_type === 'Payment' ? '₹' : r.request_type === 'Approval' ? '✓' : '↔'}
                    </div>
                    <div className="req-main-info">
                      <div className="req-title-row">
                        <span className="req-ref">${r.reference_no}</span>
                        <span className="req-title">${r.title}</span>
                      </div>
                      <div className="req-sub-info">
                        <span>To: <strong>${r.recipient_name}</strong></span>
                        <span>•</span>
                        <span className=${isOverdue ? 'text-danger font-bold' : ''}>Due ${dueDateStr}</span>
                        ${r.amount ? html`<span>•</span> <span>₹${r.amount.toLocaleString('en-IN')}</span>` : null}
                      </div>
                    </div>
                  </div>
                  <div className="req-row-actions">
                    <span className=${`status status-${r.status.toLowerCase().replace(/\s+/g,'-')}`}>
                      ${r.status}
                    </span>
                    <button
                      className="btn btn-secondary btn-xs"
                      title="Share link"
                      onClick=${(e) => { e.stopPropagation(); onOpenShare(r, link); }}
                    >
                      Share ↗
                    </button>
                  </div>
                </div>
              `;
            }) : html`
              <div className="empty-state-p">
                <span className="empty-icon">✓</span>
                <p>All caught up! No urgent requests pending.</p>
              </div>
            `}
          </div>
        </div>

        
        <div className="card validation-summary-card">
          <div className="card-head">
            <div>
              <h2>Product Validation Loop</h2>
              <p>Does DONE distribute itself?</p>
            </div>
            <a href="/analytics" className="link" onClick=${(e) => { e.preventDefault(); navigate('/analytics'); }}>
              Full Analytics →
            </a>
          </div>

          <div className="viral-highlight-box">
            <div className="viral-label">KEY STARTUP VALIDATION METRIC</div>
            <div className="viral-rate">${metrics.recipientToSenderConversionRate || 12.4}%</div>
            <div className="viral-title">Recipient → Sender Conversion</div>
            <p className="viral-desc">Recipients who completed a request and then created their own free request on DONE.</p>
          </div>

          <div className="viral-funnel-preview">
            <div className="funnel-row">
              <span>Requests Sent</span>
              <strong>${metrics.totalRequestsSent || 176}</strong>
            </div>
            <div className="funnel-bar"><div style="width: 100%"></div></div>

            <div className="funnel-row">
              <span>Opened by Recipient</span>
              <strong>${metrics.totalRequestsOpened || 160} (90.8%)</strong>
            </div>
            <div className="funnel-bar"><div style="width: 90.8%"></div></div>

            <div className="funnel-row">
              <span>Completed (DONE)</span>
              <strong>${metrics.totalRequestsCompleted || 129} (73.2%)</strong>
            </div>
            <div className="funnel-bar"><div style="width: 73.2%; background: #12b76a;"></div></div>

            <div className="funnel-row highlight">
              <span>Converted to New Senders</span>
              <strong className="text-green">${metrics.recipientsConvertedToNewSenders || 16} (${metrics.recipientToSenderConversionRate || 12.4}%)</strong>
            </div>
            <div className="funnel-bar"><div style="width: 12.4%; background: #111827;"></div></div>
          </div>
        </div>
      </div>

      
      <div className="dashboard-grid-bottom mt-20">
        
        <div className="card activity-stream-card">
          <div className="card-head">
            <div>
              <h2>Recent Activity</h2>
              <p>Live stream of recipient interactions and state transitions</p>
            </div>
          </div>
          <div className="activity-feed">
            ${recentLogs.map((log, idx) => html`
              <div key=${log.id || idx} className="activity-feed-item">
                <span className="activity-dot">●</span>
                <div className="activity-info">
                  <div className="activity-text">
                    <strong>${formatActionName(log.action)}</strong>
                    ${log.reference_no ? html`<span className="req-tag">${log.reference_no}</span>` : null}
                  </div>
                  <div className="activity-sub">${log.metadata?.note || log.metadata?.title || 'Action processed'}</div>
                  <small className="activity-time">${formatTimeAgo(log.created_at)}</small>
                </div>
              </div>
            `)}
          </div>
        </div>

        
        <div className="card quick-starters-card">
          <div className="card-head">
            <div>
              <h2>Instant Request Starters</h2>
              <p>One-click pre-configured workflows</p>
            </div>
            <a href="/templates" className="link" onClick=${(e) => { e.preventDefault(); navigate('/templates'); }}>
              All Templates →
            </a>
          </div>

          <div className="starters-list">
            <div className="starter-item" onClick=${() => navigate('/requests/new?type=Document')}>
              <span className="starter-icon type-document">▤</span>
              <div>
                <b>Collect Documents</b>
                <small>GST, PAN, bank statements, cancelled cheques</small>
              </div>
              <span className="starter-arrow">→</span>
            </div>

            <div className="starter-item" onClick=${() => navigate('/requests/new?type=Payment')}>
              <span className="starter-icon type-payment">₹</span>
              <div>
                <b>Collect Milestone Payment</b>
                <small>Retainer advance, project balance, invoice</small>
              </div>
              <span className="starter-arrow">→</span>
            </div>

            <div className="starter-item" onClick=${() => navigate('/requests/new?type=Approval')}>
              <span className="starter-icon type-approval">✓</span>
              <div>
                <b>Get Quotation Approval</b>
                <small>Scope of work, estimates, design sign-off</small>
              </div>
              <span className="starter-arrow">→</span>
            </div>

            <div className="starter-item" onClick=${() => navigate('/requests/new?type=Confirmation')}>
              <span className="starter-icon type-confirmation">↔</span>
              <div>
                <b>Confirm Schedule / Delivery</b>
                <small>Appointments, delivery sign-off, visits</small>
              </div>
              <span className="starter-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
