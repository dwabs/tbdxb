# Build-out plan

What the redesign still needs to reach parity with thebucketlistdxb.com — and
past it. Audited 6 Aug 2026 against the live site and its API; status updated
7 Aug 2026.

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
3. **Stripe on hold.** No keys, no payment work.
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
| Account / bookings       | ❌ _(API exists)_                 | ❌                       |

| Modal                   | Live site         | Redesign |
| ----------------------- | ----------------- | -------- |
| Sign in — email         | ✅                | ❌       |
| Sign in — verify OTP    | ✅                | ❌       |
| Sign in — other details | ✅                | ❌       |
| Logout confirm          | ✅                | ❌       |
| Age gate                | ❌ _(API exists)_ | ❌       |
| Checkout                | ❌ _(API exists)_ | ❌       |

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
removed, with a blush hover/focus fill replacing the old white one.

## Remaining work

Phase numbers are the original ones, kept so they still mean the same thing.
Phases 1, 2 and 8 are done; phase 5 is dropped.

Phases 4 and 7 assume a backend that can hold a user. What that backend is —
which services, which tables, which roles — is specified in
[`accounts-and-dashboard.md`](./accounts-and-dashboard.md), along with the
vendor dashboard, which is new work these phases never covered.

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

### Phase 4 — auth · needs a backend to authenticate against

- Three-step sign-in modal matching their flow: email → OTP → profile
  (full name, mobile, home base — the emirate list plus "I'm just visiting").
- Resend-code timer, paste-friendly OTP input, error states.
- Session handling and the logout confirmation modal.
- Signed-in header state.

Fix in passing: their step-3 body copy reads "Let's get you all st up".

Also: `/sign-in` is linked from the header today and 404s.

### Phase 9 — vendor dashboard · needs phase 4 · **new**

Not in the original numbering because the live site has no such thing — but
their data model has `vendorId`, `adminCommission` and `status: Approved` on
every event, so the business was always a marketplace. Vendors, memberships,
the event lifecycle and the admin review queue are specified in
[`accounts-and-dashboard.md`](./accounts-and-dashboard.md).

### Phase 6 — booking and checkout · needs phase 4 and decision 3 · **the real gap**

This is the flow that doesn't exist on the live site at all.

- Ticket picker: type, price vs `discountPrice`, remaining `quantity`,
  sold-out state.
- Age gate modal when `ageRestriction.enabled`, using their own consent copy.
- Attendee details → `confirm-user-details`.
- Coupon field → `apply-coupon`.
- Stripe: `create-payment-intent` → Payment Element → `payment-process`.
- Confirmation page, invoice and ticket download.
- Failure paths: declined card, expired intent, ticket sold out mid-checkout.

### Phase 7 — account · needs phase 4

- `/account`: profile, avatar upload, address, notification and reminder
  preferences.
- Upcoming and past bookings; cancel with confirmation.

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
- "Let's get you all st up" in the sign-in modal. _(Fix when auth is built.)_
- ✅ The language switcher translates nothing and never sets RTL. _(Ours does both.)_
- ✅ Search has no results page, no URL state, nothing shareable. _(Ours has `/events`.)_
- `Sign In` is an `<a href="/">` with a Bootstrap modal target — should be a
  button.
- Nav "Your bucketlist" vs page heading "Your Wishlist". _(Moot — feature dropped.)_
- `tickets[0].startDate.fromTime` comes back as the string `"Invalid"`.
