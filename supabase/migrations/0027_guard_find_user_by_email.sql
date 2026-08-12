-- find_user_by_email (0020) was the one function in this schema with no
-- authorization check in its body, unlike every other admin/vendor RPC
-- here. Postgres grants EXECUTE to PUBLIC by default and no migration ever
-- revoked it, so this was reachable directly via
-- supabase.rpc('find_user_by_email', {p_email}) by anyone holding the
-- public anon key — no login required — returning a real auth.users.id for
-- any guessed email. It's only ever *called* from an authorized path today
-- (app/api/admin/team/route.ts, which checks is_admin or vendor-owner
-- membership before reaching it), but that's an application-level gate,
-- not a database one — the RPC itself was a standalone open door.
--
-- The guard folds into the WHERE clause rather than an explicit
-- `raise exception`: an unauthorized caller gets zero rows back, the exact
-- same response as "no account with that email" — no distinguishing signal
-- between "you're not allowed to ask" and "that email isn't registered",
-- which matters for a function whose entire purpose is email lookup.
--
-- Scoped to is_admin() OR "owns at least one vendor" rather than is_admin()
-- alone — a vendor owner adding an existing user to their team is the
-- other real caller of this path (the route's own check allows exactly
-- that), and is_admin()-only would silently break it.
create or replace function public.find_user_by_email(p_email text)
returns uuid
language sql security definer stable set search_path = public as $$
  select id from auth.users
  where lower(email) = lower(trim(p_email))
    and (
      public.is_admin()
      or exists (
        select 1 from public.vendor_member
        where user_id = auth.uid() and role = 'owner'
      )
    )
  limit 1;
$$;
