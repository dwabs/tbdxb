# Build-out plan

What the redesign still needs to reach parity with thebucketlistdxb.com — and
past it. Audited 6 Aug 2026 against the live site and its API.

## The headline finding

The live site runs on a complete backend at `https://api.thebucketlistdxb.com/api/v1`.
It is public, returns 200 without a key, and already implements a **full
booking and payment system that the current frontend never wired up**: their
`Book Now` is a bare `<button class="thm-btn">` with no handler at all.

Real inventory is already in there. `GET /events/event-tickets/:id` returns
ticket types with prices, discount prices and remaining quantity (11 left on
the SALT workshop as of the audit).

So this is not "design a booking flow from scratch". It is "wire up the flow
they already paid for". That reframes the biggest phase below from invention
to integration.

### Endpoints found in their bundle

| Area | Endpoints |
| --- | --- |
| Auth | `/auth/login`, `/auth/verify-otp`, `/auth/resend-otp` |
| Events | `/events/homepage`, `/events/event-details/:slug`, `/events/event-tickets/:id`, `/events/track-view/:id`, `/events/track-wishlist/:id` |
| Booking | `/bookings/create-event-booking`, `/bookings/confirm-user-details`, `/bookings/booking-confirm-age`, `/bookings/apply-coupon`, `/bookings/create-payment-intent`, `/bookings/payment-process` |
| Post-booking | `/bookings/upcoming-bookings`, `/bookings/past-bookings`, `/bookings/cancel-booking/:id`, `/bookings/invioce/:id` *(sic)*, `/bookings/ticket-download/:id` |
| Wishlist | `/wishlist/wishlist-all`, `/wishlist/toggle-wishlist`, `/remove`, `/removeAll` |
| Account | `/profile`, `/users/user-details/:id`, `/users/user-update/:id`, `/users/user-update-profile-image/:id`, `/users/preferences`, `/users/reminder-preferences`, `/address/address`, `/notification-setting` |
| Content | `/about/about-us`, `/faq/faq`, `/privacypolicy/privacy-policy`, `/returnpolicy/return-policy`, `/terms/terms-condition`, `/contact-us`, `/newsletter/subscribe` |
| Vendor | `/vendors/create-vendor-request` |

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

## Inventory: live site vs. redesign

| Page | Live | Redesign |
| --- | --- | --- |
| `/` Home | ✅ | ✅ |
| `/event-details/:id` | ✅ | ✅ as `/events/[slug]` |
| Search results | ❌ filters in place, no URL state | ✅ `/events` (added) |
| `/about-us` | ✅ | ❌ |
| `/bucket-list` | ✅ empty state only | ❌ |
| `/faq` | ✅ 6-item accordion | ❌ |
| `/contact-us` | ✅ | ❌ |
| `/partner-with-us` | ✅ *(Lorem Ipsum in prod)* | ❌ |
| `/refund-policy` | ✅ | ❌ |
| `/privacy-policy` | ✅ | ❌ |
| `/terms-conditions` | ✅ | ❌ |
| Account / bookings | ❌ *(API exists)* | ❌ |

| Modal | Live | Redesign |
| --- | --- | --- |
| Sign in — email | ✅ | ❌ |
| Sign in — verify OTP | ✅ | ❌ |
| Sign in — other details | ✅ | ❌ |
| Logout confirm | ✅ | ❌ |
| Age gate | ❌ *(API exists)* | ❌ |
| Checkout | ❌ *(API exists)* | ❌ |

## Phase 0 — decisions I need from you

These block the phases that follow; everything else I can just build.

1. **Wire to the live API, or keep the content static?** Recommend wiring —
   the backend is done and static content would need re-entering by hand
   forever. Cost: the redesign stops being a standalone demo.
2. **What replaces the save-to-bucket-list control?** You had me remove the
   tick from the cards and the booking panel, but "Your Bucket List" is a core
   feature with a working API. It needs *some* affordance. Recommend a
   bookmark icon — it means "save", it isn't a tick, and it isn't the heart
   every other site uses.
3. **Stripe account owner.** Publishable key for the client, and who holds the
   secret — their existing backend already creates the intents, so I likely
   only need the publishable key.
