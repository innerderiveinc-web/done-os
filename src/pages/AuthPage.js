// DONE — Authentication & 3-Step Sender Onboarding Wizard (React 19 Component)
import { React, useState, html } from '../react-helpers.js';
import { useAuth } from '../context/AuthContext.js';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { showToast } from '../components/toast.js';

export function AuthPage({ mode = 'login', navigate }) {
  const { signIn, signUp, signInDemo } = useAuth();
  const { updateOrgName } = useWorkspace();

  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [fullName, setFullName] = useState(mode === 'login' ? 'Irfan Ashraf' : '');
  const [businessName, setBusinessName] = useState(mode === 'login' ? 'Northstar Consulting' : '');
  const [email, setEmail] = useState(mode === 'login' ? 'irfan@northstar.in' : '');
  const [password, setPassword] = useState(mode === 'login' ? 'password123' : '');
  const [loading, setLoading] = useState(false);

  // Onboarding wizard state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [step, setStep] = useState(1);
  const [useCase, setUseCase] = useState('CA / Accounting');
  const [primaryAction, setPrimaryAction] = useState('Document Uploads');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn(email, password);
        if (res && res.error) {
          showToast(res.error.message || 'Login failed', 'error');
        } else {
          showToast('Signed in successfully!', 'success');
          navigate('/dashboard');
        }
      } else {
        if (!fullName.trim()) {
          showToast('Please enter your full name', 'error');
          setLoading(false);
          return;
        }
        const bName = businessName.trim() || `${fullName}'s Practice`;
        const res = await signUp(email, password, { full_name: fullName, business_name: bName });
        if (res && res.error) {
          showToast(res.error.message || 'Registration failed', 'error');
        } else {
          setBusinessName(bName);
          setShowOnboarding(true);
        }
      }
    } catch (err) {
      console.error('[Auth Exception]:', err);
      showToast(err.message || 'An error occurred during authentication', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      await (signInDemo ? signInDemo() : signIn('irfan@northstar.in', 'password123'));
      showToast('Logged in as Irfan Ashraf (Northstar Consulting)', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Demo login error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = (targetPath = '/requests/new') => {
    if (updateOrgName) {
      updateOrgName(businessName || 'My Workspace');
    }
    showToast('Workspace ready! Welcome to DONE.', 'success');
    navigate(targetPath);
  };

  if (showOnboarding) {
    return html`
      <div className="auth-shell">
        <div className="auth-card card onboarding-card" style=${{ maxWidth: '580px', margin: '40px auto', padding: '36px 32px' }}>
          
          <div className="onboarding-steps-indicator flex-between mb-24" style=${{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style=${{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 1 ? 'var(--brand)' : '#e2e8f0', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '12px' }}>1</span>
              <small style=${{ fontWeight: step === 1 ? '700' : '500', color: step === 1 ? 'var(--text-main)' : 'var(--text-muted)' }}>Industry</small>
            </div>
            <div style=${{ width: '32px', height: '2px', background: step >= 2 ? 'var(--brand)' : '#e2e8f0', alignSelf: 'center' }}></div>
            <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style=${{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 2 ? 'var(--brand)' : '#e2e8f0', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '12px' }}>2</span>
              <small style=${{ fontWeight: step === 2 ? '700' : '500', color: step === 2 ? 'var(--text-main)' : 'var(--text-muted)' }}>Workspace</small>
            </div>
            <div style=${{ width: '32px', height: '2px', background: step >= 3 ? 'var(--brand)' : '#e2e8f0', alignSelf: 'center' }}></div>
            <div style=${{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style=${{ width: '28px', height: '28px', borderRadius: '50%', background: step >= 3 ? 'var(--brand)' : '#e2e8f0', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: '800', fontSize: '12px' }}>3</span>
              <small style=${{ fontWeight: step === 3 ? '700' : '500', color: step === 3 ? 'var(--text-main)' : 'var(--text-muted)' }}>Ready</small>
            </div>
          </div>

          ${step === 1 ? html`
            <div className="onboarding-step">
              <div className="auth-header text-center mb-20">
                <h2 style=${{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>What describes your practice?</h2>
                <p className="text-muted" style=${{ fontSize: '14px' }}>We'll customize your default request templates and action types.</p>
              </div>

              <div className="usecase-select-grid" style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
                ${[
                  { title: 'CA / Tax Accounting', sub: 'GST, ITR docs, audit checklists', icon: '📊' },
                  { title: 'Legal & Compliance', sub: 'Agreements, KYC, affidavit sign-offs', icon: '⚖️' },
                  { title: 'Consultancy & Agency', sub: 'Scope approvals & advance retainers', icon: '💼' },
                  { title: 'Freelance & SMB', sub: 'Quotation sign-off & UPI milestone pay', icon: '🚀' }
                ].map(item => html`
                  <div
                    key=${item.title}
                    className="card usecase-card"
                    style=${{
                      padding: '16px 14px',
                      cursor: 'pointer',
                      border: useCase === item.title ? '2px solid var(--brand)' : '1px solid var(--line)',
                      background: useCase === item.title ? '#f8fafc' : '#ffffff',
                      borderRadius: '10px'
                    }}
                    onClick=${() => setUseCase(item.title)}
                  >
                    <div style=${{ fontSize: '26px', marginBottom: '6px' }}>${item.icon}</div>
                    <strong style=${{ display: 'block', fontSize: '13px' }}>${item.title}</strong>
                    <small className="text-muted" style=${{ display: 'block', fontSize: '11px', marginTop: '2px', lineHeight: '1.4' }}>${item.sub}</small>
                  </div>
                `)}
              </div>

              <button className="btn btn-primary wide mt-24" onClick=${() => setStep(2)}>
                Next: Customize Workspace →
              </button>
            </div>
          ` : null}

          ${step === 2 ? html`
            <div className="onboarding-step">
              <div className="auth-header text-center mb-20">
                <h2 style=${{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>Your Business Identity</h2>
                <p className="text-muted" style=${{ fontSize: '14px' }}>This brand name appears on all encrypted recipient action links.</p>
              </div>

              <div className="form-group mt-20 text-left">
                <label className="form-label">Business / Firm / Workspace Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value=${businessName}
                  onInput=${(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Tax Advisors & Co."
                />
                <small className="text-muted block mt-4">Recipients will see: <em>"Request from ${businessName || 'Your Business'}"</em></small>
              </div>

              <div className="form-group mt-16 text-left">
                <label className="form-label">What do you request most frequently?</label>
                <select
                  className="form-control"
                  value=${primaryAction}
                  onChange=${(e) => setPrimaryAction(e.target.value)}
                >
                  <option value="Document Uploads">Document Uploads (PDF, KYC, GST, Cheques)</option>
                  <option value="UPI Payments">UPI & Retainer Advance Payments</option>
                  <option value="Quotation Approvals">Quotation & Scope Approvals</option>
                  <option value="Multi-Action Bundles">Multi-Action Bundles (Docs + Payment + Approval)</option>
                </select>
              </div>

              <div className="flex-between mt-24" style=${{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn btn-secondary" onClick=${() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick=${() => setStep(3)}>Next: Ready to Start →</button>
              </div>
            </div>
          ` : null}

          ${step === 3 ? html`
            <div className="onboarding-step text-center">
              <div style=${{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
              <h2 style=${{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>Workspace Ready, ${fullName || 'Partner'}!</h2>
              <p className="text-muted" style=${{ fontSize: '14px', marginBottom: '24px' }}>
                Your workspace for <strong>${businessName || 'DONE'}</strong> has been initialized with the <strong>${useCase}</strong> template pack.
              </p>

              <div style=${{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  className="card"
                  style=${{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    background: '#f8fafc',
                    border: '1.5px solid var(--brand)',
                    cursor: 'pointer'
                  }}
                  onClick=${() => handleFinishOnboarding('/requests/new')}
                >
                  <div>
                    <strong style=${{ fontSize: '14px', color: 'var(--brand)' }}>⚡ Create Your First Request Now</strong>
                    <small className="text-muted block mt-2">Use the AI Natural Language Composer or structured actions</small>
                  </div>
                  <span style=${{ fontSize: '18px', fontWeight: 'bold' }}>→</span>
                </button>

                <button
                  className="card"
                  style=${{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    background: '#ffffff',
                    border: '1px solid var(--line)',
                    cursor: 'pointer'
                  }}
                  onClick=${() => handleFinishOnboarding('/dashboard')}
                >
                  <div>
                    <strong style=${{ fontSize: '14px' }}>📊 Open Workspace Dashboard</strong>
                    <small className="text-muted block mt-2">View analytics, contacts address book, and template library</small>
                  </div>
                  <span style=${{ fontSize: '18px', color: '#64748b' }}>→</span>
                </button>
              </div>
            </div>
          ` : null}

        </div>
      </div>
    `;
  }

  return html`
    <div className="auth-shell">
      <div className="auth-card card" style=${{ maxWidth: '440px', margin: '40px auto', padding: '32px' }}>
        
        <div className="auth-header text-center">
          <div className="logo" style=${{ margin: '0 auto 12px' }}>✓</div>
          <h1 style=${{ fontSize: '24px', fontWeight: '800', marginBottom: '6px' }}>
            ${isLogin ? 'Sign In to DONE' : 'Create Free Workspace'}
          </h1>
          <p className="text-muted" style=${{ fontSize: '13px' }}>
            ${isLogin 
              ? 'Welcome back! Manage your requests and track completions.' 
              : 'Stop chasing clients for documents, payments, and approvals.'}
          </p>
        </div>

        <form onSubmit=${handleSubmit} className="auth-form mt-20">
          ${!isLogin ? html`
            <div className="form-group mb-12">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Rahul Sharma"
                value=${fullName}
                onInput=${(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group mb-12">
              <label className="form-label">Business / Firm Name</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Sharma & Associates"
                value=${businessName}
                onInput=${(e) => setBusinessName(e.target.value)}
              />
            </div>
          ` : null}

          <div className="form-group mb-12">
            <label className="form-label">Work Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="you@company.com"
              value=${email}
              onInput=${(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group mb-16">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value=${password}
              onInput=${(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary wide btn-lg" disabled=${loading}>
            ${loading ? 'Processing...' : (isLogin ? 'Sign In →' : 'Continue to 3-Step Setup →')}
          </button>
        </form>

        <div className="auth-switch text-center mt-16 font-size-13">
          ${isLogin ? html`
            Don't have an account? <a href="/signup" className="link font-bold" onClick=${(e) => { e.preventDefault(); setIsLogin(false); }}>Create free workspace</a>
          ` : html`
            Already have an account? <a href="/login" className="link font-bold" onClick=${(e) => { e.preventDefault(); setIsLogin(true); }}>Sign in</a>
          `}
        </div>

        <div className="auth-demo-notice mt-20 p-12 bg-gray-50 border rounded-8 text-center" style=${{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          <span className="font-size-12 text-muted block mb-8">Want to test the full workspace instantly?</span>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm wide" 
            onClick=${handleQuickDemo}
            disabled=${loading}
          >
            ⚡ 1-Click Demo Login (Northstar Consulting)
          </button>
        </div>

        <div className="text-center mt-16">
          <a href="/" className="link text-muted font-size-12" onClick=${(e) => { e.preventDefault(); navigate('/'); }}>
            ← Back to DONE Homepage
          </a>
        </div>
      </div>
    </div>
  `;
}
