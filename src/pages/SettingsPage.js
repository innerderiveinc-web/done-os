// DONE — Settings, Security & Privacy by Design (React 19 Component)
import { React, useState, html } from '../react-helpers.js';
import { useAuth } from '../context/AuthContext.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { db } from '../services/db.js';
import { showToast } from '../components/toast.js';

export function SettingsPage({ activeTab = 'general', navigate }) {
  const { user } = useAuth();
  const { organization, updateOrgName } = useWorkspace();
  const [tab, setTab] = useState(activeTab);
  const [orgName, setOrgName] = useState(organization?.name || 'Northstar Consulting');

  const currentUserName = user?.user_metadata?.full_name || 'Irfan Ashraf';
  const currentUserEmail = user?.email || 'irfan@northstar.in';
  const userInitials = currentUserName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'IA';

  const handleSaveOrg = () => {
    updateOrgName(orgName);
    showToast('Organization details updated!', 'success');
  };

  const handleExportData = () => {
    const data = db.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `done-workspace-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export downloaded successfully!', 'success');
  };

  const handleResetSeed = () => {
    if (confirm('Reset workspace to seed data? Current requests will be restored to initial sample.')) {
      db.clearAllData();
      showToast('Workspace reset to initial seed data.', 'default');
      window.location.reload();
    }
  };

  const handleClearData = () => {
    if (confirm('WARNING: Erase all requests, contacts, and logs? This action is irreversible.')) {
      db.clearAllData();
      showToast('All local workspace data cleared.', 'default');
      window.location.reload();
    }
  };

  return html`
    <section className="page narrow settings-page">
      <div className="hero compact">
        <div>
          <div className="eyebrow">SETTINGS & PRIVACY</div>
          <h1>Workspace Settings</h1>
          <p className="lead">Manage your organization, team members, security controls, and privacy-by-design preferences.</p>
        </div>
      </div>

      
      <div className="settings-tabs-row mt-16">
        <button
          className=${`settings-tab-btn ${tab === 'general' ? 'active' : ''}`}
          onClick=${() => setTab('general')}
        >
          General & Team
        </button>
        <button
          className=${`settings-tab-btn ${tab === 'security' ? 'active' : ''}`}
          onClick=${() => setTab('security')}
        >
          Security & Access
        </button>
        <button
          className=${`settings-tab-btn ${tab === 'privacy' ? 'active' : ''}`}
          onClick=${() => setTab('privacy')}
        >
          Privacy & Data Controls
        </button>
      </div>

      
      <div className="settings-tab-content mt-20">
        ${tab === 'general' ? html`
          <div className="card settings-card">
            <div className="card-head">
              <div>
                <h2>Organization Details</h2>
                <p>Your business identity as seen by recipients</p>
              </div>
            </div>

            <div className="settings-form-body mt-16">
              <div className="form-grid">
                <div className="form-group form-col-span-2">
                  <label>Organization Name</label>
                  <input
                    type="text"
                    value=${orgName}
                    onInput=${(e) => setOrgName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Workspace Slug</label>
                  <input type="text" readOnly value=${organization?.slug || 'northstar'} />
                </div>

                <div className="form-group">
                  <label>Primary Owner</label>
                  <input type="text" readOnly value=${currentUserName} />
                </div>
              </div>

              <div className="mt-16 text-right">
                <button className="btn btn-primary" onClick=${handleSaveOrg}>
                  Save Organization Details
                </button>
              </div>
            </div>

            <div className="card-head mt-24">
              <div>
                <h2>Team Members & Roles (RBAC)</h2>
                <p>Control who can create, view, or manage requests</p>
              </div>
            </div>

            <div className="team-members-list">
              <div className="member-item">
                <span className="avatar">${userInitials}</span>
                <div className="member-info">
                  <b>${currentUserName} (You)</b>
                  <small>${currentUserEmail}</small>
                </div>
                <span className="role-badge owner">Owner</span>
              </div>

              <div className="member-item">
                <span className="avatar">AK</span>
                <div className="member-info">
                  <b>Aamir Khan</b>
                  <small>aamir@northstar.in</small>
                </div>
                <span className="role-badge admin">Admin</span>
              </div>

              <div className="member-item">
                <span className="avatar">PV</span>
                <div className="member-info">
                  <b>Pooja Verma</b>
                  <small>pooja@northstar.in</small>
                </div>
                <span className="role-badge member">Member</span>
              </div>
            </div>
          </div>
        ` : null}

        ${tab === 'security' ? html`
          <div className="card settings-card">
            <div className="card-head">
              <div>
                <h2>Security Safeguards & Architecture</h2>
                <p>Implemented protections based on Section 30 & 50</p>
              </div>
            </div>

            <div className="security-items-list">
              <div className="sec-item-row">
                <div>
                  <b>Cryptographic Public Token Links</b>
                  <p>Recipient links use unguessable 192-bit hex tokens. Internal auto-increment IDs are never exposed externally.</p>
                </div>
                <span className="pill pill-success">Enforced</span>
              </div>

              <div className="sec-item-row">
                <div>
                  <b>Zero Secrets Ingestion Policy</b>
                  <p>DONE forms never collect, transmit, or store bank OTPs, UPI PINs, CVVs, or account passwords.</p>
                </div>
                <span className="pill pill-success">Active</span>
              </div>

              <div className="sec-item-row">
                <div>
                  <b>PostgreSQL Row-Level Security (RLS)</b>
                  <p>Database tables are isolated by organization UUID. Cross-tenant access is blocked at the database engine level.</p>
                </div>
                <span className="pill pill-success">Enforced</span>
              </div>

              <div className="sec-item-row">
                <div>
                  <b>Document Isolation & MIME Validation</b>
                  <p>Strict file type validation (PDF, JPG, PNG) and 10 MB file-size quotas prevent malicious payload execution.</p>
                </div>
                <span className="pill pill-success">Protected</span>
              </div>
            </div>
          </div>
        ` : null}

        ${tab === 'privacy' ? html`
          <div className="card settings-card">
            <div className="card-head">
              <div>
                <h2>Privacy by Design & Data Controls (Section 32)</h2>
                <p>Export your data, configure retention rules, or erase records</p>
              </div>
            </div>

            <div className="privacy-warning-banner">
              <span className="sec-icon">⚠️</span>
              <div>
                <b>Security Notice:</b> Never upload or ask recipients for passwords, OTPs, UPI PINs, or CVV codes. Sensitive documents must always go through secure upload pages.
              </div>
            </div>

            <div className="privacy-actions-list mt-20">
              <div className="privacy-act-row">
                <div>
                  <b>Download My Data (JSON Export)</b>
                  <p>Export all requests, actions, contacts, and audit events in a machine-readable format.</p>
                </div>
                <button className="btn btn-secondary" onClick=${handleExportData}>
                  Download JSON Export
                </button>
              </div>

              <div className="privacy-act-row">
                <div>
                  <b>Reset Workspace to Demo Seed</b>
                  <p>Restore the default requests, contacts, and validation metrics for Northstar Consulting.</p>
                </div>
                <button className="btn btn-secondary" onClick=${handleResetSeed}>
                  Reset to Seed Data
                </button>
              </div>

              <div className="privacy-act-row danger-border">
                <div>
                  <b className="text-danger">Erase All Workspace Data</b>
                  <p>Permanently delete all requests, attachments, contacts, and logs from this browser.</p>
                </div>
                <button className="btn btn-secondary text-danger" onClick=${handleClearData}>
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        ` : null}
      </div>
    </section>
  `;
}
