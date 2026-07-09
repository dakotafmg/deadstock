import React, { useState, useEffect, useCallback } from 'react';
import { PRODUCTS, PICKUPS } from './data';

// ============================================================
// DEADSTOCK ADMIN — password-protected sales dashboard
// ============================================================

const MODEL_OPTIONS = ['Broadman', 'Wayfarer', 'Monarch', "'52 Tele Set", "'62 Strat Set", 'PAF Set'];

// Format a specs object into plain text sections
function formatSpecs(specs, type) {
  const LABELS = {
    body: 'BODY', neck: type === 'guitar' ? 'NECK & FINGERBOARD' : 'NECK PICKUP',
    electronics: 'ELECTRONICS', hardware: 'HARDWARE',
    bridge: 'BRIDGE PICKUP', middle: 'MIDDLE PICKUP',
  };
  return Object.entries(specs)
    .map(([key, rows]) => `${LABELS[key] || key.toUpperCase()}\n${rows.map(r => `${r.k}: ${r.v}`).join('\n')}`)
    .join('\n\n');
}

// Pre-built templates from the product pages in data.js
const MODEL_TEMPLATES = [
  ...Object.values(PRODUCTS).map(p => ({
    id: p.id,
    label: `The ${p.name}`,
    model: p.name,
    type: 'guitar',
    name: `The ${p.name}`,
    lede: [p.lede, p.finish && `Finish: ${p.finish}.`, p.pickups && `Pickups: ${p.pickups}.`].filter(Boolean).join(' '),
    specs: p.specs,
  })),
  ...Object.values(PICKUPS).map(p => ({
    id: p.id,
    label: p.name,
    model: p.name,
    type: 'pickup',
    name: p.name,
    lede: p.lede,
    specs: p.specs,
  })),
];
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
  const [editTarget, setEditTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const changeView = (v) => { setView(v); setSidebarOpen(false); };

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
      <div className="admin-mobile-header">
        <button className="admin-hamburger" onClick={() => setSidebarOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <img src="assets/wordmark.svg" alt="Deadstock" className="admin-mobile-logo" />
      </div>
      {sidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <AdminSidebar view={view} onView={changeView} onLogout={logout} onNavigate={onNavigate} open={sidebarOpen} />
      <div className="admin-main">
        {view === 'overview'     && <Overview     onExpire={handleSessionExpired} onView={changeView} />}
        {view === 'listings'     && <Listings     onExpire={handleSessionExpired} onView={changeView} onEdit={(l) => { setEditTarget(l); changeView('edit-listing'); }} />}
        {view === 'new-listing'  && <NewListing   onExpire={handleSessionExpired} onDone={() => changeView('listings')} />}
        {view === 'edit-listing' && editTarget && <EditListing listing={editTarget} onExpire={handleSessionExpired} onDone={() => { setEditTarget(null); changeView('listings'); }} />}
        {view === 'sales'        && <Sales        onExpire={handleSessionExpired} />}
        {view === 'log-sale'     && <LogSale      onExpire={handleSessionExpired} onDone={() => changeView('sales')} />}
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
function AdminSidebar({ view, onView, onLogout, onNavigate, open }) {
  return (
    <aside className={`admin-sidebar${open ? ' open' : ''}`}>
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
  const soldCt    = sales.length;
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
          <div className="admin-table-wrap"><table className="admin-table">
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
          </table></div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LISTINGS
// ============================================================
function Listings({ onExpire, onView, onEdit }) {
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
                <button
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => onEdit(l)}
                  disabled={acting === l.id}
                >
                  Edit
                </button>
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
    description: '', condition: '', images: [],
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

  const importFromModel = (templateId) => {
    if (!templateId) return;
    const t = MODEL_TEMPLATES.find(m => m.id === templateId);
    if (!t) return;
    const description = [t.lede, t.specs ? formatSpecs(t.specs, t.type) : ''].filter(Boolean).join('\n\n');
    setForm(f => ({
      ...f,
      model: t.model,
      type: t.type,
      name: t.name,
      description,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
          images: form.images,
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

        <div className="admin-field admin-import-row">
          <label className="admin-label">Start from model <span className="admin-label-opt">(optional — pre-fills description &amp; specs)</span></label>
          <select
            className="admin-select"
            defaultValue=""
            onChange={e => importFromModel(e.target.value)}
          >
            <option value="">— select a model to pre-fill —</option>
            <optgroup label="Guitars">
              {MODEL_TEMPLATES.filter(t => t.type === 'guitar').map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </optgroup>
            <optgroup label="Pickups">
              {MODEL_TEMPLATES.filter(t => t.type === 'pickup').map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

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
          <label className="admin-label">Images</label>
          <ImageUpload
            urls={form.images}
            onChange={(imgs) => set('images', imgs)}
          />
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
// IMAGE UPLOAD
// ============================================================
async function compressAndUpload(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1800;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(async (blob) => {
        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = e.target.result.split(',')[1];
            const { url } = await apiCall('/api/upload', {
              method: 'POST',
              body: { filename: `listing-${Date.now()}.jpg`, contentType: 'image/jpeg', data: base64 },
            });
            resolve(url);
          };
          reader.readAsDataURL(blob);
        } catch (err) { reject(err); }
      }, 'image/jpeg', 0.82);
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

function ImageUpload({ urls = [], onChange }) {
  const [uploading, setUploading] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFile = async (file, index) => {
    if (!file) return;
    setUploading(index);
    setErrors(e => ({ ...e, [index]: null }));
    try {
      const url = await compressAndUpload(file);
      const next = [...(urls || [])];
      next[index] = url;
      onChange(next.filter(Boolean));
    } catch (err) {
      setErrors(e => ({ ...e, [index]: 'Upload failed' }));
    } finally {
      setUploading(null);
    }
  };

  const remove = (index) => {
    const next = [...(urls || [])];
    next.splice(index, 1);
    onChange(next.filter(Boolean));
  };

  const slots = [0, 1, 2];
  return (
    <div className="admin-image-upload">
      {slots.map(i => {
        const url = urls?.[i];
        return (
          <div key={i} className="admin-image-slot">
            {url ? (
              <div className="admin-image-preview">
                <img src={url} alt={`Photo ${i + 1}`} />
                <button type="button" className="admin-image-remove" onClick={() => remove(i)}>✕</button>
              </div>
            ) : (
              <label className={`admin-image-drop${uploading === i ? ' uploading' : ''}`}>
                {uploading === i
                  ? 'Uploading...'
                  : <><span className="admin-image-plus">+</span><span>Photo {i + 1}{i > 0 ? ' (optional)' : ''}</span></>
                }
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={e => handleFile(e.target.files?.[0], i)}
                  disabled={uploading !== null}
                />
              </label>
            )}
            {errors[i] && <div className="admin-image-error">{errors[i]}</div>}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// EDIT LISTING
// ============================================================
function EditListing({ listing, onExpire, onDone }) {
  const [form, setForm] = useState({
    name: listing.name || '',
    model: listing.model || '',
    serial: listing.serial || '',
    type: listing.type || 'guitar',
    price: listing.price != null ? String(listing.price / 100) : '',
    description: listing.description || '',
    condition: listing.condition || '',
    images: listing.images || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const priceChanged = form.price !== String(listing.price / 100);
    try {
      await apiCall('/api/admin-listings', {
        method: 'PATCH',
        body: {
          id: listing.id,
          name: form.name,
          model: form.model,
          serial: form.serial,
          type: form.type,
          description: form.description,
          condition: form.condition,
          images: form.images,
          ...(priceChanged ? { price: form.price } : {}),
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
      <h1 className="admin-page-title">Edit Listing</h1>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-form-row">
          <div className="admin-field">
            <label className="admin-label">Model</label>
            <select className="admin-select" value={form.model} onChange={e => set('model', e.target.value)}>
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
            rows={3}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Condition Notes <span className="admin-label-opt">(optional)</span></label>
          <input
            className="admin-input"
            value={form.condition}
            onChange={e => set('condition', e.target.value)}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label">Images</label>
          <ImageUpload urls={form.images} onChange={(imgs) => set('images', imgs)} />
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading || !form.name || !form.price}>
            {loading ? 'Saving...' : 'Save changes'}
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
function SaleDetail({ sale, onClose }) {
  if (!sale) return null;
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-head">
          <div className="admin-modal-title">
            <span>Sale Details</span>
            <span className={`badge badge-${sale.channel}`}>{sale.channel}</span>
          </div>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-amount">{fmt$$(sale.amount)}</div>
        <div className="admin-modal-date">{fmtDate(sale.date)}</div>

        <div className="admin-detail-grid">
          {(sale.products?.length > 0 || sale.productName) ? (
            <div className="admin-detail-row">
              <span className="admin-detail-label">{(sale.products?.length ?? 1) > 1 ? 'Products' : 'Product'}</span>
              <span className="admin-detail-value">
                {sale.products?.length > 0
                  ? sale.products.map((p, i) => (
                      <span key={i} style={{ display: 'block' }}>
                        {p.id
                          ? <a href={`/listing/${p.id}`} target="_blank" rel="noopener noreferrer" className="admin-detail-link">{p.name || p.id}</a>
                          : (p.name || '—')
                        }
                      </span>
                    ))
                  : sale.productName}
              </span>
            </div>
          ) : null}

          <div className="admin-detail-row">
            <span className="admin-detail-label">Payment</span>
            <span className="admin-detail-value">{sale.paymentMethod || '—'}</span>
          </div>

          {sale.customer && sale.customer !== '—' ? (
            <div className="admin-detail-row">
              <span className="admin-detail-label">Buyer</span>
              <span className="admin-detail-value">{sale.customer}</span>
            </div>
          ) : null}

          {sale.email ? (
            <div className="admin-detail-row">
              <span className="admin-detail-label">Email</span>
              <span className="admin-detail-value">{sale.email}</span>
            </div>
          ) : null}

          {sale.notes ? (
            <div className="admin-detail-row">
              <span className="admin-detail-label">Notes</span>
              <span className="admin-detail-value">{sale.notes}</span>
            </div>
          ) : null}

          <div className="admin-detail-row">
            <span className="admin-detail-label">ID</span>
            <span className="admin-detail-value admin-mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{sale.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sales({ onExpire }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    apiCall('/api/admin-sales')
      .then(d => { setSales(d.sales || []); setLoading(false); })
      .catch(err => {
        if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
        setError(err.message); setLoading(false);
      });
  }, []);

  useEffect(load, [load]);

  const deleteSale = async (id) => {
    if (!confirm('Void and remove this sale record?')) return;
    setDeleting(id);
    try {
      await apiCall('/api/admin-sales', { method: 'DELETE', body: { id } });
      load();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const visible = filter === 'all' ? sales : sales.filter(s => s.channel === filter);
  const totalRev = visible.reduce((s, x) => s + (x.amount || 0), 0);

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div>
      <SaleDetail sale={selected} onClose={() => setSelected(null)} />
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
          <div className="admin-table-wrap"><table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Method</th>
                <th>Buyer</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(s => (
                <tr key={s.id} className="admin-row-clickable" onClick={() => setSelected(s)}>
                  <td>{fmtDate(s.date)}</td>
                  <td className="admin-td-product">
                    {s.productName || (s.productId ? <span className="admin-mono">{s.productId.slice(0, 12)}…</span> : '—')}
                  </td>
                  <td><strong>{fmt$$(s.amount)}</strong></td>
                  <td><span className={`badge badge-${s.channel}`}>{s.channel}</span></td>
                  <td className="admin-muted">{s.paymentMethod || '—'}</td>
                  <td className="admin-muted">{s.customer || '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    {(s.channel === 'manual' || s.channel === 'online') && (
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm admin-btn-danger"
                        onClick={() => deleteSale(s.id)}
                        disabled={deleting === s.id}
                      >
                        {deleting === s.id ? '…' : 'Delete'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
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
  const [items, setItems] = useState([]);
  const [pendingId, setPendingId] = useState('');
  const [pendingName, setPendingName] = useState('');
  const [pendingAmount, setPendingAmount] = useState('');
  const [form, setForm] = useState({ buyerName: '', buyerEmail: '', paymentMethod: 'Cash', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiCall('/api/admin-listings')
      .then(d => setListings((d.listings || []).filter(l => l.available && l.active)))
      .catch(err => { if (err.message === 'SESSION_EXPIRED') onExpire(); });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleListingSelect = (id) => {
    setPendingId(id);
    if (!id) { setPendingName(''); setPendingAmount(''); return; }
    const l = listings.find(l => l.id === id);
    if (l) { setPendingName(l.name); setPendingAmount(l.price ? String(l.price / 100) : ''); }
  };

  const addItem = () => {
    if (!pendingAmount || (!pendingId && !pendingName.trim())) return;
    setItems(prev => [...prev, { productId: pendingId, productName: pendingName, amount: pendingAmount }]);
    setPendingId(''); setPendingName(''); setPendingAmount('');
  };

  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError(null);
    try {
      await apiCall('/api/admin-sales', { method: 'POST', body: { items, ...form } });
      onDone();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') { onExpire(); return; }
      setError(err.message);
      setLoading(false);
    }
  };

  const canAdd = pendingAmount && (pendingId || pendingName.trim());

  return (
    <div>
      <h1 className="admin-page-title">Log a Sale</h1>
      <p className="admin-page-sub">Record a hand sale, dealer transaction, or any sale made outside Stripe Checkout.</p>

      <form className="admin-form" onSubmit={submit}>
        {error && <div className="admin-error">{error}</div>}

        <div className="admin-field">
          <label className="admin-label">Items</label>

          <div className="admin-item-add">
            <select
              className="admin-select"
              value={pendingId}
              onChange={e => handleListingSelect(e.target.value)}
            >
              <option value="">— Manual entry</option>
              {listings.map(l => (
                <option key={l.id} value={l.id}>{l.name}{l.serial ? ` · ${l.serial}` : ''}</option>
              ))}
            </select>
            {!pendingId && (
              <input
                className="admin-input"
                value={pendingName}
                onChange={e => setPendingName(e.target.value)}
                placeholder="Product name"
              />
            )}
            <input
              className="admin-input admin-item-amount-input"
              type="number"
              min="0"
              step="0.01"
              value={pendingAmount}
              onChange={e => setPendingAmount(e.target.value)}
              placeholder="Amount"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (canAdd) addItem(); } }}
            />
            <button type="button" className="admin-btn admin-btn-ghost" onClick={addItem} disabled={!canAdd}>
              + Add
            </button>
          </div>

          {items.length > 0 && (
            <div className="admin-items-list">
              {items.map((item, i) => (
                <div key={i} className="admin-item-row">
                  <span className="admin-item-name">{item.productName || '—'}</span>
                  <span className="admin-item-price">${parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                  <button type="button" className="admin-item-remove" onClick={() => removeItem(i)}>✕</button>
                </div>
              ))}
              <div className="admin-items-total">
                <span>Total</span>
                <span>${total.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          )}
        </div>

        <div className="admin-field">
          <label className="admin-label">Payment Method</label>
          <select className="admin-select" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
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
          <button type="submit" className="admin-btn admin-btn-primary" disabled={loading || !items.length}>
            {loading ? 'Saving...' : 'Log sale'}
          </button>
          <button type="button" className="admin-btn admin-btn-ghost" onClick={onDone}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
