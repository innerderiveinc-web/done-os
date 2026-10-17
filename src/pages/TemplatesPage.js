// DONE — Templates Library (React 19 Component)
import { React, useState, useEffect, html } from '../react-helpers.js';
import { db } from '../services/db.js';

export function TemplatesPage({ navigate }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    setTemplates(db.getTemplates());
  }, []);

  return html`
    <section className="page templates-page">
      <div className="hero compact">
        <div>
          <div className="eyebrow">TEMPLATES</div>
          <h1>Start from a proven Request.</h1>
          <p className="lead">Reusable, one-click workflows for the commitments businesses chase every day.</p>
        </div>
      </div>

      <div className="template-grid mt-20">
        ${templates.map(t => html`
          <div key=${t.id} className="template-card card">
            <div className="template-head">
              <span className=${`template-icon type-${(t.type || 'Document').toLowerCase()}`}>
                ${t.type === 'Document' ? '▤' : t.type === 'Payment' ? '₹' : t.type === 'Approval' ? '✓' : '↔'}
              </span>
              <span className=${`type-pill type-${(t.type || 'Document').toLowerCase()}`}>${t.type}</span>
            </div>

            <h3 className="template-title">${t.name}</h3>
            <p className="template-desc">${t.description}</p>

            <div className="template-actions-preview">
              <span className="preview-count">${t.actions?.length || 1} Actions:</span>
              <ul>
                ${(t.actions || []).slice(0, 3).map((a, i) => html`<li key=${i}>• ${a.title}</li>`)}
              </ul>
            </div>

            <div className="template-footer">
              <button
                className="btn btn-primary btn-sm wide"
                onClick=${() => navigate(`/requests/new?template=${encodeURIComponent(t.id)}`)}
              >
                Use Template →
              </button>
            </div>
          </div>
        `)}
      </div>
    </section>
  `;
}
