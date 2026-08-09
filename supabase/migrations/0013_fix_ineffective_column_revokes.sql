-- 0009 and 0012 both tried to block specific columns from client writes
-- with `revoke update (col) on table from authenticated`. That's a no-op:
-- Supabase's default setup already grants `authenticated` blanket
-- table-level UPDATE on every public table (confirmed live —
-- `select relacl from pg_class where relname = 'vendor'` still showed
-- table-wide `w` for `authenticated` after 0012 ran). Column privileges in
-- Postgres are additive on top of table-level ones; revoking a
-- column-level grant does nothing to a still-standing table-level grant
-- that already covers it. Concretely, this meant ANY signed-in user could
-- set their own profile.is_admin = true via a direct client update — 0009
-- never actually closed that door.
--
-- The correct pattern: revoke the blanket table-level UPDATE entirely,
-- then grant UPDATE back scoped to only the columns that should be
-- client-writable. Anything not listed (is_admin; status, commission_rate)
-- is then unreachable from any direct client update, full stop.

revoke update on public.profile from authenticated;
grant update (
  full_name, phone, avatar_url, address_line1, address_line2, city,
  country, notify_marketing, notify_reminders, birthday
) on public.profile to authenticated;

revoke update on public.vendor from authenticated;
grant update (
  name, contact_email, contact_phone, logo_url, bio
) on public.vendor to authenticated;
