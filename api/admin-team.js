import { requireRole, logActivity, ROLES } from './_lib/auth.js';
import { getSupabase, must } from './_lib/supabase.js';
import { parseBody } from './_lib/body.js';
import { siteUrl } from './_lib/email.js';

// Owner-only: staff accounts, the activity log, and site settings.
//   GET   [?view=staff]        → staff with role, active flag, last sign-in
//   GET   ?view=activity       → latest 200 activity log entries
//   GET   ?view=settings       → site settings (phone, contact email)
//   POST  {action:'invite'}    → email an invite; they set their own password
//   PATCH {id, role?, active?, full_name?}
//   PUT   {settings: {...}}    → save site settings

const VALID_ROLES = ['owner', 'sales', 'tech'];
const SETTING_KEYS = ['phone', 'contact_email'];

export default async function handler(req, res) {
  const staff = await requireRole(req, res, ROLES.OWNER);
  if (!staff) return;

  try {
    const sb = getSupabase();

    if (req.method === 'GET') {
      if (req.query?.view === 'activity') {
        const rows = must(await sb.from('activity_log')
          .select('*, actor:profiles(full_name, email)')
          .order('created_at', { ascending: false })
          .limit(200));
        return res.status(200).json({ activity: rows });
      }
      if (req.query?.view === 'settings') {
        const rows = must(await sb.from('site_settings').select('key, value').in('key', SETTING_KEYS));
        return res.status(200).json({ settings: Object.fromEntries(rows.map(r => [r.key, r.value])) });
      }

      const profiles = must(await sb.from('profiles').select('*').order('created_at'));
      const { data: users } = await sb.auth.admin.listUsers({ perPage: 200 });
      const byId = Object.fromEntries((users?.users || []).map(u => [u.id, u]));
      return res.status(200).json({
        staff: profiles.map(p => ({
          ...p,
          last_sign_in_at: byId[p.id]?.last_sign_in_at || null,
          invite_pending: !byId[p.id]?.last_sign_in_at,
        })),
      });
    }

    if (req.method === 'POST') {
      const { action, email, full_name, role } = await parseBody(req);
      if (action !== 'invite') return res.status(400).json({ error: 'Unknown action' });
      const cleanEmail = String(email || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ error: 'Valid email required' });
      if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Pick a role' });

      const existing = must(await sb.from('profiles').select('id').eq('email', cleanEmail).maybeSingle());
      if (existing) return res.status(409).json({ error: 'That person is already on the team.' });

      const { data, error } = await sb.auth.admin.inviteUserByEmail(cleanEmail, {
        redirectTo: `${siteUrl()}/admin`,
        data: { full_name: full_name || '' },
      });
      if (error) return res.status(400).json({ error: error.message });

      const profile = must(await sb.from('profiles').insert({
        id: data.user.id, email: cleanEmail, full_name: full_name || '', role,
      }).select().single());
      await logActivity(staff, 'staff.invite', 'profile', profile.id, { email: cleanEmail, role });
      return res.status(201).json({ profile });
    }

    if (req.method === 'PATCH') {
      const { id, role, active, full_name } = await parseBody(req);
      if (!id) return res.status(400).json({ error: 'id required' });
      const target = must(await sb.from('profiles').select('*').eq('id', id).maybeSingle());
      if (!target) return res.status(404).json({ error: 'Not found' });

      const patch = {};
      if (full_name !== undefined) patch.full_name = full_name;
      if (role !== undefined) {
        if (!VALID_ROLES.includes(role)) return res.status(400).json({ error: 'Unknown role' });
        patch.role = role;
      }
      if (active !== undefined) patch.active = Boolean(active);

      if (id === staff.id && (patch.active === false || (patch.role && patch.role !== 'owner'))) {
        return res.status(400).json({ error: "You can't remove your own owner access." });
      }
      const losesOwner = target.role === 'owner' && target.active
        && (patch.active === false || (patch.role && patch.role !== 'owner'));
      if (losesOwner) {
        const { count } = await sb.from('profiles').select('id', { count: 'exact', head: true })
          .eq('role', 'owner').eq('active', true);
        if ((count || 0) <= 1) return res.status(400).json({ error: 'There has to be at least one active owner.' });
      }

      const updated = must(await sb.from('profiles').update(patch).eq('id', id).select().single());

      // Deactivated staff can't sign in at all; reactivating lifts the ban.
      if (patch.active !== undefined && patch.active !== target.active) {
        const { error } = await sb.auth.admin.updateUserById(id, { ban_duration: patch.active ? 'none' : '876000h' });
        if (error) console.error('Could not update sign-in ban:', error.message);
      }

      await logActivity(staff, 'staff.update', 'profile', id, patch);
      return res.status(200).json({ profile: updated });
    }

    if (req.method === 'PUT') {
      const { settings } = await parseBody(req);
      const rows = SETTING_KEYS
        .filter(k => settings && settings[k] !== undefined)
        .map(k => ({ key: k, value: String(settings[k]).trim(), updated_by: staff.id, updated_at: new Date().toISOString() }));
      if (rows.length) must(await sb.from('site_settings').upsert(rows));
      await logActivity(staff, 'settings.update', 'site_settings', 'site', settings);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
