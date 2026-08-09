-- Bug: "vendors update own events" (0007) required the RESULTING row's
-- status to be in ('draft','submitted','archived') — meant to stop a
-- vendor setting status to 'approved'/'published' themselves, but it
-- actually blocked editing ANY field on a live event, since the check
-- re-validates the whole row regardless of which columns changed. A
-- vendor fixing a typo on a published listing hit
-- "new row violates row-level security policy for table \"event\"".
--
-- Fixed the same way 9d fixed the equivalent vendor/profile problem:
-- status becomes column-revoked from `authenticated` entirely (so no
-- direct client update can touch it, regardless of what the general
-- update policy allows), and the vendor's own status transitions —
-- submit for review, archive — move behind security-definer RPCs, same
-- shape as admin_publish_event/admin_reject_event. That lets the general
-- "vendors update own events" policy drop the status restriction
-- entirely and go back to being a plain ownership check.

revoke update on public.event from authenticated;
grant update (
  title, short_title, summary, body, category, venue, area, starts_at,
  ends_at, duration_label, group_size, tags, age_min
) on public.event to authenticated;

drop policy "vendors update own events" on public.event;
create policy "vendors update own events" on public.event for update
  using (vendor_id in (select public.my_vendor_ids()))
  with check (vendor_id in (select public.my_vendor_ids()));

create or replace function public.vendor_submit_event(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.event
    where id = p_event_id
      and vendor_id in (select public.my_vendor_ids())
      and status in ('draft', 'rejected')
  ) then
    raise exception 'not authorized';
  end if;
  update public.event
    set status = 'submitted', submitted_at = now(), rejection_reason = null
    where id = p_event_id;
end;
$$;

create or replace function public.vendor_archive_event(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.event
    where id = p_event_id
      and vendor_id in (select public.my_vendor_ids())
      and status in ('published', 'approved')
  ) then
    raise exception 'not authorized';
  end if;
  update public.event set status = 'archived' where id = p_event_id;
end;
$$;
