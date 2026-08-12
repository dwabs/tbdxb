-- Checkout (0005) wrote bookings via a raw client .insert(): total_aed,
-- quantity, event_id, and ticket_type_id all came straight from browser
-- state, with only "auth.uid() = user_id" enforced server-side. Nothing
-- checked total_aed against the real ticket price, that the ticket type
-- belonged to the event, that the event was published, or any capacity —
-- ticket_type.quantity_sold/quantity_total have never been read or written
-- anywhere. A signed-in user could insert a confirmed booking at any price,
-- any quantity, for any event.
--
-- This replaces that insert path with a security-definer RPC that
-- recomputes price and event details server-side and never trusts a
-- client-supplied total. Dropping the old insert policy is the actual fix
-- — without it, the vulnerable path stays open via a direct API call
-- regardless of what the client code does.

drop policy "users insert own bookings" on public.booking;

-- One-time catch-up: real bookings made before this migration never
-- incremented quantity_sold (nothing did). Without this, the counter starts
-- under-reporting every event that already has real bookings — both for
-- the capacity check below and for the "X/Y sold" display already live in
-- apps/admin and apps/vendor.
update public.ticket_type tt
set quantity_sold = coalesce(sub.total, 0)
from (
  select ticket_type_id, sum(quantity) as total
  from public.booking
  where ticket_type_id is not null
    and status <> 'cancelled'
    and is_sample = false
  group by ticket_type_id
) sub
where tt.id = sub.ticket_type_id;

create or replace function public.create_booking(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity int,
  p_attendee_name text,
  p_attendee_phone text
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_event record;
  v_unit_price numeric;
  v_reference text;
  v_attendee_name text := trim(coalesce(p_attendee_name, ''));
  v_attendee_phone text := trim(coalesce(p_attendee_phone, ''));
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- Matches the client's own guest-count stepper cap (components/booking-panel.tsx).
  if p_quantity is null or p_quantity < 1 or p_quantity > 16 then
    raise exception 'Quantity must be between 1 and 16.';
  end if;

  if v_attendee_name = '' then
    raise exception 'Attendee name is required.';
  end if;

  select id, slug, title, venue, area, starts_at
    into v_event
    from public.event
    where id = p_event_id and status = 'published';

  if v_event.id is null then
    raise exception 'This event is not available for booking.';
  end if;

  -- Price lookup and capacity reservation in one atomic statement — a
  -- separate SELECT-then-INSERT would leave a race window where two
  -- concurrent bookings could both pass a capacity check before either
  -- commits (same reasoning as check_in_booking's atomic UPDATE...
  -- RETURNING, 0021). quantity_total <= 0 means capacity isn't tracked for
  -- this ticket type, not that it's sold out — matches its every-event
  -- default of 0 today, so this doesn't retroactively block anything.
  update public.ticket_type
    set quantity_sold = quantity_sold + p_quantity
    where id = p_ticket_type_id
      and event_id = p_event_id
      and (quantity_total <= 0 or quantity_sold + p_quantity <= quantity_total)
    returning price_aed into v_unit_price;

  if not found then
    if exists (
      select 1 from public.ticket_type where id = p_ticket_type_id and event_id = p_event_id
    ) then
      raise exception 'Not enough tickets left for this event.';
    else
      raise exception 'This ticket type is not available for this event.';
    end if;
  end if;

  -- event_slug/title/image/location are a snapshot at booking time, same
  -- as the original design (0007's comment): a vendor editing the venue
  -- later must not retroactively change a ticket someone already holds.
  insert into public.booking (
    user_id, event_id, ticket_type_id, event_slug, event_title, event_image,
    location, quantity, total_aed, event_date, attendee_name, attendee_phone
  )
  values (
    auth.uid(), v_event.id, p_ticket_type_id, v_event.slug, v_event.title,
    coalesce(
      (select url from public.event_image where event_id = v_event.id order by position limit 1),
      ''
    ),
    trim(both ', ' from concat_ws(', ', nullif(v_event.venue, ''), nullif(v_event.area, ''))),
    p_quantity,
    v_unit_price * p_quantity,
    coalesce((v_event.starts_at + interval '4 hours')::date, current_date),
    v_attendee_name,
    v_attendee_phone
  )
  returning reference into v_reference;

  return v_reference;
end;
$$;

-- cancel_booking (0022) never touched quantity_sold, since nothing wrote to
-- it before this migration either. Now that create_booking reserves
-- capacity on the way in, cancelling has to release it back — otherwise
-- every cancellation would permanently shrink real availability.
create or replace function public.cancel_booking(p_booking_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_booking record;
begin
  select b.ticket_type_id, b.quantity
    into v_booking
    from public.booking b
    where b.id = p_booking_id
      and (
        b.user_id = auth.uid()
        or b.event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()))
        or public.is_admin()
      )
      and b.status = 'confirmed' and b.event_date >= current_date and b.checked_in_at is null;

  if not found then
    raise exception 'This booking can no longer be cancelled.';
  end if;

  update public.booking set status = 'cancelled' where id = p_booking_id;

  -- greatest(...,0): bookings made before this migration never incremented
  -- quantity_sold in the first place, so decrementing for one of those
  -- could otherwise push the counter negative.
  if v_booking.ticket_type_id is not null then
    update public.ticket_type
      set quantity_sold = greatest(quantity_sold - v_booking.quantity, 0)
      where id = v_booking.ticket_type_id;
  end if;
end;
$$;
