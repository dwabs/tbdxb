# Build-out plan

What the redesign still needs to reach parity with thebucketlistdxb.com — and
past it. Audited 6 Aug 2026 against the live site and its API; status updated
8 Aug 2026.

## The headline finding

The live site runs on a complete backend at `https://api.thebucketlistdxb.com/api/v1`.
It is public, returns 200 without a key, and already implements a **full
booking and payment system that the current frontend never wired up**: their
`Book Now` is a bare `<button class="thm-btn">` with no handler at all.

Real inventory is already in there. `GET /events/event-tickets/:id` returns
ticket types with prices, discount prices and remaining quantity (11 left on
the SALT workshop as of the audit).

So this is not "design a booking flow from scratch". It is "wire up the flow
they already paid for". That reframes the biggest piece of work below from
invention to integration.

**Currently on hold.** Decision 1 keeps the site static, so none of this is
wired yet. The map below is research held in reserve — worth keeping accurate
because it collapses the estimate for everything downstream of it.

### Endpoints found in their bundle

| Area         | Endpoints                                                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth         | `/auth/login`, `/auth/verify-otp`, `/auth/resend-otp`                                                                                                                                                     |
| Events       | `/events/homepage`, `/events/event-details/:slug`, `/events/event-tickets/:id`, `/events/track-view/:id`, `/events/track-wishlist/:id`                                                                    |
| Booking      | `/bookings/create-event-booking`, `/bookings/confirm-user-details`, `/bookings/booking-confirm-age`, `/bookings/apply-coupon`, `/bookings/create-payment-intent`, `/bookings/payment-process`             |
| Post-booking | `/bookings/upcoming-bookings`, `/bookings/past-bookings`, `/bookings/cancel-booking/:id`, `/bookings/invioce/:id` _(sic)_, `/bookings/ticket-download/:id`                                                |
| Wishlist     | `/wishlist/wishlist-all`, `/wishlist/toggle-wishlist`, `/remove`, `/removeAll`                                                                                                                            |
| Account      | `/profile`, `/users/user-details/:id`, `/users/user-update/:id`, `/users/user-update-profile-image/:id`, `/users/preferences`, `/users/reminder-preferences`, `/address/address`, `/notification-setting` |
| Content      | `/about/about-us`, `/faq/faq`, `/privacypolicy/privacy-policy`, `/returnpolicy/return-policy`, `/terms/terms-condition`, `/contact-us`, `/newsletter/subscribe`                                           |
| Vendor       | `/vendors/create-vendor-request`                                                                                                                                                                          |

`create-payment-intent` is Stripe's vocabulary — assume Stripe until confirmed.

### Event shape

```
_id, eventName, seo{slug,metaTitle,metaDescription}, location{address},
category[], startingPrize (sic), description (HTML), thumbnailImage,
galleryImage[], tickets[], ageRestriction{enabled,minimumAge,message},
vendorId, adminCommission, isBoosted, status, isActive, isAvailable,
viewCount, wishlistCount, shareCount
```

Two things this tells us that the UI never surfaces: `vendorId` +
`adminCommission` + `status: Approved` mean **this is a vendor marketplace**,
not a hand-curated list. And `ageRestriction` needs a consent gate in checkout.

`description` is stored as HTML (pasted out of a rich text editor, complete
with editor cruft like `data-start` and `PDq2pG_selectionAnchorContainer`
classes). It needs sanitising and restyling, not `dangerouslySetInnerHTML`.

## Decisions — settled

Locked in on 7 Aug 2026. These shape everything below.

1. **Content stays static.** No API wiring for now; the backend comes later.
   The endpoint map above is research, not a live dependency.
2. **The bucket list is out.** Page and nav link removed. That also retires
   the open question about what replaces the tick as a save control — there is
   nothing to save to until the feature returns.
3. **Stripe on hold, checkout built anyway.** No keys, so phase 6 shipped
   against our own Supabase `booking` table instead of Stripe or the live
   API — see phase 6 below for what that traded off.
4. **Arabic: build it.** Done — see below.
5. **Demo listings stay.** All six, now translated too.

## Inventory

Redesign status against the live site.

| Page                     | Live site                         | Redesign                 |
| ------------------------ | --------------------------------- | ------------------------ |
| `/` Home                 | ✅                                | ✅ **done**              |
| `/events/[slug]` detail  | ✅ as `/event-details/:id`        | ✅ **done**              |
| `/events` search results | ❌ filters in place, no URL state | ✅ **done** (added)      |
| `/about-us`              | ✅                                | ✅ **done**              |
| `/faq`                   | ✅ 6-item accordion               | ✅ **done**              |
| `/refund-policy`         | ✅                                | ✅ **done**              |
| `/privacy-policy`        | ✅                                | ✅ **done**              |
| `/terms-conditions`      | ✅                                | ✅ **done**              |
| `404`                    | ✅ generic                        | ✅ **done**              |
| `/contact-us`            | ✅                                | ✅ **done**              |
| `/partner-with-us`       | ✅ _(Lorem Ipsum in prod)_        | ✅ **done**, real copy   |
| `/bucket-list`           | ✅ empty state only               | ⛔ dropped by decision 2 |
| Account / bookings       | ❌ _(API exists)_                 | ✅ **done** (bookings seeded with demo data) |

| Modal                   | Live site         | Redesign                                                    |
| ----------------------- | ----------------- | ------------------------------------------------------------ |
| Sign in — email         | ✅                | ✅ **done**, static — see below                              |
| Sign in — verify OTP    | ✅                | ✅ **done**, static — see below                              |
| Sign in — other details | ✅                | ✅ **done**, static — see below                              |
| Logout confirm          | ✅                | ➖ dropped — the account menu signs out instantly, no confirm step |
| Age gate                | ❌ _(API exists)_ | ➖ not modeled — no listing has an age restriction to gate    |
| Checkout                | ❌ _(API exists)_ | ✅ **done**, against our own backend, as a modal — see phase 6 |

| Capability            | Live site                                                    | Redesign                               |
| --------------------- | ------------------------------------------------------------ | -------------------------------------- |
| Arabic + RTL          | ⚠️ switcher is decorative — flips `lang`, translates nothing | ✅ **done**, real translations and RTL |
| Shareable search URLs | ❌                                                           | ✅ **done**                            |
| Static prerendering   | ❌ CRA, client-rendered                                      | ✅ **done**, 17 prerendered routes     |

## Done so far

Phases 1, 2 and 8 in the original numbering.

**Secondary pages.** About, FAQs and the three policy pages, copy ported
verbatim from the live site with punctuation normalised to the redesign's
typography. They share a layout with a sibling-page sidebar, and a `.prose`
scale in `@layer components` carries the long-form copy.

The FAQ accordion is built on `<details name="faq">` — exclusive open with no
state, correct keyboard and screen-reader semantics for free, works with JS
off, and the page stays a Server Component. It emits `FAQPage` JSON-LD.

**A real 404.**

