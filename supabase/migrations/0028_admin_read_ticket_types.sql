-- ticket_type never got the same admin-bypass policy vendor/event/booking/
-- event_view_log all have. apps/admin's per-event page
-- (vendors/[id]/events/[eventId]/page.tsx) already queries ticket_type
-- directly, no code change needed — for any event not yet published
-- (draft/submitted/approved, i.e. essentially every event an admin looks
-- at from the Review queue) belonging to a vendor the admin isn't a member
-- of, the existing policy's two branches (published, or own vendor) both
-- fail and the query silently returns zero rows. An admin could approve or
-- reject an event without ever seeing its ticket pricing.
create policy "admins read all ticket types" on public.ticket_type for select
  using (public.is_admin());
