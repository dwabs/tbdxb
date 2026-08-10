-- Vendor check-in: booking.checked_in_at/checked_in_by (0007) have existed
-- unused since day one — nothing ever wrote them. Returns a structured
-- result rather than raising, since "already checked in" / "not found" /
-- "cancelled" are routine, frequent states during a live event (unlike
-- cancel_booking's single rare-failure shape) and the UI needs to visibly
-- branch on which one it is.
create or replace function public.check_in_booking(p_reference text)
returns table (
  ok boolean, reason text, booking_id uuid,
  attendee_name text, event_title text, quantity int, checked_in_at timestamptz
)
language plpgsql security definer set search_path = public as $$
declare
  v_ref text := upper(trim(p_reference));
  b record;
begin
  -- Every table reference below is qualified with the `bk` alias — this
  -- function's OUT columns (checked_in_at, attendee_name, event_title,
  -- quantity) are implicitly in scope as plpgsql variables inside a
  -- `returns table(...)` function, and each one happens to share a name
  -- with a real column on booking, which unqualified references would
  -- resolve ambiguously between the two.
  --
  -- Atomic check-and-set in one UPDATE, not SELECT-then-UPDATE: two staff
  -- scanning the same ticket in the same second must not both succeed.
  update public.booking bk
    set checked_in_at = now(), checked_in_by = auth.uid()
    where bk.reference = v_ref
      and bk.event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()))
      and bk.status = 'confirmed'
      and bk.checked_in_at is null
    returning bk.id, bk.attendee_name, bk.event_title, bk.quantity, bk.checked_in_at
    into b;

  if found then
    return query select true, 'checked_in', b.id, b.attendee_name, b.event_title, b.quantity, b.checked_in_at;
    return;
  end if;

  -- Nothing updated — figure out why, purely for messaging (read-only, no
  -- race concern on this branch).
  select bk.id, bk.status, bk.attendee_name, bk.event_title, bk.quantity, bk.checked_in_at into b
  from public.booking bk
  where bk.reference = v_ref
    and bk.event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()));

  if not found then
    -- Deliberately the same message whether the reference doesn't exist at
    -- all, or exists but belongs to a different vendor — folding "wrong
    -- vendor" into "not found" avoids letting one vendor's staff enumerate
    -- that a reference is valid but belongs to someone else.
    return query select false, 'not_found', null::uuid, null::text, null::text, null::int, null::timestamptz;
  elsif b.status = 'cancelled' then
    return query select false, 'cancelled', b.id, b.attendee_name, b.event_title, b.quantity, b.checked_in_at;
  else
    return query select false, 'already_checked_in', b.id, b.attendee_name, b.event_title, b.quantity, b.checked_in_at;
  end if;
end;
$$;
