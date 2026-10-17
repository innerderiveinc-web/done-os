// DONE — Unified Public Topbar & Footer Component
// Shared across Landing, About, Security, Pricing, FAQ, Contact, Terms, and Privacy pages
import { React, useState, html } from '../react-helpers.js';

export function PublicHeader({ currentPath = '/', navigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (url) => (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    navigate(url);
  };

  const navLinks = [
    { label: 'Home', url: '/' },
    { label: 'How It Works', url: '/#how-it-works' },
    { label: 'About', url: '/about' },
    { label: 'Security', url: '/security' },
    { label: 'Pricing', url: '/pricing' },
    { label: 'FAQ', url: '/faq' },
    { label: 'Contact', url: '/contact' }
  ];

  return html`
    <header className="landing-header">
      <div className="landing-container nav-container">
        <a href="/" className="brand-link" onClick=${handleNav('/')}>
          <div className="logo">✓</div>
          <div className="brand-name">DONE</div>
        </a>

        <nav className="landing-nav">
          ${navLinks.map(item => html`
            <a 
              key=${item.url} 
              href=${item.url} 
              className=${`landing-nav-link ${currentPath === item.url ? 'active' : ''}`}
              onClick=${handleNav(item.url)}
            >
              ${item.label}
            </a>
          `)}
        </nav>

        <div className="landing-nav-actions">
          <a href="/login" className="btn btn-secondary btn-sm" onClick=${handleNav('/login')}>Sign In</a>
          <a href="/signup" className="btn btn-primary btn-sm" onClick=${handleNav('/signup')}>Get Started Free →</a>
          <button 
            className="mobile-nav-toggle btn btn-secondary btn-sm"
            onClick=${() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ${mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      ${mobileMenuOpen ? html`
        <div className="mobile-dropdown-nav">
          ${navLinks.map(item => html`
            <a 
              key=${item.url} 
              href=${item.url} 
              className=${`mobile-nav-item ${currentPath === item.url ? 'active' : ''}`}
              onClick=${handleNav(item.url)}
            >
              ${item.label}
            </a>
          `)}
          <div className="mobile-nav-buttons">
            <a href="/login" className="btn btn-secondary wide" onClick=${handleNav('/login')}>Sign In</a>
            <a href="/signup" className="btn btn-primary wide" onClick=${handleNav('/signup')}>Get Started Free →</a>
          </div>
        </div>
      ` : null}
    </header>
  `;
}

export function PublicFooter({ navigate }) {
  const handleNav = (url) => (e) => {
    e.preventDefault();
    navigate(url);
    window.scrollTo(0, 0);
  };

  return html`
    <footer className="landing-footer">
      <div className="landing-container footer-container-grid">
        <div className="footer-col-main">
          <div className="footer-brand">
            <div className="logo-sm">✓</div>
            <b>DONE</b> — The Request-to-Completion OS
          </div>
          <p className="footer-desc">
            Stop chasing people for documents, payments, approvals and confirmations. Turn broken chats into structured, single-link actionable requests.
          </p>
          <div className="footer-corp-tag">
            Engineered & Operated by <strong>Qsura India Pvt Ltd</strong>
          </div>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <a href="/" onClick=${handleNav('/')}>Overview</a>
          <a href="/#how-it-works" onClick=${handleNav('/#how-it-works')}>How It Works</a>
          <a href="/pricing" onClick=${handleNav('/pricing')}>Plans & Pricing</a>
          <a href="/security" onClick=${handleNav('/security')}>Security Protocol</a>
          <a href="/dashboard" onClick=${handleNav('/dashboard')}>Live Workspace</a>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <a href="/about" onClick=${handleNav('/about')}>About Qsura</a>
          <a href="/faq" onClick=${handleNav('/faq')}>Knowledgebase / FAQ</a>
          <a href="/contact" onClick=${handleNav('/contact')}>Contact & Sales</a>
          <a href="/security" onClick=${handleNav('/security')}>Trust & Security</a>
        </div>

        <div className="footer-col">
          <h4>Legal & Trust</h4>
          <a href="/terms" onClick=${handleNav('/terms')}>Terms of Service</a>
          <a href="/privacy" onClick=${handleNav('/privacy')}>Privacy Policy</a>
          <a href="/security#compliance" onClick=${handleNav('/security')}>DPDP Act Compliance</a>
          <a href="/terms#disclaimer" onClick=${handleNav('/terms')}>Trademark Fair Use</a>
        </div>
      </div>

      <div className="landing-container footer-bottom-bar">
        <div className="footer-copy">
          © 2026 DONE. All rights reserved. Intellectual property of <strong>Qsura India Private Limited</strong>.
        </div>
        <div className="footer-trademark-text">
          Third-party trademarks (including WhatsApp, UPI, Razorpay, Cashfree, Google, Apple) are referenced strictly for technical interoperability and user convenience under nominative fair use doctrine, and do not imply endorsement or partnership.
        </div>
      </div>
    </footer>
  `;
}
