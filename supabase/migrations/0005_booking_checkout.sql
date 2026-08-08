-- Book Now was a dead button — this is what makes it write a real row.
-- See docs/roadmap.md phase 6.

-- Auto-generate a reference so the client never has to invent one itself
-- (matches the pattern the 0003 seed data used).
alter table public.booking
  alter column reference set default ('BKT-' || upper(substr(md5(random()::text), 1, 6)));

-- Real bookings only: a signed-in user may insert a row for themselves, and
-- only a non-sample one — demo rows stay a server/SQL-only concept.
create policy "users insert own bookings"
  on public.booking for insert
  with check (auth.uid() = user_id and is_sample = false);
