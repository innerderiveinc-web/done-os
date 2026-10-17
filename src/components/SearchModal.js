// DONE — Global Command Palette & Search Modal (React 19)
import { React, useState, useEffect, useRef, html } from '../react-helpers.js';
import { db } from '../services/db.js';

export function SearchModal({ isOpen, onClose, navigate }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const allRequests = db.getRequests();
  const allContacts = db.getContacts();
  const allTemplates = db.getTemplates();

  const requests = q
    ? allRequests.filter(r => `${r.reference_no} ${r.title} ${r.recipient_name} ${r.request_type} ${r.status}`.toLowerCase().includes(q)).slice(0, 5)
    : [];
  const contacts = q
    ? allContacts.filter(c => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q)).slice(0, 3)
    : [];
  const templates = q
    ? allTemplates.filter(t => `${t.name} ${t.description} ${t.type}`.toLowerCase().includes(q)).slice(0, 3)
    : [];

  const items = [];
  if (!q) {
    items.push({ type: 'nav', title: 'Create New Request', sub: 'AI-assisted or manual form', url: '/requests/new', icon: '＋' });
    items.push({ type: 'nav', title: 'All Requests', sub: 'Filter by status and due date', url: '/requests', icon: '◫' });
    items.push({ type: 'nav', title: 'Product Validation Dashboard', sub: 'Track recipient-to-sender viral loops', url: '/analytics', icon: '⌁' });
  } else {
    requests.forEach(r => items.push({ type: 'request', data: r, url: `/requests/${encodeURIComponent(r.id)}` }));
    contacts.forEach(c => items.push({ type: 'contact', data: c, url: `/contacts?search=${encodeURIComponent(c.name)}` }));
    templates.forEach(t => items.push({ type: 'template', data: t, url: `/requests/new?template=${encodeURIComponent(t.id)}` }));
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (items.length > 0) {
        setSelectedIndex(prev => (prev + 1) % items.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (items.length > 0) {
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        onClose();
        navigate(items[selectedIndex].url);
      }
    }
  };

  return html`
    <div className="modal-backdrop" onClick=${(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="search-modal card" role="dialog" aria-modal="true" aria-label="Global search">
        <div className="search-modal-header">
          <span className="search-icon">⌕</span>
          <input
            ref=${inputRef}
            type="text"
            placeholder="Search requests, recipients, actions, templates... (Esc to close)"
            value=${query}
            onInput=${(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown=${handleKeyDown}
            autoComplete="off"
          />
          <span className="esc-badge" onClick=${onClose}>ESC</span>
        </div>

        <div className="search-modal-results">
          ${items.length === 0 && q ? html`
            <div className="search-empty">No results found for "${query}"</div>
          ` : null}

          ${!q ? html`
            <div className="search-section-title">Quick Links</div>
            ${items.map((item, idx) => html`
              <div 
                key=${item.url}
                className=${`search-item ${selectedIndex === idx ? 'selected' : ''}`}
                onMouseEnter=${() => setSelectedIndex(idx)}
                onClick=${() => { onClose(); navigate(item.url); }}
              >
                <span className="search-item-icon">${item.icon}</span>
                <div><b>${item.title}</b><small>${item.sub}</small></div>
              </div>
            `)}
          ` : null}

          ${q && requests.length > 0 ? html`
            <div className="search-section-title">Requests (${requests.length})</div>
            ${requests.map((r, idx) => {
              const itemIdx = items.findIndex(i => i.type === 'request' && i.data.id === r.id);
              return html`
                <div 
                  key=${r.id}
                  className=${`search-item ${selectedIndex === itemIdx ? 'selected' : ''}`}
                  onMouseEnter=${() => setSelectedIndex(itemIdx)}
                  onClick=${() => { onClose(); navigate(`/requests/${encodeURIComponent(r.id)}`); }}
                >
                  <span className=${`type-dot type-${r.request_type.toLowerCase()}`}>
                    ${r.request_type === 'Document' ? '▤' : r.request_type === 'Payment' ? '₹' : r.request_type === 'Approval' ? '✓' : '↔'}
                  </span>
                  <div className="search-item-text">
                    <b>${r.reference_no}: ${r.title}</b>
                    <small>${r.recipient_name} • Status: <span className=${`status status-${r.status.toLowerCase().replace(/\s+/g,'-')}`}>${r.status}</span></small>
                  </div>
                </div>
              `;
            })}
          ` : null}

          ${q && contacts.length > 0 ? html`
            <div className="search-section-title">Contacts (${contacts.length})</div>
            ${contacts.map((c) => {
              const itemIdx = items.findIndex(i => i.type === 'contact' && i.data.id === c.id);
              return html`
                <div 
                  key=${c.id}
                  className=${`search-item ${selectedIndex === itemIdx ? 'selected' : ''}`}
                  onMouseEnter=${() => setSelectedIndex(itemIdx)}
                  onClick=${() => { onClose(); navigate(`/contacts?search=${encodeURIComponent(c.name)}`); }}
                >
                  <span className="avatar contact">${c.name.slice(0, 2).toUpperCase()}</span>
                  <div className="search-item-text">
                    <b>${c.name}</b>
                    <small>${c.email || c.phone || 'Contact'}</small>
                  </div>
                </div>
              `;
            })}
          ` : null}

          ${q && templates.length > 0 ? html`
            <div className="search-section-title">Templates (${templates.length})</div>
            ${templates.map((t) => {
              const itemIdx = items.findIndex(i => i.type === 'template' && i.data.id === t.id);
              return html`
                <div 
                  key=${t.id}
                  className=${`search-item ${selectedIndex === itemIdx ? 'selected' : ''}`}
                  onMouseEnter=${() => setSelectedIndex(itemIdx)}
                  onClick=${() => { onClose(); navigate(`/requests/new?template=${encodeURIComponent(t.id)}`); }}
                >
                  <span className="search-item-icon">▣</span>
                  <div className="search-item-text">
                    <b>Template: ${t.name}</b>
                    <small>${t.description}</small>
                  </div>
                </div>
              `;
            })}
          ` : null}
        </div>

        <div className="search-modal-footer">
          <span>Navigation: <kbd>↑</kbd> <kbd>↓</kbd> to cycle</span>
          <span>Action: <kbd>Enter</kbd> to select</span>
        </div>
      </div>
    </div>
  `;
}
