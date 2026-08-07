# Accounts, vendors and the dashboard

Groundwork for the two surfaces the site doesn't have yet: **user accounts**
(sign in, profile, bookings) and a **vendor dashboard** (a business logs in and
lists an event). Written 7 Aug 2026. Nothing here is built yet — this is the
plan, the shopping list and the decisions that need making first.

Everything below assumes the redesign stays on Next.js on Vercel. It doesn't
change any decision in `roadmap.md`; it sits underneath phases 4 and 7 and
adds a phase those never had.

## The fork in the road — decide this first

The live site already runs a backend at `api.thebucketlistdxb.com` (see
`roadmap.md`). It owns events, bookings, Stripe and a customer OTP login. Every
event it returns carries `vendorId`, `adminCommission` and `status: Approved`,
which is proof the client's business model is a **vendor marketplace with an
approval step** — not a hand-curated list.

But it has exactly one vendor endpoint: `POST /vendors/create-vendor-request`.
There is no vendor login, no "create event", no "edit my event", no approval
queue. **The vendor dashboard does not exist on their backend either.** Whatever
approves events today is an internal admin tool we've never seen.

So there are two ways to build this, and they cost very different amounts:

**A — extend their backend.** Someone writes the missing vendor endpoints into
the existing API; we build only the dashboard UI against it. Cheapest by far,
keeps one database, and bookings/payments stay wherever they already work.
Requires source access, a database credential, or a working relationship with
whoever wrote it.

**B — build our own.** A Postgres database, our own auth, our own event
records. Full control, no waiting on anyone, and it doubles as the escape hatch
if their backend is unmaintained. The cost is that events then live in two
places until the old site is switched off, and bookings/payments eventually
have to move too.

The rest of this document specifies **B**, because it's the only path that
doesn't depend on someone we can't reach. If A turns out to be available, most
of it still applies — drop the database and ORM sections, keep the roles,
the event lifecycle, the route map and the security notes.

> **Open question for the client:** do we have access to that backend's source
> code and database, or a named contact who maintains it? Ask before writing
> the first migration. It's the single highest-leverage answer available.

## What to sign up for

Six accounts, all with free tiers that comfortably cover a pre-launch build.
GitHub and Vercel you already have.

| Need              | Pick                       | Why this one                                                                                                                                                              |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database          | **Neon** (Postgres)        | Serverless, scales to zero between requests, and gives a database branch per Vercel preview deploy. Install from the Vercel Marketplace and `DATABASE_URL` is injected into every environment automatically. |
| Schema + queries  | **Drizzle ORM**            | Lives in the repo, no account. Types come from the schema; migrations are plain SQL files you can read and review in a diff. No query-engine binary to cold-start.        |
| Auth              | **Better Auth**            | Self-hosted — the user table is _your_ table, in your database, so "this event belongs to this vendor" is a foreign key rather than a join across a SaaS boundary. No per-user pricing. Has the pieces this needs: email OTP, roles, and organisations. |
| Transactional email | **Resend**               | Sends the OTP codes, vendor approval and rejection notices, booking confirmations later. Templates as React components via React Email.                                     |
| Image uploads     | **Vercel Blob**            | Vendors upload event photos. Supports presigned client uploads, so a 4 MB image never passes through a serverless function. Already inside the Vercel dashboard.            |
| Rate limiting     | **Upstash Redis**          | Not optional. An OTP endpoint with no rate limit is an email-bombing tool and a brute-force target, and serverless functions can't share an in-memory counter.              |

Plus **Zod** (in-repo, no account) for validation — one schema per form,
used by both the browser and the server action so they can't disagree.

Later, deliberately not now:

- **Stripe** — deferred by decision 3. Note for planning: paying vendors out
  means **Stripe Connect**, not just Checkout. That's a much larger integration
  and it needs the client's registered business entity and bank details.
- **Sentry** — worth adding once real users can hit real errors.

### The alternative worth naming

**Supabase** bundles Postgres, auth and file storage behind one signup. Fewer
accounts, one dashboard, and a genuine reduction in setup. The trade is that
authorisation becomes Row Level Security — policies written in SQL that you
must get exactly right, because getting them wrong is a data leak rather than a
bug. The stack above keeps authorisation in TypeScript where the rest of the
app's logic already lives, and each piece can be swapped without touching the
others. Take Supabase if one dashboard matters more than that.

**Clerk** and **Auth0** are the other obvious auth answers. Both are excellent
and both are wrong here: they price per monthly active user, and they keep the
user record on their side, which makes every "vendor owns this event" query a
seam. Fine for a SaaS, poor for a marketplace.

## Who is who

Three roles, and one distinction that's easy to get wrong.

A vendor is **not a user**. A vendor is a business, and a business can have two
people who both need a login — an owner and whoever actually updates the
listings. Their own API already models it this way: `vendorId` sits on the
event, not on the user. So:

- `user` — one person, one email. Everyone has one, customers included.
- `vendor` — a business. Name, contact details, commission rate, approval status.
- `vendor_member` — which users belong to which vendor, and as `owner` or `staff`.
- `admin` — a flag on `user`. There will be two or three of these, ever; a
  whole role table for that is ceremony.

A customer is simply a user who belongs to no vendor. That means one sign-in
flow serves everybody and the destination after login depends on membership —
no separate "vendor login" page to maintain, and no support emails from vendors
who signed in on the wrong one.

