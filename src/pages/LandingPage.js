// DONE — Public Marketing Landing Page (React Component)
import { React, html } from '../react-helpers.js';
import { PublicHeader, PublicFooter } from '../components/PublicNav.js';
import { config } from '../config.js';

export function LandingPage({ navigate }) {
  const handleNav = (url) => (e) => {
    e.preventDefault();
    navigate(url);
  };

  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/" navigate=${navigate} />

      
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Universal Request-to-Completion OS
          </div>

          <h1 className="hero-title">
            Stop Chasing.<br/>
            Start Getting Things <span className="highlight-done">DONE</span>.
          </h1>

          <p className="hero-hindi">
            "${config.hindiPromise}"
          </p>

          <p className="hero-lead">
            Turn documents, payments, approvals and confirmations into <strong>one structured, trackable request</strong>. Your recipient opens a single link without downloading an app or creating an account.
          </p>

          <div className="hero-cta-group">
            <a href="/signup" className="btn btn-primary btn-lg" onClick=${handleNav('/signup')}>
              Create Your First Request Free →
            </a>
            <a href="/dashboard" className="btn btn-secondary btn-lg" onClick=${handleNav('/dashboard')}>
              Explore Live Workspace
            </a>
          </div>

          
          <div className="hero-preview-wrapper">
            <div className="hero-preview-window card">
              <div className="preview-window-bar">
                <div className="window-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="window-url-bar">done.os/r/tok_demo_rahul_1024</div>
                <div className="window-badge">RECIPIENT EXPERIENCE • NO APP REQUIRED</div>
              </div>

              <div className="preview-inner">
                <div className="preview-head">
                  <div className="preview-brand">
                    <div className="logo-sm">✓</div>
                    <div>
                      <strong>Request from Northstar Consulting</strong>
                      <small className="block text-muted">🔒 Encrypted action link • Reference REQ-1024</small>
                    </div>
                  </div>
                  <div className="preview-progress-pill">
                    <span className="progress-indicator">●</span> 2 of 3 Completed
                  </div>
                </div>

                <div className="preview-checklist">
                  <div className="preview-check-item done">
                    <div className="check-icon">✓</div>
                    <div className="check-text">
                      <b>1. GST Certificate (Form REG-06)</b>
                      <small className="text-green">Document submitted (PDF, 1.4 MB)</small>
                    </div>
                    <span className="badge badge-success">Completed</span>
                  </div>

                  <div className="preview-check-item done">
                    <div className="check-icon">✓</div>
                    <div className="check-text">
                      <b>2. FY26 Scope & Quotation</b>
                      <small className="text-green">Approved by Rahul Sharma</small>
                    </div>
                    <span className="badge badge-success">Approved</span>
                  </div>

                  <div className="preview-check-item active">
                    <div className="check-icon pending">3</div>
                    <div className="check-text">
                      <b>3. Tax Filing Retainer Advance (₹15,000)</b>
                      <small>Payment awaiting confirmation</small>
                    </div>
                    <a href="/r/tok_demo_rahul_1024" className="btn btn-primary btn-sm" onClick=${handleNav('/r/tok_demo_rahul_1024')}>
                      Pay ₹15,000 →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="section-block bg-white" id="problem">
        <div className="landing-container">
          <div className="section-head text-center">
            <div className="eyebrow">THE REALITY OF EVERYDAY BUSINESS</div>
            <h2>Why does getting work done feel like endless chasing?</h2>
            <p>Today, business requests are fragmented across multiple broken channels.</p>
          </div>

          <div className="comparison-grid">
            <div className="compare-card compare-old">
              <div className="compare-tag danger">The Old Chasing Way</div>
              <ul>
                <li>❌ WhatsApp messages buried under 50 other chats</li>
                <li>❌ Asking "Did you transfer the ₹15k?" 3 times a week</li>
                <li>❌ Chasing GST certificates and cancelled cheques across emails</li>
                <li>❌ PDF quotation sign-offs lost in chat screenshots</li>
                <li>❌ No single record of what has been submitted vs pending</li>
              </ul>
            </div>

            <div className="compare-card compare-new">
              <div className="compare-tag success">The DONE Way</div>
              <ul>
                <li>✓ <strong>One Request:</strong> Multi-action checklist in one clean link</li>
                <li>✓ <strong>No App for Recipient:</strong> Opens on any mobile browser in 2 seconds</li>
                <li>✓ <strong>Real-time Progress:</strong> 0/3 → 1/3 → 2/3 → DONE</li>
                <li>✓ <strong>Full Audit Trail:</strong> Timestamped proof of every upload and approval</li>
                <li>✓ <strong>Viral Distribution:</strong> Recipients create their own requests after completion</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      
      <section className="section-block" id="how-it-works">
        <div className="landing-container">
          <div className="section-head text-center">
            <div className="eyebrow">SIMPLE 5-STEP PROTOCOL</div>
            <h2>Create → Send → Recipient Opens → Completes → DONE</h2>
            <p>Engineered for maximum completion rate with zero recipient friction.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card card">
              <div className="step-number">1</div>
              <h3>Create</h3>
              <p>Type naturally in Hinglish or English: <em>"Rahul se GST certificate aur ₹15,000 advance chahiye."</em> Our AI composer structures the actions instantly.</p>
            </div>

            <div className="step-card card">
              <div className="step-number">2</div>
              <h3>Send</h3>
              <p>Dispatch a secure, trackable link via WhatsApp, SMS, or Email. Pre-formatted message previews eliminate drafting work.</p>
            </div>

            <div className="step-card card">
              <div className="step-number">3</div>
              <h3>Recipient Opens</h3>
              <p>The recipient opens the link immediately. No login, no password, no app store download. Instant trust and clarity.</p>
            </div>

            <div className="step-card card">
              <div className="step-number">4</div>
              <h3>Completes</h3>
              <p>They drag-and-drop documents, complete payment via UPI/Cards, approve quotes, or confirm appointments in 60 seconds.</p>
            </div>

            <div className="step-card card">
              <div className="step-number">5</div>
              <h3>DONE</h3>
              <p>Both parties receive instant completion receipts and verified audit proof. The recipient can easily initiate their own structured requests.</p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="section-block bg-white" id="pricing">
        <div className="landing-container">
          <div className="section-head text-center">
            <div className="eyebrow">TRANSPARENT PRICING</div>
            <h2>Start free. Scale as your requests grow.</h2>
            <p>Recipients are always 100% free. No credit card required to begin.</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card card">
              <div className="plan-name">Free</div>
              <div className="plan-price">₹0<span>/month</span></div>
              <p className="plan-sub">Perfect for individuals testing the workflow</p>
              <ul className="plan-features">
                <li>✓ <strong>10 requests</strong> / month</li>
                <li>✓ All 4 action types (Docs, UPI, Quotes, Confirm)</li>
                <li>✓ WhatsApp, SMS & Email link dispatch</li>
                <li>✓ Recipient zero-app experience</li>
              </ul>
              <a href="/signup" className="btn btn-secondary wide" onClick=${handleNav('/signup')}>Get Started Free →</a>
            </div>

            <div className="pricing-card card popular">
              <div className="popular-badge">MOST POPULAR</div>
              <div className="plan-name">Starter</div>
              <div className="plan-price">₹299<span>/month</span></div>
              <p className="plan-sub">For freelancers & boutique consultancies</p>
              <ul className="plan-features">
                <li>✓ <strong>100 requests</strong> / month</li>
                <li>✓ AI Natural Language Request Composer</li>
                <li>✓ Automated WhatsApp & SMS reminders</li>
                <li>✓ 90-day cryptographic audit trail</li>
              </ul>
              <a href="/signup" className="btn btn-primary wide" onClick=${handleNav('/signup')}>Start with Starter →</a>
            </div>

            <div className="pricing-card card">
              <div className="plan-name">Growth</div>
              <div className="plan-price">₹799<span>/month</span></div>
              <p className="plan-sub">For growing agencies, CAs & law firms</p>
              <ul className="plan-features">
                <li>✓ <strong>500 requests</strong> / month</li>
                <li>✓ Team workspace with 5 staff seats</li>
                <li>✓ Custom brand watermark on action pages</li>
                <li>✓ Webhook & REST API integrations</li>
              </ul>
              <a href="/signup" className="btn btn-secondary wide" onClick=${handleNav('/signup')}>Choose Growth →</a>
            </div>
          </div>

          <div className="pricing-cta-banner card text-center mt-24">
            <h3 style=${{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>Looking for Annual Discounts (20% Off) or Custom Enterprise Volume?</h3>
            <p className="text-muted" style=${{ fontSize: '14px', marginBottom: '16px' }}>
              We offer 2,000+ request tiers, dedicated account managers, and custom ERP integrations.
            </p>
            <a href="/pricing" className="btn btn-outline" onClick=${handleNav('/pricing')}>
              Compare All Features & View Enterprise Matrix →
            </a>
          </div>
        </div>
      </section>

      
      <section className="section-block landing-trust-section">
        <div className="landing-container">
          <div className="section-head text-center">
            <div className="eyebrow">BUILT FOR SPEED & TRUST</div>
            <h2>Everything you need to run high-trust client workflows</h2>
            <p>Explore our deep architecture, legal foundation, and answers to common questions.</p>
          </div>

          <div className="trust-grid">
            <div className="card trust-card">
              <div className="trust-icon">💬</div>
              <h3>Normal WhatsApp vs DONE</h3>
              <p>Why replace messy chat threads with a structured single-link completion engine? Understand the cost, recipient experience, and follow-up automation.</p>
              <a href="/faq" className="trust-link" onClick=${handleNav('/faq')}>
                Read the FAQ & Knowledgebase →
              </a>
            </div>

            <div className="card trust-card">
              <div className="trust-icon">🔒</div>
              <h3>Bank-Grade Security & DPDP 2023</h3>
              <p>Zero secrets ingestion, tokenized links, TLS 1.3 encryption, and compliance with the Digital Personal Data Protection Act 2023.</p>
              <a href="/security" className="trust-link" onClick=${handleNav('/security')}>
                Explore Security Protocol →
              </a>
            </div>

            <div className="card trust-card">
              <div className="trust-icon">🏢</div>
              <h3>Operated by Qsura India Pvt Ltd</h3>
              <p>Built with conviction to eliminate professional chasing across India. Read our origin story, core values, and corporate governance.</p>
              <a href="/about" className="trust-link" onClick=${handleNav('/about')}>
                About Qsura India →
              </a>
            </div>
          </div>
        </div>
      </section>

      
      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}
