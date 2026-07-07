import React, { useState, useEffect, useCallback } from 'react';

// ============================================================
// DEADSTOCK ADMIN — password-protected sales dashboard
// ============================================================

const MODEL_OPTIONS = ['Broadman', 'Wayfarer', 'Monarch', "'52 Tele Set", "'62 Strat Set", 'PAF Set'];
const PAYMENT_METHODS = ['Cash', 'Check', 'Card', 'Bank Transfer', 'Affirm', 'Afterpay', 'Klarna', 'Trade', 'Other'];

async function apiCall(path, opts = {}) {
  const token = sessionStorage.getItem('ds-admin-token');
  const res = await fetch(path, {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401) throw new Error('SESSION_EXPIRED');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  return res.json();
}

function fmt$$(cents) {
  if (cents == null) return '—';
  return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 });
}

function fmtDate(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================================
// TOP-LEVEL
// ============================================================
export default function Admin({ onNavigate }) {
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem('ds-admin-token'); } catch { return null; }
  });
  const [view, setView] = useState('overview');

  useEffect(() => {
    document.body.classList.add('admin-active');
    return () => document.body.classList.remove('admin-active');
  }, []);

  const login = (t) => {
    sessionStorage.setItem('ds-admin-token', t);
    setToken(t);
  };

  const logout = () => {
    sessionStorage.removeItem('ds-admin-token');
    setToken(null);
  };

  const handleSessionExpired = useCallback(() => {
    logout();
  }, []);

  if (!token) return <AdminLogin onLogin={login} />;

  return (
    <div className="admin-shell">
      <AdminSidebar view={view} onView={setView} onLogout={logout} onNavigate={onNavigate} />
      <div className="admin-main">
        {view === 'overview'     && <Overview     onExpire={handleSessionExpired} onView={setView} />}
        {view === 'listings'     && <Listings     onExpire={handleSessionExpired} onView={setView} />}
        {view === 'new-listing'  && <NewListing   onExpire={handleSessionExpired} onDone={() => setView('listings')} />}
        {view === 'sales'        && <Sales        onExpire={handleSessionExpired} />}
        {view === 'log-sale'     && <LogSale      onExpire={handleSessionExpired} onDone={() => setView('sales')} />}
      </div>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await apiCall('/api/admin-login', { method: 'POST', body: { password: pw } });
      onLogin(token);
    } catch {
      setError('Incorrect password.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-logo">
          <img src="assets/wordmark.svg" alt="Deadstock" />
          <div className="admin-login-sub">Admin</div>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-field">
          <label className="admin-label">Password</label>
          <input
            className="admin-input"
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Enter password"
            autoFocus
          />
        </div>
        <button className="admin-btn admin-btn-primary" style={{ width: '100%' }} disabled={loading || !pw}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// SIDEBAR
// ============================================================
function AdminSidebar({ view, onView, onLogout, onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <img src="assets/wordmark.svg" alt="Deadstock" />
        <div className="admin-sidebar-label">Admin</div>
      </div>

      <nav className="admin-nav">
        <NavItem label="Overview"    id="overview"    active={view} onView={onView} />
        <div className="admin-nav-section">Inventory</div>
        <NavItem label="Listings"    id="listings"    active={view} onView={onView} />
        <NavItem label="+ New Listing" id="new-listing" active={view} onView={onView} accent />
        <div className="admin-nav-section">Sales</div>
        <NavItem label="All Sales"   id="sales"       active={view} onView={onView} />
        <NavItem label="+ Log a Sale" id="log-sale"   active={view} onView={onView} accent />
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-nav-item" onClick={() => onNavigate('home')}>← View Site</button>
        <button className="admin-nav-item" onClick={onLogout}>Sign out</button>
      </div>
    </aside>
  );
}

function NavItem({ label, id, active, onView, accent }) {
  return (
    <button
      className={`admin-nav-item${active === id ? ' active' : ''}${accent ? ' accent' : ''}`}
      onClick={() => onView(id)}
    >
      {label}
    </button>
  );
}

// ============================================================
// OVERVIEW
// ============================================================
function Overview({ onExpire, onView }) {
  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      apiCall('/api/admin-listings'),
      apiCall('/api/admin-sales'),
    ]).then(([l, s]) => {
      setListings(l.listings || []);
      setSales(s.sales || []);
      setLoading(false);
    }).catch(err => {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  const activeCt  = listings.filter(l => l.available && l.active).length;
  const soldCt    = listings.filter(l => !l.available).length;
  const totalRev  = sales.reduce((s, x) => s + (x.amount || 0), 0);
  const recent    = sales.slice(0, 8);

  return (
    <div>
      <h1 className="admin-page-title">Overview</h1>

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="admin-stat-label">Active Listings</div>
          <div className="admin-stat-value">{activeCt}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Units Sold</div>
          <div className="admin-stat-value">{soldCt}</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat-label">Total Revenue</div>
          <div className="admin-stat-value">{fmt$$(totalRev)}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <span>Recent Sales</span>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onView('sales')}>
            All sales →
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="admin-empty-text">No sales yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Buyer</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(s => (
                <tr key={s.id}>
                  <td>{fmtDate(s.date)}</td>
                  <td>{s.productName || s.productId || '—'}</td>
                  <td>{fmt$$(s.amount)}</td>
                  <td><span className={`badge badge-${s.channel}`}>{s.channel}</span></td>
                  <td>{s.customer || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LISTINGS
// ============================================================
function Listings({ onExpire, onView }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [acting, setActing] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    apiCall('/api/admin-listings')
      .then(d => { setListings(d.listings || []); setLoading(false); })
      .catch(err => {
        if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
        setError(err.message); setLoading(false);
      });
  }, []);

  useEffect(load, [load]);

  const markSold = async (id) => {
    setActing(id);
    try {
      await apiCall('/api/admin-listings', { method: 'PATCH', body: { id, available: false } });
      load();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  const markAvailable = async (id) => {
    setActing(id);
    try {
      await apiCall('/api/admin-listings', { method: 'PATCH', body: { id, available: true } });
      load();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  const archive = async (id) => {
    if (!confirm('Archive this listing? It will no longer appear anywhere.')) return;
    setActing(id);
    try {
      await apiCall('/api/admin-listings', { method: 'PATCH', body: { id, active: false } });
      load();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      alert(err.message);
    } finally {
      setActing(null);
    }
  };

  const visible = listings.filter(l => {
    if (!l.active) return filter === 'archived';
    if (filter === 'available') return l.available;
    if (filter === 'sold') return !l.available;
    if (filter === 'archived') return false;
    return true;
  });

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Listings</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => onView('new-listing')}>
          + New Listing
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-filters">
        {['all', 'available', 'sold', 'archived'].map(f => (
          <button key={f} className={`admin-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="admin-card">
          <p className="admin-empty-text">No listings in this category.</p>
        </div>
      ) : (
        <div className="admin-listing-list">
          {visible.map(l => (
            <div key={l.id} className="admin-listing-row">
              {l.images?.[0]
                ? <img src={l.images[0]} alt={l.name} className="admin-listing-thumb" />
                : <div className="admin-listing-thumb-ph">No img</div>
              }
              <div className="admin-listing-info">
                <div className="admin-listing-name">{l.name}</div>
                <div className="admin-listing-meta">
                  {l.serial && `S/N ${l.serial}`}
                  {l.serial && l.model && ' · '}
                  {l.model}
                  {(l.serial || l.model) && ' · '}
                  {fmtDate(l.createdAt)}
                </div>
              </div>
              <span className={`badge badge-${l.available ? 'available' : 'sold'}`}>
                {l.available ? 'Available' : 'Sold'}
              </span>
              <div className="admin-listing-price">{fmt$$(l.price)}</div>
              <div className="admin-listing-actions">
                {l.active && l.available && (
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => markSold(l.id)}
                    disabled={acting === l.id}
                  >
                    Mark sold
                  </button>
                )}
                {l.active && !l.available && (
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => markAvailable(l.id)}
                    disabled={acting === l.id}
                  >
                    Re-list
                  </button>
                )}
                {l.active && (
                  <button
                    className="admin-btn admin-btn-ghost admin-btn-sm"
                    onClick={() => archive(l.id)}
                    disabled={acting === l.id}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// NEW LISTING
// ============================================================
function NewListing({ onExpire, onDone }) {
  const [form, setForm] = useState({
    name: '', model: '', serial: '', type: 'guitar', price: '',
    description: '', condition: '',
    image1: '', image2: '', image3: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleModelChange = (model) => {
    set('model', model);
    if (!form.name) set('name', `The ${model}`);
    if (['Broadman', 'Wayfarer', 'Monarch'].includes(model)) set('type', 'guitar');
    else set('type', 'pickup');
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const images = [form.image1, form.image2, form.image3].filter(Boolean);
    try {
      await apiCall('/api/admin-listings', {
        method: 'POST',
        body: {
          name: form.name,
          model: form.model,
          serial: form.serial,
          type: form.type,
          price: form.price,
          description: form.description,
          condition: form.condition,
          images,
        },
      });
      onDone();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">New Listing</h1>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Model</label>
            <select className="admin-select" value={form.model} onChange={e => handleModelChange(e.target.value)}>
              <option value="">Select model</option>
              {MODEL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="admin-field">
            <label className="admin-label">Type</label>
            <select className="admin-select" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="guitar">Guitar</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Listing Name</label>
          <input
            className="admin-input"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. The Broadman — Shell Pink"
            required
          />
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Serial Number</label>
            <input
              className="admin-input"
              value={form.serial}
              onChange={e => set('serial', e.target.value)}
              placeholder="e.g. BR-0042"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Price (USD)</label>
            <input
              className="admin-input"
              type="number"
              min="1"
              step="1"
              value={form.price}
              onChange={e => set('price', e.target.value)}
              placeholder="7000"
              required
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Description</label>
          <textarea
            className="admin-textarea"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Finish, notable features, anything the buyer should know..."
            rows={3}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Condition Notes <span className="admin-label-opt">(optional)</span></label>
          <input
            className="admin-input"
            value={form.condition}
            onChange={e => set('condition', e.target.value)}
            placeholder="e.g. Light play wear on back of neck"
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Images — publicly accessible URLs</label>
          <input className="admin-input" style={{ marginBottom: 8 }} value={form.image1} onChange={e => set('image1', e.target.value)} placeholder="https://..." />
          <input className="admin-input" style={{ marginBottom: 8 }} value={form.image2} onChange={e => set('image2', e.target.value)} placeholder="https://... (optional)" />
          <input className="admin-input" value={form.image3} onChange={e => set('image3', e.target.value)} placeholder="https://... (optional)" />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading || !form.name || !form.price}>
            {loading ? 'Creating...' : 'Create listing'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// SALES
// ============================================================
function Sales({ onExpire }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apiCall('/api/admin-sales')
      .then(d => { setSales(d.sales || []); setLoading(false); })
      .catch(err => {
        if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
        setError(err.message); setLoading(false);
      });
  }, []);

  const visible = filter === 'all' ? sales : sales.filter(s => s.channel === filter);
  const totalRev = visible.reduce((s, x) => s + (x.amount || 0), 0);

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <h1 className="admin-page-title">All Sales</h1>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-sales-header">
        <div className="admin-filters">
          {['all', 'online', 'manual'].map(f => (
            <button key={f} className={`admin-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="admin-revenue-total">
          {visible.length} sale{visible.length !== 1 ? 's' : ''} · {fmt$$(totalRev)} total
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {visible.length === 0 ? (
          <p className="admin-empty-text" style={{ padding: '32px 24px' }}>No sales yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Method</th>
                <th>Buyer</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(s => (
                <tr key={s.id}>
                  <td>{fmtDate(s.date)}</td>
                  <td className="admin-td-product">
                    {s.productName || (s.productId ? <span className="admin-mono">{s.productId.slice(0, 12)}…</span> : '—')}
                  </td>
                  <td><strong>{fmt$$(s.amount)}</strong></td>
                  <td><span className={`badge badge-${s.channel}`}>{s.channel}</span></td>
                  <td className="admin-muted">{s.paymentMethod || '—'}</td>
                  <td className="admin-muted">{s.customer || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LOG A SALE
// ============================================================
function LogSale({ onExpire, onDone }) {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState({
    productId: '', productName: '', buyerName: '', buyerEmail: '',
    amount: '', paymentMethod: 'Cash', notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiCall('/api/admin-listings')
      .then(d => setListings((d.listings || []).filter(l => l.available && l.active)))
      .catch(err => { if (err.message === 'SESSION_EXPIRED') onExpire(); });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleProductSelect = (id) => {
    set('productId', id);
    if (!id) { set('productName', ''); set('amount', ''); return; }
    const listing = listings.find(l => l.id === id);
    if (listing) {
      set('productName', listing.name);
      set('amount', listing.price ? String(listing.price / 100) : '');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiCall('/api/admin-sales', { method: 'POST', body: form });
      onDone();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">Log a Sale</h1>
      <p className="admin-page-sub">Record a hand sale, dealer transaction, or any sale made outside Stripe Checkout.</p>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-field">
          <label className="admin-label">Product Sold</label>
          <select className="admin-select" value={form.productId} onChange={e => handleProductSelect(e.target.value)}>
            <option value="">— Select from active listings, or enter below</option>
            {listings.map(l => (
              <option key={l.id} value={l.id}>{l.name}{l.serial ? ` · ${l.serial}` : ''}</option>
            ))}
          </select>
        </div>

        {!form.productId && (
          <div className="admin-field">
            <label className="admin-label">Product Name <span className="admin-label-opt">(if not in listings)</span></label>
            <input
              className="admin-input"
              value={form.productName}
              onChange={e => set('productName', e.target.value)}
              placeholder="e.g. The Broadman — Black"
            />
          </div>
        )}

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Sale Amount (USD)</label>
            <input
              className="admin-input"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={e => set('amount', e.target.value)}
              placeholder="7000"
              required
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Payment Method</label>
            <select className="admin-select" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Buyer Name <span className="admin-label-opt">(optional)</span></label>
            <input
              className="admin-input"
              value={form.buyerName}
              onChange={e => set('buyerName', e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">Buyer Email <span className="admin-label-opt">(optional)</span></label>
            <input
              className="admin-input"
              type="email"
              value={form.buyerEmail}
              onChange={e => set('buyerEmail', e.target.value)}
              placeholder="email@example.com"
            />
          </div>
        </div>

        <div className="admin-field">
          <label className="admin-label">Notes <span className="admin-label-opt">(optional)</span></label>
          <textarea
            className="admin-textarea"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Show, venue, any details worth noting..."
            rows={2}
          />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading || !form.amount}>
            {loading ? 'Saving...' : 'Log sale'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
