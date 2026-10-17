// DONE — Requests Directory & Table View (React 19 Component)
import { React, useState, useEffect, html } from '../react-helpers.js';
import { db } from '../services/db.js';

function formatMoney(amount) {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function RequestsPage({ navigate, onOpenShare, initialFilter = 'All' }) {
  const [currentFilter, setCurrentFilter] = useState(initialFilter);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentSort, setCurrentSort] = useState('newest');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    setRequests(db.getRequests());
  }, []);

  const filterTabs = [
    'All', 'Sent', 'Opened', 'In Progress', 'Submitted',
    'Needs Correction', 'Approved', 'Paid', 'Completed', 'Closed', 'Overdue'
  ];

  let filtered = [...requests];

  if (currentFilter !== 'All') {
    filtered = filtered.filter(r => r.status.toLowerCase() === currentFilter.toLowerCase());
  }

  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(r =>
      `${r.reference_no} ${r.title} ${r.recipient_name} ${r.recipient_email} ${r.recipient_phone} ${r.request_type}`.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    if (currentSort === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (currentSort === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (currentSort === 'due_soon') return new Date(a.due_at) - new Date(b.due_at);
    if (currentSort === 'overdue') {
      const aO = a.status === 'Overdue' ? 1 : 0;
      const bO = b.status === 'Overdue' ? 1 : 0;
      return bO - aO;
    }
    return 0;
  });

  return html`
    <section className="page requests-page">
      <div className="hero compact">
        <div>
          <div className="eyebrow">REQUESTS</div>
          <h1>Everything that needs to get DONE.</h1>
          <p className="lead">One request, one owner, one status, one completion.</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick=${() => navigate('/requests/new')}>
            ＋ Create Request
          </button>
        </div>
      </div>

      
      <div className="toolbar-box card">
        <div className="toolbar-top">
          <div className="search-input-wrap">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by title, recipient, reference ID..."
              value=${currentSearch}
              onInput=${(e) => setCurrentSearch(e.target.value)}
            />
            ${currentSearch ? html`
              <button className="clear-input-btn" onClick=${() => setCurrentSearch('')}>✕</button>
            ` : null}
          </div>

          <div className="sort-wrap">
            <label>Sort by:</label>
            <select value=${currentSort} onChange=${(e) => setCurrentSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="due_soon">Due Soonest</option>
              <option value="overdue">Overdue First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="filter-pills-row">
          ${filterTabs.map(f => html`
            <button
              key=${f}
              className=${`filter-pill ${currentFilter === f ? 'selected' : ''}`}
              onClick=${() => setCurrentFilter(f)}
            >
              ${f}
            </button>
          `)}
        </div>
      </div>

      
      <div className="card table-card mt-16">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Request & Actions</th>
                <th>Recipient</th>
                <th>Type</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map(r => {
                const isOverdue = r.status === 'Overdue';
                const dueDateStr = r.due_at ? new Date(r.due_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                const link = `${window.location.origin}/r/${r.public_token}`;
                return html`
                  <tr key=${r.id} className=${`table-row ${isOverdue ? 'row-highlight-overdue' : ''}`}>
                    <td className="font-mono font-bold">
                      <a href=${`/requests/${encodeURIComponent(r.id)}`} className="table-id-link" onClick=${(e) => { e.preventDefault(); navigate(`/requests/${encodeURIComponent(r.id)}`); }}>
                        ${r.reference_no}
                      </a>
                    </td>
                    <td>
                      <div className="table-title-cell">
                        <a href=${`/requests/${encodeURIComponent(r.id)}`} className="table-title-text" onClick=${(e) => { e.preventDefault(); navigate(`/requests/${encodeURIComponent(r.id)}`); }}>
                          ${r.title}
                        </a>
                        <div className="table-actions-sub">
                          ${(r.actions || []).map((a, i) => html`
                            <span key=${i} className="mini-action-tag">${a.title}</span>
                          `)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-recipient-cell">
                        <strong>${r.recipient_name}</strong>
                        <small className="text-muted">${r.recipient_email || r.recipient_phone || 'No phone'}</small>
                      </div>
                    </td>
                    <td>
                      <span className=${`type-badge type-${r.request_type.toLowerCase()}`}>
                        ${r.request_type}
                      </span>
                    </td>
                    <td>
                      <span className=${`status status-${r.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        ${r.status}
                      </span>
                    </td>
                    <td className=${isOverdue ? 'text-danger font-bold' : ''}>
                      ${dueDateStr}
                    </td>
                    <td className="font-mono">
                      ${formatMoney(r.amount)}
                    </td>
                    <td className="text-right">
                      <div className="table-action-btns">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick=${() => onOpenShare(r, link)}
                          title="Share link"
                        >
                          Share
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick=${() => navigate(`/requests/${encodeURIComponent(r.id)}`)}
                        >
                          View →
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }) : html`
                <tr>
                  <td colSpan="8">
                    <div className="empty-table-state">
                      <div className="empty-icon">⌁</div>
                      <h3>No matching requests</h3>
                      <p>Try adjusting your search query or status filter, or create a brand new request.</p>
                      <button className="btn btn-primary btn-sm" onClick=${() => navigate('/requests/new')}>
                        Create Request
                      </button>
                    </div>
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}
