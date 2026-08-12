-- Platform-wide aggregate stats for apps/admin's dashboard. Deliberately not
-- a security_invoker view like vendor_summary_stats/vendor_event_stats
-- (0007) — those are correct for a per-vendor scope where RLS naturally
-- restricts the caller to their own rows; a platform-wide aggregate has no
-- row-level scope to restrict, so it needs the is_admin() gate a
-- security-definer function gives instead.
--
-- One row, one function: a single dashboard page rendering fixed tiles on
-- page load, no independent refresh cadence per tile — one round trip beats
-- five separate queries the client would have to reconcile itself.

create or replace function public.admin_platform_stats()
returns table (
  vendors_pending int,
  vendors_approved int,
  vendors_suspended int,
  events_draft int,
  events_submitted int,
  events_approved int,
  events_published int,
  events_rejected int,
  events_archived int,
  bookings_total int,
  tickets_sold bigint,
  views_total bigint,
  gross_revenue_aed numeric,
  commission_revenue_aed numeric
)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    (select count(*) from public.vendor where status = 'pending')::int,
    (select count(*) from public.vendor where status = 'approved')::int,
    (select count(*) from public.vendor where status = 'suspended')::int,
    (select count(*) from public.event where status = 'draft')::int,
    (select count(*) from public.event where status = 'submitted')::int,
    (select count(*) from public.event where status = 'approved')::int,
    (select count(*) from public.event where status = 'published')::int,
    (select count(*) from public.event where status = 'rejected')::int,
    (select count(*) from public.event where status = 'archived')::int,
    (select count(*) from public.booking where status <> 'cancelled' and not is_sample)::int,
    (select coalesce(sum(quantity), 0) from public.booking where status <> 'cancelled' and not is_sample)::bigint,
    (select coalesce(sum(view_count), 0) from public.event)::bigint,
    (select coalesce(sum(total_aed), 0) from public.booking where status <> 'cancelled' and not is_sample)::numeric,
    (select coalesce(sum(b.total_aed * v.commission_rate), 0)
       from public.booking b
       join public.event e on e.id = b.event_id
       join public.vendor v on v.id = e.vendor_id
       where b.status <> 'cancelled' and not b.is_sample)::numeric;
end;
$$;
