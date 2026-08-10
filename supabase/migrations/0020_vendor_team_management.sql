-- Vendor team management: vendor_member and vendor_role (0007) have existed
-- unused since day one — nothing ever wrote to vendor_member, and no admin
-- UI could create a new vendor at all. This adds the writes, all through
-- security-definer RPCs rather than an INSERT policy: "only an owner of
-- THIS vendor may add a member" can't be expressed as a row policy without
-- reading vendor_member from inside its own policy (the same recursion
-- my_vendor_ids() exists to avoid).
--
-- auth.users rows themselves are created via the GoTrue admin API in
-- apps/vendor/app/api/admin/team/route.ts (SQL can't call that) — these
-- functions assume the user already exists and just do the table writes.

create or replace function public.admin_create_vendor(
  p_user_id uuid, p_name text, p_slug text,
  p_contact_email text, p_contact_phone text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_vendor_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  insert into public.vendor (name, slug, contact_email, contact_phone)
  values (p_name, p_slug, p_contact_email, p_contact_phone)
  returning id into v_vendor_id;

  insert into public.vendor_member (user_id, vendor_id, role)
  values (p_user_id, v_vendor_id, 'owner');

  return v_vendor_id;
end;
$$;

create or replace function public.add_vendor_member(
  p_vendor_id uuid, p_user_id uuid, p_role public.vendor_role default 'staff'
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (
    public.is_admin()
    or exists (
      select 1 from public.vendor_member
      where vendor_id = p_vendor_id and user_id = auth.uid() and role = 'owner'
    )
  ) then
    raise exception 'not authorized';
  end if;

  insert into public.vendor_member (user_id, vendor_id, role)
  values (p_user_id, p_vendor_id, p_role)
  on conflict (user_id, vendor_id) do update set role = excluded.role;
end;
$$;

-- Same gate as add_vendor_member, plus a self-lockout guard mirroring
-- admin_revoke_admin's (0011) "you cannot revoke your own admin access" —
-- here scoped to "not if you're the last owner," since staff removing
-- themselves (or another owner removing them) is always fine.
create or replace function public.remove_vendor_member(p_vendor_id uuid, p_user_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (
    public.is_admin()
    or exists (
      select 1 from public.vendor_member
      where vendor_id = p_vendor_id and user_id = auth.uid() and role = 'owner'
    )
  ) then
    raise exception 'not authorized';
  end if;

  if p_user_id = auth.uid()
    and exists (
      select 1 from public.vendor_member
      where vendor_id = p_vendor_id and user_id = auth.uid() and role = 'owner'
    )
    and (
      select count(*) from public.vendor_member
      where vendor_id = p_vendor_id and role = 'owner'
    ) <= 1
  then
    raise exception 'You are the only owner — add another owner before removing yourself.';
  end if;

  delete from public.vendor_member where vendor_id = p_vendor_id and user_id = p_user_id;
end;
$$;

-- vendor_member's own SELECT policy (0007) only exposes a caller's own row,
-- so seeing teammates needs the same join-live-auth.users pattern as
-- admin_list_admins (0011) rather than a new RLS policy.
--
-- The `vm` alias in the authorization check isn't cosmetic: this function's
-- own OUT columns (user_id, among others) are implicitly in scope as
-- plpgsql variables here, and an unqualified `user_id` would resolve
-- ambiguously against vendor_member.user_id — same trap as check_in_booking
-- (0021)'s checked_in_at.
create or replace function public.vendor_list_team(p_vendor_id uuid)
returns table (user_id uuid, full_name text, email text, role public.vendor_role, created_at timestamptz)
language plpgsql security definer stable set search_path = public as $$
begin
  if not (
    public.is_admin()
    or exists (
      select 1 from public.vendor_member vm
      where vm.vendor_id = p_vendor_id and vm.user_id = auth.uid()
    )
  ) then
    raise exception 'not authorized';
  end if;

  return query
    select vm.user_id, p.full_name, u.email::text, vm.role, vm.created_at
    from public.vendor_member vm
    join public.profile p on p.id = vm.user_id
    join auth.users u on u.id = vm.user_id
    where vm.vendor_id = p_vendor_id
    order by vm.role, p.full_name;
end;
$$;

-- Used by the route handler to resolve an already-registered email to an
-- id instead of erroring when adding an existing user to a second vendor.
create or replace function public.find_user_by_email(p_email text)
returns uuid
language sql security definer stable set search_path = public as $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;
