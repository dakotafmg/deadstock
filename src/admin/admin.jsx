import React, { useState, useEffect, useCallback } from 'react';
import { AdminLogin } from './login';
import { Overview } from './overview';
import { Listings } from './listings/listings';
import { NewListing } from './listings/new-listing';
import { EditListing } from './listings/edit-listing';
import { Sales } from './sales/sales';
import { LogSale } from './sales/log-sale';

// ============================================================
// DEADSTOCK ADMIN — password-protected sales dashboard
// ============================================================

// ============================================================
// TOP-LEVEL
// ============================================================
export default function Admin({ onNavigate }) {
  // null = checking, true = logged in, false = not
  const [authed, setAuthed] = useState(null);
  const [view, setView] = useState('overview');
  const [editTarget, setEditTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const changeView = (v) => { setView(v); setSidebarOpen(false); };

  useEffect(() => {
    document.body.classList.add('admin-active');
    return () => document.body.classList.remove('admin-active');
  }, []);

  useEffect(() => {
    fetch('/api/admin-check', { credentials: 'include' })
      .then(r => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  const login = () => setAuthed(true);

  const logout = async () => {
    await fetch('/api/admin-logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setAuthed(false);
  };

  const handleSessionExpired = useCallback(() => {
    logout();
  }, []);

  if (authed === null) return (
    <div className="admin-login-wrap">
      <div style={{ color: '#555', fontFamily: 'inherit', fontSize: 13 }}>Checking session…</div>
    </div>
  );

  if (!authed) return <AdminLogin onLogin={login} />;

  return (
    <div className="admin-shell">
      <div className="admin-mobile-header">
        <button className="admin-hamburger" onClick={() => setSidebarOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <img src="/assets/wordmark.svg" alt="Deadstock" className="admin-mobile-logo" />
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
// SIDEBAR
// ============================================================
function AdminSidebar({ view, onView, onLogout, onNavigate, open }) {
  return (
    <aside className={`admin-sidebar${open ? ' open' : ''}`}>
      <div className="admin-sidebar-logo">
        <img src="/assets/wordmark.svg" alt="Deadstock" />
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
