// DONE — Share Modal React Component (React 19)
import { React, useState, html } from '../react-helpers.js';
import { messagingService } from '../services/messaging.js';
import { showToast } from './toast.js';

export function ShareModal({ request, link, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const recipient = {
    name: request.recipient_name,
    phone: request.recipient_phone,
    email: request.recipient_email
  };
  const links = messagingService.buildLinks(request, recipient, link);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      showToast('Recipient action link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Link ready: select and copy from field', 'default');
    }
  };

  return html`
    <div className="modal-backdrop" onClick=${(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="share-modal card" role="dialog" aria-modal="true" aria-label="Share Request">
        <div className="modal-head">
          <div>
            <div className="eyebrow">${request.reference_no}</div>
            <h2>Share Request with ${request.recipient_name}</h2>
          </div>
          <button className="icon-btn" onClick=${onClose}>✕</button>
        </div>

        <div className="share-banner">
          <span className="trust-badge">🔒 Encrypted Recipient Action Link</span>
          <p>No app or account creation required for ${request.recipient_name} to complete this request.</p>
        </div>

        <div className="share-channels">
          <a href=${links.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp wide">
            <span className="channel-icon">💬</span> Share via WhatsApp
          </a>

          <div className="share-secondary-grid">
            <a href=${links.sms} className="btn btn-secondary">
              <span>✉️</span> SMS
            </a>
            <a href=${links.email} className="btn btn-secondary">
              <span>📧</span> Email
            </a>
            <button className="btn btn-secondary" onClick=${handleCopy}>
              <span>🔗</span> ${copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="share-url-box">
          <label>Direct Recipient URL</label>
          <div className="copy-input-row">
            <input type="text" readOnly value=${link} onClick=${(e) => e.target.select()} />
            <button className="btn btn-primary" onClick=${handleCopy}>
              ${copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="share-preview-box">
          <div className="preview-label">PRE-FORMATTED MESSAGE PREVIEW</div>
          <pre className="preview-text">${links.text}</pre>
        </div>

        <div className="modal-foot">
          <div className="demo-pill">DEMO MODE • QSURA & Meta WhatsApp API Ready</div>
          <button className="btn btn-secondary" onClick=${onClose}>Done</button>
        </div>
      </div>
    </div>
  `;
}
