# Accounts, vendors and the dashboard

Groundwork for the two surfaces the site doesn't have yet: **user accounts**
(sign in, profile, bookings) and a **vendor dashboard** (a business logs in and
lists an event). Written 7 Aug 2026. Nothing here is built yet — this is the
plan, the shopping list and the traps.

Settled: **Supabase**, alongside the existing Next.js on Vercel. Everything
below assumes it. It doesn't change any decision in `roadmap.md`; it sits
underneath phases 4 and 7 and adds a phase those never had.

## Why this is new work, not integration

The live site runs a backend at `api.thebucketlistdxb.com` (see `roadmap.md`).
It owns events, bookings, Stripe and a customer OTP login. Every event it
returns carries `vendor_id`, `adminCommission` and `status: Approved`, which is
proof the client's business model is a **vendor marketplace with an approval
step** — not a hand-curated list.

But it has exactly one vendor endpoint: `POST /vendors/create-vendor-request`.
No vendor login, no create-event, no edit, no approval queue. **The vendor
dashboard doesn't exist on their backend either** — whatever approves events
today is an internal tool we've never seen. So unlike the booking flow, this
isn't wiring up something they already paid for. It's new.

We build it on Supabase. The consequence to accept knowingly: events then live
in two places until the old site is switched off, and bookings and payments
eventually have to move too. That migration is a known cost, not a surprise.

> Still worth asking the client: does anyone still maintain that backend, and
> can we get at its database? Not a blocker — it changes the migration at the
> end, not the build. But the answer is cheaper to have early than late.

## What you still need to sign up for

**One thing: Resend.** Everything else is either Supabase or lives in the repo.

Supabase's built-in email sender is rate-limited to a handful of messages an
hour and is explicitly not for production — it exists so you can test. Since
sign-in *is* an email in this design, that limit is the whole product. Wire
Resend in as Supabase's custom SMTP provider under Auth → Settings and the
limit goes away.

| Need                  | What we use                          | Notes                                                                                                     |
| --------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Database, auth, storage | **Supabase** ✅ created             | Connect it to the Vercel project via the Supabase integration — env vars land in all three environments.  |
| Next.js glue          | `@supabase/ssr`, `@supabase/supabase-js` | `@supabase/ssr` is the one that matters: cookie-based sessions that work in server components.         |
| Migrations + types    | **Supabase CLI**                     | `supabase/migrations/*.sql` in the repo, reviewable in a diff. `supabase gen types typescript` for types. |
| Email delivery        | **Resend** ← sign up                 | Custom SMTP for Supabase auth; later, booking confirmations and vendor approval notices.                   |
| Validation            | **Zod**                              | One schema per form, used by both browser and server action so they can't disagree.                        |

