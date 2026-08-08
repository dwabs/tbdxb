-- Vendor dashboard schema: vendors create events, admins review them, the
-- public site reads what's published. See docs/vendor-dashboard.md.
--
-- Lifecycle is simplified for v1: vendors self-serve draft -> submitted (and
-- may archive their own live event), but only an admin can move a row to
-- approved/published/rejected — done through the two RPCs at the bottom,
-- never through the vendor's own UPDATE policy. `approved` stays a real enum
-- value for a future two-step review even though nothing sets it yet.

create type public.vendor_status as enum ('pending', 'approved', 'suspended');
create type public.vendor_role as enum ('owner', 'staff');
create type public.event_status as enum
  ('draft', 'submitted', 'approved', 'published', 'rejected', 'archived');

create table public.vendor (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  contact_email text not null,
  contact_phone text,
  logo_url text,
  bio text,
  status public.vendor_status not null default 'pending',
  commission_rate numeric not null default 0.15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendor_member (
  user_id uuid not null references public.profile (id) on delete cascade,
  vendor_id uuid not null references public.vendor (id) on delete cascade,
  role public.vendor_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (user_id, vendor_id)
);

create table public.event (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendor (id) on delete cascade,
  slug text not null unique,
  status public.event_status not null default 'draft',
  title text not null,
  short_title text not null default '',
  summary text not null default '',
  body text not null default '',
  category text not null default '',
  venue text not null default '',
  area text not null default '',
  starts_at timestamptz,
  ends_at timestamptz,
  duration_label text not null default '',
  group_size text not null default '',
  tags text[] not null default '{}',
  includes jsonb not null default '[]',
  age_min int,
  view_count int not null default 0,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profile (id),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_type (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.event (id) on delete cascade,
  title text not null,
  description text not null default '',
  price_aed numeric not null,
  discount_price_aed numeric,
  quantity_total int not null default 0,
  quantity_sold int not null default 0,
  position int not null default 0
);

create table public.event_image (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.event (id) on delete cascade,
  url text not null,
  alt text not null,
  width int not null,
  height int not null,
  position int not null default 0
);

create table public.event_translation (
  event_id uuid not null references public.event (id) on delete cascade,
  locale text not null,
  title text not null,
  short_title text not null,
  summary text not null,
  body text not null,
  primary key (event_id, locale)
);

-- booking already exists (0001/0003/0005/0006) — link it to the real schema
-- while keeping its denormalised columns as the historical record: a vendor
-- editing a venue later must not retroactively change a ticket someone
-- already holds.
alter table public.booking
  add column event_id uuid references public.event (id),
  add column ticket_type_id uuid references public.ticket_type (id),
  add column checked_in_at timestamptz,
  add column checked_in_by uuid references public.profile (id);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vendor_set_updated_at before update on public.vendor
  for each row execute function public.set_updated_at();
create trigger event_set_updated_at before update on public.event
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Helper functions. security definer so they can read vendor_member/profile
-- without recursing back through those tables' own RLS policies.
-- ---------------------------------------------------------------------------

create or replace function public.my_vendor_ids() returns setof uuid
language sql security definer stable set search_path = public as $$
  select vendor_id from public.vendor_member where user_id = auth.uid();
$$;

create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profile where id = auth.uid()), false);
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.vendor enable row level security;
alter table public.vendor_member enable row level security;
alter table public.event enable row level security;
alter table public.ticket_type enable row level security;
alter table public.event_image enable row level security;
alter table public.event_translation enable row level security;

create policy "vendors read own row" on public.vendor for select
  using (id in (select public.my_vendor_ids()));
create policy "admins read all vendors" on public.vendor for select
  using (public.is_admin());
create policy "admins manage vendors" on public.vendor for update
  using (public.is_admin());

create policy "members read own membership" on public.vendor_member for select
  using (user_id = auth.uid());
create policy "admins read all memberships" on public.vendor_member for select
  using (public.is_admin());

