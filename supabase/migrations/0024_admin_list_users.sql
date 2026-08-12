-- First paginated/searchable admin surface. Same live-join-to-auth.users
-- pattern as admin_list_admins (0011) and vendor_list_team (0020) — profile
-- deliberately has no email column (see 0011's comment). A user can belong
-- to more than one vendor (vendor_member's PK is composite (user_id,
-- vendor_id), no per-user uniqueness), so vendor affiliation is aggregated,
-- not naively joined. count(*) over() carries the total match count
-- alongside the page of rows, avoiding a second round trip for pagination
-- UI.

create or replace function public.admin_list_users(
  p_query text default null,
  p_limit int default 25,
  p_offset int default 0
)
returns table (
  id uuid,
  full_name text,
  email text,
  is_admin boolean,
  created_at timestamptz,
  vendor_names text[],
  total_count bigint
)
language plpgsql security definer stable set search_path = public as $$
declare
  v_query text := nullif(trim(coalesce(p_query, '')), '');
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
    select
      p.id,
      p.full_name,
      u.email::text,
      p.is_admin,
      p.created_at,
      coalesce(array_remove(array_agg(distinct v.name), null), '{}') as vendor_names,
      count(*) over() as total_count
    from public.profile p
    join auth.users u on u.id = p.id
    left join public.vendor_member vm on vm.user_id = p.id
    left join public.vendor v on v.id = vm.vendor_id
    where
      v_query is null
      or p.full_name ilike '%' || v_query || '%'
      or u.email::text ilike '%' || v_query || '%'
    group by p.id, u.email
    order by p.created_at desc, p.id
    limit greatest(p_limit, 0)
    offset greatest(p_offset, 0);
end;
$$;
