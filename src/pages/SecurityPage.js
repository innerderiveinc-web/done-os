// DONE — Dedicated Security, Compliance & Architecture Page (React 19 Component)
// Engineered & Operated by Qsura India Pvt Ltd
import { React, html } from '../react-helpers.js';
import { PublicHeader, PublicFooter } from '../components/PublicNav.js';
import { config } from '../config.js';

export function SecurityPage({ navigate }) {
  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/security" navigate=${navigate} />

      <main className="public-content-page">
        <section className="page-hero-section text-center">
          <div className="landing-container">
            <div className="eyebrow">TRUST & ARCHITECTURE</div>
            <h1 className="page-hero-title">Security & Compliance by Design</h1>
            <p className="page-hero-lead">
              At DONE, privacy and security are not afterthoughts. Our protocol is engineered to protect sensitive business documents and financial transaction records under India's strict digital regulations.
            </p>
          </div>
        </section>

        <section className="section-block bg-white">
          <div className="landing-container content-narrow">
            
            <div className="security-highlight-box card">
              <div className="sec-badge">CORE PRINCIPLE</div>
              <h2>Zero Secrets Ingestion Policy</h2>
              <p>
                DONE is intentionally architected so that we <strong>NEVER solicit, handle, or store sensitive credentials</strong>. This includes:
              </p>
              <div className="prohibited-grid">
                <div className="prohibit-item">❌ Bank account passwords</div>
                <div className="prohibit-item">❌ UPI PINs or Debit ATM PINs</div>
                <div className="prohibit-item">❌ Credit / Debit card CVVs</div>
                <div className="prohibit-item">❌ One-Time Passwords (OTPs)</div>
              </div>
              <p className="mt-16 text-muted font-size-13">
                All payment requests generate official intent deep-links directly into licensed UPI apps (BHIM, Google Pay, PhonePe, Paytm) or verified PCI-DSS Level 1 payment gateways (Razorpay, Cashfree).
              </p>
            </div>

            <div className="sec-pillars-grid mt-24">
              <div className="sec-card card">
                <div className="sec-card-icon">🔐</div>
                <h3>Cryptographic Action Tokens</h3>
                <p>Recipients access their single request via high-entropy, cryptographically generated tokens (<code>tok_...</code>). These tokens expire upon completion or sender revocation, eliminating the risk of credential stuffing.</p>
              </div>

              <div className="sec-card card">
                <div className="sec-card-icon">🛡️</div>
                <h3>AES-256 & TLS 1.3 Encryption</h3>
                <p>All data in transit is protected with modern TLS 1.3 encryption. Attachments and database records are stored with AES-256 enterprise encryption at rest.</p>
              </div>

              <div className="sec-card card">
                <div className="sec-card-icon">📜</div>
                <h3>Immutable Audit Trail</h3>
                <p>Every link open, document upload, quotation approval, and payment confirmation is cryptographically timestamped and logged with IP and device fingerprints for non-repudiation.</p>
              </div>

              <div className="sec-card card" id="compliance">
                <div className="sec-card-icon">🇮🇳</div>
                <h3>India DPDP Act 2023 Compliance</h3>
                <p>Full compliance with the Digital Personal Data Protection Act, 2023. Senders retain 100% ownership of their data with instant export and permanent deletion capabilities.</p>
              </div>
            </div>

            <div className="compliance-table-card card mt-24">
              <h3>Compliance & Operational Standards</h3>
              <table className="compliance-table">
                <thead>
                  <tr>
                    <th>Standard / Regulation</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>DPDP Act 2023 (India)</strong></td>
                    <td><span className="badge badge-success">Compliant</span></td>
                    <td>Data principal rights, purpose limitation, and consent-driven workflows.</td>
                  </tr>
                  <tr>
                    <td><strong>IT Act 2000 (India)</strong></td>
                    <td><span className="badge badge-success">Compliant</span></td>
                    <td>Intermediary guidelines, audit trail preservation, and reasonable security practices.</td>
                  </tr>
                  <tr>
                    <td><strong>Data Residency</strong></td>
                    <td><span className="badge badge-success">India Hosted</span></td>
                    <td>Database and storage instances reside in Indian cloud zones (Mumbai / Hyderabad).</td>
                  </tr>
                  <tr>
                    <td><strong>Payment Security</strong></td>
                    <td><span className="badge badge-success">PCI-DSS L1</span></td>
                    <td>Direct NPCI UPI integration; zero raw payment credential retention.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="reporting-box card mt-24">
              <h3>Responsible Vulnerability Disclosure</h3>
              <p>
                If you are a security researcher and have discovered a potential security vulnerability in DONE, please email our security team directly at <strong>security@qsura.com</strong>. We review all reports within 24 hours.
              </p>
            </div>

          </div>
        </section>
      </main>

      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}
