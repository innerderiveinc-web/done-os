// DONE — Lightweight Contacts Directory (React 19 Component)
import { React, useState, useEffect, html } from '../react-helpers.js';
import { db } from '../services/db.js';

export function ContactsPage({ navigate, initialSearch = '' }) {
  const [search, setSearch] = useState(initialSearch);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    setContacts(db.getContacts());
  }, []);

  let filtered = [...contacts];
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q));
  }

  return html`
    <section className="page contacts-page">
      <div className="hero compact">
        <div>
          <div className="eyebrow">CONTACTS</div>
          <h1>Recipients, without the CRM clutter.</h1>
          <p className="lead">People and businesses you request actions from. Automatically captured as you send requests.</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick=${() => navigate('/requests/new')}>
            ＋ New Request
          </button>
        </div>
      </div>

      
      <div className="toolbar-box card">
        <div className="search-input-wrap">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search contacts by name, email, or phone..."
            value=${search}
            onInput=${(e) => setSearch(e.target.value)}
          />
          ${search ? html`
            <button className="clear-input-btn" onClick=${() => setSearch('')}>✕</button>
          ` : null}
        </div>
      </div>

      
      <div className="contacts-grid mt-20">
        ${filtered.length > 0 ? filtered.map(c => html`
          <div key=${c.id} className="contact-card card">
            <div className="contact-card-top">
              <div className="avatar-lg">${c.name.slice(0, 2).toUpperCase()}</div>
              <div className="contact-details">
                <h3>${c.name}</h3>
                <div className="contact-meta-item">📧 ${c.email || 'No email provided'}</div>
                <div className="contact-meta-item">📱 ${c.phone || 'No phone provided'}</div>
              </div>
            </div>

            <div className="contact-stats-row">
              <div>
                <span className="stat-label">Requests</span>
                <strong>${c.requestsCount || 1}</strong>
              </div>
              <div>
                <span className="stat-label">Completed</span>
                <strong className="text-green">${c.completedCount || 0}</strong>
              </div>
              <div>
                <span className="stat-label">Status</span>
                <span className=${`badge ${c.status === 'Active' ? 'badge-success' : ''}`}>
                  ${c.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="contact-card-actions">
              <button
                className="btn btn-secondary btn-sm wide"
                onClick=${() => navigate(`/requests/new?recipient=${encodeURIComponent(c.name)}`)}
              >
                Send Request →
              </button>
            </div>
          </div>
        `) : html`
          <div className="empty-state-card card" style="grid-column: 1 / -1;">
            <div className="empty-icon">◉</div>
            <h3>No contacts found</h3>
            <p>Contacts appear automatically as you create requests. Or try another search query.</p>
          </div>
        `}
      </div>
    </section>
  `;
}