Deliberately not now: **Stripe** (deferred by decision 3 — and note that
paying vendors out means Stripe **Connect**, not Checkout, which is a far
larger job needing the client's registered business entity); **Sentry**;
**Upstash** for rate limiting, which Supabase's own auth limits cover until we
start writing endpoints of our own.

No Drizzle, no Prisma. Having chosen the bundle, adding a second migration
system and a second source of types fights the tooling for no gain.

## RLS is now the security model — read this part twice

The anon key ships to the browser. It is public by design. **Row Level
Security is the only thing standing between that key and the database.** So:

- **Enable RLS on every table**, including ones that feel harmless. A table
  with RLS off and a public key is a published table.
- **`using` and `with check` are different clauses and the difference is the
  whole ballgame.** `using` decides which rows you may target. `with check`
  decides what a row is allowed to look like afterwards. A vendor update policy
  with `using` alone lets a vendor flip their own event to `published` and skip
  review entirely.
- **Policies that query other tables can recurse.** If the policy on `event`
  reads `vendor_member`, and `vendor_member`'s policy reads back, Postgres
  errors with infinite recursion. Fix it with one `security definer` function
  that returns the caller's vendor ids, and call that from both.
- **The service role key bypasses RLS completely.** Server-side only, never in
  a client component, never in anything prefixed `NEXT_PUBLIC_`. Reach for it
  rarely — admin approval writes, that's about it.

Sketch of the shape, not final SQL:

```sql
alter table public.event enable row level security;

-- Anyone, signed in or not, reads a published event.
create policy "published events are public"
  on public.event for select
  using (status = 'published');

-- A vendor reads all of their own, at any status.
create policy "vendors read own events"
  on public.event for select
  using (vendor_id in (select public.my_vendor_ids()));

-- ...and may edit them, but may not publish them.
create policy "vendors edit own events"
  on public.event for update
  using (vendor_id in (select public.my_vendor_ids()))
  with check (status in ('draft', 'submitted'));
```

That last `with check` is the review gate. Without it there is no review.

## Who is who

Three roles, and one distinction that's easy to get wrong.

A vendor is **not a user**. A vendor is a business, and a business can have two
people who both need a login — an owner and whoever actually updates the
listings. Their own API models it this way already: `vendor_id` sits on the
event, not on the user.

- `auth.users` — Supabase's own table. Don't touch it.
- `profile` — ours, one row per user, `id` referencing `auth.users.id`, created
  by a trigger on signup. Name, phone, preferences. Everything the app needs to
  join against lives here, because you can't add columns to `auth.users`.
- `vendor` — a business. Name, contact details, commission rate, status.
- `vendor_member` — which users belong to which vendor, as `owner` or `staff`.
- `is_admin` — a boolean on `profile`. There will be two or three admins, ever;
  a whole role table for that is ceremony.

A customer is a user who belongs to no vendor. One sign-in flow serves
everybody and the post-login destination depends on membership — no separate
vendor login page to maintain, and no support emails from vendors who signed
in on the wrong one.

## Sign-in, concretely

Supabase's `signInWithOtp` sends a **magic link** by default. Their existing
users are used to typing a 6-digit code, and a code survives being opened on a
different device — which on a phone-first audience happens constantly.

To get a code instead, change the email template to use `{{ .Token }}` rather
than `{{ .ConfirmationURL }}`, then verify with `verifyOtp({ type: 'email' })`.
Easy to miss; costs an afternoon if you miss it.

## The event lifecycle

Mirror their vocabulary where it exists (`Approved` is already in their data)
so the eventual migration doesn't have to translate.

```
draft ──submit──> submitted ──approve──> approved ──publish──> published
                      │                                            │
                      └──reject──> rejected                    archived
```

- **draft** — vendor's, invisible, incomplete allowed.
- **submitted** — locked for editing, sitting in the admin queue.
- **rejected** — carries a reason, and the reason is shown to the vendor. A
  rejection with no explanation generates a support email every single time.
- **approved** — passed review; the vendor chooses when it goes live.
- **published** — visible on the site.
- **archived** — was live, isn't now. Never hard-delete an event that has
  bookings against it.

**Editing a published event** is the decision people skip. Workable v1 rule:
material edits — price, dates, capacity, title — send it back to `submitted`
and it stops being visible until re-approved. Cosmetic edits — description
wording, another photo — publish immediately. The alternative, a pending
revision shadowing the live row, is better and roughly three times the work.

## Data model sketch

Close enough to argue with. snake_case, since this is raw SQL now.

```
profile           id → auth.users.id, full_name, phone, is_admin, created_at

vendor            id, name, slug, contact_email, contact_phone,
                  status(pending|approved|suspended), commission_rate,
                  created_at

vendor_member     user_id → profile.id, vendor_id → vendor.id,
                  role(owner|staff)            [PK: user_id + vendor_id]

event             id, vendor_id → vendor.id, slug,
                  status(draft|submitted|approved|published|rejected|archived),
                  category, venue, area,
                  starts_at, ends_at, duration_minutes,
                  price_aed, capacity,
                  age_restriction_enabled, age_minimum,
                  summary, description,
                  submitted_at, reviewed_at, reviewed_by, rejection_reason,
                  created_at, updated_at

event_image       id, event_id → event.id, url, alt, width, height, position

event_translation event_id + locale, title, summary, description
                  [so a vendor can author Arabic; falls back to English]
```

Two notes. `Experience` in `lib/events.ts` is the shape the front end already
renders — keep the tables close to it and the mapping layer stays thin. And
alt text is a column, not an afterthought: make it required at upload time,
because nobody ever goes back to add it.

Status values as Postgres enums, not free text. The database should refuse
`publsihed`.

## Images

A Supabase Storage bucket, `event-images`, public read. Uploads go through
`createSignedUploadUrl` so a 4 MB photo never passes through a serverless
function. Write access is an RLS policy on `storage.objects` scoped to the
vendor's own folder — same rules as above, and the same consequences for
getting them wrong.

Add the Supabase storage host to `remotePatterns` in `next.config.ts` so
`next/image` keeps working. Cap file size, check the actual content type rather
than the filename, and strip EXIF — phone photos carry GPS coordinates, and a
vendor uploading from home should not be publishing their home address.

## Route map

```
/[locale]/sign-in          email → 6-digit code → done
/[locale]/account          profile, preferences, bookings (phase 7)

/dashboard                 vendor: listings at a glance
/dashboard/events          list, filtered by status
/dashboard/events/new      the create form
/dashboard/events/[id]     edit, submit, publish, archive
/dashboard/settings        business profile, team members

/admin/vendors             approve vendor applications
/admin/events              the review queue
```

**The dashboard sits outside `[locale]`.** It's a tool for a few dozen business
accounts, not a marketing surface, and doubling the dictionary for it buys
little. English only for v1 — but route the copy through the same dictionary
mechanism anyway, so adding Arabic later is a file rather than a refactor.

`/[locale]/sign-in` is already linked from the header and currently 404s. Same
class of bug `/contact` had before phase 2.

**Route protection.** Do the real check in the `/dashboard` and `/admin`
layouts, where there's database access — `@supabase/ssr`'s server client reads
the session from cookies. `proxy.ts` can do a cheap cookie-presence redirect so
signed-out visitors don't flash a loading state, but a cookie existing is not a
session and must never be the only gate. RLS is the backstop under both.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     public by design — RLS is the guard
SUPABASE_SERVICE_ROLE_KEY         server only, bypasses RLS, never NEXT_PUBLIC_
RESEND_API_KEY                    app-side sends; Supabase SMTP is configured
                                  in its own dashboard, not from here
```

The Vercel–Supabase integration injects the first three into all three
environments. One dependency to raise early: **Resend needs DNS records on the
domain you send from.** That's the client's DNS, not ours. Development runs on
Resend's test domain, so it only blocks launch — but ask for the access now,
because waiting on it at the end blocks every email in the system.

## Suggested order of work

Each step is independently verifiable, which matters — none of this has a
visible UI until quite late.

1. Connect Supabase to Vercel. `supabase init`, `supabase link`, first
   migration with `profile` and its signup trigger. Prove it reads from a
   server component.
2. Auth end to end: `@supabase/ssr` clients, `/sign-in` with a 6-digit code,
   sign out, session state in the header. Resend as SMTP. Customers only, no
   vendor concept yet.
3. `vendor` + `vendor_member`, with RLS and the `my_vendor_ids()` helper.
   Wire `/partner-with-us` — which currently fakes its submission — to create
   a real `pending` application.
4. `/admin/vendors`: approve or reject, email either way.
5. Dashboard shell: layout, auth gate, empty state.
6. Event create and edit, saving as `draft`. No images yet.
7. Storage uploads with required alt text.
8. Submit → review queue → approve → publish. The full lifecycle.
9. Point the public site at Supabase instead of `lib/events.ts` — this is
   roadmap phase 3, and it lands naturally here rather than separately.

Steps 1–3 are the ones worth doing slowly; get the policies right while there
are three tables rather than nine. Everything after is ordinary CRUD.