## The event lifecycle

Mirror their vocabulary where it exists (`Approved` is already in their data)
so a future migration doesn't have to translate.

```
draft ──submit──> submitted ──approve──> approved ──publish──> published
                      │                                            │
                      └──reject──> rejected                    archived
```

- **draft** — vendor's, invisible, incomplete allowed.
- **submitted** — locked for editing, sitting in the admin queue.
- **rejected** — carries a reason, and the reason is shown to the vendor. A
  rejection with no explanation generates a support email every single time.
- **approved** — passed review, vendor chooses when it goes live.
- **published** — visible on the site.
- **archived** — was live, isn't now. Never delete an event that has bookings
  against it.

**Editing a published event** is the decision people skip. Simplest workable
rule for v1: material edits — price, dates, capacity, title — send it back to
`submitted` and it stops being visible until re-approved. Cosmetic edits —
description wording, adding a photo — publish immediately. The alternative, a
pending-revision record that shadows the live one, is better and roughly three
times the work; not for v1.

## Data model sketch

Not final, but close enough to argue with. Better Auth generates its own
`user` / `session` / `account` / `verification` tables — these are the ones we
add on top.

```
vendor            id, name, slug, contactEmail, contactPhone,
                  status(pending|approved|suspended), commissionRate,
                  createdAt

vendor_member     userId → user.id, vendorId → vendor.id,
                  role(owner|staff)          [PK: userId + vendorId]

event             id, vendorId → vendor.id, slug,
                  status(draft|submitted|approved|published|rejected|archived),
                  category, venue, area,
                  startsAt, endsAt, durationMinutes,
                  priceAED, capacity,
                  ageRestriction{ enabled, minimumAge },
                  summary, description,
                  submittedAt, reviewedAt, reviewedBy, rejectionReason,
                  createdAt, updatedAt

event_image       id, eventId → event.id, url, alt, width, height, position

event_translation eventId + locale, title, summary, description
                  [so a vendor can author Arabic; falls back to English]
```

Two notes. `Experience` in `lib/events.ts` is the shape the front end already
renders — keep the database close to it and the mapping layer stays thin.
Alt text is a column, not an afterthought: it's required at upload time in the
dashboard, because nobody ever goes back to add it.

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

**The dashboard sits outside `[locale]`.** It's a tool used by a few dozen
business accounts, not a marketing surface, and doubling the dictionary for it
buys very little. English only for v1 — but write the copy through the same
dictionary mechanism anyway, so adding Arabic later is a file rather than a
refactor.

`/[locale]/sign-in` is already linked from the header and currently 404s. Same
class of bug `/contact` was before phase 2 — worth fixing early even if the
page only says "coming soon" for a while.

**Route protection.** Do the real session check in the `/dashboard` and
`/admin` layouts, where there's database access. `proxy.ts` can do a cheap
cookie-presence redirect so signed-out visitors don't flash a loading state,
but a cookie existing is not a session — it must never be the only gate.

## Environment variables

```
DATABASE_URL              Neon, injected by the Vercel integration
BETTER_AUTH_SECRET        openssl rand -base64 32
BETTER_AUTH_URL           deployment URL
RESEND_API_KEY
EMAIL_FROM                needs DNS records on the sending domain
BLOB_READ_WRITE_TOKEN     created with the Vercel Blob store
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

One dependency to raise early: **Resend needs DNS records on the domain you
send from.** That's the client's DNS, not ours, and waiting on it at the end
blocks every email in the system. Development can run on Resend's test domain,
so it only blocks launch — but ask for the DNS access now.

## Security, specifically

The things that go wrong on exactly this kind of build:

- **OTP codes** — store a hash, never the code. Five-minute expiry, single use,
  invalidate on success, max five attempts per code. Rate limit by email *and*
  by IP; neither alone is enough.
- **Vendor isolation** — every event query carries `where vendorId = …` from
  the session. Put it in one query helper rather than trusting each call site
  to remember. This is the bug that leaks another business's listings.
- **Admin gates run on the server.** Hiding the nav link is not access control.
- **Uploads** — cap file size, check the actual content type rather than the
  filename, and strip EXIF. Phone photos carry GPS coordinates.
- **Their public API** returns 200 with no key. Whatever we build should not
  copy that. Anything that reads a booking or a profile requires a session.

## Suggested order of work

Each step is independently verifiable, which matters — none of this has a
visible UI until quite late.

1. Neon + Drizzle + first migration. Prove it connects from a server component.
2. Better Auth on top of it: email OTP end to end, `/sign-in`, sign out,
   session in the header. Customers only, no vendor concept yet.
3. Vendor + membership tables. Wire `/partner-with-us` — which currently fakes
   its submission — to create a real `pending` vendor application.
4. `/admin/vendors`: approve or reject an application, email either way.
5. The dashboard shell: layout, auth gate, empty state.
6. Event create and edit, saving as `draft`. No images yet.
7. Vercel Blob uploads with required alt text.
8. Submit → review queue → approve → publish. The full lifecycle.
9. Point the public site at database events instead of `lib/events.ts` — this
   is roadmap phase 3, and it lands naturally here rather than separately.

Steps 1–2 are the ones worth doing carefully. Everything after is ordinary
CRUD, and it goes fast once the foundation is right.
