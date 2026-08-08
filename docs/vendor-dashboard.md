# Vendor dashboard — build plan

A second Next.js app at **`vendor-tbdxb.vercel.app`** where vendors create and
manage events, and an admin approves them, so the public site at
`tbdxb.vercel.app` can stop serving a hardcoded array. Written 8 Aug 2026.

This **supersedes the route map in
[`accounts-and-dashboard.md`](./accounts-and-dashboard.md)**, which assumed the
dashboard would live at `/dashboard` inside the public app. Everything else in
that document — the roles, the lifecycle, the RLS warnings — still stands and is
not repeated here. Read it first; this builds on top.

Delivering this also **closes roadmap phase 3** (live data). That phase was
blocked on decision 1 ("content stays static") because the only alternative was
the client's API. Once vendors author events into our own database, the public
site has real data to read and the block dissolves — see phase 5 below.

## Decisions taken — sanity-check these first

Made while writing this so the plan could be concrete. Each is cheap to reverse
now and expensive later.

| # | Decision | Why |
| - | -------- | --- |
| 1 | **Monorepo — npm workspaces**, `apps/web` + `apps/vendor` + shared `packages/` | The two apps share a database schema, generated types, the `Experience` shape and validation rules. Duplicating those across repos guarantees drift, and drift here means a vendor saves an event the public site can't render. |
| 2 | **One Supabase project**, not two | "Own database" means our Postgres instead of `api.thebucketlistdxb.com` — not a second instance. Events written by vendors must be read by the public site; two databases would need a sync job that can only ever be a source of bugs. |
| 3 | **Vendors sign in with email + password**, customers keep OTP | Vendors log in daily. Our only email path (Resend) is not domain-verified, so every OTP is a launch blocker per login. Password auth needs email exactly once, at invite. |
| 4 | **Admin lives in the vendor app** at `/admin`, gated on `profile.is_admin` | A third deployment for a queue two or three people use is ceremony. Same app, different gate. |
| 5 | **Ticket types are modelled properly** (many per event) | Their API has them, vendors expect them, and it is the only way to express "early bird" or capacity. Cost: the public checkout gains a ticket picker — see phase 5. |
| 6 | **One event = one date window.** Recurring sessions are out of scope | `Experience` already assumes a single `date` + `startTime`/`endTime`. Recurrence is a real need for weekly experiences but it is a separate table and a separate booking model. Not v1. |
| 7 | **Existing six demo experiences get seeded into the database** owned by a house vendor | The public site has real content the moment it switches over, and there is a worked example in the admin queue on day one. |

## What we do differently from theirs

The live vendor dashboard was walked end to end on 8 Aug 2026. Seven findings,
each turned into a rule rather than a bug report.

**1. Stats have no single source of truth.** The same vendor, same one event,
reports four different numbers: dashboard says 0 sold / AED 0, Manage Ticket
Sales says 1 sold / AED 0, Event Performance says 1 sold / AED 10.7, Earnings
says 0 / AED 0.00. Each page aggregates independently.

→ **Two SQL views, `vendor_event_stats` and `vendor_summary_stats`. Every page
selects from them. No page computes a total in TypeScript.**

**2. `/payment-method` is a copy-paste of `/earnings-withdraw`** — same title,
same breadcrumb, and three stat tiles carrying leftover development dummy data
(47,857 tickets sold, AED 67,857 earned) that belong to no real vendor and have
no business on a payout-method screen.

→ **Shared layout primitives, composed per page. A `<StatRow>` a page opts into,
never a page cloned.**

**3. "View Event" is the edit form again** — the eye icon opens every field live
and editable, including two full rich-text editor instances. There is no read
view.

→ **`/events/[id]` is a genuine read-only summary. Editing is `/events/[id]/edit`
and an explicit choice.**

**4. The editor is a CMS bolted onto a text box.** Jodit, with tables, print,
fullscreen, video embed, speech recognition and an AI assistant — twice per
event (ticket description and event description) — for what is realistically
three sentences.

→ **Tiptap, toolbar limited to bold / italic / link / bullet list. Ticket
descriptions are plain text. Sanitise on write with an allowlist, not on render
and never `dangerouslySetInnerHTML` on raw input.**

**5. The ticket date model is broken and it shows.** Every ticket carries four
time fields — start date's From and To, end date's From and To. Saved times come
back empty (`--:--`) on reload, which is the same defect roadmap already logged
from their API (`tickets[0].startDate.fromTime` returning `"Invalid"`).

