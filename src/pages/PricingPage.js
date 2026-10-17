// DONE — Dedicated Pricing Page with Full Feature Matrix (React 19 Component)
import { React, useState, html } from '../react-helpers.js';
import { PublicHeader, PublicFooter } from '../components/PublicNav.js';

export function PricingPage({ navigate }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const handleNav = (url) => (e) => {
    e.preventDefault();
    navigate(url);
  };

  const starterPrice = billingCycle === 'annual' ? 239 : 299;
  const growthPrice = billingCycle === 'annual' ? 639 : 799;

  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/pricing" navigate=${navigate} />

      <main className="public-content-page">
        <section className="page-hero-section text-center">
          <div className="landing-container">
            <div className="eyebrow">TRANSPARENT & AFFORDABLE</div>
            <h1 className="page-hero-title">Simple Plans That Grow With You</h1>
            <p className="page-hero-lead">
              Recipients are <strong>always 100% free</strong>. Senders only pay as their monthly request volume increases. No hidden setup fees or surprise surcharges.
            </p>

            <div className="billing-toggle-wrap">
              <span className=${billingCycle === 'monthly' ? 'active font-bold' : 'text-muted'}>Monthly</span>
              <button 
                className=${`billing-toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
                onClick=${() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                aria-label="Toggle annual billing discount"
              >
                <span className="toggle-switch"></span>
              </button>
              <span className=${billingCycle === 'annual' ? 'active font-bold' : 'text-muted'}>
                Annual <span className="discount-pill">Save 20%</span>
              </span>
            </div>
          </div>
        </section>

        <section className="section-block bg-white">
          <div className="landing-container">
            
            <div className="pricing-grid">
              
              <div className="pricing-card card">
                <div className="plan-name">Free Forever</div>
                <div className="plan-price">₹0<span>/mo</span></div>
                <p className="plan-sub">For freelancers testing structured requests</p>
                <ul className="plan-features">
                  <li>✓ <strong>10 Requests</strong> / month</li>
                  <li>✓ All 4 action types (Docs, UPI, Quotes, Confirm)</li>
                  <li>✓ WhatsApp, SMS & Email link dispatch</li>
                  <li>✓ Recipient Zero-App Mobile Experience</li>
                  <li>✓ 7-Day Audit Trail Timeline</li>
                  <li>✓ Basic CSV Export</li>
                </ul>
                <a href="/signup" className="btn btn-secondary wide" onClick=${handleNav('/signup')}>Get Started Free →</a>
              </div>

              <div className="pricing-card card popular">
                <div className="popular-badge">MOST POPULAR</div>
                <div className="plan-name">Starter</div>
                <div className="plan-price">₹${starterPrice}<span>/mo</span></div>
                <p className="plan-sub">For growing professionals & consultancies</p>
                <ul className="plan-features">
                  <li>✓ <strong>100 Requests</strong> / month</li>
                  <li>✓ Multi-Action Bundles (up to 8 per request)</li>
                  <li>✓ AI Natural Language Request Composer</li>
                  <li>✓ Automated WhatsApp & SMS Reminders</li>
                  <li>✓ 90-Day Cryptographic Audit Log</li>
                  <li>✓ Custom Reusable Request Templates</li>
                  <li>✓ Dedicated Contact Address Book</li>
                </ul>
                <a href="/signup" className="btn btn-primary wide" onClick=${handleNav('/signup')}>Start with Starter →</a>
              </div>

              <div className="pricing-card card">
                <div className="plan-name">Growth</div>
                <div className="plan-price">₹${growthPrice}<span>/mo</span></div>
                <p className="plan-sub">For agencies, law firms, and CA practices</p>
                <ul className="plan-features">
                  <li>✓ <strong>500 Requests</strong> / month</li>
                  <li>✓ Team Workspace with 5 Staff Seats</li>
                  <li>✓ Custom Brand Logo on Recipient Action Pages</li>
                  <li>✓ 1-Year Comprehensive Audit History</li>
                  <li>✓ Webhooks & REST API Integrations</li>
                  <li>✓ Product Validation Analytics Dashboard</li>
                  <li>✓ Priority SLA Email & Phone Support</li>
                </ul>
                <a href="/signup" className="btn btn-secondary wide" onClick=${handleNav('/signup')}>Choose Growth →</a>
              </div>

            </div>

            <div className="comparison-table-wrap card mt-24">
              <h3 className="mb-20">Full Feature Comparison Matrix</h3>
              <div className="table-responsive">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>Free</th>
                      <th>Starter</th>
                      <th>Growth</th>
                      <th>Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Monthly Request Quota</td>
                      <td>10</td>
                      <td>100</td>
                      <td>500</td>
                      <td>Unlimited</td>
                    </tr>
                    <tr>
                      <td>Recipient Fee / Requirement</td>
                      <td>Free (No App)</td>
                      <td>Free (No App)</td>
                      <td>Free (No App)</td>
                      <td>Free (No App)</td>
                    </tr>
                    <tr>
                      <td>Actions per Request</td>
                      <td>Up to 3</td>
                      <td>Up to 8</td>
                      <td>Unlimited</td>
                      <td>Unlimited</td>
                    </tr>
                    <tr>
                      <td>AI Natural Language Composer</td>
                      <td>❌</td>
                      <td>✓ Included</td>
                      <td>✓ Included</td>
                      <td>✓ Custom Models</td>
                    </tr>
                    <tr>
                      <td>Automated Reminders</td>
                      <td>Manual</td>
                      <td>✓ Automated</td>
                      <td>✓ Smart Cadence</td>
                      <td>✓ Dedicated Queues</td>
                    </tr>
                    <tr>
                      <td>Custom Brand Watermark</td>
                      <td>DONE Branding</td>
                      <td>DONE Branding</td>
                      <td>✓ Custom Logo</td>
                      <td>✓ White-Label Domain</td>
                    </tr>
                    <tr>
                      <td>Audit Trail Retention</td>
                      <td>7 Days</td>
                      <td>90 Days</td>
                      <td>1 Year</td>
                      <td>7 Years (Statutory)</td>
                    </tr>
                    <tr>
                      <td>Team Member Seats</td>
                      <td>1</td>
                      <td>1</td>
                      <td>5 Seats</td>
                      <td>Unlimited RBAC</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="enterprise-banner card mt-24">
              <div className="flex-between">
                <div>
                  <h3 style=${{ fontSize: '20px', marginBottom: '6px' }}>Need a Custom High-Volume Enterprise Plan?</h3>
                  <p className="text-muted" style=${{ fontSize: '14px', maxWidth: '640px' }}>
                    For large enterprises, fintechs, NBFCs, or accounting networks processing over 2,000 monthly requests with custom SSO, on-premise data residency, or dedicated account managers.
                  </p>
                </div>
                <a href="/contact" className="btn btn-primary" onClick=${handleNav('/contact')}>Talk to Enterprise Sales →</a>
              </div>
            </div>

          </div>
        </section>
      </main>

      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}
