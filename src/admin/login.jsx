import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

// ============================================================
// LOGIN
// Staff sign in with Supabase. Until LEGACY_ADMIN_LOGIN=off, the old
// ADMIN_EMAIL / password still works as a fallback so nobody is locked out
// during the switch.
// ============================================================
export function AdminLogin({ onLogin }) {
  const [mode, setMode] = useState('signin'); // signin | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const legacyLogin = async () => {
    const res = await fetch('/api/admin-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    return res.ok;
  };

  const signIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (supabase) {
        const { error: sbError } = await supabase.auth.signInWithPassword({ email, password });
        if (!sbError) { onLogin(); return; }
        if (await legacyLogin()) { onLogin(); return; }
        throw new Error('Invalid email or password.');
      }
      if (await legacyLogin()) { onLogin(); return; }
      throw new Error('Invalid email or password.');
    } catch (err) {
      setError(err.message || 'Login failed.');
      setLoading(false);
    }
  };

  const sendReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    setLoading(false);
    if (sbError) { setError(sbError.message); return; }
    setNotice('If that email is on the team, a reset link is on its way.');
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={mode === 'signin' ? signIn : sendReset}>
        <div className="admin-login-logo">
          <img src="/assets/wordmark.svg" alt="Deadstock" />
          <div className="admin-login-sub">{mode === 'signin' ? 'Admin' : 'Reset password'}</div>
        </div>
        {error && <div className="admin-error">{error}</div>}
        {notice && <div className="admin-notice">{notice}</div>}
        <div className="admin-field">
          <label className="admin-label">Email</label>
          <input
            className="admin-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@deadstockguitars.com"
            autoFocus
            autoComplete="email"
          />
        </div>
        {mode === 'signin' && (
          <div className="admin-field">
            <label className="admin-label">Password</label>
            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
          </div>
        )}
        <button
          className="admin-btn admin-btn-primary"
          style={{ width: '100%' }}
          disabled={loading || !email || (mode === 'signin' && !password)}
        >
          {mode === 'signin'
            ? (loading ? 'Signing in…' : 'Sign in →')
            : (loading ? 'Sending…' : 'Send reset link')}
        </button>
        {supabase && (
          <button
            type="button"
            className="admin-login-switch"
            onClick={() => { setMode(mode === 'signin' ? 'forgot' : 'signin'); setError(null); setNotice(null); }}
          >
            {mode === 'signin' ? 'Forgot password?' : '← Back to sign in'}
          </button>
        )}
      </form>
    </div>
  );
}

// Shown after someone opens an invite or password-reset link.
export function SetPassword({ onDone, invited }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 10) { setError('Use at least 10 characters.'); return; }
    if (password !== confirm) { setError("The two passwords don't match."); return; }
    setLoading(true);
    setError(null);
    const { error: sbError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (sbError) { setError(sbError.message); return; }
    onDone();
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-logo">
          <img src="/assets/wordmark.svg" alt="Deadstock" />
          <div className="admin-login-sub">{invited ? 'Welcome — set your password' : 'Choose a new password'}</div>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-field">
          <label className="admin-label">New password</label>
          <input className="admin-input" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" autoFocus />
        </div>
        <div className="admin-field">
          <label className="admin-label">Confirm password</label>
          <input className="admin-input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
        <button className="admin-btn admin-btn-primary" style={{ width: '100%' }} disabled={loading || !password || !confirm}>
          {loading ? 'Saving…' : 'Save password →'}
        </button>
      </form>
    </div>
  );
}