→ **Two columns on the event: `starts_at`, `ends_at`, both `timestamptz`.
Tickets carry no dates of their own. Rendered in `Asia/Dubai`.**

**6. Copy and data defects worth simply not inheriting.** "Starting Prize(AED)"
for price, in the vendor-facing UI and not just the API field name. The End Date
input's accessible name is still "Start Date" from the copy-paste. Profile
renders stored markup as visible text (`<p>Test</p>`). Ticket Type is free text,
so nothing can group or report on it. The gallery upload row has colliding
labels.

→ **Ticket type is an enum. Alt text is required at upload. Copy gets read once
before it ships.**

**7. Add Event is one continuous scroll** — name through category, location,
price, repeatable ticket blocks each with an editor and four date fields,
thumbnail, gallery, SEO. On a phone, standing in a venue, that is punishing.

→ **Four steps — Basics, Tickets, Media, Review — with autosave to `draft` on
every step change. A vendor who closes the tab loses nothing.**

## Architecture

```
thebucketlistdxb-redesign/
  apps/
    web/         → tbdxb.vercel.app          (moves here, unchanged otherwise)
    vendor/      → vendor-tbdxb.vercel.app   (new)
  packages/
    db/          migrations, generated types, Supabase clients, row→Experience mapper
    ui/          Button, Field, Dialog, Avatar, design tokens
    schema/      Zod schemas shared by the form that writes and the app that reads
  supabase/migrations/   stays at the root — one database, one migration history
```

Two Vercel projects from one repo, distinguished by **Root Directory**
(`apps/web`, `apps/vendor`). Both get the Supabase env vars; only the vendor
project gets `SUPABASE_SERVICE_ROLE_KEY`.

Phase 0 is the only structurally invasive step: the existing app moves into
`apps/web`. It is mechanical — the `@/` alias re-roots to `apps/web` and import
paths are unchanged — but it touches everything, so it lands as its own commit
with a green `build` on both apps before any feature work starts.

> **If the restructure is unwanted**, the fallback is a standalone `apps/vendor`
> with its own copy of the Supabase client and generated types. It works. It
> also means every schema change is now two edits in two places, and the first
> time they disagree the failure is a vendor saving an event the public site
> cannot render. Recommend against.

## Auth, and the cookie constraint

**`vercel.app` is on the Public Suffix List.** Cookies set on
`tbdxb.vercel.app` cannot be read by `vendor-tbdxb.vercel.app` — the browser
refuses to scope a cookie to `.vercel.app`. So the two apps have separate
sessions and the vendor app needs **its own sign-in page**, regardless of the
shared Supabase project. This is the concrete reason
`accounts-and-dashboard.md`'s "one sign-in flow serves everybody" no longer
holds; it was written for a same-origin `/dashboard`.

On real domains (`thebucketlistdxb.com` + `vendor.thebucketlistdxb.com`) a
shared parent-domain cookie becomes possible. Not worth designing for now, but
it is why the session helper lives in `packages/db` rather than being written
twice.

Vendor sign-in is **email + password** (decision 3), same `auth.users` table.
The gate is membership: a session with no approved `vendor_member` row gets a
"your application is still under review" screen, not the dashboard.

> **Launch dependency, not a build blocker:** Resend still has no verified
> sending domain, so invite and approval emails only deliver to the Resend
> account's own address. During build, vendor accounts are created by an admin.
> Self-serve onboarding needs the client's DNS.

## Data model

Sketch, close enough to argue with. Postgres enums throughout — the database
should refuse `publsihed`.

```sql
create type public.vendor_status  as enum ('pending','approved','suspended');
create type public.vendor_role    as enum ('owner','staff');
create type public.event_status   as enum
  ('draft','submitted','approved','published','rejected','archived');

vendor          id, name, slug unique, contact_email, contact_phone,
                logo_url, bio, status vendor_status default 'pending',
                commission_rate numeric default 0.15, created_at, updated_at

vendor_member   user_id → profile.id, vendor_id → vendor.id,
                role vendor_role default 'owner'      [PK: user_id, vendor_id]

event           id, vendor_id → vendor.id, slug unique,
                status event_status default 'draft',
                title, short_title, summary, body,        -- body = sanitised HTML
                category text,                            -- matches CATEGORIES ids
                venue, area,
                starts_at timestamptz, ends_at timestamptz,
                duration_label, group_size,
                tags text[], includes jsonb,              -- [{emoji,label}]
                age_min int,
                submitted_at, reviewed_at, reviewed_by, rejection_reason,
                view_count int default 0,
                created_at, updated_at

ticket_type     id, event_id → event.id, title, description,
                price_aed numeric, discount_price_aed numeric null,
                quantity_total int, quantity_sold int default 0, position int

event_image     id, event_id → event.id, url, alt text not null,
                width, height, position

event_translation  event_id + locale, title, short_title, summary, body   [PK both]
```