create policy "published events are public" on public.event for select
  using (status = 'published');
create policy "vendors read own events" on public.event for select
  using (vendor_id in (select public.my_vendor_ids()));
create policy "admins read all events" on public.event for select
  using (public.is_admin());
create policy "vendors insert own events" on public.event for insert
  with check (vendor_id in (select public.my_vendor_ids()) and status = 'draft');
-- A vendor may target any of their own rows (including a live one, to edit
-- or archive it) but the result may never be admin-only territory — approve/
-- publish/reject only ever happen through the two RPCs below.
create policy "vendors update own events" on public.event for update
  using (vendor_id in (select public.my_vendor_ids()))
  with check (
    vendor_id in (select public.my_vendor_ids())
    and status in ('draft', 'submitted', 'archived')
  );

create policy "ticket types follow their event" on public.ticket_type for select
  using (
    event_id in (select id from public.event where status = 'published')
    or event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()))
  );
create policy "vendors manage own ticket types" on public.ticket_type for all
  using (event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids())))
  with check (event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids())));

create policy "event images follow their event" on public.event_image for select
  using (
    event_id in (select id from public.event where status = 'published')
    or event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()))
  );
create policy "vendors manage own event images" on public.event_image for all
  using (event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids())))
  with check (event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids())));

create policy "event translations follow their event" on public.event_translation for select
  using (
    event_id in (select id from public.event where status = 'published')
    or event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids()))
  );
create policy "vendors manage own event translations" on public.event_translation for all
  using (event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids())))
  with check (event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids())));

-- Additive to booking's existing customer policies (0001/0005): a vendor may
-- also read bookings made against their own events.
create policy "vendors read bookings for own events" on public.booking for select
  using (event_id in (select id from public.event where vendor_id in (select public.my_vendor_ids())));

-- ---------------------------------------------------------------------------
-- Stats — every page reads these, none aggregates its own numbers. The live
-- vendor dashboard shows four different ticket-sold counts for one event
-- because each page computes it separately; this is the fix.
--
-- security_invoker = on is load-bearing, not stylistic: a view defaults to
-- running as its *owner*, which reads through RLS as the owner and would
-- hand every vendor's revenue to any caller who selects from it.
-- ---------------------------------------------------------------------------

create view public.vendor_event_stats with (security_invoker = on) as
  select
    e.id as event_id,
    e.vendor_id,
    e.title,
    e.view_count,
    coalesce(sum(b.quantity), 0) as tickets_sold,
    coalesce(sum(b.total_aed), 0) as gross_aed,
    coalesce(sum(b.total_aed), 0) * (1 - v.commission_rate) as net_aed
  from public.event e
  join public.vendor v on v.id = e.vendor_id
  left join public.booking b
    on b.event_id = e.id and b.status <> 'cancelled' and not b.is_sample
  group by e.id, v.commission_rate;

create view public.vendor_summary_stats with (security_invoker = on) as
  select
    v.id as vendor_id,
    coalesce(sum(s.tickets_sold), 0) as tickets_sold,
    coalesce(sum(s.net_aed), 0) as net_aed,
    count(*) filter (
      where e.status = 'published' and e.starts_at > now()
    ) as upcoming_events
  from public.vendor v
  left join public.event e on e.vendor_id = v.id
  left join public.vendor_event_stats s on s.event_id = e.id
  group by v.id;

-- ---------------------------------------------------------------------------
-- Admin review — the only path a row can take to approved/published/rejected.
-- Kept out of RLS `with check` on purpose: RLS is row-level, and expressing
-- "you may write this status but not that one, depending on who you are" is
-- exactly what a security-definer function is for.
-- ---------------------------------------------------------------------------