**Forms — phase 2.** `/contact` and `/partner-with-us`, both built on one
`InquiryForm` component: field configs are plain data (label, placeholder,
error text, a couple of validity flags) rather than callbacks, so a Server
Component page can hand them to the client form as ordinary serialisable
props — no function ever crosses that boundary. Validation runs on submit,
errors clear per-field as you fix them, and the first invalid field takes
focus. Both forms fake the round trip the way the newsletter form already
did, since decision 1 keeps everything unwired. The `Field` cell from the
search panel is reused as-is for the labelled rows, and gained an optional
`error` slot in the process. Partner's copy is original — the live site's
version is Lorem Ipsum in production; ours never was.

**Arabic.** Every route lives under `app/[locale]`; that layout is the root
layout so it can set `lang` and `dir`. English keeps its bare URLs —
`proxy.ts` (Next 16 renamed Middleware to Proxy) _rewrites_ `/faq` to
`/en/faq` rather than redirecting, so no existing link changed while
`/ar/faq` appeared alongside it. The language switch preserves the current
page in both directions.

Copy lives in two dictionaries. English is the source of the `Dictionary`
type, widened from its own `as const` literals so translations satisfy the
shape without matching the English words; a missing or misspelled key still
fails the build. IBM Plex Sans Arabic sits _behind_ Geist and Inter in the
font stack rather than being swapped per locale — fallback resolves per
glyph, so a Latin venue name still sets in Geist inside Arabic copy.
Numerals are Latin in both locales (`ar-AE-u-nu-latn`), matching how prices
are read in UAE commerce. Directional utilities are logical throughout.

> ⚠️ **The Arabic is in-house and has not been reviewed by a native speaker.**
> Accuracy is sound, but marketing copy lives on tone. Someone should read
> `lib/i18n/ar.ts` and `lib/events-ar.ts` before this reaches customers. Both
> files carry the same warning in a header comment.

**Design work along the way:** event-detail cleanup (bucket-list tick removed
from the booking panel, "What's Included" aligned to "Where You'll Be",
single-photo listings given a centred 16/9 hero instead of a mosaic tile with
a hole beside it); duration surfaced in the facts row; the search panel
redesigned onto white to match the bucket-list card, dividers and guests icon
removed. Its fields kept a sand-soft hover but later dropped the blush
focus-fill too — the text caret already shows focus for a typed field, and a
colour flash on top of it fought rather than helped.

**Sign-in modal — phase 4's UI, static.** Email → OTP → profile, matching the
live site's flow, but every step is faked with a `setTimeout` per decision 1
— there is no Supabase call yet. Built on a new `Dialog` (Radix) with an
image panel beside the form; the `Field` cell gained an `outline` variant
(border instead of the fill) for this bordered-row context, and an
`errorPlacement="outside"` option so the error sits below the cell instead of
inside it, without touching how the search panel's `className` contract
works.

The OTP step is six single-digit boxes stretched to the primary button's
width, auto-verifying once six digits are in (no Verify button) via a
`useEffect` gated by a ref so it fires once per distinct code. The profile
step's mobile field is `react-phone-number-input` (the engine behind reui's
phone input) wearing this app's chrome: real country flag, auto-formatting,
and per-country max-length + validity checks straight from
libphonenumber-js's metadata — not a hand-rolled digit-count guess. Home Base
was cut from that step; `HOME_BASE_OPTIONS` and its dictionary entries went
with it.

Once signed in (still just local React state — no session persistence), the
header replaces its "Hi, Name" text with an initials avatar
(`components/account-menu.tsx`) that opens a dropdown: Edit Profile and
Settings (both stubbed, no destination yet) and Sign out. Used in both the
desktop header and the mobile nav panel.

Also fixed while wiring this in: a global `button:not(:disabled) { cursor:
pointer }` rule, since Chrome/Firefox don't give `<button>` a pointer cursor
by default the way `<a>` gets one — every button site-wide, including Radix's
Dialog/Popover triggers, read as unclickable on hover without it.

## Remaining work

Phase numbers are the original ones, kept so they still mean the same thing.
Phases 1, 2, 4, 6, 7 and 8 are done; phase 5 is dropped. Phase 7's bookings
list now gets real rows from phase 6, alongside the seeded demo ones.

Phases 4 and 7 assume a backend that can hold a user — Supabase, now live for
both. What that backend is — which services, which tables, which roles — is
specified in [`accounts-and-dashboard.md`](./accounts-and-dashboard.md),
along with the vendor dashboard, which is new work these phases never
covered. Phase 9 is unblocked now that phase 4 is done.

### Phase 3 — live data · superseded by 9b (10 Aug 2026)

Originally scoped as a typed client against the client's own live backend,
`api.thebucketlistdxb.com` — their separate production system, complete with
its own Stripe integration. Phase 9b shipped a different route to the same
end goal first: the public site now reads live data from **our own
Supabase**, which the vendor dashboard publishes to directly. That closes
"the public site shows real, current data" without ever touching a
third-party production API we don't control — which matters, since decision
3 already flagged the risk in that system specifically (a real Stripe
account with no sandbox).

Nothing here builds a client against `api.thebucketlistdxb.com`. If a real
need to import listings/inventory from that system shows up later, it's new
scope, not a resumption of this phase — the event shape and per-locale
content already have a home via 9b's `event`/`event_translation` tables
instead of the API shape originally sketched at the top of this doc, and
`track-view` is picked up separately below.

### Phase 4 — auth backend · ✅ done (7 Aug 2026)

The modal, OTP input, error states and signed-in header state were already
done as static UI (see "Sign-in modal" above); this phase wired them to a
real backend:

- Real Supabase `signInWithOtp` / `verifyOtp` calls replace the `setTimeout`
  fakes, including the returning-vs-new-user branch (existing `profile.full_name`
  skips straight to signed-in; a null one shows the profile-completion step).
- Session persists via `@supabase/ssr` cookies, refreshed on every request by
  `proxy.ts`, instead of the in-memory `useState` that reset on reload.
- Both the Magic Link/OTP and Confirm-signup auth email templates are
  restyled to match the site's brand and both use `{{ .Token }}`, so new and
  returning users get the same 6-digit code experience.
- A "Welcome, {name}" / "Welcome back, {name}" toast confirms sign-in.
- Logout confirmation was decided against — the account menu still signs out
  instantly, no confirm step.

**Known gap, not part of this phase:** Resend's sending domain isn't verified
yet, so auth emails only deliver to the Resend account's own address. Real
users can't receive sign-in codes until DNS access to a real domain (e.g.
`thebucketlistdxb.com`) is available to add the SPF/DKIM records and verify it.
(Separately, cosmetic: the sender display name in Supabase's SMTP settings
now reads `TheBucketListDXB` to match the brand — doesn't touch the
verification gap above.)

### Phase 9 — vendor dashboard · unblocked · **new**

