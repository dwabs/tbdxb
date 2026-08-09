-- Admin account management, same security-definer pattern as
-- admin_publish_event/admin_reject_event (0007): gated on is_admin(),
-- runs as the function owner so it isn't subject to the column-level
-- revoke on profile.is_admin (0009) that blocks direct client writes.
--
-- No new column and no new RLS policy: email is auth-owned and
-- handle_new_user() (0001) only fires on insert, so a copied
-- profile.email column would silently go stale on any email change with
-- nothing to catch it. admin_list_admins() joins auth.users live instead —
-- narrower than a general "admins read all profiles" policy would be,
-- since it only ever returns is_admin rows.

create or replace function public.admin_list_admins()
returns table (id uuid, full_name text, email text, created_at timestamptz)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  return query
    -- auth.users.email is varchar, not text — RETURN QUERY requires an
    -- exact type match against the declared table shape, not just an
    -- assignable one, so this needs the explicit cast.
    select p.id, p.full_name, u.email::text, p.created_at
    from public.profile p
    join auth.users u on u.id = p.id
    where p.is_admin
    order by p.created_at;
end;
$$;

create or replace function public.admin_grant_admin(p_email text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  target_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  select id into target_id
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if target_id is null then
    raise exception 'No account found for that email — they need to sign up first.';
  end if;

  update public.profile set is_admin = true where id = target_id;
end;
$$;

create or replace function public.admin_revoke_admin(p_user_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot revoke your own admin access.';
  end if;

  update public.profile set is_admin = false where id = p_user_id;
end;
$$;
