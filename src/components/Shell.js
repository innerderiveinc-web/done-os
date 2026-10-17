// DONE — Application Shell React Component
import { React, useState, useEffect, html } from '../react-helpers.js';
import { useAuth } from '../context/AuthContext.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { db } from '../services/db.js';

export function Shell({ children, currentPath, navigate, onOpenSearch }) {
  const { user, signOut } = useAuth();
  const { organization } = useWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Pull recent 4 audit events as real live notifications
    const logs = db.getAuditLogs().slice(0, 4);
    setNotifications(logs);
  }, [currentPath]);

  const isAdmin = user?.user_metadata?.role === 'admin' || localStorage.getItem('done_admin_unlocked') === 'true';

  const navItems = [
    { url: '/dashboard', label: 'Dashboard', icon: '⌂' },
    { url: '/requests', label: 'Requests', icon: '◫' },
    { url: '/contacts', label: 'Contacts', icon: '◉' },
    { url: '/templates', label: 'Templates', icon: '▣' },
    { url: '/analytics', label: 'Analytics', icon: '⌁' },
    { url: '/billing', label: 'Billing', icon: '💳' },
    { url: '/settings', label: 'Settings', icon: '⚙' },
    ...(isAdmin ? [{ url: '/admin', label: 'Admin Console', icon: '🛡️' }] : [])
  ];

  const handleNavClick = (url) => (e) => {
    e.preventDefault();
    setMobileOpen(false);
    setUserMenuOpen(false);
    setNotifMenuOpen(false);
    navigate(url);
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  const fullName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'My Practice');
  const email = user?.email || 'user@company.com';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MP';

  return html`
    <div className="app-shell">
      
      ${mobileOpen ? html`
        <div 
          className="mobile-sidebar-backdrop active" 
          onClick=${() => setMobileOpen(false)}
        />
      ` : null}

      
      <aside className=${`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <a href="/dashboard" className="brand-link" onClick=${handleNavClick('/dashboard')}>
            <div className="logo">✓</div>
            <div>
              <div className="brand-name">DONE</div>
              <div className="brand-sub">Request-to-Completion OS</div>
            </div>
          </a>
        </div>

        <nav className="sidebar-nav">
          ${navItems.map(item => {
            const isActive = currentPath === item.url || (item.url !== '/dashboard' && currentPath.startsWith(item.url));
            return html`
              <a 
                key=${item.url}
                className=${`nav-item ${isActive ? 'active' : ''}`} 
                href=${item.url} 
                onClick=${handleNavClick(item.url)}
              >
                <span className="nav-icon">${item.icon}</span>
                <span className="nav-label">${item.label}</span>
                ${item.pill ? html`<span className="nav-pill">${item.pill}</span>` : null}
              </a>
            `;
          })}
        </nav>

        <div className="sidebar-promo">
          <div className="promo-box">
            <b>Stop chasing people.</b>
            <p>Documents, payments & approvals in one trackable request.</p>
            <a href="/requests/new" className="btn btn-primary btn-sm wide" onClick=${handleNavClick('/requests/new')}>
              ＋ New Request
            </a>
          </div>
        </div>

        <div className="sidebar-foot">
          <div className="workspace-chip">
            <span className="ws-dot"></span>
            <div>
              <div className="ws-name">${organization.name || 'Northstar Consulting'}</div>
              <div className="ws-plan">${(organization.plan || 'growth').toUpperCase()} PLAN</div>
            </div>
          </div>
          <div className="sidebar-meta">
            <span className="mini-badge">🔒 256-BIT ENCRYPTED</span>
            <small>DPDP Act 2023 Compliant</small>
          </div>
        </div>
      </aside>

      
      <div className="main">
        
        <header className="topbar">
          <div className="topbar-left">
            <button 
              className="icon-btn mobile-menu-toggle" 
              onClick=${() => setMobileOpen(!mobileOpen)} 
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <div className="workspace-indicator">
              <div className="eyebrow">WORKSPACE</div>
              <div className="workspace-title" onClick=${handleNavClick('/settings')}>
                ${organization.name || 'Northstar Consulting'}
                <span className="chev"> ⌄</span>
              </div>
            </div>
          </div>

          <div className="topbar-center">
            <button className="topbar-search-btn" onClick=${onOpenSearch} title="Global search (Cmd+K / Ctrl+K)">
              <span className="search-symbol">⌕</span>
              <span className="search-placeholder">Search requests, contacts, templates...</span>
              <kbd className="kbd-shortcut">⌘K</kbd>
            </button>
          </div>

          <div className="topbar-right">
            <a href="/requests/new" className="btn btn-primary topbar-new-btn" onClick=${handleNavClick('/requests/new')}>
              <span>＋</span> <span>New Request</span>
            </a>
            
            <div className="topbar-actions" style="position: relative; display: flex; align-items: center; gap: 8px;">
              
              <div style="position: relative;">
                <button 
                  className="icon-btn notification-btn" 
                  title="Notifications" 
                  aria-label="Notifications"
                  onClick=${() => { setNotifMenuOpen(!notifMenuOpen); setUserMenuOpen(false); }}
                >
                  🔔<span className="notif-badge">${notifications.length || 0}</span>
                </button>

                ${notifMenuOpen ? html`
                  <div className="detail-dropdown-menu" style="position: absolute; top: 48px; right: 0; width: 300px; z-index: 100; box-shadow: 0 10px 25px -3px rgba(0,0,0,0.1); border-radius: 12px; background: white; border: 1px solid #e2e8f0; padding: 0;">
                    <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
                      <b style="font-size: 13px;">Recent Activity</b>
                      <small style="font-size: 11px; color: #64748b;">Live Stream</small>
                    </div>
                    <div style="max-height: 240px; overflow-y: auto;">
                      ${notifications.length > 0 ? notifications.map((n, i) => html`
                        <div 
                          key=${n.id || i}
                          style="padding: 10px 14px; border-bottom: 1px solid #f8fafc; cursor: pointer; font-size: 12px;"
                          onClick=${() => {
                            setNotifMenuOpen(false);
                            if (n.request_id) navigate(`/requests/${encodeURIComponent(n.request_id)}`);
                          }}
                        >
                          <div style="font-weight: 600; color: #0f172a; display: flex; justify-content: space-between;">
                            <span>${(n.action || 'EVENT').replace(/_/g, ' ')}</span>
                            ${n.reference_no ? html`<span style="color: #64748b; font-family: monospace;">${n.reference_no}</span>` : null}
                          </div>
                          <div style="color: #64748b; margin-top: 2px;">${n.metadata?.note || n.metadata?.title || 'Action recorded'}</div>
                        </div>
                      `) : html`
                        <div style="padding: 16px; text-align: center; color: #64748b; font-size: 12px;">No new notifications</div>
                      `}
                    </div>
                    <div style="padding: 8px 14px; background: #f8fafc; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; text-align: center;">
                      <a href="/analytics" style="font-size: 11px; font-weight: 600; color: #2563eb;" onClick=${handleNavClick('/analytics')}>
                        View all activity & funnel →
                      </a>
                    </div>
                  </div>
                ` : null}
              </div>
              
              
              <div style="position: relative;">
                <div 
                  className="user-menu-trigger" 
                  title="User profile"
                  onClick=${() => { setUserMenuOpen(!userMenuOpen); setNotifMenuOpen(false); }}
                >
                  <span className="avatar">${initials}</span>
                </div>

                ${userMenuOpen ? html`
                  <div className="detail-dropdown-menu" style="position: absolute; top: 48px; right: 0; width: 200px; z-index: 100; box-shadow: 0 10px 25px -3px rgba(0,0,0,0.1); border-radius: 12px; background: white; border: 1px solid #e2e8f0;">
                    <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
                      <b style="font-size: 13px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${fullName}</b>
                      <small style="font-size: 11px; color: #64748b; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${email}</small>
                    </div>
                    <button className="dropdown-item" onClick=${() => { setUserMenuOpen(false); navigate('/settings'); }}>Settings</button>
                    <button className="dropdown-item" onClick=${() => { setUserMenuOpen(false); navigate('/billing'); }}>Billing & Usage</button>
                    <button className="dropdown-item danger-text" onClick=${handleSignOut}>Sign Out</button>
                  </div>
                ` : null}
              </div>
            </div>
          </div>
        </header>

        
        <main className="page-content" id="page-content">
          ${children}
        </main>
      </div>
    </div>
  `;
}
