// DONE — Configuration & Environment Handler
// Safe across Vite, static web servers, and browser ESM

function getEnv(key) {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  if (typeof window !== 'undefined' && window.__DONE_CONFIG__ && window.__DONE_CONFIG__[key]) {
    return window.__DONE_CONFIG__[key];
  }
  return '';
}

export function safeUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

// 192-bit (24-byte) Cryptographically Secure Token Generator
export function generateCryptoToken(byteLength = 24) {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return 'tok_' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
  return 'tok_' + Array.from({ length: 4 }, () => Math.random().toString(36).substring(2)).join('');
}

export const config = {
  appName: 'DONE',
  tagline: 'Request → Track → Complete → DONE',
  hindiPromise: 'Kisi se kuch karwana hai? Request bhejo. Track karo. Kaam complete karao.',
  englishPromise: 'Stop chasing people for documents, payments, approvals and confirmations. Send one structured request, track it end-to-end, and get it DONE.',
  supabaseUrl: getEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
  get isProduction() {
    if (typeof window !== 'undefined') {
      const h = window.location.hostname;
      return h !== 'localhost' && h !== '127.0.0.1' && !h.endsWith('.local');
    }
    return false;
  },
  get demoMode() {
    return !(this.supabaseUrl && this.supabaseAnonKey);
  },
  company: {
    name: 'Qsura India Pvt Ltd',
    legalName: 'QSURA INDIA PRIVATE LIMITED',
    supportEmail: 'support@qsura.com'
  },
  defaultOrg: {
    name: 'Northstar Consulting',
    slug: 'northstar-consulting',
    plan: 'growth',
    owner: 'Irfan Ashraf'
  }
};
