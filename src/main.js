// DONE — Universal Request-to-Completion OS (Client Bootstrap)
// Developed by Qsura India Pvt Ltd
// Powered by React 19 Virtual DOM & Supabase Enterprise Cloud
import { createRoot, html } from './react-helpers.js';
import { App } from './App.js';

// Global uncaught error handler to prevent silent white-screen failures
window.addEventListener('error', (event) => {
  console.error('[DONE OS Runtime Error]:', event.error || event.message);
  const rootEl = document.getElementById('root');
  if (rootEl && (!rootEl.children.length || rootEl.innerHTML.trim() === '')) {
    rootEl.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px;">
        <div style="max-width: 520px; width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
          <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 style="font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 8px;">Application Render Error</h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 0 0 20px; line-height: 1.5;">An unexpected script error occurred during initialization. Please reload the page or check the developer console.</p>
          <pre style="background: #0f172a; padding: 14px; border-radius: 8px; font-size: 12px; color: #f87171; overflow-x: auto; margin: 0 0 24px; border: 1px solid rgba(239,68,68,0.2); font-family: monospace;">${event.error ? (event.error.stack || event.error.message) : event.message}</pre>
          <button onclick="window.location.reload()" style="background: #2563eb; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%;">Reload Application</button>
        </div>
      </div>
    `;
  }
});

// React 19 Root Mounting
const rootEl = document.getElementById('root');
if (rootEl) {
  try {
    const root = createRoot(rootEl);
    root.render(html`<${App} />`);
  } catch (err) {
    console.error('[DONE OS Mount Exception]:', err);
    rootEl.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 24px;">
        <div style="max-width: 480px; width: 100%; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px;">
          <h2 style="color: #ef4444; font-size: 18px; margin-bottom: 8px;">Failed to initialize DONE OS</h2>
          <p style="color: #94a3b8; font-size: 13px; margin-bottom: 16px;">${err.message}</p>
          <button onclick="window.location.reload()" style="background: #2563eb; color: #fff; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer;">Reload</button>
        </div>
      </div>
    `;
  }
}
