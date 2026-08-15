# Architecture

How the three apps fit together. Read [`CLAUDE.md`](../CLAUDE.md) first for
the short version.

## One database, three front ends

```
                    ┌──────────────────────────┐
                    │   Supabase (one project) │
                    │   Postgres + RLS + Auth  │
                    │   + Storage buckets      │
                    └────────────┬─────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────┴────────┐   ┌───────────┴─────────┐   ┌──────────┴────────┐
│  Public site   │   │  Vendor dashboard   │   │  Admin dashboard  │
│  repo root     │   │  apps/vendor        │   │  apps/admin       │
│  EN + AR       │   │  brand-tinted       │   │  dark, EN only    │
│  customers     │   │  vendors            │   │  platform staff   │
└────────────────┘   └─────────────────────┘   └───────────────────┘
```

There is no shared package and no API layer between the apps. Each talks to
Supabase directly, and **RLS is the boundary** — the same query returns
different rows depending on who is asking.

This is why a permissions change is almost always a migration, not a UI
change, and why the same table can be safely read by all three apps.

### Why the apps are separate

They have different audiences, different visual identities, and different
deploy cadences. A vendor should never load admin code. Splitting them also
means an admin-only dependency (e.g. `recharts` in admin) never ships to
customers.

### The cost of that split

Files that look shared are copies: `lib/utils.ts`, `lib/supabase/*`,
`components/ui/*`, `components/logo.tsx`, and the toast system all exist
independently in two or three places. **Fixing a bug in one does not fix the
others.** When you change one, grep for siblings and decide deliberately
whether the others need the same change.

## Identity model

One `auth.users` table backs all three apps. A person is not "a customer" or
"a vendor" — they are a user who may also have roles:

| Concept | Where it lives | Meaning |
| --- | --- | --- |
| User | `auth.users` + `public.profile` (1:1) | Anyone who signed up, on any surface |
| Admin | `profile.is_admin = true` | Platform staff |
| Vendor member | row in `vendor_member` | Belongs to a vendor, as `owner` or `staff` |

Consequences worth internalising:

- A customer who signs up on the public site **shares the same account** if
  they later become a vendor. Signing in to the vendor app with a customer
  account is possible; the layout gate is what stops them getting a broken
  empty dashboard.
- A user can belong to **more than one vendor** (an agency staffer on two
  clients' teams). This is why the `active_vendor` cookie exists.
- An admin is not automatically a vendor, and vice versa.

### The auth gates

Each dashboard's `app/(dashboard)/layout.tsx` is the gate:

- **`apps/vendor`** — signed in **and** a member of at least one vendor.
  Otherwise: "This account isn't a vendor."
- **`apps/admin`** — signed in **and** `profile.is_admin`. Otherwise: "This
  account isn't an admin."

The public site has no gate; pages that need a user check individually.

### Sessions

`proxy.ts` (Next 16 renamed Middleware to Proxy) refreshes the Supabase
session cookie on every request. This matters because Server Components can
read cookies but cannot write them — without the proxy, reads silently go
stale once the access token expires.

The vendor app additionally has an idle timeout (`components/idle-timeout.tsx`,
`profile.session_timeout_minutes`, default 30 min).

## Multi-vendor scoping — the sharpest edge in the codebase

A user on more than one vendor's team must see exactly one vendor's data at a
time. The `active_vendor` cookie picks which; `VendorSwitcher` in the sidebar
sets it.

**Every vendor-app page must scope its queries explicitly.** RLS alone is not
enough, for two independent reasons:

1. `vendor` carries an `"admins read all vendors"` policy that the admin app
   needs. Both apps share one database, so an unfiltered select in the vendor
   app hands a platform admin every vendor on the platform.
2. `vendor_summary_stats` and `vendor_event_stats` are `security_invoker`
   views — they run with the caller's own permissions, so an unfiltered
   select returns **one row per vendor the caller can read**, not one merged
   row. `.maybeSingle()` on 2+ rows then errors, and because only `data` is
   usually destructured, the page silently renders all zeros.

Use [`apps/vendor/lib/active-vendor.ts`](../apps/vendor/lib/active-vendor.ts)
(`resolveActiveVendor`) — it scopes through `my_vendor_ids()`, the same
function RLS uses. **Do not hand-roll the resolution in a new page.**

Booking queries need one more guard: the vendor read policy is *additive* to
the customer "own bookings" policy, so an operator who has also booked as a
customer would see their personal bookings mixed into the vendor list.
Scope by `event_id in (this vendor's events)` explicitly.

## Request flow: a customer booking

Worth tracing once, because it touches most of the system.

1. Customer opens `/[locale]/events/[slug]` on the public site. Only
   `status = 'published'` events are readable anonymously.
2. Page fires `increment_event_view` — bumps `event.view_count` and appends
   to `event_view_log` (the timestamped history the dashboards chart).
3. `Book Now` opens a checkout modal. Not signed in → sign-in modal first
   (email OTP via Resend).
4. Confirm calls the **`create_booking` RPC** — never a direct insert. The
   RPC validates the event is published, clamps quantity 1–16, atomically
   reserves capacity on `ticket_type` (`UPDATE … WHERE quantity_sold +
   n <= quantity_total RETURNING price_aed`), and computes `total_aed`
   server-side.
5. Booking appears in the customer's `/account/bookings` with a QR code
   (the `reference`), in the vendor's `/bookings`, and in admin's global
   `/bookings`.
6. At the door, vendor scans the QR → `check_in_booking` RPC, which is
   atomic on `checked_in_at IS NULL` so a double scan cannot double-check-in.

The direct-insert path was deliberately removed (`0026`): the client used to
send its own price.

## Event lifecycle

```
draft ──submit──> submitted ──approve──> published
  ^                   │
  └──── reject ───────┘  (rejected, with rejection_reason)

published/approved ──archive──> archived
```

- Vendors move `draft → submitted` (`vendor_submit_event`) and archive
  (`vendor_archive_event`).
- Only admins publish or reject (`admin_publish_event`,
  `admin_reject_event`) — enforced in RPCs, not RLS, because "you may write
  this status but not that one, depending on who you are" is not expressible
  row-level.
- Vendors may delete only `draft` or `rejected` events.
- Publishing requires a start date (`0015`).

## Storage

Three public buckets: `avatars`, `event-images`, `vendor-logos`. Public read;
writes scoped by RLS to the owning user or vendor.

Seeded demo events store **app-relative** image paths (`/events/foo.jpg`)
served from the public site's own `public/`. Vendor uploads store absolute
Supabase URLs. The dashboards run on different origins, so they resolve
relative paths at render time via `lib/images.ts` (`resolveImageUrl`).

## External services

| Service | Used for | Notes |
| --- | --- | --- |
| Supabase | Postgres, Auth, Storage | The single source of truth |
| Vercel | Hosting, 3 projects | Auto-deploys from `main` |
| Resend | Sign-in OTP email | Configured as Supabase Auth's **SMTP provider**, in the Supabase dashboard. The app has no API route and never sends email itself — sender name "TheBucketListDXB" |

There is also a legacy backend at `api.thebucketlistdxb.com` from the client's
original site. **This project does not use it.** See `docs/roadmap.md` for why.
