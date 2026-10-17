// DONE — Comprehensive Legal Agreements (Terms of Service & Privacy Policy)
// Engineered & Operated by Qsura India Pvt Ltd
import { React, html } from '../react-helpers.js';
import { PublicHeader, PublicFooter } from '../components/PublicNav.js';
import { config } from '../config.js';

export function TermsPage({ navigate }) {
  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/terms" navigate=${navigate} />

      <main className="public-content-page">
        <section className="page-hero-section text-center">
          <div className="landing-container">
            <div className="eyebrow">LEGAL AGREEMENT</div>
            <h1 className="page-hero-title">Terms of Service</h1>
            <p className="page-hero-lead">Effective Date: September 29, 2026 • Version 2.4</p>
          </div>
        </section>

        <section className="section-block bg-white">
          <div className="landing-container content-narrow">
            <div className="card p-32 legal-document-card">
              
              <div className="disclaimer-callout-warning mb-24">
                <strong>⚠️ CRITICAL STATUTORY DISCLAIMER (SECTION 1.2):</strong><br/>
                <strong>DONE is strictly an asynchronous workflow and digital communication platform.</strong> DONE is <u>NOT</u> a debt-collection agency, legal representation firm, financial intermediary, recovery agent, or escrow provider. DONE facilitates structured communication, document exchange, and payment tracking between Senders and Recipients. The operating entity, <strong>${config.company.legalName}</strong>, does not assume any fiduciary responsibility, does not guarantee recipient performance, and does not enforce compliance.
              </div>

              <div className="legal-body">
                <section className="legal-section">
                  <h3>1. Contracting Entity & Acceptance of Terms</h3>
                  <p>
                    These Terms of Service ("Terms") constitute a legally binding electronic agreement between you ("User", whether as an account-holding "Sender" or a no-login "Recipient") and <strong>${config.company.legalName}</strong> ("Company", "we", "us", or "our"), governing your access to and use of the DONE platform, websites, and associated APIs.
                  </p>
                  <p>
                    By creating an account, generating a request link, or clicking to interact with a recipient request token (<code>/r/...</code>), you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree, you must discontinue access immediately.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>2. Recipient Protocol (No-Account Access)</h3>
                  <p>
                    DONE features an asymmetric recipient architecture: Recipients are not required to create an account, register credentials, or download mobile applications. 
                  </p>
                  <p>
                    Access to individual requests is facilitated via high-entropy cryptographic tokens. Senders are solely responsible for verifying the authenticity and contact details of recipients before sending request links. Recipients participate on a voluntary basis and may decline or close requests at any time.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>3. Acceptable Use & Prohibited Activities</h3>
                  <p>Users must not use DONE to solicit, store, transmit, or process any of the following prohibited content:</p>
                  <ul>
                    <li>Bank account passwords, UPI PINs, ATM PINs, or Credit/Debit card CVVs;</li>
                    <li>One-Time Passwords (OTPs) or multi-factor authentication tokens;</li>
                    <li>Extortion, threatening, harassing, or defamatory communications;</li>
                    <li>Counterfeit documents, forged government certificates, or fraudulent invoices;</li>
                    <li>Malware, viruses, automated web scrapers, or exploits targeting platform infrastructure.</li>
                  </ul>
                  <p>Violation will result in immediate termination of the offending workspace and reporting to law enforcement authorities under the Indian Information Technology Act, 2000.</p>
                </section>

                <section className="legal-section">
                  <h3>4. Financial Transactions & Third-Party Gateways</h3>
                  <p>
                    DONE enables Senders to configure payment actions and generate UPI deep-links or payment gateway links (such as Razorpay or Cashfree). 
                  </p>
                  <p>
                    <strong>We do not hold customer funds:</strong> In live transactions, payments are routed directly from the Recipient's bank/UPI app to the Sender's linked gateway or virtual payment address (VPA). In Demo Sandbox mode, all monetary figures are strictly simulated and do not convey monetary value. Senders are responsible for issuing appropriate GST tax invoices to their clients.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>5. Electronic Signatures & Audit Logs</h3>
                  <p>
                    Pursuant to Section 10A of the Indian Information Technology Act, 2000, electronic approvals and confirmations made on DONE are valid and binding. 
                  </p>
                  <p>
                    DONE records immutable audit trails containing UTC timestamps, IP addresses, and state transition hashes. These audit logs are maintained for non-repudiation and evidential purposes.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>6. Intellectual Property Rights</h3>
                  <p>
                    All software code, database architecture, algorithms, UI components, graphics, documentation, and the name "DONE" are the exclusive proprietary property of <strong>${config.company.legalName}</strong>.
                  </p>
                  <p>
                    Users are granted a limited, revocable, non-exclusive, non-transferable subscription license to access the platform. Reverse-engineering, decompiling, or creating unauthorized derivative works is strictly prohibited.
                  </p>
                </section>

                <section className="legal-section" id="disclaimer">
                  <h3>7. Third-Party Trademarks & Nominative Fair Use</h3>
                  <p>
                    All third-party product names, logos, brands, and registered trademarks referenced on this platform—including but not limited to <strong>WhatsApp, UPI, Razorpay, Cashfree, Google Pay, PhonePe, Paytm, Apple, and Microsoft</strong>—are the property of their respective owners.
                  </p>
                  <p>
                    Their mention on DONE is strictly for technical interoperability, descriptive compatibility, and user navigational convenience under the nominative fair use doctrine. Reference to these brands does not imply endorsement, affiliation, sponsorship, or partnership by or with the trademark holders.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>8. Limitation of Liability</h3>
                  <p>
                    To the maximum extent permitted by applicable Indian law, ${config.company.legalName} and its directors, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of business profits, uncollected invoices, delayed client submissions, or external contract disputes.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>9. Governing Law & Dispute Resolution</h3>
                  <p>
                    These Terms shall be governed by and construed in accordance with the substantive laws of the Republic of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>10. Contacting the Legal Department</h3>
                  <p>
                    For legal notices, compliance queries, or copyright inquiries, please write to:
                  </p>
                  <p>
                    <strong>Legal Department</strong><br/>
                    ${config.company.legalName}<br/>
                    Email: <strong>legal@qsura.com</strong> or <strong>${config.company.supportEmail}</strong>
                  </p>
                </section>
              </div>

            </div>
          </div>
        </section>
      </main>

      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}

