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

### Phase 3 — live data · blocked on decision 1 · next up

- Typed API client + response schemas; fail loudly on shape drift.
- Home from `/events/homepage`; detail from `/events/event-details/:slug`
  plus `/events/event-tickets/:id`.
- Sanitise the HTML `description` and restyle it to the type scale.
- `next.config` `remotePatterns` for their `/uploads` host; keep `next/image`.
- Point `/events` search at the API instead of the local array.
- Fire `track-view` on detail mount.
- Per-locale content: the Arabic overlay in `lib/events-ar.ts` is a stand-in
  for what the vendor would author.

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
  - **Bug caught applying the migration:** `admin_list_admins()` failed
    every call with "structure of query does not match function result
    type" — `auth.users.email` is `varchar`, not `text`, and `RETURN QUERY`
    requires an exact type match against the declared `RETURNS TABLE`
    shape, not just an assignable one. Fixed with an explicit
    `u.email::text` cast. Caught immediately because the admins page logs
    the RPC's error instead of silently rendering an empty list (same
    `console.error`-on-failure pattern 9b already committed to) — worth
    remembering for any future function returning an `auth.users` column.
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
- **9f — Responsive layout.** Flagged 9 Aug 2026: the whole app was built
  and verified at desktop width only, and it breaks on mobile/tablet — the
  sidebar is a fixed 256px column with no collapse or off-canvas pattern, so
  narrow viewports lose most of the content width to it, and none of the
  forms, tables, or the event editor's multi-column rows have been checked
  below desktop. Sequenced last on purpose: 9a–9e are still adding pages,
  and reworking layout before that surface exists would mean redoing it.
  Once 9a–9e are done, this pass covers the sidebar (collapsible/off-canvas
  below some breakpoint), the stat tiles and event list (already `sm:`
  responsive in places, unverified), and the event editor's field grids.

- **9g — Overview charts.** The stat tiles are single numbers with no trend;
  the review call flagged this. All the underlying fields already exist —
  no new migration needed:
  - **Tickets sold & net revenue over time** (line, last 12 weeks or by
    month) — `booking.created_at`/`quantity`/`total_aed` joined to the
    vendor's own events via `event_id`, same scoping `vendor_event_stats`
    already uses. The headline chart; ties directly to the two existing
    tiles.
  - **Top events by tickets sold** (bar, top 5) — straight off
    `vendor_event_stats`, no new query shape.
  - **Events by category** (donut) — `event.category` across the vendor's
    events; cheap to compute, shows portfolio mix at a glance.
  - **Views → bookings conversion** — `event.view_count` (tracked on every
    event, currently surfaced nowhere in the vendor UI) against tickets
    sold per event. The one genuinely new metric; worth it because
    `view_count` is otherwise dead data.
  Needs a charting library — `recharts` is the natural pick since shadcn's
  own chart blocks are built on it, keeping the dependency inside what 9's
  "shadcn/ui, CRM style" direction already committed to. Sequenced after
  9b/9c: before then there's no real vendor-authored trend data to chart,
  only the two seeded demo bookings.

### Phase 10 — cancel booking · planned · **new**, not blocking anything

Spotted as a gap while reviewing phase 6/7: a customer can book but has no
way to un-book, and neither will a vendor once phase 9's `/bookings` page
exists. The live site's bundle already names `/bookings/cancel-booking/:id`
(see the endpoint table above), so this was always part of the intended
surface — it just never got scoped in phases 6/7. Doesn't block either of
those (both already ship) or phase 9 (its bookings page can land without
this and grow into it).

- **DB.** `booking.status` is `confirmed | cancelled | completed` already
  (`0003_bookings.sql`); no new enum value needed. Add a `cancel_booking(id)`
  security-definer RPC rather than a raw `update` RLS policy — a policy
  would have to be trusted to only ever move status one direction, whereas
  an RPC can enforce the transition explicitly (only from `confirmed`, only
  before `event_date`, and — once `checked_in_at` is set, per
  `0007_vendor_schema.sql` — never, since the ticket's already been used).
  Two callers: the booking's own `user_id` (customer-side) and any vendor
  member of the event's vendor via `my_vendor_ids()` (vendor-side), same
  pattern as `admin_publish_event`/`admin_reject_event`.
- **No refund logic.** Payment is still the labeled stub from phase 6 — no
  real charge exists to reverse, so cancelling only flips the row's status.
  This needs revisiting once Stripe is wired for real.
- **Client UI** (`/account/bookings`) — a "Cancel" action on upcoming cards,
  confirm dialog before calling the RPC, hidden once the card is already
  `cancelled`/`completed` or checked in.
- **Vendor UI** (`/bookings`, phase 9, not yet built) — the same capability
  from the vendor's side once that page exists; scope it in alongside the
  page rather than bolting it on after.

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
- **Arabic 404.** `not-found` renders below the locale segment but cannot read
  its param, so it always renders English. Needs its own boundary; not worth a
  route file until there is Arabic traffic.

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
