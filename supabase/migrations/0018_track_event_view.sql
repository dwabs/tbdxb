-- event.view_count has existed since 0007 but nothing has ever incremented
-- it — the public site never called a track-view equivalent, so 9g's
-- "views -> bookings conversion" chart has been permanently empty. See
-- docs/roadmap.md phase 9g's "known, separate gap" note.
--
-- A security-definer RPC, not a direct client update: a signed-out visitor
-- has no UPDATE grant on public.event at all (only "authenticated" has any,
-- and only on the vendor-editable columns per 0007's column grant), so an
-- anonymous page view needs a narrow, purpose-built door instead of a
-- broader grant that would let any visitor edit other columns too.
-- Scoped to published events only — there's nothing worth counting a view
-- of a draft only its own vendor can see.

create or replace function public.increment_event_view(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.event set view_count = view_count + 1
  where id = p_event_id and status = 'published';
end;
$$;
