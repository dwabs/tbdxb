# thebucketlistdxb — redesign

A rebuild of [thebucketlistdxb.com](https://thebucketlistdxb.com), restyled as an Airbnb × shadcn hybrid — home page, event detail, search, secondary pages, and a working account/booking flow against our own Supabase backend. English and Arabic (RTL), both fully translated.

```bash
npm install
npm run dev
```

Every route below lives under both `/en` and `/ar`.

| Route | What it is |
| --- | --- |
| `/` | Home — hero, search, five category rails, why-us |
| `/events/[slug]` | Event detail — gallery, facts, booking panel. `Book Now` opens checkout in a modal right on the page |
| `/events` | Search results (added: the home page's search and every "See All" needed a destination) |
| `/about-us`, `/faq`, `/contact`, `/partner-with-us` | Secondary pages — FAQ accordion, contact and vendor-inquiry forms |
| `/refund-policy`, `/privacy-policy`, `/terms-conditions` | Policy pages |
| `/account` | Profile, address and notification settings — signed in only |
| `/account/bookings` | Upcoming/past bookings, QR ticket per booking — signed in only |

### Vendor dashboard

A second app, `apps/vendor` (own `package.json`, deployed separately at
`vendor-tbdxb.vercel.app`), where vendors create and manage events against
the same Supabase project — this is what the main site's `/events` now reads
from instead of a static array. Overview, event editor (with ticket types and
photo upload), bookings, check-in, and self-service settings (including team
management) for vendors — vendor-only now that the admin surface has fully
moved to `apps/admin`. See [`docs/vendor-dashboard.md`](./docs/vendor-dashboard.md)
and the "Phase 9"/"Phase 13" sections of [`docs/roadmap.md`](./docs/roadmap.md)
for the full build history.

### Admin app

A third app, `apps/admin` (own `package.json`, port 3300 locally, deployed
at `admin-tbdxb.vercel.app`), splitting the admin surface out of the vendor
dashboard into its own site with a dark/white identity, distinct from the
vendor app's brand-tinted one — same shared logo. Auth-gated (sign-in +
`profile.is_admin` check) with a sidebar nav: a review queue, vendor
management (create vendor, status/commission, team), and admin management.
The old copies of these pages have been removed from `apps/vendor` — see
[`docs/admin-site-and-bookings-plan.md`](./docs/admin-site-and-bookings-plan.md)
for the full build history.

---

## Design direction

Everything is derived from the client's logo (`components/logo.tsx`, source at `public/dxb-logo.svg`): its pink `#F47EB4` is the primary, its maroon `#4A2536` is the ink family. Airbnb supplies the generosity — big 4:3 photography, real whitespace, soft warm elevation. shadcn supplies the discipline — hairline borders, restrained radii, a muted-foreground hierarchy, `cva` variants.

**One constraint drove the whole palette.** `#F47EB4` is light: white text on it is only **2.47:1**, well under the 4.5:1 minimum, so it can never carry white text. The logo already solves this — its own maroon on its own pink is **5.28:1**. So every primary button is pink with maroon text, which is just the logo's pairing scaled up.

| Token | Hex | Role | Contrast |
| --- | --- | --- | --- |
| `canvas` | `#FFFAFC` | Page ground | — |
| `ink` | `#331924` | Primary text | 15.6:1 |
| `ink-muted` | `#7A5766` | Secondary text | 6.0:1 |
| `ink-subtle` | `#8A6B78` | Tertiary | 4.6:1 |
| `pink` | `#F47EB4` | Primary fills | maroon on it: 5.28:1 |
| `pink-hover` | `#EE6BA6` | Primary hover | 4.53:1 |
| `pink-deep` | `#BE3775` | Pink *text* on light | 5.1:1 |
| `maroon` | `#4A2536` | Text on pink; dark buttons | white on it: 13.1:1 |
| `blush` / `sand-soft` / `line` | `#FDEEF5` / `#FBF3F6` / `#F2E4EB` | Tints and structure | — |

Shadows are tinted with the maroon rather than neutral grey, so elevation stays in the same family as the ink.

**Type** — Geist for titles, Inter for body and UI, both loaded as variable fonts via `next/font`.

**The signature** is the hero: the headline sits on a faintly ruled ground, like the sheet you'd write a bucket list on, with a half-ticked list card beside it — decorative only. The bucket-list *feature* itself (a save/wishlist affordance) was dropped from scope entirely, cards and booking panel both; there is currently nothing to save to.

## Content: what is real vs. placeholder

`lib/events.ts` is the single source of content.

- **Real** — the SALT candle-making listing: title, venue, date, times, AED 169, full body copy and inclusions are copied from the live site. Its three photos are downloaded to `public/events/`.
- **Sample** — the other six listings are marked `isSample: true` and exist only so the category rails can be judged with content in them. Their photography comes from [Unsplash](https://unsplash.com/license) (free for commercial use, no attribution required) and sits in `public/events/`. Every shot was opened and checked by eye, not chosen from its caption — searches return plenty of mislabelled results. **Replace both the copy and the photos with the operators' own before shipping.**

`components/experience-media.tsx` still carries a duotone fallback for any listing that arrives without an image, so an empty `images: []` degrades gracefully rather than breaking the card.

The live site shows "No Event Found" in four of five rails. Rather than reproduce that, the rails take real content and `Summer in the City` is left empty on purpose to demonstrate the designed empty state.

---

## Skills applied

- **Anthropic frontend-design** — committed to one direction, spent the boldness in a single signature element, avoided the templated defaults. (Its guidance and Bencium's both name Inter as a font to avoid; you asked for it specifically, so Inter it is — paired with Geist it reads clean rather than generic.)
- **Vercel Web Interface Guidelines** — audited against the full rule list. Curly apostrophes, `…` not `...`, tabular numerals on prices and dates, `Intl` for all dates/currency (fixed `en-AE` + `Asia/Dubai` so server and client can't disagree), `text-wrap: balance` headings, `min-w-0` on truncating flex children, explicit image `width`/`height`, lazy below the fold, `touch-action: manipulation`, `overscroll-contain` on the drawer, `env(safe-area-inset-bottom)` on the mobile booking bar, search state in the URL, skip link, `:focus-visible` rings, `prefers-reduced-motion`, Title Case buttons and headings.
- **Vercel React best practices** — pages are Server Components; interactivity (`search-panel`, `booking-panel`, `newsletter-form`, `site-header`, the sign-in and checkout modals, the account forms) is pushed to the leaves rather than lifted into layouts. Uncontrolled inputs read via `FormData`. `Intl` formatters hoisted to module scope. `useSearchParams` wrapped in `Suspense` so the shell still prerenders. Drawer close moved from an effect into the click handler (`rerender-move-effect-to-event`). Static pages prerender; account/booking pages are dynamic since they read the session.
- **Bencium UX designer** — a chosen tone committed to fully, characterful type, atmosphere over flat fills, 44×44 hit targets, WCAG AA verified by measurement.

## Accessibility

Measured in-browser, not assumed: every text pairing clears WCAG AA, verified against the live DOM after the palette change (primary button 5.28:1, dark button 13.05:1, pink eyebrow 5.09:1); every icon-only control has an `aria-label` and a 44×44 hit area via the `.tap-target` utility (visual size unchanged); guest count and running total are `aria-live`; no horizontal overflow at 375px.

## Backend

Sign-in, profile, and bookings run against **our own Supabase project** — not the client's live API (`api.thebucketlistdxb.com`), which has a working backend for all of this but no sandbox to build safely against. Auth is email OTP (`signInWithOtp` / `verifyOtp`, no password) for customers, email + password for vendors, sent through Resend as Supabase's SMTP provider. Confirming a checkout does a real `insert` into `public.booking`; there's no Stripe integration yet, so the payment step is a labeled demo that charges nothing. `supabase/migrations/*.sql` has the schema; `docs/roadmap.md`, `docs/accounts-and-dashboard.md` and `docs/vendor-dashboard.md` have the reasoning.

Event/listing content (`lib/events.ts` on the public site) now reads from the database — vendors author it in `apps/vendor`, and an admin approves it before it's `published`. Every public table is RLS-scoped; writes to sensitive columns (`profile.is_admin`, `vendor.status`/`commission_rate`, `event.status`) are additionally column-revoked from direct client writes and only reachable through gated `security definer` RPCs.

## Known gaps

- No Stripe: checkout's payment step is an honest demo, no card is charged.
- Auth emails only deliver to the Resend account's own address until a verified sending domain is added — real users can't receive sign-in codes yet.
- The 404 page always renders in English, even under `/ar`.
- Date fields are native `<input type="date">`, so the placeholder format follows the visitor's browser locale.
- Vendor dashboard (`apps/vendor`) has no i18n — English only, by design (see `docs/vendor-dashboard.md`).
- Six of the seven seeded event listings are still placeholder copy/photos (flagged in the vendor's own event rows) — real vendors replace these by editing/creating their own events.
