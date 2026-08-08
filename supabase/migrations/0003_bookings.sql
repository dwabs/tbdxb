-- Splits the account page into Profile (rare visits) and Bookings (frequent
-- visits): a birthday field for the former, a real bookings table for the
-- latter. See docs/roadmap.md phase 7.

alter table public.profile add column birthday date;

create type public.booking_status as enum ('confirmed', 'cancelled', 'completed');

create table public.booking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profile (id) on delete cascade,
  reference text not null unique,
  event_slug text not null,
  event_title text not null,
  event_image text not null,
  location text not null,
  ticket_type text not null,
  quantity integer not null default 1,
  total_aed numeric not null,
  event_date date not null,
  status public.booking_status not null default 'confirmed',
  -- Demo rows so the page has something real to show before phase 6
  -- (checkout) exists to write real ones. Strip with `delete from
  -- public.booking where is_sample`.
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.booking enable row level security;

-- No insert/update/delete policy for regular users: real rows only ever get
-- written server-side once checkout exists, so nothing here lets a browser
-- client fabricate a booking.
create policy "users read own bookings"
  on public.booking for select
  using (auth.uid() = user_id);

-- Demo seed for the test account, tied to real events from lib/events.ts.
insert into public.booking (
  user_id, reference, event_slug, event_title, event_image, location,
  ticket_type, quantity, total_aed, event_date, status, is_sample
)
select
  id,
  'BKT-' || upper(substr(md5(random()::text), 1, 6)),
  'an-afternoon-at-salt-candle-making-mango-softies',
  'An Afternoon at SALT: Candle Making & Mango Softies',
  '/events/salt-1.jpeg',
  'SALT, Museum of the Future, Sheikh Zayed Road',
  'VIP',
  2,
  338,
  (current_date + interval '14 days')::date,
  'confirmed'::public.booking_status,
  true
from auth.users where email = 'cremecorp97@gmail.com'
union all
select
  id,
  'BKT-' || upper(substr(md5(random()::text), 1, 6)),
  'sunset-dhow-supper-al-seef',
  'Sunset Dhow Supper on Dubai Creek',
  '/events/sunset-dhow.jpg',
  'Al Seef Marine Station, Al Seef',
  'Standard',
  1,
  295,
  (current_date - interval '30 days')::date,
  'completed'::public.booking_status,
  true
from auth.users where email = 'cremecorp97@gmail.com';
