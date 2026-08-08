-- Checkout's attendee-details step needs somewhere to land: who a booking
-- is for isn't always the account holder, so it doesn't belong on `profile`.
-- See docs/roadmap.md phase 6.

alter table public.booking add column attendee_name text not null default '';
alter table public.booking add column attendee_phone text not null default '';

alter table public.booking alter column attendee_name drop default;
alter table public.booking alter column attendee_phone drop default;