export function PrivacyPolicyPage({ navigate }) {
  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/privacy" navigate=${navigate} />

      <main className="public-content-page">
        <section className="page-hero-section text-center">
          <div className="landing-container">
            <div className="eyebrow">PRIVACY & DATA PROTECTION</div>
            <h1 className="page-hero-title">Privacy Policy</h1>
            <p className="page-hero-lead">
              Compliant with the Digital Personal Data Protection Act, 2023 (DPDP) • Last Updated: September 2026
            </p>
          </div>
        </section>

        <section className="section-block bg-white">
          <div className="landing-container content-narrow">
            <div className="card p-32 legal-document-card">
              
              <div className="disclaimer-callout-success mb-24">
                <strong>🔒 OUR PRIVACY COMMITMENT:</strong><br/>
                DONE is built by <strong>${config.company.legalName}</strong> under the principle of <em>Privacy by Design</em>. We do not sell your personal data, we do not track recipients across third-party websites, and our revenue comes solely from software subscriptions.
              </div>

              <div className="legal-body">
                <section className="legal-section">
                  <h3>1. Scope & Application</h3>
                  <p>
                    This Privacy Policy details how ${config.company.legalName} ("Company", "we", "us") collects, processes, stores, and safeguards personal data when you interact with DONE as a registered Sender or as an unregistered Recipient accessing a structured action link.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>2. Data We Collect</h3>
                  <h4>A. From Senders (Account Holders):</h4>
                  <ul>
                    <li>Account information: Full name, work email address, organization name;</li>
                    <li>Billing information: Subscription tier, billing cycle, invoice history (processed securely via PCI-DSS compliant payment gateways);</li>
                    <li>Workspace data: Request configurations, titles, due dates, action instructions, contact address book.</li>
                  </ul>

                  <h4>B. From Recipients (No-Account Users):</h4>
                  <ul>
                    <li>Action fulfillment data: Uploaded file attachments (e.g. GST certificates, invoices, signed documents);</li>
                    <li>Decision records: Approval confirmation notes, rejection reasons, appointment confirmations;</li>
                    <li>Technical metadata: Time of link access, device user agent, IP address for audit validation.</li>
                  </ul>
                </section>

                <section className="legal-section">
                  <h3>3. Purpose of Processing</h3>
                  <p>We process personal data strictly for legitimate operational purposes:</p>
                  <ul>
                    <li>Enabling the creation, dispatch, and tracking of request workflows;</li>
                    <li>Maintaining immutable audit logs of document submission and approvals;</li>
                    <li>Dispatching automated notification alerts and reminder messages;</li>
                    <li>Preventing platform abuse, fraud, and illegal credential solicitation;</li>
                    <li>Complying with statutory record-keeping obligations under Indian law.</li>
                  </ul>
                </section>

                <section className="legal-section">
                  <h3>4. Digital Personal Data Protection Act (DPDP Act, 2023) Rights</h3>
                  <p>In accordance with Indian data protection laws, Users and Data Principals possess the following rights:</p>
                  <ul>
                    <li><strong>Right to Access:</strong> Review all personal data held about you in your workspace;</li>
                    <li><strong>Right to Correction & Erasure:</strong> Senders can update details or permanently delete requests, files, and contacts via the Settings panel;</li>
                    <li><strong>Right to Data Portability:</strong> 1-click JSON export of your entire workspace database at any time;</li>
                    <li><strong>Right of Grievance Redressal:</strong> Dedicated Data Protection Officer to address grievances within 7 business days.</li>
                  </ul>
                </section>

                <section className="legal-section">
                  <h3>5. Data Storage & Localization</h3>
                  <p>
                    All primary database instances, file attachment repositories, and audit logs are hosted in secure enterprise cloud data centers located within the Republic of India (Mumbai / Hyderabad cloud availability zones). Data is encrypted in transit using TLS 1.3 and at rest using AES-256.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>6. Zero Third-Party Advertising & No Data Selling</h3>
                  <p>
                    We have never sold, rented, or monetized personal information or contact lists to advertising brokers or marketing agencies. We will never do so. Third-party service providers (such as Supabase for database hosting and Razorpay for payment billing) process data strictly as Data Processors bound by contractual confidentiality.
                  </p>
                </section>

                <section className="legal-section">
                  <h3>7. Grievance Officer Contact Details</h3>
                  <p>
                    In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the DPDP Act 2023, the Grievance Officer details are:
                  </p>
                  <p>
                    <strong>Grievance Officer:</strong> Irfan Ashraf<br/>
                    <strong>Entity:</strong> ${config.company.legalName}<br/>
                    <strong>Email:</strong> privacy@qsura.com or support@qsura.com<br/>
                    <strong>Jurisdiction:</strong> New Delhi, India
                  </p>
                </section>
              </div>

            </div>
          </div>
        </section>
      </main>

      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}
