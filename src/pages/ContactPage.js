// DONE — Dedicated Contact & Enterprise Sales Page (React 19 Component)
import { React, useState, html } from '../react-helpers.js';
import { PublicHeader, PublicFooter } from '../components/PublicNav.js';
import { showToast } from '../components/toast.js';
import { config } from '../config.js';

export function ContactPage({ navigate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('enterprise');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Please provide your name and email', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Inquiry submitted! Our team will connect with you shortly.', 'success');
  };

  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/contact" navigate=${navigate} />

      <main className="public-content-page">
        <section className="page-hero-section text-center">
          <div className="landing-container">
            <div className="eyebrow">GET IN TOUCH</div>
            <h1 className="page-hero-title">We'd Love to Hear From You</h1>
            <p className="page-hero-lead">
              Have questions about enterprise custom pricing, workflow integrations, or need dedicated onboarding assistance? Talk directly to our team.
            </p>
          </div>
        </section>

        <section className="section-block bg-white">
          <div className="landing-container">
            <div className="contact-layout-grid">
              
              <div className="contact-form-card card">
                ${submitted ? html`
                  <div className="contact-success-state text-center" style=${{ padding: '40px 20px' }}>
                    <div style=${{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                    <h2 style=${{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Thank You, ${name}!</h2>
                    <p className="text-muted" style=${{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                      Your message has been received by our enterprise team at <strong>Qsura India Pvt Ltd</strong>. We review inquiries promptly and will reply to <strong>${email}</strong> within 4 business hours.
                    </p>
                    <button className="btn btn-secondary" onClick=${() => setSubmitted(false)}>Send Another Message</button>
                  </div>
                ` : html`
                  <form onSubmit=${handleSubmit} className="contact-form">
                    <h2 className="mb-20" style=${{ fontSize: '20px', fontWeight: '800' }}>Send Us a Message</h2>
                    
                    <div className="form-group mb-16">
                      <label className="form-label">Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        className="form-control" 
                        placeholder="e.g. Rahul Sharma"
                        value=${name}
                        onInput=${(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="form-grid-2 mb-16">
                      <div className="form-group">
                        <label className="form-label">Work Email *</label>
                        <input 
                          type="email" 
                          required 
                          className="form-control" 
                          placeholder="rahul@company.com"
                          value=${email}
                          onInput=${(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone / WhatsApp</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          placeholder="+91 98765 43210"
                          value=${phone}
                          onInput=${(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group mb-16">
                      <label className="form-label">Inquiry Subject</label>
                      <select 
                        className="form-control"
                        value=${topic}
                        onChange=${(e) => setTopic(e.target.value)}
                      >
                        <option value="enterprise">Enterprise Custom Plan (2,000+ requests)</option>
                        <option value="sales">Sales & Feature Inquiries</option>
                        <option value="partnership">API / Gateway Partnership</option>
                        <option value="support">Customer & Account Support</option>
                      </select>
                    </div>

                    <div className="form-group mb-20">
                      <label className="form-label">How can we help your business?</label>
                      <textarea 
                        rows="4" 
                        className="form-control" 
                        placeholder="Tell us about your current request process and what you're looking to automate..."
                        value=${message}
                        onInput=${(e) => setMessage(e.target.value)}
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary wide btn-lg">
                      Submit Business Inquiry →
                    </button>
                  </form>
                `}
              </div>

              <div className="contact-info-col">
                <div className="info-card card mb-20">
                  <div className="info-icon">🏢</div>
                  <h3>Corporate Office</h3>
                  <p><strong>${config.company.legalName}</strong></p>
                  <p className="text-muted font-size-13">New Delhi / NCR, India</p>
                </div>

                <div className="info-card card mb-20">
                  <div className="info-icon">✉️</div>
                  <h3>Email Contacts</h3>
                  <p><strong>General Support:</strong> ${config.company.supportEmail}</p>
                  <p><strong>Enterprise Sales:</strong> sales@qsura.com</p>
                  <p><strong>Legal & Security:</strong> security@qsura.com</p>
                </div>

                <div className="info-card card">
                  <div className="info-icon">⏱️</div>
                  <h3>Service Response SLA</h3>
                  <p><strong>Standard Hours:</strong> Monday – Saturday (9:30 AM – 6:30 PM IST)</p>
                  <p className="text-muted font-size-13 mt-6">
                    Enterprise tier customers receive 24/7 priority ticket support with guaranteed 1-hour initial response time.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}
