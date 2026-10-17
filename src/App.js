import { React, Fragment, useState, useEffect, useCallback, html } from './react-helpers.js';
import { AuthProvider, useAuth, ProtectedRoute } from './context/AuthContext.js';
import { WorkspaceProvider } from './context/WorkspaceContext.js';

import { Shell } from './components/Shell.js';
import { SearchModal } from './components/SearchModal.js';
import { ShareModal } from './components/ShareModal.js';

import { LandingPage } from './pages/LandingPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { SecurityPage } from './pages/SecurityPage.js';
import { PricingPage } from './pages/PricingPage.js';
import { FAQPage } from './pages/FAQPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { TermsPage, PrivacyPolicyPage } from './pages/legal.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { AuthPage } from './pages/AuthPage.js';
import { RecipientPage } from './pages/RecipientPage.js';

import { DashboardPage } from './pages/DashboardPage.js';
import { RequestsPage } from './pages/RequestsPage.js';
import { RequestNewPage } from './pages/RequestNewPage.js';
import { RequestDetailPage } from './pages/RequestDetailPage.js';
import { ContactsPage } from './pages/ContactsPage.js';
import { TemplatesPage } from './pages/TemplatesPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { BillingPage } from './pages/BillingPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { AdminPage } from './pages/AdminPage.js';

function getPathFromLocation() {
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    return window.location.hash.slice(1);
  }
  return window.location.pathname || '/';
}

function MainRouter() {
  const [currentPath, setCurrentPath] = useState(getPathFromLocation());
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareData, setShareData] = useState({ isOpen: false, request: null, link: '' });

  const navigate = useCallback((url, replace = false) => {
    if (url.startsWith('#/')) {
      window.location.hash = url;
    } else if (window.location.protocol === 'file:') {
      window.location.hash = '#' + url;
    } else {
      if (replace) {
        window.history.replaceState({}, '', url);
      } else {
        window.history.pushState({}, '', url);
      }
    }
    setCurrentPath(getPathFromLocation());
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getPathFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Global Cmd+K / Ctrl+K listener
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const openShare = (request, link) => {
    setShareData({ isOpen: true, request, link });
  };

  const closeShare = () => {
    setShareData({ isOpen: false, request: null, link: '' });
  };

  const path = currentPath;

  // 1. Recipient Experience Route (/r/:token or /recipient?token=...)
  // Strictly public, zero login required!
  if (path.startsWith('/r/') || path.startsWith('/recipient')) {
    let token = '';
    if (path.startsWith('/r/')) {
      token = path.slice(3).split('?')[0];
    } else {
      token = new URLSearchParams(window.location.search).get('token') || new URLSearchParams(window.location.search).get('id') || '';
    }
    return html`<${RecipientPage} token=${token} navigate=${navigate} />`;
  }

  // 2. Public Marketing & Legal Pages
  if (path === '/') {
    return html`<${LandingPage} navigate=${navigate} />`;
  }
  if (path === '/about') {
    return html`<${AboutPage} navigate=${navigate} />`;
  }
  if (path === '/security') {
    return html`<${SecurityPage} navigate=${navigate} />`;
  }
  if (path === '/pricing') {
    return html`<${PricingPage} navigate=${navigate} />`;
  }
  if (path === '/faq') {
    return html`<${FAQPage} navigate=${navigate} />`;
  }
  if (path === '/contact') {
    return html`<${ContactPage} navigate=${navigate} />`;
  }
  if (path === '/terms') {
    return html`<${TermsPage} navigate=${navigate} />`;
  }
  if (path === '/privacy') {
    return html`<${PrivacyPolicyPage} navigate=${navigate} />`;
  }

  // 3. Auth Routes
  if (path === '/login') {
    return html`<${AuthPage} mode="login" navigate=${navigate} />`;
  }
  if (path === '/signup') {
    return html`<${AuthPage} mode="signup" navigate=${navigate} />`;
  }

  // 4. Authenticated SaaS Pages within Shell
  let pageComponent = null;

  if (path === '/dashboard') {
    pageComponent = html`<${DashboardPage} navigate=${navigate} onOpenShare=${openShare} />`;
  } else if (path === '/requests') {
    pageComponent = html`<${RequestsPage} navigate=${navigate} onOpenShare=${openShare} />`;
  } else if (path === '/requests/new') {
    const params = new URLSearchParams(window.location.search);
    const tmplId = params.get('template') || '';
    const presetType = params.get('type') || '';
    pageComponent = html`<${RequestNewPage} navigate=${navigate} onOpenShare=${openShare} presetType=${presetType} presetTemplateId=${tmplId} />`;
  } else if (path.startsWith('/requests/')) {
    const reqId = decodeURIComponent(path.slice('/requests/'.length).split('?')[0]);
    pageComponent = html`<${RequestDetailPage} requestId=${reqId} navigate=${navigate} onOpenShare=${openShare} />`;
  } else if (path.startsWith('/contacts')) {
    const search = new URLSearchParams(window.location.search).get('search') || '';
    pageComponent = html`<${ContactsPage} navigate=${navigate} initialSearch=${search} />`;
  } else if (path === '/templates') {
    pageComponent = html`<${TemplatesPage} navigate=${navigate} />`;
  } else if (path === '/analytics') {
    pageComponent = html`<${AnalyticsPage} navigate=${navigate} />`;
  } else if (path === '/billing') {
    pageComponent = html`<${BillingPage} navigate=${navigate} />`;
  } else if (path.startsWith('/settings')) {
    const tab = path.includes('/security') ? 'security' : path.includes('/privacy') ? 'privacy' : 'general';
    pageComponent = html`<${SettingsPage} activeTab=${tab} navigate=${navigate} />`;
  } else if (path === '/admin') {
    pageComponent = html`<${AdminPage} navigate=${navigate} />`;
  } else {
    // 404 Not Found Page for any unrecognized route
    return html`<${NotFoundPage} navigate=${navigate} />`;
  }

  return html`
    <${Fragment}>
      <${ProtectedRoute} navigate=${navigate}>
        <${Shell} currentPath=${path} navigate=${navigate} onOpenSearch=${() => setSearchOpen(true)}>
          ${pageComponent}
        <//>
      <//>

      <${SearchModal} isOpen=${searchOpen} onClose=${() => setSearchOpen(false)} navigate=${navigate} />
      <${ShareModal} isOpen=${shareData.isOpen} onClose=${closeShare} request=${shareData.request} link=${shareData.link} />
    <//>
  `;
}

export function App() {
  return html`
    <${AuthProvider}>
      <${WorkspaceProvider}>
        <${MainRouter} />
      <//>
    <//>
  `;
}
