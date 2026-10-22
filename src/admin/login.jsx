import React, { useState } from 'react';

// ============================================================
// LOGIN
// ============================================================
export function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin();
    } catch (err) {
      setError(err.message || 'Login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-logo">
          <img src="/assets/wordmark.svg" alt="Deadstock" />
          <div className="admin-login-sub">Admin</div>
        </div>
        {error && <div className="admin-error">{error}</div>}
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
        <button className="admin-btn admin-btn-primary" style={{ width: '100%' }} disabled={loading || !email || !password}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </form>
    </div>
  );
}
