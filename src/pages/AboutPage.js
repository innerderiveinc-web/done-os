// DONE — Dedicated About Us Page (React 19 Component)
// Engineered & Operated by Qsura India Pvt Ltd
import { React, html } from '../react-helpers.js';
import { PublicHeader, PublicFooter } from '../components/PublicNav.js';
import { config } from '../config.js';

export function AboutPage({ navigate }) {
  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/about" navigate=${navigate} />

      <main className="public-content-page">
        <section className="page-hero-section text-center">
          <div className="landing-container">
            <div className="eyebrow">ABOUT THE PLATFORM</div>
            <h1 className="page-hero-title">Why We Built DONE</h1>
            <p className="page-hero-lead">
              Every day across India, millions of business owners, freelancers, and professionals lose hundreds of productive hours doing one painful thing: <strong>chasing people</strong>.
            </p>
          </div>
        </section>

        <section className="section-block bg-white">
          <div className="landing-container content-narrow">
            <div className="story-card card">
              <h2>The Genesis of DONE</h2>
              <p>
                In 2026, <strong>Qsura India Pvt Ltd</strong> set out to solve a fundamental friction in business communication: <em>"Kisi se kuch karwana hai? Request bhejo. Track karo. Kaam complete karao."</em>
              </p>
              <p>
                When a Chartered Accountant needs a GST certificate, a freelancer needs an advance payment, or an agency needs a design sign-off, they send messages across WhatsApp, email threads, SMS, and phone calls. Documents get buried under family chats. Payment screenshots get lost. Nobody remembers what has been submitted and what is still pending.
              </p>
              <p>
                Existing project management tools (like Jira, Asana, or Monday.com) failed because they forced the external client or recipient to sign up, remember a password, and learn complicated enterprise software.
              </p>
              <div className="quote-callout">
                "We realized the breakthrough wasn't building another dashboard for the sender — it was building a <strong>Zero-Friction Recipient Protocol</strong> where anyone can complete a task in 30 seconds without an app or password."
              </div>
            </div>

            <div className="pillars-grid mt-24">
              <div className="pillar-card card">
                <div className="pillar-icon">🎯</div>
                <h3>One Request, Multi-Action</h3>
                <p>Instead of 5 separate messages for documents, approvals, and fees, DONE bundles them into a single, clean trackable checklist link.</p>
              </div>

              <div className="pillar-card card">
                <div className="pillar-icon">⚡</div>
                <h3>No App Required</h3>
                <p>Recipients open an encrypted web link on any phone or laptop. No account creation, no password friction, no app download.</p>
              </div>

              <div className="pillar-card card">
                <div className="pillar-icon">🔒</div>
                <h3>Bank-Grade Security</h3>
                <p>Built with end-to-end data encryption, audit trails with cryptographic tokens, and zero credential ingestion.</p>
              </div>

              <div className="pillar-card card">
                <div className="pillar-icon">🇮🇳</div>
                <h3>Made for Indian Commerce</h3>
                <p>Built-in UPI deep-links, Hinglish natural language parsing, and compliance with the India DPDP Act 2023.</p>
              </div>
            </div>

            <div className="company-info-card card mt-24">
              <h3>Corporate Identity</h3>
              <p>
                <strong>DONE</strong> is conceptualized, engineered, and operated exclusively by:
              </p>
              <ul className="company-details-list">
                <li><strong>Operating Entity:</strong> ${config.company.legalName}</li>
                <li><strong>Headquarters:</strong> India</li>
                <li><strong>Official Support:</strong> ${config.company.supportEmail}</li>
                <li><strong>Core Focus:</strong> Next-generation business workflow infrastructure, financial transaction tracking, and digital automation.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}
