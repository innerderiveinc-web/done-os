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
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

export const config = {
  appName: 'DONE',
  tagline: 'Request → Track → Complete → DONE',
  hindiPromise: 'Kisi se kuch karwana hai? Request bhejo. Track karo. Kaam complete karao.',
  englishPromise: 'Stop chasing people for documents, payments, approvals and confirmations. Send one structured request, track it end-to-end, and get it DONE.',
  supabaseUrl: getEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: getEnv('VITE_SUPABASE_ANON_KEY'),
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
