// DONE — Real Supabase Authentication Context & Protected Route Guards
import { React, createContext, useContext, useState, useEffect, html } from '../react-helpers.js';
import { getSupabase, isLiveBackend } from '../services/supabase.js';
import { config } from '../config.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = getSupabase();

    if (sb) {
      // 1. Live Supabase Session Check
      sb.auth.getSession().then(({ data: { session: currentSession } }) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
      }).catch(err => {
        console.warn('[Supabase Auth] Session fetch error:', err);
        setLoading(false);
      });

      // 2. Real-time Auth State Listener (JWT token refresh & signout)
      const { data: { subscription } } = sb.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Demo / Local Sandbox Auth: check if user has explicitly logged in or registered
      const cached = localStorage.getItem('done_demo_user');
      if (cached) {
        try {
          const userObj = JSON.parse(cached);
          setUser(userObj);
          setSession({ access_token: 'demo-session-token', user: userObj });
        } catch (e) {
          localStorage.removeItem('done_demo_user');
          setUser(null);
          setSession(null);
        }
      } else {
        // Start unauthenticated so new visitors see registration & onboarding
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) return { error };
        setSession(data.session);
        setUser(data.user);
        return { data, error: null };
      } catch (err) {
        return { error: err };
      }
    } else {
      // Local demo fallback
      const cleanEmail = email || 'irfan@northstar.in';
      const demoUser = {
        id: 'usr-owner-01',
        email: cleanEmail,
        user_metadata: {
          full_name: cleanEmail.includes('@') ? cleanEmail.split('@')[0] : 'Irfan Ashraf',
          organization: 'Northstar Consulting',
          role: 'owner'
        }
      };
      localStorage.setItem('done_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      const sess = { access_token: 'demo-session-token', user: demoUser };
      setSession(sess);
      return { data: { session: sess, user: demoUser }, error: null };
    }
  };

  const signUp = async (email, password, metadataOrFullName, maybeOrgName) => {
    let fullName = 'Irfan Ashraf';
    let orgName = 'Northstar Consulting';

    if (typeof metadataOrFullName === 'object' && metadataOrFullName !== null) {
      fullName = metadataOrFullName.full_name || metadataOrFullName.fullName || fullName;
      orgName = metadataOrFullName.business_name || metadataOrFullName.organization_name || orgName;
    } else {
      fullName = metadataOrFullName || fullName;
      orgName = maybeOrgName || orgName;
    }

    const sb = getSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              organization_name: orgName
            }
          }
        });
        if (error) return { error };
        return { data, error: null };
      } catch (err) {
        return { error: err };
      }
    } else {
      const demoUser = {
        id: 'usr-' + Date.now(),
        email: email || 'irfan@northstar.in',
        user_metadata: {
          full_name: fullName,
          organization: orgName,
          role: 'owner'
        }
      };
      localStorage.setItem('done_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      const sess = { access_token: 'demo-session-token', user: demoUser };
      setSession(sess);
      return { data: { session: sess, user: demoUser }, error: null };
    }
  };

  const signOut = async () => {
    const sb = getSupabase();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (err) {
        console.warn('[Supabase SignOut Error]:', err);
      }
    }
    localStorage.removeItem('done_demo_user');
    setUser(null);
    setSession(null);
  };

  const signInDemo = async () => {
    return signIn('irfan@northstar.in', 'password123');
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: Boolean(user),
    isLiveBackend: isLiveBackend(),
    signIn,
    signInWithPassword: signIn,
    signInDemo,
    signUp,
    signOut
  };

  return html`
    <${AuthContext.Provider} value=${value}>
      ${children}
    <//>
  `;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Enterprise Protected Route Guard Component
export function ProtectedRoute({ children, navigate }) {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', true);
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return html`
      <div style="min-height: 100vh; display: grid; place-items: center; background: #f8fafc;">
        <div style="text-align: center;">
          <div style="width: 36px; height: 36px; border: 3px solid #cbd5e1; border-top-color: #0f172a; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px;"></div>
          <p style="font-size: 13px; color: #64748b; font-weight: 600;">Verifying session...</p>
        </div>
      </div>
    `;
  }

  if (!isAuthenticated) return null;

  return children;
}
