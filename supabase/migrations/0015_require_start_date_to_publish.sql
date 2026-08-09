-- One event published while its starts_at was still null took down every
-- production deploy of the public site for six consecutive commits (see
-- roadmap 9e): lib/events.ts maps a null starts_at to date: "", Intl throws
-- RangeError on the resulting invalid Date, and a throw inside a prerender
-- aborts the whole build. a0fdd43 made the read path defensive, so a row
-- like that can no longer break rendering — but nothing stopped it being
-- published in the first place. admin_publish_event only checked is_admin().
--
-- An event with no start date can't be rendered honestly or sold (the
-- customer would be booking an unspecified day), so publishing one is never
-- the right outcome. Enforce it at the RPC rather than in the UI: this is
-- the single chokepoint every publish goes through, and it already runs
-- security definer, so the check can't be skipped by talking to PostgREST
-- directly the way a client-side guard could be.
--
-- Deliberately not added to vendor_submit_event: a vendor filling in a
-- draft over several sittings should still be able to hand it to review,
-- and the admin now gets a clear error at the point of decision instead.

create or replace function public.admin_publish_event(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;

  if not exists (
    select 1 from public.event
    where id = p_event_id and starts_at is not null
  ) then
    raise exception 'This event has no start date. Send it back to the vendor to add one before publishing.';
  end if;

  update public.event
    set status = 'published',
        submitted_at = coalesce(submitted_at, now()),
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        rejection_reason = null
    where id = p_event_id;
end;
$$;
