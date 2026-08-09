-- 0007 added booking.event_id/ticket_type_id but nothing ever populated
-- them: the demo seed in 0003 predates those columns, and checkout's insert
-- (0005, lib/checkout-flow.tsx) was written against the pre-vendor schema
-- and never set them either — so no booking, sample or real, has ever been
-- linked to an event. That's why vendor_event_stats and the vendor's own
-- /bookings page (9c) both read zero rows even after a real checkout.
-- checkout-flow.tsx now sets both columns on insert going forward; this
-- backfills every existing row by the event_slug it already carries.

update public.booking b
set event_id = e.id
from public.event e
where b.event_id is null and b.event_slug = e.slug;

-- Same ticket type checkout would have charged: the lowest-position (i.e.
-- cheapest/first-listed) type for that event, matching lib/events.ts's
-- own "cheapest ticket type" selection.
update public.booking b
set ticket_type_id = (
  select tt.id
  from public.ticket_type tt
  where tt.event_id = b.event_id
  order by tt.position
  limit 1
)
where b.event_id is not null and b.ticket_type_id is null;
