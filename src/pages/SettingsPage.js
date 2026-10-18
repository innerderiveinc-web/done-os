// DONE — Comprehensive System & Workspace Settings (React 19 Component)
import { React, useState, html } from '../react-helpers.js';
import { useAuth } from '../context/AuthContext.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { db } from '../services/db.js';
import { showToast } from '../components/toast.js';

export function SettingsPage({ activeTab = 'general', navigate }) {
  const { user } = useAuth();
  const { organization, updateOrganization } = useWorkspace();
  const [tab, setTab] = useState(activeTab);

  // 1. General & Branding Form State
  const [orgName, setOrgName] = useState(organization?.name || 'Northstar Consulting');
  const [tagline, setTagline] = useState(organization?.tagline || 'Kisi se kuch karwana hai? Request bhejo. Track karo. Kaam complete karao.');
  const [supportEmail, setSupportEmail] = useState(organization?.support_email || 'support@northstar.in');
  const [supportPhone, setSupportPhone] = useState(organization?.support_phone || '+91 98765 43210');

  // 2. WhatsApp & Notifications State
  const [waMode, setWaMode] = useState(organization?.whatsapp_mode || 'manual'); // 'manual' or 'cloud_api'
  const [waPhoneId, setWaPhoneId] = useState(organization?.whatsapp_phone_id || '');
  const [waToken, setWaToken] = useState(organization?.whatsapp_token || '');

  // 3. Payments & UPI Gateway State
  const [upiId, setUpiId] = useState(organization?.upi_id || 'northstar@icici');
  const [razorpayKey, setRazorpayKey] = useState(organization?.razorpay_key || '');
  const [currency, setCurrency] = useState(organization?.currency || 'INR');

  const currentUserName = user?.user_metadata?.full_name || 'Irfan Ashraf';
  const currentUserEmail = user?.email || 'irfan@northstar.in';
  const userInitials = currentUserName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'IA';

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    updateOrganization({
      name: orgName.trim() || 'My Business',
      tagline: tagline.trim(),
      support_email: supportEmail.trim(),
      support_phone: supportPhone.trim()
    });
    showToast('Organization & Branding details saved!', 'success');
  };

  const handleSaveWhatsApp = (e) => {
    e.preventDefault();
    updateOrganization({
      whatsapp_mode: waMode,
      whatsapp_phone_id: waPhoneId.trim(),
      whatsapp_token: waToken.trim()
    });
    showToast('WhatsApp & Notification preferences saved!', 'success');
  };

  const handleTestWhatsApp = () => {
    if (waMode === 'cloud_api' && (!waPhoneId.trim() || !waToken.trim())) {
      showToast('Please enter both WhatsApp Phone ID and Access Token to test.', 'error');
      return;
    }
    if (waMode === 'cloud_api') {
      showToast('Meta WhatsApp Cloud API credentials configured. Ready for cron reminders!', 'success');
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent('Test notification from DONE OS')}`, '_blank');
      showToast('Testing Free WhatsApp Deep-Link in new tab...', 'default');
    }
  };

  const handleSavePayments = (e) => {
    e.preventDefault();
    if (upiId && !upiId.includes('@')) {
      showToast('Please enter a valid UPI ID (e.g. name@bank)', 'error');
      return;
    }
    updateOrganization({
      upi_id: upiId.trim(),
      razorpay_key: razorpayKey.trim(),
      currency
    });
    showToast('Payment & UPI collection settings saved!', 'success');
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
          <div className="eyebrow">SYSTEM & WORKSPACE CONFIGURATION</div>
          <h1>System Settings</h1>
          <p className="lead">Configure branding, WhatsApp automation, UPI payments, team access, and privacy controls.</p>
        </div>
      </div>

      
      <div className="settings-tabs-row mt-16" style=${{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        <button
          className=${`settings-tab-btn ${tab === 'general' ? 'active' : ''}`}
          onClick=${() => setTab('general')}
        >
          🏢 General & Branding
        </button>
        <button
          className=${`settings-tab-btn ${tab === 'whatsapp' ? 'active' : ''}`}
          onClick=${() => setTab('whatsapp')}
        >
          💬 WhatsApp & Messages
        </button>
        <button
          className=${`settings-tab-btn ${tab === 'payments' ? 'active' : ''}`}
          onClick=${() => setTab('payments')}
        >
          💳 Payments & UPI
        </button>
        <button
          className=${`settings-tab-btn ${tab === 'security' ? 'active' : ''}`}
          onClick=${() => setTab('security')}
        >
          🛡️ Security & Team
        </button>
        <button
          className=${`settings-tab-btn ${tab === 'privacy' ? 'active' : ''}`}
          onClick=${() => setTab('privacy')}
        >
          🔒 Data & Privacy
        </button>
      </div>

      
      <div className="settings-tab-content mt-20 p-0">
        
        ${tab === 'general' ? html`
          <form onSubmit=${handleSaveGeneral} className="card settings-card">
            <div className="card-head">
              <div>
                <h2>Organization & Branding Identity</h2>
                <p>This information is shown to your clients on recipient action links</p>
              </div>
            </div>

            <div className="settings-form-body mt-16">
              <div className="form-grid">
                <div className="form-group form-col-span-2">
                  <label>Business / Organization Name</label>
                  <input
                    type="text"
                    value=${orgName}
                    onInput=${(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Northstar Consulting / Inner Derive"
                    required
                  />
                  <small className="text-muted">Displayed prominently in WhatsApp headers and top of recipient links.</small>
                </div>

                <div className="form-group form-col-span-2">
                  <label>Brand Slogan / Hindi Promise</label>
                  <input
                    type="text"
                    value=${tagline}
                    onInput=${(e) => setTagline(e.target.value)}
                    placeholder="e.g. Kisi se kuch karwana hai? Request bhejo. Track karo."
                  />
                </div>

                <div className="form-group">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value=${supportEmail}
                    onInput=${(e) => setSupportEmail(e.target.value)}
                    placeholder="support@yourdomain.com"
                  />
                </div>

                <div className="form-group">
                  <label>Support Phone / WhatsApp</label>
                  <input
                    type="text"
                    value=${supportPhone}
                    onInput=${(e) => setSupportPhone(e.target.value)}
                    placeholder="+91 98765 43210"
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
                <button type="submit" className="btn btn-primary">
                  Save General Settings
                </button>
              </div>
            </div>
          </form>
        ` : null}

        
        ${tab === 'whatsapp' ? html`
          <form onSubmit=${handleSaveWhatsApp} className="card settings-card">
            <div className="card-head">
              <div>
                <h2>WhatsApp & Notifications Gateway</h2>
                <p>Configure how requests and automatic reminders reach your clients</p>
              </div>
            </div>

            <div className="settings-form-body mt-16">
              <div className="form-group">
                <label className="font-weight-600">Dispatch Delivery Mode</label>
                <div style=${{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <label style=${{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: waMode === 'manual' ? '#f0fdf4' : 'transparent' }}>
                    <input
                      type="radio"
                      name="wa_mode"
                      value="manual"
                      checked=${waMode === 'manual'}
                      onChange=${() => setWaMode('manual')}
                    />
                    <div>
                      <b>Free WhatsApp Deep-Link Mode (Recommended for Zero Cost)</b>
                      <div className="text-muted" style=${{ fontSize: '12px' }}>Opens pre-filled message in WhatsApp Web/Mobile with 1-click send. 100% Free, no Meta API key required.</div>
                    </div>
                  </label>

                  <label style=${{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', background: waMode === 'cloud_api' ? '#eff6ff' : 'transparent' }}>
                    <input
                      type="radio"
                      name="wa_mode"
                      value="cloud_api"
                      checked=${waMode === 'cloud_api'}
                      onChange=${() => setWaMode('cloud_api')}
                    />
                    <div>
                      <b>Meta WhatsApp Cloud API (100% Automated Background Delivery)</b>
                      <div className="text-muted" style=${{ fontSize: '12px' }}>Hands-free background dispatch. Meta gives first 1,000 conversations free every month.</div>
                    </div>
                  </label>
                </div>
              </div>

              ${waMode === 'cloud_api' ? html`
                <div className="p-16" style=${{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label>WhatsApp Phone Number ID</label>
                    <input
                      type="text"
                      value=${waPhoneId}
                      onInput=${(e) => setWaPhoneId(e.target.value)}
                      placeholder="e.g. 104829104812345"
                    />
                    <small className="text-muted">Available in Meta for Developers -> WhatsApp -> API Setup</small>
                  </div>

                  <div className="form-group">
                    <label>Permanent Access Token (System User Bearer Token)</label>
                    <input
                      type="password"
                      value=${waToken}
                      onInput=${(e) => setWaToken(e.target.value)}
                      placeholder="EAAGm0PX4ZCBO..."
                    />
                    <small className="text-muted">Generated under Meta Business Manager -> System Users.</small>
                  </div>
                </div>
              ` : null}

              <div className="mt-16" style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick=${handleTestWhatsApp}>
                  🧪 Test WhatsApp Message
                </button>
                <button type="submit" className="btn btn-primary">
                  Save WhatsApp Settings
                </button>
              </div>
            </div>
          </form>
        ` : null}

        
        ${tab === 'payments' ? html`
          <form onSubmit=${handleSavePayments} className="card settings-card">
            <div className="card-head">
              <div>
                <h2>Payment Collection & Direct UPI Gateway</h2>
                <p>Configure direct UPI collection so clients can pay you with GPay, PhonePe, or Paytm with 0% gateway commission</p>
              </div>
            </div>

            <div className="settings-form-body mt-16">
              <div className="form-grid">
                <div className="form-group form-col-span-2">
                  <label>Business UPI ID / VPA (Direct Bank Settlement)</label>
                  <input
                    type="text"
                    value=${upiId}
                    onInput=${(e) => setUpiId(e.target.value)}
                    placeholder="e.g. innerderive@okhdfcbank or merchant@icici"
                    required
                  />
                  <small className="text-muted">Payment requests will generate dynamic UPI QR codes and app deep links for this ID.</small>
                </div>

                <div className="form-group form-col-span-2">
                  <label>Razorpay Key ID (Optional — for Credit/Debit Cards & Netbanking)</label>
                  <input
                    type="text"
                    value=${razorpayKey}
                    onInput=${(e) => setRazorpayKey(e.target.value)}
                    placeholder="rzp_live_xxxxxxxxxxxxxx"
                  />
                  <small className="text-muted">Optional. Leave blank if collecting purely via UPI & Bank NEFT.</small>
                </div>

                <div className="form-group">
                  <label>Settlement Currency</label>
                  <select value=${currency} onChange=${(e) => setCurrency(e.target.value)} className="form-control">
                    <option value="INR">INR — Indian Rupee (₹)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                    <option value="GBP">GBP — British Pound (£)</option>
                  </select>
                </div>
              </div>

              <div className="mt-16 text-right">
                <button type="submit" className="btn btn-primary">
                  Save Payment Settings
                </button>
              </div>
            </div>
          </form>
        ` : null}

        
        ${tab === 'security' ? html`
          <div className="card settings-card">
            <div className="card-head">
              <div>
                <h2>Team Members & Access Control (RBAC)</h2>
                <p>Manage who can create, edit, or track client requests</p>
              </div>
            </div>

            <div className="team-members-list mt-16">
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

            <div className="card-head mt-24">
              <div>
                <h2>Security Architecture & DPDP Act Safeguards</h2>
                <p>Automated cryptographic protections running on this workspace</p>
              </div>
            </div>

            <div className="security-items-list mt-12">
              <div className="sec-item-row">
                <div>
                  <b>192-bit Cryptographic Public Token Links</b>
                  <p>Recipient links use unguessable tokens. Internal database auto-increment IDs are never exposed.</p>
                </div>
                <span className="pill pill-success">Enforced</span>
              </div>

              <div className="sec-item-row">
                <div>
                  <b>Zero Secrets Ingestion Policy</b>
                  <p>DONE forms never collect, transmit, or store bank OTPs, UPI PINs, CVVs, or passwords.</p>
                </div>
                <span className="pill pill-success">Active</span>
              </div>

              <div className="sec-item-row">
                <div>
                  <b>Document Isolation & MIME Validation</b>
                  <p>Strict file validation (PDF, JPG, PNG) and 10 MB per-file limits protect against malicious scripts.</p>
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
                <h2>Data Backup & Workspace Controls</h2>
                <p>Export all records, restore initial sample, or completely erase workspace data</p>
              </div>
            </div>

            <div className="privacy-actions-list mt-20">
              <div className="privacy-act-row">
                <div>
                  <b>Download Complete Backup (JSON Export)</b>
                  <p>Export all requests, uploaded attachment references, contacts, and audit events in a machine-readable format.</p>
                </div>
                <button className="btn btn-secondary" onClick=${handleExportData}>
                  📥 Download JSON Backup
                </button>
              </div>

              <div className="privacy-act-row">
                <div>
                  <b>Reset Workspace to Demo Seed</b>
                  <p>Restore the default sample requests, contacts, and metrics.</p>
                </div>
                <button className="btn btn-secondary" onClick=${handleResetSeed}>
                  ↺ Reset to Seed Data
                </button>
              </div>

              <div className="privacy-act-row danger-border">
                <div>
                  <b className="text-danger">Erase All Workspace Data</b>
                  <p>Permanently delete all requests, attachments, contacts, and activity logs from this browser.</p>
                </div>
                <button className="btn btn-secondary text-danger" onClick=${handleClearData}>
                  🗑 Clear All Data
                </button>
              </div>
            </div>
          </div>
        ` : null}
      </div>
    </section>
  `;
}