4. **Arabic.** Their toggle is decorative: it flips `lang` to `ar`, translates
   nothing, and never sets RTL. Either commission translations or drop the
   switcher. Recommend dropping it until the content exists.
5. **The six sample listings.** Keep as demo content, or delete once the API
   is wired? Four of their five categories genuinely return zero events, so
   the rails will look empty on real data.

## Phases

Estimates are working days for one developer.

### Phase 1 — static pages · ~2d · no blockers

- Shared secondary-page layout with the "Other" sidebar nav they use.
- `/about-us`, `/faq`, `/refund-policy`, `/privacy-policy`, `/terms-conditions`.
  Copy is already written and decent — port it verbatim.
- FAQ as an accessible accordion (their markup is Bootstrap collapse).
- A real `404`.

### Phase 2 — forms · ~1d · depends on 0.1

- `/contact` → `POST /contact-us`
- `/partner-with-us` → `POST /vendors/create-vendor-request`
- Newsletter → `POST /newsletter/subscribe` (UI already built, unwired)
- Server Actions, field-level validation, pending and error states.
- Rewrite the Partner page copy — it is Lorem Ipsum in production today.

### Phase 3 — live data · ~3d · depends on 0.1

- Typed API client + response schemas; fail loudly on shape drift.
- Home from `/events/homepage`; detail from `/events/event-details/:slug`
  plus `/events/event-tickets/:id`.
- Sanitise the HTML `description` and restyle it to the type scale.
- `next.config` `remotePatterns` for their `/uploads` host; keep `next/image`.
- Point `/events` search at the API instead of the local array.
- Fire `track-view` on detail mount.

### Phase 4 — auth modals · ~2d · depends on 3

- Three-step sign-in modal matching their flow: email → OTP → profile
  (full name, mobile, home base — the emirate list plus "I'm just visiting").
- Resend-code timer, paste-friendly OTP input, error states.
- Session handling and the logout confirmation modal.
- Signed-in header state.

Fix in passing: their step-3 body copy reads "Let's get you all st up".

### Phase 5 — bucket list · ~1.5d · depends on 4 and 0.2

- Save control on cards and detail (whatever 0.2 lands on).
- `/bucket-list` page against `wishlist-all`, `toggle-wishlist`, `removeAll`.
- Optimistic toggle; signed-out taps open the sign-in modal and resume after.
- Name it one thing — nav says "Your bucketlist", their page says
  "Your Wishlist".

### Phase 6 — booking and checkout · ~5d · depends on 4 · **the real gap**

This is the flow that doesn't exist on the live site at all.

- Ticket picker: type, price vs `discountPrice`, remaining `quantity`,
  sold-out state.
- Age gate modal when `ageRestriction.enabled`, using their own consent copy.
- Attendee details → `confirm-user-details`.
- Coupon field → `apply-coupon`.
- Stripe: `create-payment-intent` → Payment Element → `payment-process`.
- Confirmation page, invoice and ticket download.
- Failure paths: declined card, expired intent, ticket sold out mid-checkout.

### Phase 7 — account · ~2d · depends on 4

- `/account`: profile, avatar upload, address, notification and reminder
  preferences.
- Upcoming and past bookings; cancel with confirmation.

### Phase 8 — Arabic · size depends on 0.4

- `next-intl`, locale routing, `dir="rtl"`, mirrored layout, Arabic numerals
  in the price and date formatters.

**Total ≈ 16–17 days** to full parity plus the booking flow they're missing.
Phases 1–3 are the ones that make it a real site; 6 is the one that makes it
a business.

## Bugs on the live site — do not port these

- `Book Now` has no handler. The primary conversion action does nothing.
- Contact page phone links to `tel:1-800-453-6744`, a US placeholder, while
  displaying +971509147621.
- Footer phone number is a `mailto:` link.
- Facebook, X and YouTube icons link to those sites' bare homepages.
- Partner With Us opens with Lorem Ipsum.
- "Let's get you all st up" in the sign-in modal.
- The language switcher translates nothing and never sets RTL.
- Search has no results page, no URL state, nothing shareable.
- `Sign In` is an `<a href="/">` with a Bootstrap modal target — should be a
  button.
- Nav "Your bucketlist" vs page heading "Your Wishlist".
- `tickets[0].startDate.fromTime` comes back as the string `"Invalid"`.