`tags text[]` and `includes jsonb` are shaped to drop straight into
`Experience` — the mapper stays thin, which is the whole point.

### `booking` gains foreign keys but keeps its snapshot

```sql
alter table public.booking
  add column event_id       uuid references public.event (id),
  add column ticket_type_id uuid references public.ticket_type (id),
  add column checked_in_at  timestamptz,
  add column checked_in_by  uuid references public.profile (id);
```

The existing denormalised columns (`event_title`, `event_image`, `location`,
`event_date`, `total_aed`) **stay**. They are not redundancy to clean up — they
are the historical record. A vendor who edits the venue next month must not
retroactively change a ticket someone already holds. The new `event_id` is for
joining and reporting; the snapshot is for the customer.

### Stats, computed once

```sql
create view public.vendor_event_stats with (security_invoker = on) as
  select e.id as event_id, e.vendor_id, e.title, e.view_count,
         coalesce(sum(b.quantity), 0)                        as tickets_sold,
         coalesce(sum(b.total_aed), 0)                       as gross_aed,
         coalesce(sum(b.total_aed), 0) * (1 - v.commission_rate) as net_aed
  from public.event e
  join public.vendor v on v.id = e.vendor_id
  left join public.booking b
    on b.event_id = e.id and b.status <> 'cancelled' and not b.is_sample
  group by e.id, v.commission_rate;
```

> **`security_invoker = on` is not optional.** A Postgres view runs as its
> *owner* by default, which means it reads through RLS as the owner and happily
> returns every vendor's revenue to any caller. This one flag is the difference
> between a stats view and a data leak.

## RLS

`accounts-and-dashboard.md` covers the reasoning; these are the specifics.

```sql
create function public.my_vendor_ids() returns setof uuid
language sql security definer stable set search_path = public as $$
  select vendor_id from public.vendor_member where user_id = auth.uid();
$$;

create function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profile where id = auth.uid()), false);
$$;
```

Both are `security definer` to break the policy-recursion trap: `event`'s policy
reads `vendor_member`, and `vendor_member`'s own policy would otherwise read
back.

```sql
-- The public site sees published events and nothing else.
create policy "published events are public"
  on public.event for select using (status = 'published');

create policy "vendors read own events"
  on public.event for select
  using (vendor_id in (select public.my_vendor_ids()));

-- Vendors may edit their own, but may never move one to approved/published.
create policy "vendors edit own events"
  on public.event for update
  using (vendor_id in (select public.my_vendor_ids()))
  with check (status in ('draft', 'submitted'));

create policy "vendors read bookings for own events"
  on public.booking for select
  using (event_id in (
    select id from public.event where vendor_id in (select public.my_vendor_ids())
  ));
```

That `with check` is the review gate. Without it a vendor publishes themselves
and the approval queue is decorative.

**Check-in cannot be an RLS policy.** Letting a vendor `update` a booking to set
`checked_in_at` also lets them rewrite `total_aed` — RLS grants rows, not
columns. Check-in goes through a `security definer` RPC that takes a booking
reference, verifies the booking belongs to a caller's event, and touches only
the two check-in columns.

## Route map

English only, outside `[locale]` — it is a tool for a few dozen accounts, not a
marketing surface. Copy still routes through a dictionary so Arabic is a file
later, not a refactor.

```
/sign-in                    email + password
/                           dashboard: real stats, recent bookings
/events                     list — Draft / In review / Live / Past tabs
/events/new                 4-step create (Basics → Tickets → Media → Review)
/events/[id]                read-only summary
/events/[id]/edit           the same 4 steps, populated
/sales                      bookings across events, searchable, CSV export
/performance                per-event views, sold, revenue, conversion
/coupons                    list + create
/check-in                   QR scanner
/earnings                   balance, transactions, withdrawal requests
/settings                   business profile, team members, payout method
/admin/events               review queue: approve / reject with reason
/admin/vendors              vendor applications
```

