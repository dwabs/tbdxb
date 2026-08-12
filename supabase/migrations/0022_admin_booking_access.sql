-- Admins get read access to every booking (matching the shape of the
-- existing "admins read all vendors"/"admins read all events" policies in
-- 0007), and check_in_booking/cancel_booking get an is_admin() bypass on
-- their vendor-scoping subquery. Without this, an admin session with no
-- vendor_member rows gets zero rows from a plain booking select, and
-- misleading not_found/"can no longer be cancelled" results from the two
-- RPCs instead of a clean, correct outcome.

create policy "admins read all bookings" on public.booking for select
  using (public.is_admin());

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
  update public.booking bk
    set checked_in_at = now(), checked_in_by = auth.uid()
    where bk.reference = v_ref
      and (
        bk.event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()))
        or public.is_admin()
      )
      and bk.status = 'confirmed'
      and bk.checked_in_at is null
    returning bk.id, bk.attendee_name, bk.event_title, bk.quantity, bk.checked_in_at
    into b;

  if found then
    return query select true, 'checked_in', b.id, b.attendee_name, b.event_title, b.quantity, b.checked_in_at;
    return;
  end if;

  select bk.id, bk.status, bk.attendee_name, bk.event_title, bk.quantity, bk.checked_in_at into b
  from public.booking bk
  where bk.reference = v_ref
    and (
      bk.event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()))
      or public.is_admin()
    );

  if not found then
    return query select false, 'not_found', null::uuid, null::text, null::text, null::int, null::timestamptz;
  elsif b.status = 'cancelled' then
    return query select false, 'cancelled', b.id, b.attendee_name, b.event_title, b.quantity, b.checked_in_at;
  else
    return query select false, 'already_checked_in', b.id, b.attendee_name, b.event_title, b.quantity, b.checked_in_at;
  end if;
end;
$$;

create or replace function public.cancel_booking(p_booking_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.booking b
    where b.id = p_booking_id
      and (
        b.user_id = auth.uid()
        or b.event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()))
        or public.is_admin()
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