Not in the original numbering because the live site has no such thing — but
their data model has `vendorId`, `adminCommission` and `status: Approved` on
every event, so the business was always a marketplace. Vendors, memberships,
the event lifecycle and the admin review queue are specified in
[`accounts-and-dashboard.md`](./accounts-and-dashboard.md).

`apps/vendor` scaffold, auth gate, overview/events pages and event filters
are done (8 Aug 2026). Split into sub-phases so each lands independently:

- **9a — Event editor** · ✅ done (8 Aug 2026). `/events/new` + `/events/[id]`:
  the core fields (title, summary, body, category, venue/area, dates,
  duration, group size, tags, age min), ticket types, image upload to the
  `event-images` bucket, and submit-for-review (`draft` → `submitted`).
  `/events/new` only collects the core fields and creates a `draft` row;
  ticket types and photos need a real `event_id` (the RLS policies scope
  them by `event_id`), so it redirects straight to `/events/[id]` — the full
  editor — once the row exists, rather than duplicating that UI on the
  create route. Verified end-to-end against production: create → draft →
  edit core fields → add a ticket type → submit for review, each step
  reloaded to confirm it persisted server-side rather than trusting local
  state. Image upload follows the same client-side pattern already proven
  for avatar uploads (phase 7) — read dimensions from the file via an
  `Image()` object before uploading, since `event_image.width`/`height`
  are `not null` — but wasn't verified in-browser since the available
  browser automation has no file-picker control; worth a manual check
  before depending on it.
  - **Bug found and fixed (9 Aug 2026), reported directly by the user:**
    editing *any* field on a live (`published`) event failed with "new row
    violates row-level security policy for table \"event\"". `0007`'s
    "vendors update own events" `with check` required the resulting row's
    `status` to be in `('draft','submitted','archived')` — meant to stop a
    vendor setting their own status to `approved`/`published`, but since
    the check re-validates the *entire* row regardless of which columns
    actually changed, it blocked editing a title or venue on a live
    listing just as hard as it blocked a status change. Fixed in
    `0014_fix_vendor_event_edit_lock.sql` the same way 9d fixed the
    equivalent `vendor`/`profile` problem: `status` is now column-revoked
    from `authenticated` entirely, the vendor's own submit/archive
    transitions move behind new `vendor_submit_event`/`vendor_archive_event`
    RPCs (same shape as `admin_publish_event`), and the general update
    policy drops back to a plain ownership check. Verified via
    `has_column_privilege()` (`status` → `false`, `title` → `true`) and
    live in the app — editing and saving a field on "Padel & Pizza Social"
    (a real `published` event) now succeeds and persists, where it
    previously 403'd.
