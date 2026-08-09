-- Phase 10: a customer can book but has no way to un-book, and neither can
-- a vendor from their own /bookings page. See docs/roadmap.md phase 10.
--
-- A security-definer RPC rather than an update RLS policy: a policy would
-- have to be trusted to only ever move status one direction, whereas an RPC
-- enforces the transition explicitly — same reasoning as
-- admin_publish_event/vendor_submit_event. Two callers, checked in one
-- EXISTS: the booking's own user (customer-side) or any vendor member of
-- the event's vendor via my_vendor_ids() (vendor-side).
--
-- No refund logic — payment is still the labeled stub from phase 6, no real
-- charge exists to reverse, so this only flips the row's status.

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.booking b
    where b.id = p_booking_id
      and (
        b.user_id = auth.uid()
        or b.event_id in (
          select id from public.event where vendor_id in (select public.my_vendor_ids())
        )
      )
      and b.status = 'confirmed'
      and b.event_date >= current_date
      and b.checked_in_at is null
  ) then
    raise exception 'This booking can no longer be cancelled.';
  end if;

  update public.booking set status = 'cancelled' where id = p_booking_id;
end;
$$;