create or replace function public.admin_publish_event(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  update public.event
    set status = 'published',
        submitted_at = coalesce(submitted_at, now()),
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        rejection_reason = null
    where id = p_event_id;
end;
$$;

create or replace function public.admin_reject_event(p_event_id uuid, p_reason text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  update public.event
    set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(), rejection_reason = p_reason
    where id = p_event_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Storage — event photos. Same shape as the avatars bucket (0002): public
-- read, write scoped to the caller's own folder — except the folder key here
-- is a vendor id, not a user id, since a listing belongs to the business.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do nothing;

create policy "event images are publicly readable" on storage.objects for select
  using (bucket_id = 'event-images');

create policy "vendors manage own event image files" on storage.objects for all
  using (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1]::uuid in (select public.my_vendor_ids())
  )
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1]::uuid in (select public.my_vendor_ids())
  );

-- ---------------------------------------------------------------------------
-- Seed: the six existing listings, migrated verbatim so the public site's
-- output is unchanged once it switches from lib/events.ts to the database.
-- Generated from lib/events.ts + lib/events-ar.ts, not retyped by hand.
-- ---------------------------------------------------------------------------

-- House-vendor seed: the six existing demo/real listings from lib/events.ts,
-- migrated into the real schema so the public site's output is unchanged
-- once it switches from the static array to the database (roadmap phase 3 /
-- vendor-dashboard.md phase 5). Generated from lib/events.ts + lib/events-ar.ts.

insert into public.vendor (id, name, slug, contact_email, status, commission_rate)
values ('00000000-0000-0000-0000-000000000001', 'The Bucket List DXB', 'thebucketlistdxb', 'hello@thebucketlistdxb.com', 'approved', 0)
on conflict (id) do nothing;

