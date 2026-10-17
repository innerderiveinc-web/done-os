// DONE — 404 Not Found Page (React 19 Component)
import { React, html } from '../react-helpers.js';
import { PublicHeader, PublicFooter } from '../components/PublicNav.js';

export function NotFoundPage({ navigate }) {
  const handleNav = (url) => (e) => {
    e.preventDefault();
    navigate(url);
  };

  return html`
    <div className="landing-page">
      <${PublicHeader} currentPath="/404" navigate=${navigate} />

      <main className="public-content-page text-center">
        <section className="section-block">
          <div className="landing-container" style=${{ maxWidth: '600px', margin: '40px auto 80px' }}>
            <div style=${{ fontSize: '72px', fontWeight: '900', color: 'var(--brand)', lineHeight: '1', marginBottom: '16px' }}>
              404
            </div>
            <h1 style=${{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>
              Page Not Found
            </h1>
            <p className="text-muted" style=${{ fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
              The link you followed may be broken, or the page may have been moved or removed.
            </p>

            <div style=${{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/" className="btn btn-primary" onClick=${handleNav('/')}>
                Back to Homepage
              </a>
              <a href="/faq" className="btn btn-secondary" onClick=${handleNav('/faq')}>
                Visit FAQ
              </a>
              <a href="/dashboard" className="btn btn-outline" onClick=${handleNav('/dashboard')}>
                Open Workspace
              </a>
            </div>
          </div>
        </section>
      </main>

      <${PublicFooter} navigate=${navigate} />
    </div>
  `;
}
