-- There's only one ticket type (no VIP/Standard distinction), so the column
-- from 0003_bookings.sql was inaccurate. See docs/roadmap.md phase 7.

alter table public.booking drop column ticket_type;