-- an-afternoon-at-salt-candle-making-mango-softies
with ins_event as (
  insert into public.event (
    vendor_id, slug, status, title, short_title, summary, body,
    category, venue, area, starts_at, ends_at, duration_label, group_size,
    tags, includes
  ) values (
    '00000000-0000-0000-0000-000000000001', 'an-afternoon-at-salt-candle-making-mango-softies', 'published',
    'An Afternoon at SALT: Candle Making & Mango Softies', 'An Afternoon at SALT', 'One of Dubai’s favourite summer treats — turned into a candle. Pour and customise your own Mango Softie scent, then eat the real thing.', 'One of Dubai’s favourite summer treats—turned into a candle. 🥭🕯️

Spend your Saturday afternoon at SALT, Museum of the Future creating your very own scented candle inspired by SALT’s iconic Mango Softie—then enjoy the real thing afterwards. During this two-hour guided workshop, you’ll learn how to pour, customise, and take home your handmade candle, with all materials included.

Whether you’re planning a fun date, a girls’ catch-up, or simply looking for something different to do this summer, this is one of those uniquely Dubai experiences you won’t want to miss. Trust us…this is one you’ll definitely want to tick off your bucket list.',
    'best-this-month', 'SALT, Museum of the Future', 'Sheikh Zayed Road', '2026-08-08T16:00:00+04:00'::timestamptz, '2026-08-08T18:00:00+04:00'::timestamptz,
    '2 hours', 'Up to 16 people', array['Workshop','Hands-on','Includes food'], '[{"emoji":"🕯️","label":"A guided Mango Softie-inspired candle-making workshop"},{"emoji":"🧰","label":"All candle-making materials and supplies"},{"emoji":"🥭","label":"SALT’s signature Mango Softie"},{"emoji":"🎁","label":"Your handmade candle to take home"}]'::jsonb
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.ticket_type (event_id, title, price_aed, quantity_total, position)
select id, 'General Admission', 169, 50, 0 from ins_event;

insert into public.event_image (event_id, url, alt, width, height, position)
select e.id, v.url, v.alt, v.width, v.height, v.position
from public.event e, (values
  ('/events/salt-1.jpeg', 'A mango softie shaped candle lit against a blue backdrop', 1080, 1350, 0),
  ('/events/salt-2.jpeg', 'Hands stirring a candle wick into a glass vessel at a workshop table', 736, 1104, 1),
  ('/events/salt-3.jpeg', 'A hand holding SALT’s signature mango softie in a branded cup', 800, 1066, 2)
) as v(url, alt, width, height, position)
where e.slug = 'an-afternoon-at-salt-candle-making-mango-softies'
on conflict do nothing;

insert into public.event_translation (event_id, locale, title, short_title, summary, body)
select id, 'ar', 'بعد الظهر في سولت: صناعة الشموع وآيس كريم المانجو', 'بعد الظهر في سولت', 'واحدة من أحبّ حلويات دبي الصيفية — تتحوّل إلى شمعة. اسكب عطرك الخاص المستوحى من مانجو سوفتي، ثم تذوّق الأصل.', 'واحدة من أحبّ حلويات دبي الصيفية — تتحوّل إلى شمعة. 🥭🕯️

اقضِ بعد ظهر السبت في سولت، متحف المستقبل، لتصنع شمعتك المعطّرة المستوحاة من مانجو سوفتي الشهير من سولت — ثم استمتع بالأصل بعدها. خلال هذه الورشة الموجّهة التي تستمر ساعتين، ستتعلّم كيف تسكب شمعتك وتضفي عليها لمستك الخاصة وتأخذها معك، مع توفير كل المواد.

سواء كنت تخطط لموعد ممتع أو لقاء مع الصديقات أو تبحث ببساطة عن شيء مختلف هذا الصيف، فهذه واحدة من تجارب دبي الفريدة التي لا تريد تفويتها. ثق بنا… ستريد بالتأكيد شطبها من قائمتك.'
from public.event where slug = 'an-afternoon-at-salt-candle-making-mango-softies'
on conflict (event_id, locale) do nothing;

-- sunset-dhow-supper-al-seef
with ins_event as (
  insert into public.event (
    vendor_id, slug, status, title, short_title, summary, body,
    category, venue, area, starts_at, ends_at, duration_label, group_size,
    tags, includes
  ) values (
    '00000000-0000-0000-0000-000000000001', 'sunset-dhow-supper-al-seef', 'published',
    'Sunset Dhow Supper on Dubai Creek', 'Sunset Dhow Supper', 'A slow loop of the creek on a restored wooden dhow, with a four-course Emirati supper served as the light goes.', 'A slow loop of the creek on a restored wooden dhow, with a four-course Emirati supper served as the light goes.',
    'date-night', 'Al Seef Marine Station', 'Al Seef', '2026-08-14T18:30:00+04:00'::timestamptz, '2026-08-14T21:00:00+04:00'::timestamptz,
    '2.5 hours', 'Up to 24 people', array['Dinner','On the water','Sunset'], '[{"emoji":"🍽️","label":"Four-course Emirati supper"},{"emoji":"☕","label":"Soft drinks and karak"},{"emoji":"⛵","label":"Two-hour creek cruise"}]'::jsonb
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.ticket_type (event_id, title, price_aed, quantity_total, position)
select id, 'General Admission', 295, 50, 0 from ins_event;

insert into public.event_image (event_id, url, alt, width, height, position)
select e.id, v.url, v.alt, v.width, v.height, v.position
from public.event e, (values
  ('/events/sunset-dhow.jpg', 'A lantern-lit wooden dhow crossing the water at night below the Dubai skyline', 1600, 1200, 0)
) as v(url, alt, width, height, position)
where e.slug = 'sunset-dhow-supper-al-seef'
on conflict do nothing;

insert into public.event_translation (event_id, locale, title, short_title, summary, body)
select id, 'ar', 'عشاء الغروب على متن داو في خور دبي', 'عشاء الغروب على الداو', 'جولة هادئة في الخور على متن داو خشبي مُرمّم، مع عشاء إماراتي من أربعة أطباق يُقدَّم مع مغيب الشمس.', 'جولة هادئة في الخور على متن داو خشبي مُرمّم، مع عشاء إماراتي من أربعة أطباق يُقدَّم مع مغيب الشمس.'
from public.event where slug = 'sunset-dhow-supper-al-seef'
on conflict (event_id, locale) do nothing;

-- rooftop-film-club-alserkal
with ins_event as (
  insert into public.event (
    vendor_id, slug, status, title, short_title, summary, body,
    category, venue, area, starts_at, ends_at, duration_label, group_size,
    tags, includes
  ) values (
    '00000000-0000-0000-0000-000000000001', 'rooftop-film-club-alserkal', 'published',
    'Rooftop Film Club at Alserkal Avenue', 'Rooftop Film Club', 'Deckchairs, wireless headphones and a cult film on a warehouse roof, with the Al Quoz skyline behind the screen.', 'Deckchairs, wireless headphones and a cult film on a warehouse roof.',
    'date-night', 'Alserkal Avenue', 'Al Quoz', '2026-08-21T20:00:00+04:00'::timestamptz, '2026-08-21T22:30:00+04:00'::timestamptz,
    '2.5 hours', 'Up to 60 people', array['Outdoors','Late night'], '[{"emoji":"🪑","label":"Reserved deckchair"},{"emoji":"🎧","label":"Wireless headphones"},{"emoji":"🥤","label":"One drink from the kiosk"}]'::jsonb
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.ticket_type (event_id, title, price_aed, quantity_total, position)
select id, 'General Admission', 120, 50, 0 from ins_event;

insert into public.event_image (event_id, url, alt, width, height, position)
select e.id, v.url, v.alt, v.width, v.height, v.position
from public.event e, (values
  ('/events/rooftop-cinema.jpg', 'Two people in chairs watching a film on an open-air screen strung with festoon lights', 1600, 1067, 0)
) as v(url, alt, width, height, position)
where e.slug = 'rooftop-film-club-alserkal'
on conflict do nothing;

insert into public.event_translation (event_id, locale, title, short_title, summary, body)
select id, 'ar', 'نادي السينما على السطح في السركال أفنيو', 'نادي السينما على السطح', 'كراسي استلقاء وسماعات لاسلكية وفيلم مميّز على سطح مستودع، مع أفق القوز خلف الشاشة.', 'كراسي استلقاء وسماعات لاسلكية وفيلم مميّز على سطح مستودع.'
from public.event where slug = 'rooftop-film-club-alserkal'
on conflict (event_id, locale) do nothing;

-- padel-and-pizza-social
with ins_event as (
  insert into public.event (
    vendor_id, slug, status, title, short_title, summary, body,
    category, venue, area, starts_at, ends_at, duration_label, group_size,
    tags, includes
  ) values (
    '00000000-0000-0000-0000-000000000001', 'padel-and-pizza-social', 'published',
    'Padel & Pizza Social', 'Padel & Pizza Social', 'Two hours of round-robin padel across four courts, then pizza on the terrace. Rackets provided, no partner needed.', 'Two hours of round-robin padel across four courts, then pizza on the terrace.',
    'group-plans', 'Padel Pro, Al Barsha', 'Al Barsha', '2026-08-16T19:00:00+04:00'::timestamptz, '2026-08-16T22:00:00+04:00'::timestamptz,
    '3 hours', '8 – 24 people', array['Sport','Beginner friendly','Includes food'], '[{"emoji":"🎾","label":"Court hire and rackets"},{"emoji":"🏆","label":"Round-robin matches"},{"emoji":"🍕","label":"Pizza and drinks after"}]'::jsonb
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.ticket_type (event_id, title, price_aed, quantity_total, position)
select id, 'General Admission', 145, 50, 0 from ins_event;

insert into public.event_image (event_id, url, alt, width, height, position)
select e.id, v.url, v.alt, v.width, v.height, v.position
from public.event e, (values
  ('/events/padel.jpg', 'Two padel bats and scattered balls on a blue court, seen from above', 1600, 1067, 0)
) as v(url, alt, width, height, position)
where e.slug = 'padel-and-pizza-social'
on conflict do nothing;

insert into public.event_translation (event_id, locale, title, short_title, summary, body)
select id, 'ar', 'بادل وبيتزا', 'بادل وبيتزا', 'ساعتان من مباريات البادل على أربعة ملاعب، ثم بيتزا على الشرفة. المضارب متوفرة، ولا حاجة لشريك.', 'ساعتان من مباريات البادل على أربعة ملاعب، ثم بيتزا على الشرفة.'
from public.event where slug = 'padel-and-pizza-social'
on conflict (event_id, locale) do nothing;

-- desert-supper-club
with ins_event as (
  insert into public.event (
    vendor_id, slug, status, title, short_title, summary, body,
    category, venue, area, starts_at, ends_at, duration_label, group_size,
    tags, includes
  ) values (
    '00000000-0000-0000-0000-000000000001', 'desert-supper-club', 'published',
    'Desert Supper Club at Al Marmoom', 'Desert Supper Club', 'A long table set in the dunes, a fire-pit menu cooked in front of you, and a telescope once the sky clears.', 'A long table set in the dunes, with a fire-pit menu cooked in front of you.',
    'group-plans', 'Al Marmoom Desert Conservation Reserve', 'Al Marmoom', '2026-08-29T17:30:00+04:00'::timestamptz, '2026-08-29T22:00:00+04:00'::timestamptz,
    '4.5 hours', 'Up to 30 people', array['Dinner','Out of town','Stargazing'], '[{"emoji":"🚐","label":"Return transfer from Dubai"},{"emoji":"🔥","label":"Fire-pit dinner"},{"emoji":"🔭","label":"Guided stargazing"}]'::jsonb
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.ticket_type (event_id, title, price_aed, quantity_total, position)
select id, 'General Admission', 420, 50, 0 from ins_event;

insert into public.event_image (event_id, url, alt, width, height, position)
select e.id, v.url, v.alt, v.width, v.height, v.position
from public.event e, (values
  ('/events/desert-camp.jpg', 'White canvas tents at a desert camp in the dunes at twilight', 1600, 1067, 0)
) as v(url, alt, width, height, position)
where e.slug = 'desert-supper-club'
on conflict do nothing;

insert into public.event_translation (event_id, locale, title, short_title, summary, body)
select id, 'ar', 'عشاء في الصحراء بمحمية المرموم', 'عشاء الصحراء', 'طاولة طويلة بين الكثبان، وقائمة تُطهى على النار أمامك، وتلسكوب حين تصفو السماء.', 'طاولة طويلة بين الكثبان، وقائمة تُطهى على النار أمامك.'
from public.event where slug = 'desert-supper-club'
on conflict (event_id, locale) do nothing;

-- glassblowing-taster-dubai-glass
with ins_event as (
  insert into public.event (
    vendor_id, slug, status, title, short_title, summary, body,
    category, venue, area, starts_at, ends_at, duration_label, group_size,
    tags, includes
  ) values (
    '00000000-0000-0000-0000-000000000001', 'glassblowing-taster-dubai-glass', 'published',
    'Glassblowing Taster Session', 'Glassblowing Taster', 'Gather, shape and blow your first piece at a 1,100°C furnace, under one-to-one instruction. Take it home the next week.', 'Gather, shape and blow your first piece at a 1,100°C furnace.',
    'try-something-new', 'Dubai Glass Studio', 'Al Quoz', '2026-08-12T11:00:00+04:00'::timestamptz, '2026-08-12T13:00:00+04:00'::timestamptz,
    '2 hours', 'Up to 6 people', array['Workshop','Hands-on','Small group'], '[{"emoji":"🔥","label":"Two-hour guided session"},{"emoji":"🧰","label":"All materials"},{"emoji":"🏺","label":"Your finished piece, collected later"}]'::jsonb
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.ticket_type (event_id, title, price_aed, quantity_total, position)
select id, 'General Admission', 350, 50, 0 from ins_event;

insert into public.event_image (event_id, url, alt, width, height, position)
select e.id, v.url, v.alt, v.width, v.height, v.position
from public.event e, (values
  ('/events/glassblowing.jpg', 'A glassmaker shaping a clear vessel in the flame of a torch', 1600, 1067, 0)
) as v(url, alt, width, height, position)
where e.slug = 'glassblowing-taster-dubai-glass'
on conflict do nothing;

insert into public.event_translation (event_id, locale, title, short_title, summary, body)
select id, 'ar', 'جلسة تعريفية بنفخ الزجاج', 'نفخ الزجاج', 'اجمع الزجاج وشكّله وانفخ قطعتك الأولى على فرن بحرارة 1100 درجة، بإشراف فردي. تستلمها الأسبوع التالي.', 'اجمع الزجاج وشكّله وانفخ قطعتك الأولى على فرن بحرارة 1100 درجة.'
from public.event where slug = 'glassblowing-taster-dubai-glass'
on conflict (event_id, locale) do nothing;

-- arabic-calligraphy-workshop
with ins_event as (
  insert into public.event (
    vendor_id, slug, status, title, short_title, summary, body,
    category, venue, area, starts_at, ends_at, duration_label, group_size,
    tags, includes
  ) values (
    '00000000-0000-0000-0000-000000000001', 'arabic-calligraphy-workshop', 'published',
    'Arabic Calligraphy from Scratch', 'Arabic Calligraphy', 'Learn to cut a reed pen and write your name in Diwani script, taught by a calligrapher in a wind-tower house.', 'Learn to cut a reed pen and write your name in Diwani script.',
    'try-something-new', 'Sikka Art Space', 'Al Fahidi', '2026-08-19T17:00:00+04:00'::timestamptz, '2026-08-19T19:30:00+04:00'::timestamptz,
    '2.5 hours', 'Up to 12 people', array['Workshop','Beginner friendly'], '[{"emoji":"🖋️","label":"Reed pen and ink to keep"},{"emoji":"📄","label":"Practice sheets"},{"emoji":"☕","label":"Arabic coffee and dates"}]'::jsonb
  )
  on conflict (slug) do nothing
  returning id
)
insert into public.ticket_type (event_id, title, price_aed, quantity_total, position)
select id, 'General Admission', 190, 50, 0 from ins_event;

insert into public.event_image (event_id, url, alt, width, height, position)
select e.id, v.url, v.alt, v.width, v.height, v.position
from public.event e, (values
  ('/events/calligraphy.jpg', 'A calligrapher writing Arabic script in red ink with a reed pen', 1600, 1067, 0)
) as v(url, alt, width, height, position)
where e.slug = 'arabic-calligraphy-workshop'
on conflict do nothing;

insert into public.event_translation (event_id, locale, title, short_title, summary, body)
select id, 'ar', 'الخط العربي من البداية', 'الخط العربي', 'تعلّم بري القلم وكتابة اسمك بخط الديواني، على يد خطّاط في بيت من بيوت البراجيل.', 'تعلّم بري القلم وكتابة اسمك بخط الديواني.'
from public.event where slug = 'arabic-calligraphy-workshop'
on conflict (event_id, locale) do nothing;

-- ---------------------------------------------------------------------------
-- Grant the operator account (cremecorp97@gmail.com) ownership of the house
-- vendor and admin rights, so there's one working login for both the vendor
-- dashboard and the review queue from day one. Matched by email since the
-- auth.users row already exists from earlier OTP sign-in testing.
-- ---------------------------------------------------------------------------

insert into public.vendor_member (user_id, vendor_id, role)
select id, '00000000-0000-0000-0000-000000000001', 'owner'
from auth.users where email = 'cremecorp97@gmail.com'
on conflict (user_id, vendor_id) do nothing;

update public.profile set is_admin = true
where id = (select id from auth.users where email = 'cremecorp97@gmail.com');
