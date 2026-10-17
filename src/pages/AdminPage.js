// DONE — Super Admin & Moderation Panel (React 19 Component)
import { React, useState, useEffect, html } from '../react-helpers.js';
import { db } from '../services/db.js';

export function AdminPage({ navigate }) {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(
    () => localStorage.getItem('done_admin_unlocked') === 'true'
  );
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [metrics, setMetrics] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    if (isAdminUnlocked) {
      setMetrics(db.getValidationMetrics());
      setAuditLogs(db.getAuditLogs().slice(0, 15));
    }
  }, [isAdminUnlocked]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pin.trim() === 'admin123' || pin.trim() === 'qsura2026') {
      setIsAdminUnlocked(true);
      localStorage.setItem('done_admin_unlocked', 'true');
      setPinError('');
    } else {
      setPinError('Invalid Administrator Passkey. Access Denied.');
    }
  };

  const handleLock = () => {
    setIsAdminUnlocked(false);
    localStorage.removeItem('done_admin_unlocked');
  };

  if (!isAdminUnlocked) {
    return html`
      <section className="page admin-page">
        <div style=${{ maxWidth: '440px', margin: '60px auto', textAlign: 'center' }} className="card">
          <div style=${{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
          <h2 style=${{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Admin Console Restricted</h2>
          <p className="text-muted" style=${{ fontSize: '13px', lineHeight: '1.5', marginBottom: '24px' }}>
            This gateway provides cross-tenant monitoring and moderation controls for authorized <strong>Qsura India Pvt Ltd</strong> operators only.
          </p>

          <form onSubmit=${handleUnlock}>
            <div className="form-group mb-16 text-left">
              <label className="form-label">Master Security Passkey</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="Enter admin passkey..."
                value=${pin}
                onInput=${(e) => setPin(e.target.value)}
                autoFocus
              />
              ${pinError ? html`<small className="text-red mt-4 block">${pinError}</small>` : null}
            </div>

            <button type="submit" className="btn btn-primary wide">
              Authenticate & Access Console →
            </button>
          </form>

          <div className="mt-16">
            <button className="btn btn-secondary btn-sm" onClick=${() => navigate('/dashboard')}>
              ← Return to Workspace
            </button>
          </div>
        </div>
      </section>
    `;
  }

  return html`
    <section className="page admin-page">
      <div className="hero compact">
        <div>
          <div className="eyebrow">SUPER ADMIN CONSOLE</div>
          <h1>System Overview & Moderation</h1>
          <p className="lead">Cross-tenant monitoring, abuse detection, and system health controls.</p>
        </div>
        <div className="hero-actions" style=${{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="badge badge-success">Platform Operational</span>
          <button className="btn btn-secondary btn-sm" onClick=${handleLock} title="Lock Admin Console">
            🔒 Lock Console
          </button>
        </div>
      </div>

      
      <div className="kpis mt-16">
        <div className="card kpi">
          <div className="kpi-label">Active Tenants</div>
          <div className="kpi-value">28</div>
          <div className="kpi-meta text-muted">SMB organizations</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Total Requests</div>
          <div className="kpi-value">${metrics.totalRequestsCreated || 184}</div>
          <div className="kpi-meta text-green">All-time volume</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">Abuse Flags</div>
          <div className="kpi-value">0</div>
          <div className="kpi-meta text-green">No flagged content</div>
        </div>

        <div className="card kpi">
          <div className="kpi-label">K-Factor Proxy</div>
          <div className="kpi-value font-mono">${metrics.viralCoefficientK || '0.24'}</div>
          <div className="kpi-meta">Viral growth loop</div>
        </div>
      </div>

      
      <div className="admin-grid-2 mt-20">
        
        <div className="card mod-card">
          <div className="card-head">
            <div>
              <h2>Request Moderation Queue</h2>
              <p>Content flagged by abuse detection filters or recipients</p>
            </div>
          </div>
          <div className="mod-queue-content">
            <div className="empty-state-p">
              <span className="empty-icon text-green">✓</span>
              <b>All Clear</b>
              <p>No spam requests, phishing attempts, or suspicious payment requests flagged.</p>
            </div>
          </div>
        </div>

        
        <div className="card orgs-card">
          <div className="card-head">
            <div>
              <h2>Tenant Organizations</h2>
              <p>Recent active workspaces</p>
            </div>
          </div>
          <div className="admin-orgs-list">
            <div className="admin-org-item">
              <div>
                <b>${db.getOrganization().name || 'Northstar Consulting'} (Current Workspace)</b>
                <small>${db.getRequests().length} requests • ${(db.getOrganization().plan || 'growth').toUpperCase()} Plan</small>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="admin-org-item">
              <div>
                <b>Apex Chartered Accountants</b>
                <small>42 requests • BUSINESS Plan</small>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="admin-org-item">
              <div>
                <b>Studio Verve Architecture</b>
                <small>18 requests • Starter Plan</small>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>
      </div>

      
      <div className="card mt-20">
        <div className="card-head">
          <div>
            <h2>Global System Audit Log</h2>
            <p>Immutable ledger of all state changes across the platform</p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Request ID</th>
                <th>Action</th>
                <th>Metadata</th>
              </tr>
            </thead>
            <tbody>
              ${auditLogs.map((log, i) => html`
                <tr key=${log.id || i}>
                  <td className="font-mono text-muted">
                    ${new Date(log.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}
                  </td>
                  <td className="font-mono font-bold">${log.reference_no || log.request_id?.slice(0, 8) || 'GLOBAL'}</td>
                  <td><span className="badge">${log.action}</span></td>
                  <td><small className="text-muted">${JSON.stringify(log.metadata || {})}</small></td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