Route protection happens in the layouts, where there is database access —
`proxy.ts` may do a cheap cookie-presence redirect to avoid a signed-out flash,
but a cookie existing is not a session and RLS is the backstop under both.

## Phases

Each is independently verifiable, which matters because none of this shows on
the public site until phase 5.

**Phase 0 — Monorepo.** Move to `apps/web`, scaffold `apps/vendor`, extract
`packages/db|ui|schema`, create the second Vercel project. Done when both apps
build green and `tbdxb.vercel.app` is byte-identical to today.

**Phase 1 — Schema.** Migrations for every table above, the two functions, RLS
on all of them, the stats views, the `booking` columns, the `event-images`
bucket. Seed the house vendor and the six existing experiences as `published`.
Verified in SQL: a second vendor must not see the first's rows.

**Phase 2 — Shell and auth.** Vendor sign-in, session gate, membership gate,
layout and nav, dashboard reading real (zero) stats.

**Phase 3 — Event CRUD.** List with status tabs, the 4-step form with autosave,
read-only view, ticket types, image upload via signed URLs with required alt
text and EXIF stripped. No lifecycle yet — everything stays `draft`.

**Phase 4 — Lifecycle and review.** submit → approve/reject → publish →
archive, the admin queue, rejection reasons shown to the vendor. Material edits
to a live event (price, dates, capacity, title) return it to `submitted`;
cosmetic edits publish straight through.

**Phase 5 — The public site reads the database.** *Closes roadmap phase 3.*
Cheaper than it looks: only four files call the data functions
(`app/[locale]/page.tsx`, `events/page.tsx`, `events/[slug]/page.tsx`,
`account/bookings/page.tsx`) and all four are Server Components. The other seven
imports are `type Experience` only and do not change at all. So the work is:
make `allExperiences` / `experiencesByCategory` / `getExperience` /
`relatedExperiences` async and DB-backed behind the same names, add the
row→`Experience` mapper, and `await` in four places. Then the real work —
revalidation (`/en` and `/ar` are currently SSG; event pages are already
dynamic), a ticket-type picker in checkout, sold-out states now that
`quantity_total` exists, and Arabic falling back to English where
`event_translation` is empty.

**Phase 6 — Sales and performance.** Both pages read the phase 1 views. Revenue
chart over real `booking.created_at`.

**Phase 7 — Check-in.** The scanner reads the reference our own ticket modal
already QR-encodes with `qrcode.react`, calls the RPC, shows valid / already
used / not your event.

**Phase 8 — Coupons.** Vendor CRUD, plus redemption in the public checkout —
the first time a coupon field there would validate against something real.

**Phase 9 — Earnings.** Balance and transactions computed from real bookings.
Withdrawal is a *request record* an admin marks paid, not a fake integration —
the same honest-stub posture already taken for payment. Real payouts mean Stripe
**Connect**, which needs the client's registered business entity.

**Phase 10 — Settings, team, polish.** Vendor profile, `vendor_member` invites,
payout details. Wire `/partner-with-us` to create a real application. Update
`roadmap.md` and `accounts-and-dashboard.md`.

Phases 0–5 are the spine. 6–10 are each independently shippable and can be
reordered or cut.

## Risks

- **The restructure in phase 0** touches every file. Isolated commit, both
  builds green, nothing else in it.
- **Resend's unverified domain** blocks self-serve vendor onboarding, not the
  build. Ask for DNS access now.
- **Ticket types expand the public checkout** (decision 5). Contained, but it is
  real work in `booking-panel.tsx` and `checkout-flow.tsx` and it lands in phase
  5, not phase 3.
- **Arabic regresses at phase 5.** Today `lib/events-ar.ts` hand-translates all
  six listings. Vendor-authored events will be English-only until someone fills
  `event_translation`. UI chrome stays translated; listing copy falls back.
  Accept knowingly or budget translation.
- **Revalidation strategy needs checking against Next 16's actual API** in
  `node_modules/next/dist/docs/`, per `AGENTS.md` — not assumed from memory.
- **Two events sources until the client's old site is switched off.** Already
  logged in `accounts-and-dashboard.md`; unchanged by this plan.
