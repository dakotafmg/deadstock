import React, { useState, useEffect, useCallback } from 'react';
import { supabase, authLinkType } from '../lib/supabase';
import { apiCall, can } from './api';
import { AdminLogin, SetPassword } from './login';
import { Overview } from './overview';
import { Listings } from './listings/listings';
import { NewListing } from './listings/new-listing';
import { EditListing } from './listings/edit-listing';
import { Sales } from './sales/sales';
import { LogSale } from './sales/log-sale';
import { RepairBoard } from './repairs/board';
import { RepairDetail } from './repairs/repair-detail';
import { NewRepair } from './repairs/new-repair';
import { RepairServices } from './repairs/services';
import { Team } from './team/team';
import { Activity } from './team/activity';
import { Settings } from './team/settings';

// ============================================================
// DEADSTOCK ADMIN — staff dashboard
// ============================================================

// Which role may open each screen. The server checks again on every call.
const VIEW_ACCESS = {
  'overview': () => true,
  'listings': can.sales, 'new-listing': can.sales, 'edit-listing': can.sales,
  'sales': can.sales, 'log-sale': can.sales,
  'repairs': can.repairs, 'repair': can.repairs,
  'new-repair': can.editRepairs, 'repair-services': can.editRepairs,
  'team': can.team, 'activity': can.team, 'settings': can.team,
};

// ============================================================
// TOP-LEVEL
// ============================================================
export default function Admin({ onNavigate }) {
  // undefined = checking, null = signed out, object = signed in staff member
  const [staff, setStaff] = useState(undefined);
  const [notStaff, setNotStaff] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(authLinkType === 'invite' || authLinkType === 'recovery');
  const [view, setView] = useState('overview');
  const [editTarget, setEditTarget] = useState(null);
  const [repairId, setRepairId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const changeView = (v) => { setView(v); setSidebarOpen(false); };
  const openRepair = (id) => { setRepairId(id); changeView('repair'); };

  useEffect(() => {
    document.body.classList.add('admin-active');
    return () => document.body.classList.remove('admin-active');
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const { staff } = await apiCall('/api/admin-session');
      setStaff(staff);
      setNotStaff(false);
    } catch {
      // Signed in to Supabase but not on the team (or deactivated).
      const session = supabase ? (await supabase.auth.getSession()).data.session : null;
      setNotStaff(Boolean(session));
      setStaff(null);
    }
  }, []);

  useEffect(() => {
    if (!supabase) { checkSession(); return; }
    // getSession waits for an invite/reset link in the URL to be read.
    supabase.auth.getSession().then(checkSession);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setNeedsPassword(true);
      if (event === 'SIGNED_OUT') setStaff(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [checkSession]);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut().catch(() => {});
    await fetch('/api/admin-session', { method: 'DELETE', credentials: 'include' }).catch(() => {});
    setStaff(null);
    setNotStaff(false);
    setView('overview');
  }, []);

  if (staff === undefined) return (
    <div className="admin-login-wrap">
      <div style={{ color: '#555', fontFamily: 'inherit', fontSize: 13 }}>Checking session…</div>
    </div>
  );

  if (needsPassword && supabase) {
    return <SetPassword invited={authLinkType === 'invite'} onDone={() => { setNeedsPassword(false); checkSession(); }} />;
  }

  if (!staff) {
    if (notStaff) return (
      <div className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-error">This account isn't on the Deadstock team, or it has been turned off. Ask the owner to invite you.</div>
          <button className="admin-btn admin-btn-ghost" style={{ width: '100%' }} onClick={logout}>Sign out</button>
        </div>
      </div>
    );
    return <AdminLogin onLogin={checkSession} />;
  }

  const allowed = (v) => (VIEW_ACCESS[v] || (() => false))(staff);
  const current = allowed(view) ? view : 'overview';
  const common = { staff, onExpire: logout, onView: changeView };

  return (
    <div className="admin-shell">
      <div className="admin-mobile-header">
        <button className="admin-hamburger" onClick={() => setSidebarOpen(o => !o)}>
          <span /><span /><span />
        </button>
        <img src="/assets/wordmark.svg" alt="Deadstock" className="admin-mobile-logo" />
      </div>
      {sidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <AdminSidebar staff={staff} view={current} onView={changeView} onLogout={logout} onNavigate={onNavigate} open={sidebarOpen} />
      <div className="admin-main">
        {staff.legacy && (
          <div className="admin-notice">
            You're signed in with the old admin password. Once your Supabase login works, set
            <span className="admin-mono"> LEGACY_ADMIN_LOGIN=off </span> in Vercel.
          </div>
        )}
        {current === 'overview'        && <Overview {...common} onOpenRepair={openRepair} />}
        {current === 'listings'        && <Listings {...common} onEdit={(l) => { setEditTarget(l); changeView('edit-listing'); }} />}
        {current === 'new-listing'     && <NewListing {...common} onDone={() => changeView('listings')} />}
        {current === 'edit-listing' && editTarget && <EditListing {...common} listing={editTarget} onDone={() => { setEditTarget(null); changeView('listings'); }} />}
        {current === 'sales'           && <Sales {...common} />}
        {current === 'log-sale'        && <LogSale {...common} onDone={() => changeView('sales')} />}
        {current === 'repairs'         && <RepairBoard {...common} onOpen={openRepair} />}
        {current === 'repair' && repairId && <RepairDetail {...common} id={repairId} onBack={() => changeView('repairs')} />}
        {current === 'repair-services' && <RepairServices {...common} />}
        {current === 'new-repair'      && <NewRepair {...common} onDone={openRepair} />}
        {current === 'team'            && <Team {...common} />}
        {current === 'activity'        && <Activity {...common} />}
        {current === 'settings'        && <Settings {...common} />}
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR — only shows what the signed-in role can use
// ============================================================
function AdminSidebar({ staff, view, onView, onLogout, onNavigate, open }) {
  const active = view === 'repair' ? 'repairs' : view;
  return (
    <aside className={`admin-sidebar${open ? ' open' : ''}`}>
      <div className="admin-sidebar-logo">
        <img src="/assets/wordmark.svg" alt="Deadstock" />
        <div className="admin-sidebar-label">Admin</div>
      </div>

      <nav className="admin-nav">
        <NavItem label="Overview" id="overview" active={active} onView={onView} />
        {can.sales(staff) && <>
          <div className="admin-nav-section">Inventory</div>
          <NavItem label="Listings" id="listings" active={active} onView={onView} />
          <NavItem label="+ New Listing" id="new-listing" active={active} onView={onView} accent />
          <div className="admin-nav-section">Sales</div>
          <NavItem label="All Sales" id="sales" active={active} onView={onView} />
          <NavItem label="+ Log a Sale" id="log-sale" active={active} onView={onView} accent />
        </>}
        {can.repairs(staff) && <>
          <div className="admin-nav-section">Repairs</div>
          <NavItem label="Repair Board" id="repairs" active={active} onView={onView} />
          {can.editRepairs(staff) && <NavItem label="Services & Prices" id="repair-services" active={active} onView={onView} />}
          {can.editRepairs(staff) && <NavItem label="+ New Repair" id="new-repair" active={active} onView={onView} accent />}
        </>}
        {can.team(staff) && <>
          <div className="admin-nav-section">Team</div>
          <NavItem label="Staff" id="team" active={active} onView={onView} />
          <NavItem label="Activity" id="activity" active={active} onView={onView} />
          <NavItem label="Settings" id="settings" active={active} onView={onView} />
        </>}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-user-name">{staff.full_name || staff.email}</div>
          <div className="admin-sidebar-user-role">{staff.role}</div>
        </div>
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