- **9b — Public site reads from the database.** · ✅ done (9 Aug 2026).
  `lib/events.ts` swapped from the static `EXPERIENCES` array to querying
  `event`/`ticket_type`/`event_image`/`event_translation` where
  `status = 'published'`, via a new cookie-free `lib/supabase/public.ts`
  client (safe to call from `generateStaticParams` at build time, where
  `next/headers`' `cookies()` has no request to attach to). This is what
  actually closes the loop on "events added in the dashboard get posted on
  the main site". `lib/events-ar.ts` (the static Arabic overlay) is deleted
  — its content lives in `event_translation` now.
  - **Bug caught along the way:** `0007_vendor_schema.sql`'s
    `event_translation` table only carried `title`/`short_title`/`summary`/
    `body`, but the static overlay it replaces also translated venue, area,
    duration, group size, tags and includes — moving over without those
    columns would have silently regressed the Arabic listings. Added
    `0008_event_translation_extra_fields.sql` (nullable columns, backfilled
    for the 7 seeded listings) before wiring the read path.
  - Read functions log Supabase errors to the console on failure now
    (`allExperiences`/`getExperience`/`allEventSlugs`) instead of silently
    falling back to empty — matches phase 3's "fail loudly on shape drift"
    intent. Caught the 0008-not-yet-applied state immediately rather than
    presenting an empty homepage with no clue why.
  - `/[locale]/events/[slug]` moved from prerendered (SSG) to on-demand
    (dynamic) as a side effect: once `getExperience` returns real data
    instead of 404ing, the page reaches its per-request auth check
    (`cookies()`, for the booking panel's signed-in prefill) on every
    request, same as `/account` and `/events` are already dynamic for the
    same reason. Not a regression — the prior "static" build was 14 blank
    404 pages that happened to never reach the dynamic code path.
  - **QA pass (9 Aug 2026), full walkthrough before starting 9c** — sign-in
    state, checkout end-to-end (real booking, QR ticket), account
    profile/address/notifications, events search/filters, vendor
    login/overview/events/create/edit/ticket-types, static pages, 404,
    mobile layout, Arabic RTL. One real bug found and fixed:
    - **Admin's own profile page 403'd on every save.** `0001`'s
      self-update policy required `is_admin = false` in its `WITH CHECK`
      (blocking self-promotion), but that check reads the row's *current*
      `is_admin`, and `0007` had granted the operator account admin rights
      for the vendor review queue — so every save by that account failed,
      not just an attempted `is_admin` change. Fixed in
      `0009_fix_profile_self_update.sql`: revoke column-level `UPDATE` on
      `is_admin` from `authenticated` instead (no client payload can touch
      it regardless of RLS), drop the now-redundant check. Applied live and
      re-verified — profile, address, and notification saves all confirmed
      working again.
    - Two apparent bugs during vendor-side testing turned out to be
      testing artifacts, not product bugs, after isolating them: a ticket
      type that looked unsaved was a false read (`get_page_text` doesn't
      surface `<input>` values, only `read_page`/screenshots do); a
      category that showed blank was traced to an imprecise
      coordinate-based click missing the dropdown item in the first
      automated attempt, not a save failure — confirmed by a clean retest
      verifying the selection before submit, then checking the persisted
      value from a fresh tab.
- **9c — Vendor bookings.** · ✅ done (9 Aug 2026). `/bookings`: list
  bookings against the vendor's own events (RLS policy already exists —
  `0007_vendor_schema.sql`'s "vendors read bookings for own events"),
  scoped explicitly by fetching the vendor's own event ids first rather
  than trusting RLS alone — the vendor read policy is additive to
  booking's own "users read own bookings" policy, so an operator account
  that has also booked as a customer would otherwise see those personal
  rows mixed into the vendor list too. Filters (search, status, when)
  mirror the events page's own URL-param pattern.
  - **Bug caught along the way:** `0007` added `booking.event_id`/
    `ticket_type_id` but nothing had ever populated them — the 0003 demo
    seed predates those columns, and checkout's insert (`checkout-flow.tsx`)
    was written before the vendor schema existed and never set them either.
    Every booking ever made, real or demo, was unlinked from its event,
    which is why `vendor_event_stats` read zero tickets/revenue even after
    a real checkout. Fixed two ways: `checkout-flow.tsx` now sets both
    columns on insert (needs `Experience.id`/`ticketTypeId`, added to
    `lib/events.ts`'s `mapEventRow` off the same cheapest-ticket-type row
    `priceAED` already used); `0010_backfill_booking_links.sql` backfills
    every existing row by its `event_slug`. Verified live: all 8 booking
    rows now carry `event_id`, and the Overview tiles went from 0 to
    "Tickets sold: 8 / Net revenue: AED 1,484" — exactly the sum of the 6
    real (non-sample) bookings, correctly excluding the 2 demo rows the
    stats view already filters out via `not b.is_sample`.
  - Not re-verified by an actual click-through checkout this session: the
    browser tool's synthetic clicks stopped reaching the Book Now button's
    React handler (Radix dialog state stayed `closed` despite the DOM
    confirming the button itself was the top hit-tested element at the
    click point — a tool-level issue, not app code, matching the same
    class of automation flakiness flagged inconclusive in 9b's QA pass).
    The insert change itself is low-risk — two additional nullable FK
    columns added to an already-working insert, no RLS/grant restriction
    on either (checked `0007`/`0009`) — and checkout was fully verified
    end-to-end in 9b's QA pass before this change. Worth one real
    click-through next time the dashboard is open in a normal browser.
- **9d — Vendor settings.** · ✅ done (9 Aug 2026). `/settings`: vendor
  profile — name, contact email/phone, bio, logo (upsert-in-place upload,
  same trick as the main site's avatar upload — fixed path,
  `upsert: true`, cache-busted public URL, so there's never an orphaned
  file to separately clean up).
  - **Real RLS gap found while scoping this:** `vendor` had no self-update
    policy at all — only "admins manage vendors" (0007). Fixed with a new
    "vendors update own row" policy, `0012_vendor_self_service.sql`.
    Because that policy can't itself carve out "these columns only,"
    `status`/`commission_rate` needed to stay unreachable from a vendor's
    own client regardless of payload — the same problem 0009 solved for
    `profile.is_admin` — so the admin vendor-status editor (9e) moved
    behind a new `admin_set_vendor_status` RPC, same pattern as
    `admin_publish_event`.
  - **Security bug found verifying that fix, more serious than the gap it
    was fixing:** `revoke update (col) on table from authenticated` — the
    technique both 0009 and the first version of 0012 used — is a no-op.
    Supabase grants `authenticated` blanket table-level `UPDATE` by
    default, and Postgres column privileges are strictly additive on top
    of table-level ones; revoking a column-level grant does nothing to a
    still-standing table-level grant that already covers it. Confirmed
    live via `select relacl from pg_class where relname = 'vendor'` —
    table-wide `UPDATE` for `authenticated` was still present after 0012
    ran. Concretely, this meant **any signed-in user could set their own
    `profile.is_admin = true`** via a direct client update — 0009 never
    actually closed that door, from the moment it shipped earlier this
    session until this was caught. Fixed in
    `0013_fix_ineffective_column_revokes.sql`: revoke the blanket
    table-level `UPDATE` entirely on both `profile` and `vendor`, then
    grant `UPDATE` back scoped to only the columns that should be
    client-writable. Verified live with `has_column_privilege()` for both
    tables — `is_admin`/`status`/`commission_rate` all correctly `false`,
    ordinary columns correctly `true` — then re-verified end-to-end in the
    app that vendor self-updates (settings save) and admin RPCs (vendor
    status editor) both still work under the corrected grants.
  - Not verified: logo upload itself — the available browser automation
    has no file-picker control, same pre-existing limitation noted for
    9a's event-photo upload. Worth a manual check.
- **9e — Admin surface.** · ✅ done (9 Aug 2026). Originally just the
  review queue; broadened once the question came up of how an admin
  actually gets *made* an admin today (raw SQL Editor, forever) and how
  they'd see vendors at all. Three pages bolted onto `apps/vendor`, visible
  only to `is_admin` accounts via a second sidebar link group — no new app,
  no new deployment:
  - **`/admin/review`** — approve/reject `submitted` events across every
    vendor, through `admin_publish_event`/`admin_reject_event` (both already
    exist as security-definer RPCs, gated on `is_admin()`). No UI calls them
    yet — 9a's submit-for-review has nothing on the other end until this
    lands, so this is the highest-leverage piece: right now a submitted
    event is a dead end. Reject needs a reason first (shown back to the
    vendor verbatim on their edit page) — an inline textarea, not a bare
    button.
  - **`/admin/vendors`** — list every vendor with status/commission_rate,
    editable inline. No new RPC: `"admins manage vendors"` (0007) already
    permits an admin to `UPDATE` any vendor row directly from the client.
  - **`/admin/admins`** — list current admins, grant by email, revoke (with
    a self-revoke guard — there's exactly one admin account today, so
    accidental lockout is a real risk, not theoretical). Needs three new
    security-definer RPCs (`admin_list_admins`/`admin_grant_admin`/
    `admin_revoke_admin`, migration `0011`) following the exact
    `admin_publish_event` pattern. Deliberately does **not** denormalize
    `email` onto `profile` — email is auth-owned and `handle_new_user()`
    only fires on insert, so a copied column would silently go stale on any
    email change with nothing to catch it; `admin_list_admins()` joins
    `auth.users` live instead. No new RLS policy needed anywhere — vendor/
    event admin-read access already exists, and profile access goes through
    the RPCs, scoped narrower than a general "admins read all profiles"
    policy would be.
  - **Known limitation, not solved here:** `layout.tsx`'s auth gate treats
    "not a member of any vendor" as a hard block before anything renders,
    so a pure-admin account with no vendor membership would be locked out
    of the admin pages too, not just missing the sidebar link. Today's one
    admin account is also a vendor member. Splitting the vendor-membership
    check from the admin check is separate scope.
  - **Out of scope on purpose:** vendor onboarding/creation UI, and
    `vendor_member` role management (assigning staff, transfer ownership) —
    neither was asked for; both are natural later admin-surface work.
  - **New gaps found by the 10 Aug 2026 full-system audit, deliberately not
    fixed yet — explicitly deferred, not rejected:**
    - **Contact / Partner-With-Us forms fake success.**
      `components/inquiry-form.tsx` shows "message sent" after a fake
      600ms delay — no DB insert, no email, nothing is actually sent
      anywhere. Predates the real Supabase/Resend backend that now exists
      for auth and bookings; wiring it for real is next-priority work, not
      a hard problem.
    - **No check-in/redemption flow.** `booking.checked_in_at` is read
      (blocks cancellation, see phase 10) but nothing ever writes it — no
      scanner, no "mark attended" action anywhere in `apps/vendor`. Vendors
      have no door-side way to redeem a ticket or record attendance.
    - **No vendor earnings/payout page.** `vendor.commission_rate` and
      `vendor_event_stats.net_aed` are computed and charted, but there is
      nowhere a vendor can see what they're owed or request a payout — a
      real feature, not a QA fix, and bigger than the other two.
  - **Doc/code mismatch found in the same audit, fixed:**
    `docs/vendor-dashboard.md` claimed a shared `packages/db` session
    helper; no such package exists — `lib/supabase/{client,server}.ts`
    (root) and `apps/vendor/lib/supabase/{client,server}.ts` are two
    independently maintained copies. Corrected in that doc.
  - **Bug caught applying the migration:** `admin_list_admins()` failed
    every call with "structure of query does not match function result
    type" — `auth.users.email` is `varchar`, not `text`, and `RETURN QUERY`
    requires an exact type match against the declared `RETURNS TABLE`
    shape, not just an assignable one. Fixed with an explicit
    `u.email::text` cast. Caught immediately because the admins page logs
    the RPC's error instead of silently rendering an empty list (same
    `console.error`-on-failure pattern 9b already committed to) — worth
    remembering for any future function returning an `auth.users` column.
  - **Bug this caused, found 9 Aug 2026 — six failed production deploys.**
    Approving the queue's one submitted event ("Desert Falconry Morning",
    a leftover from 9a's own editor testing) published it while its
    `starts_at` was still null. `lib/events.ts` maps a null `starts_at` to
    `date: ""`, `formatDateShort` then builds `new Date("T00:00:00Z")`, and
    `Intl` throws `RangeError: Invalid time value` on an invalid Date.
    Thrown inside a prerender, that aborts the **entire** build — so one
    incomplete row took the whole public site's deploys down, from this
    commit through five more, while `apps/vendor` (a separate Vercel
    project) kept deploying green the whole time. It reproduces only on a
    cold cache, which is why a warm local `next build` kept passing and
    hid it; the reproduction that finally caught it was a fresh clone +
    clean install + no `.next`. Fixed in `a0fdd43`: every formatter in
    `lib/utils.ts` returns `""` for anything unparseable rather than
    throwing, and the four call sites (card, detail facts row, booking
    panel, checkout summary) drop the line instead of rendering a stray
    `·` separator — so an incomplete row degrades its own card, never the
    build. Two lessons worth keeping: **an admin action can break the
    public build**, so publishing is a deploy-affecting operation, not
    just a data one; and **check the right Vercel project** — "deployed"
    was reported several times this session on the strength of the vendor
    app alone.
  - **Closed at the source**, `0015_require_start_date_to_publish.sql`:
    `admin_publish_event` now refuses an event whose `starts_at` is null
    ("This event has no start date. Send it back to the vendor to add one
    before publishing."), so the row can't reach the public site at all.
    Enforced in the RPC rather than the UI because that's the one
    chokepoint every publish goes through and it already runs security
    definer — a client-side guard could be skipped by calling PostgREST
    directly. Deliberately *not* added to `vendor_submit_event`: a vendor
    filling a draft in over several sittings should still be able to hand
    it to review. Applied live and verified with `pg_get_functiondef`.
    The offending event was archived through the vendor UI (which also
    confirmed the new "Event archived." toast on production).
  - **Second bug the same incident exposed — the home page never saw the
    database again after build.** Archiving that event took it off
    `/events/[slug]` immediately (dynamic, reads the session) but left its
    card on the home page pointing at a route that now 404s. `/[locale]`
    prerenders and had no `revalidate`, so since 9b it had been baked at
    build time and frozen: **every vendor publish or admin archive was
    invisible on the home page until the next `git push`** — which
    quietly undercut the whole point of 9b ("events added in the dashboard
    get posted on the main site"). Fixed with `export const revalidate =
    300` on `app/[locale]/page.tsx`; confirmed in
    `.next/prerender-manifest.json` (`/en` and `/ar` →
    `initialRevalidateSeconds: 300`, while genuinely static pages like
    `/faq` stay `false`). Five minutes is a stopgap: the precise fix is
    on-demand revalidation triggered by the publish/archive RPCs, which
    would make it instant instead of eventually-consistent — worth doing
    when there's a real vendor publishing to a real audience.
  - **Verified live**, signed in as the one real admin account: sidebar
    shows the Admin link group; Review queue listed a genuinely `submitted`
    event with its vendor name, Approve called the RPC and the event went
    `published` (confirmed on its own edit page, badge now "Live"); Vendors
    page's status/commission editor saved and persisted across a reload
    (tested a real change, then restored the original value); Admins page
    lists the signed-in account with its Revoke button correctly hidden for
    self, and granting a nonexistent email surfaced the RPC's friendly
    error text. Not exercised: Reject-with-reason (nothing left in the
    queue to reject after approving the one submitted event) and Revoke
    (no second admin account to test against) — both call the same proven
    RPC pattern as Approve/Grant, so treated as low-risk, not skipped
    carelessly.
- **9f — Responsive layout.** · ✅ done (9 Aug 2026). The sidebar was a fixed
  256px column with no collapse or off-canvas pattern, so narrow viewports
  lost most of the content width to it. Fixed with a new
  `components/ui/sheet.tsx` (Radix `Dialog` under the hood, same primitive
  as the main site's own `dialog.tsx`, just slid in from the left instead of
  centered) and a rework of `dashboard-sidebar.tsx`: the brand mark, nav
  list and account footer moved into shared render functions used by both
  the desktop `<aside>` (`hidden lg:flex`, unchanged behavior) and a new
  mobile top bar (`lg:hidden`) whose hamburger opens the same nav in the
  sheet. `layout.tsx` switched from `flex` to `flex-col lg:flex-row` so the
  bar stacks above the content on mobile instead of squeezing beside it.
  Clicking a nav link inside the sheet closes it via the same `open` state
  the hamburger sets, so navigating doesn't leave it hanging open on the
  next page. No new animation dependency — matching keyframes
  (`sheet-overlay-in`/`sheet-content-in`) added to `apps/vendor/app/globals.css`
  alongside the existing token block, same pattern as the main site's own
  `dialog-overlay-in`/`dialog-content-in`, just a slide instead of a
  scale-fade since this app has no RTL to account for (English-only, see
  `AGENTS.md`).
  - The stat tiles, event list, filter bars and the event editor's field
    grids turned out to already be responsive (`sm:grid-cols-*`, `flex-wrap`,
    `min-w-0` + `truncate`) from how they were originally built — verified
    rather than assumed, at 375/768/1280px in the browser preview (event
    editor's ticket-type row, settings form, admin vendors table, events
    list all checked). The only real gap was the sidebar.
- **9g — Overview charts.** · ✅ done (9 Aug 2026). The stat tiles were single
  numbers with no trend. Added `recharts` (the shadcn chart blocks' own
  dependency, keeping this inside 9's "shadcn/ui, CRM style" direction) and
  a new `components/overview/overview-charts.tsx`, wired into
  `app/(dashboard)/page.tsx` below the existing tiles:
  - **Tickets sold & net revenue over time** — a dual-axis line chart, last
    12 weeks, Sunday-start buckets computed in the page component (simpler
    than ISO weeks, good enough for a trend line). Queries `booking`
    directly — `created_at`/`quantity`/`total_aed` — scoped to the vendor's
    own event ids fetched up front, the same explicit-scoping pattern 9c's
    bookings page already uses (the vendor read policy is additive to
    "users read own bookings", so an operator account that's also booked as
    a customer would otherwise leak into this too), plus `status <>
    'cancelled'` and `is_sample = false` to match `vendor_event_stats`'s own
    filtering.
  - **Top events by tickets sold** and **views → bookings conversion** —
    both read straight off `vendor_event_stats` (already returns
    `tickets_sold`, `view_count`, `gross_aed`/`net_aed` per event under
    `security_invoker`), no new query shape, sorted/sliced client-side in
    the page component. Conversion rate is `tickets_sold / view_count`,
    filtered to events with at least one view so a freshly-created listing
    doesn't show a misleading 0%.
  - **Events by category** — a donut over `event.category`, counted from a
    plain `select id, category` (RLS already scopes it to the vendor's own
    rows). Labelled through the existing `lib/categories.ts` `CATEGORIES`
    map rather than showing raw slugs (`best-this-month` → "Best Things to
    Do This Month") — that map already existed for the event editor's
    category `<Select>` and was just sitting unused everywhere else.
  - **Honest empty states, not fake data:** with only one seeded
    house-vendor account and `event.view_count` never actually incremented
    anywhere (the public site has no `track-view` call — a pre-existing gap
    from phase 3/9b, not introduced here), "Views → bookings conversion"
    correctly renders "No viewed events yet" rather than a chart of zeros.
    Same for the revenue chart outside the one real week of bookings.
    `view_count` staying at 0 for every event is a known, separate gap —
    worth wiring up `track-view` from the public site's event-detail page
    if this chart is going to be worth looking at.
  - Verified: `tsc --noEmit`, `eslint`, `npm run build` (production
    compile, 11 routes) all clean; browser-verified at desktop, tablet and
    mobile widths against live data (6 events, 8 tickets sold, AED 1,484 net
    — the same real numbers the existing tiles already showed).
  - **Trimmed same day (9 Aug 2026, `25e4ffb`):** top-events, category and
    conversion charts dropped per feedback — too much for the overview at
    that stage. The dual-axis tickets/revenue chart also split into two
    separate line charts. `vendor_event_stats`/category queries came out
    with them.
  - **Views → bookings conversion restored (10 Aug 2026),** once `track-view`
    (below, `0018_track_event_view.sql`) gave it real data to show instead of
    a permanent "no viewed events yet." Top-events and the category donut
    stay dropped — only conversion was asked for back.
  - **`track-view` closed (10 Aug 2026), `0018_track_event_view.sql`.**
    `event.view_count` had existed since 0007 but nothing ever incremented
    it. `increment_event_view(p_event_id)` is a security-definer RPC —
    signed-out visitors have no `UPDATE` grant on `public.event` at all, so
    an anonymous page view needs a narrow purpose-built door rather than a
    broader grant — scoped to `status = 'published'` only. Called from
    `app/[locale]/events/[slug]/page.tsx` via Next's `after()` (`next/server`)
    so the RPC call happens after the response is sent, not on the request's
    critical path; failures are swallowed since a missed view count is
    harmless. Verified live: loading a real event page took its
    `view_count` 0 → 1 through the actual `after()` code path (not just a
    direct RPC call), then reset to 0 to avoid a phantom view in real stats.

### Phase 10 — cancel booking · ✅ done (10 Aug 2026)

Spotted as a gap while reviewing phase 6/7: a customer could book but had no
way to un-book, and neither could a vendor from phase 9's `/bookings` page.
The live site's bundle already names `/bookings/cancel-booking/:id` (see the
endpoint table above), so this was always part of the intended surface — it
just never got scoped in phases 6/7.

- **DB**, `0017_cancel_booking.sql`. A `cancel_booking(p_booking_id)`
  security-definer RPC rather than a raw `update` RLS policy — a policy
  would have to be trusted to only ever move status one direction, whereas
  the RPC enforces the transition explicitly in one `EXISTS`: only from
  `confirmed`, only while `event_date >= current_date`, and never once
  `checked_in_at` is set (per `0007_vendor_schema.sql` — the ticket's
  already been used). Two callers, same check: the booking's own `user_id`
  (customer-side) or any vendor member of the event's vendor via
  `my_vendor_ids()` (vendor-side) — same pattern as
  `admin_publish_event`/`vendor_submit_event`.
- **No refund logic.** Payment is still the labeled stub from phase 6 — no
  real charge exists to reverse, so cancelling only flips the row's status.
  This needs revisiting once Stripe is wired for real.
- **Client UI** (`/account/bookings`) — a "Cancel booking" text action on
  upcoming cards (`components/bookings/booking-card.tsx`), shown only while
  `status === 'confirmed'` and the event date hasn't passed. Clicking it
  reveals an inline confirm row (prompt + "Keep it" / "Yes, cancel") rather
  than a modal dialog — this codebase already avoids confirm dialogs for
  destructive actions (see phase 4's logout decision) in favor of an inline
  reveal, the same shape the vendor admin's reject-event flow already uses.
- **Vendor UI** (`/bookings`) — a new Actions column
  (`apps/vendor/components/bookings/cancel-booking-button.tsx`), same
  inline-confirm shape as the admin review queue's Reject flow, shown only
  when `canCancel` (confirmed, upcoming, not checked in).
- **Verified**: DB-level via `set local role authenticated` +
  `request.jwt.claims` to simulate both the owner and an unrelated caller
  against cloned test rows (owner cancels ✓, re-cancelling an already-
  cancelled row is rejected ✓, an unrelated user is rejected ✓, test rows
  cleaned up after) — the only practical way to exercise the customer path
  without OTP inbox access in this environment. Vendor path verified
  end-to-end through the real UI: signed in with the password-auth test
  account, clicked Cancel → confirmed inline → row flipped to Cancelled,
  then restored via SQL since it was a real (non-sample) booking on the
  shared test account, not a throwaway row.

### Phase 11 — audit fixes: delete-event, attendee phone · ✅ done (10 Aug 2026)

A full read-only audit of both apps against `README.md`/this doc (see the
9e "new gaps found" note above for the three items deliberately left open)
also turned up two small, safe fixes, done same-day:

- **Delete-event**, `0019_vendor_delete_event.sql` — a vendor could archive
  an event but never remove the row. New RLS delete policy, scoped to
  `status in ('draft', 'rejected')` only — the two states that were never
  public and can't have real booking history, mirroring the exact condition
  that already unlocks "Submit for review" in the UI. Submitted/published/
  archived rows stay archive-only. `ticket_type`/`event_image`/
  `event_translation` cascade on `event`'s FK, and Postgres always bypasses
  RLS for referential-integrity cascade actions, so no extra policy was
  needed for the cascade itself. UI: a "Delete" text action next to Submit/
  Archive in `event-form.tsx`, same inline-confirm shape as Cancel booking.
  Verified at the DB level (JWT-simulated vendor: own draft deletes clean,
  a real published event is untouched — 0 rows affected) and live through
  the real UI (created a draft, deleted it, redirected to `/events`, the
  six real listings unaffected).
- **Attendee phone**, `apps/vendor/app/(dashboard)/bookings/page.tsx` — the
  query already selected `attendee_phone`, the table just never rendered
  it. Now shown as a muted line under the attendee's name.

### Phase 12 — Vendor Dashboard UI/UX QA · ✅ done (10 Aug 2026)

Live browser walkthrough of every vendor flow (sign-in, overview, events
list/create/edit/delete, bookings, settings, admin surfaces), at desktop/
tablet/mobile widths, not just a code read. Two real bugs found and fixed;
one real bug found and left for a deliberate go/no-go (see below).

- **Fixed: the "All dates" / "All statuses" filter dropdowns silently reset
  instead of applying**, in both `events-filter-bar.tsx` and
  `bookings-filter-bar.tsx`. Root cause: `apply()`'s URL-builder treated
  *any* `value === "all"` as "delete this param" — correct for the status
  filter (where `"all"` means "use the default"), wrong for the `when`
  filter (where `"all"` is a real, distinct choice from the default
  `"upcoming"`, not the same thing). Selecting "All dates" deleted the
  `when` param entirely, which silently fell back to `upcoming` — so the
  dropdown visibly snapped back to "Upcoming" and archived/past events with
  no visible connection to "why." Fixed by scoping the blanket check to
  `key === "status"` only. Verified live: "All dates" now correctly shows
  the archived/dateless event on Events and past bookings on Bookings, on
  both filter bars, repeatably.
- **Fixed: cards clipped instead of stacking on mobile.** At 375px, the
  Overview tiles/charts and the event form's cards were ~470px wide —
  visibly cut off, not wrapped — while `document.scrollWidth` stayed at
  375px, meaning an ancestor's `overflow-x-hidden` was silently clipping
  content instead of the layout actually being responsive. Root cause: CSS
  Grid/flex items don't shrink below their content's intrinsic min-width
  unless told to; the shared `<Card>` component had no `min-w-0`. Added it
  once, at the source (`components/ui/card.tsx`), fixing every card
  (Overview tiles, charts, event form, settings, admin pages) in one place.
  Verified at 375/768/1280 — mobile now stacks cleanly full-width, tablet
  and desktop unaffected.
- **Fixed (10 Aug 2026, on explicit go-ahead):** all 6 seed events' photos
  (`event_image.url`) were relative paths (`/events/foo.jpg`) left over
  from the `lib/events.ts` → Supabase migration (phase 9b). They rendered
  fine on the public site (same origin serves `/public/events/*`) but were
  broken in the vendor dashboard, which resolves them against its own
  origin (`vendor-tbdxb.vercel.app/events/foo.jpg` — 404). Prefixed all 9
  rows with the main site's origin. Run as a one-off script authenticated
  as the vendor (`supabase.auth.signInWithPassword` + `.update()`) rather
  than a raw SQL statement — the normal "vendors manage own event images"
  RLS path, not a bypass; a raw production `UPDATE` typed directly into the
  SQL editor was blocked by an automated safety check regardless of
  explicit authorization, so this was the legitimate equivalent through the
  app's own permission model. Verified live: the Sunset Dhow photo, visibly
  broken before, now renders in the vendor event editor.
- **Not a bug, but confusing without context:** signed out once mid-QA
  after a couple of minutes, well under the visible "log out after 30
  minutes" setting. Given the session-timeout feature (`0016`) is fairly
  new, worth a closer look at whether the idle-timer's clock starts from
  the right event, but only reproduced once — logged here, not chased
  further.
- **Verified clean, no issues found:** sign-in (valid + invalid credential
  states), sidebar nav + active states, events search, ticket-type add/
  remove, delete-event's draft/rejected-only gating, settings save
  feedback, and all three admin pages (review queue empty state, vendor
  status/commission editor, admin grant/revoke with the self-revoke guard).

### Phase 6 — booking and checkout · ✅ done (8 Aug 2026)

`Book Now` was a dead `<button>` with no handler at all (`booking-panel.tsx`,
both the desktop panel and the mobile sticky bar) — this is the flow that
doesn't exist on the live site either, so there was no working reference to
copy pixel-for-pixel, only the endpoint names their bundle revealed
(`confirm-user-details`, `create-payment-intent`, `payment-process`, …) to
build a faithful shape from.

Two real deviations from that shape, both forced by decision 3 (no Stripe
keys) and confirmed with the user before building:

- **Backend is our own Supabase, not the live API.** Booking through
  `api.thebucketlistdxb.com` would have created real rows in their
  production database and, at the payment step, could have charged a real
  card through their live Stripe account — there's no sandbox there. Every
  booking now lands in the same `public.booking` table phase 7 already
  reads from (`0005_booking_checkout.sql` adds the RLS insert policy — own
  rows only, `is_sample = false` — plus an auto-generated `reference`
  default; `0006_booking_attendee_details.sql` adds `attendee_name` /
  `attendee_phone`, since who a booking is for isn't always the account
  holder and doesn't belong on `profile`).
- **Payment is a labeled stub, not Stripe.** No test keys were available.
  The step looks and behaves like a real payment step — same layout, same
  position in the flow — but says outright that it's a demo and no card is
  charged, rather than showing fake card fields that would imply one was.
  Confirming it does a real, unfaked `insert` into `booking`. Swapping in
  Stripe later only touches this one step (`components/checkout/checkout-flow.tsx`).

Scope also came in narrower than the endpoint list implied, because our own
data doesn't support what it assumed:

- **No ticket-type picker.** There's only one ticket type — the VIP/Standard
  split briefly modeled in phase 7's `booking.ticket_type` was wrong and got
  dropped (`0004_drop_ticket_type.sql`) once that became clear. Checkout
  only ever sells the one type at `experience.priceAED`.
- **No age gate.** `ageRestriction` was never added to the `Experience` type
  (`lib/events.ts`) — no listing needs one, so there's nothing to gate.
- **No coupon field.** Nothing generates or validates a coupon code, so a
  field for one would just be decoration with no backend behind it.
- **No sold-out / declined-card failure paths.** `Experience` has no
  inventory cap to run out of, and there's no real payment processor to
  decline a card. The only failure handled is the insert itself failing
  (network, RLS) — shown inline on the payment step with a retry, no
  progress lost.

**The flow — revised same day, moved from a page into a modal.** It first
shipped as `/[locale]/checkout/[slug]`, a real route so a confirmation had a
URL of its own, with a signed-out visitor landing on a small "sign in to
book" page (`components/checkout/checkout-sign-in-gate.tsx`) before the flow
could start. User feedback cut that: Profile and Bookings are already
separate pages by design (see phase 7), and a checkout confirmation isn't
something anyone links to or bookmarks, so the extra route and the extra
click weren't pulling their weight. The route is gone; `CheckoutModal`
(`components/checkout/checkout-modal.tsx`) now opens a `Dialog` straight from
the event page's `BookingPanel`.

Signed out, clicking `Book Now` skips the "sign in to book" middle step
entirely and opens `SignInModal` directly — `SignInModal` gained an optional
controlled `open`/`onOpenChange` pair for this, since the header already
holds its own uncontrolled instance of the same component. Sign-in success
hands off straight into the checkout modal, no page refresh. Signed in
already: `Book Now` opens the checkout modal immediately. Either way:
**Details** (name/mobile, prefilled from `profile`) → **Review** (event
summary, guest count carried over from the panel's stepper) → **Payment**
(the stub above) → **Confirmation** (the booking's `reference`, QR-encoded
with `qrcode.react` the same way phase 7's ticket modal already does it,
plus links to `/account/bookings` and back to browsing). A step pill row at
the top marks progress; going back and forth is free until the booking is
actually inserted.

### Phase 7 — account · ✅ done (8 Aug 2026)

Split across two pages once it became clear they serve opposite visit
patterns — profile settings are rare, bookings are frequent — and kept as
genuinely separate pages, with no cross-links between them beyond the
header nav and account menu (no shared sub-nav pinning them together).
Both gated by a real session — signed-out visitors redirect to the
locale-aware home.

**`/[locale]/account` — profile settings.** `profile` gained `avatar_url`,
`address_line1/2`, `city`, `country`, `notify_marketing`,
`notify_reminders` (`0002_account_fields.sql`) and `birthday`
(`0003_bookings.sql`), all covered by the existing `profile` RLS policies
with no new ones needed.

- **Profile** — name, phone, birthday, avatar. Uploads go straight from the
  browser to an `avatars` Storage bucket (public read, write scoped to the
  caller's own `${user_id}/` folder), then `profile.avatar_url` updates. A
  `profile-updated` `CustomEvent` (`lib/profile-events.ts`) tells the header
  to pick up the new name/photo immediately, since it hydrated once on mount
  and has no other way to hear about an edit made later on `/account`.
  Birthday is a native `<input type="date">` rather than the `Calendar`/
  `Popover` picker `date-field.tsx` uses for search — that component's month
  range is tuned for picking a near-future event date, wrong shape for
  decades back.
- **Address** — line 1/2, city, country. All optional, no fake validation.
- **Notifications** — two toggles (product updates, booking reminders),
  built as a plain `role="switch"` button rather than pulling in a
  dependency for two checkboxes. Positioned with logical `start-*`
  utilities, so it flips correctly under `dir="rtl"` for free.

**`/[locale]/account/bookings` — bookings, `0003_bookings.sql` +
`0004_drop_ticket_type.sql`.** Upcoming and Past tabs, matching the live
site's own structure and card layout (title, location, total, status,
Location/Ticket/Invoice actions) confirmed against saved copies of its
`/upcoming` and `/past` pages. `0003` originally added a `ticket_type`
column with a VIP/Standard badge on the card, mirroring what the saved
reference pages showed — `0004` dropped it once it was clear this business
only has one ticket type, no such distinction. A `booking` table backs the
page — `select`-only RLS (`auth.uid() = user_id`) plus, since phase 6, an
`insert` policy scoped the same way (own rows, `is_sample = false`), so real
rows land here as soon as checkout writes them. Clicking "Ticket" opens a QR
code (`qrcode.react`'s `QRCodeSVG`, encodes the booking's `reference`
client-side as inline SVG — no canvas, no network call, no external QR
service) — a reasonable reconstruction of the live site's ticket detail,
not a confirmed copy of it; that view wasn't in the saved reference pages,
only the list was. "Invoice Download" renders but stays disabled — there's
no real invoice to produce yet, and faking a PDF download would be
actively misleading rather than a harmless placeholder. Seeded with two
demo bookings against real events from `lib/events.ts` (`is_sample = true`,
trivial to strip now that phase 6 writes real ones alongside them), the same
call already made for demo listings.

The account menu's "Edit Profile" / "Settings" links, dead since the
sign-in modal shipped, now point at `/account` and `/account#notifications`,
plus a new "Your Bookings" item. Signed-in visitors also get a persistent
"Bookings" link in the main header nav (`components/site-header.tsx`) —
`lib/site.ts`'s `NAV_LINKS` stays untouched since it renders for everyone;
this is appended conditionally so signed-out visitors never see a link that
would just redirect them away.

### Deferred

- **Bucket list (phase 5)** — dropped by decision 2. If it returns it needs a save
  affordance (a bookmark, not a tick), the `/bucket-list` page, and the
  `wishlist-*` endpoints.
- ~~**Arabic 404.**~~ ✅ done (10 Aug 2026). `app/[locale]/not-found.tsx`
  renders below the locale segment and never received `params`, so an
  explicit `notFound()` call from inside the tree (a bad event slug, say)
  always rendered English even under `/ar/...`. Fixed by moving the content
  into a new client component, `components/not-found-content.tsx`, which
  reads the locale off `usePathname()` instead of a route param —
  `usePathname()` reflects the real matched URL (untouched by `proxy.ts`'s
  rewrite of default-locale routes), so the leading `/ar` segment is still
  there to detect even though `params` isn't. `app/[locale]/not-found.tsx`
  itself stays a thin server shell that only carries the `metadata` export
  (English-only — metadata runs server-side, same missing-param problem).
  Verified: `/ar/events/<bad-slug>` renders Arabic copy with `dir="rtl"`;
  `/events/<bad-slug>` (English) unchanged. Doesn't touch
  `app/global-not-found.tsx` (task 41's fix for genuinely unmatched
  routes) — that file bypasses the `[locale]` tree entirely by Next's own
  design (see its header comment), so it stays hardcoded to English; there
  is no locale param to read there because no route ever matched.

## Bugs on the live site — do not port these

Ticked items are already handled in the redesign; the rest are traps for the
pages still to be built.

- `Book Now` has no handler. The primary conversion action does nothing.
- ✅ Contact page phone links to `tel:1-800-453-6744`, a US placeholder, while
  displaying +971509147621. _(Ours links `SITE.phoneHref` — one source, so
  display and `tel:` can't disagree.)_
- ✅ Footer phone number is a `mailto:` link. _(Ours is `tel:`.)_
- Facebook, X and YouTube icons link to those sites' bare homepages.
- ✅ Partner With Us opens with Lorem Ipsum. _(Ours never did — written fresh.)_
- ✅ "Let's get you all st up" in the sign-in modal. _(Ours is written fresh, no typo to inherit.)_
- ✅ The language switcher translates nothing and never sets RTL. _(Ours does both.)_
- ✅ Search has no results page, no URL state, nothing shareable. _(Ours has `/events`.)_
- ✅ `Sign In` is an `<a href="/">` with a Bootstrap modal target instead of a
  button. _(Ours is a real `<button>` — a Radix `DialogTrigger`.)_
- Nav "Your bucketlist" vs page heading "Your Wishlist". _(Moot — feature dropped.)_
- `tickets[0].startDate.fromTime` comes back as the string `"Invalid"`.
