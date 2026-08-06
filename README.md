# thebucketlistdxb — redesign

A rebuild of the [thebucketlistdxb.com](https://thebucketlistdxb.com) **home page** and **event detail page**, restyled as an Airbnb × shadcn hybrid.

```bash
npm install
npm run dev
```

| Route | What it is |
| --- | --- |
| `/` | Home — hero, search, five category rails, why-us |
| `/events/[slug]` | Event detail — gallery, facts, booking panel, related |
| `/events` | Search results (added: the home page's search and every "See All" needed a destination) |

---

## Design direction

The brief was "better than it is now" without losing the client. So the bubblegum pink was kept as brand equity but deepened into a **berry** and set on a **warm off-white** canvas rather than pure white. Airbnb supplies the generosity — big 4:3 photography, real whitespace, soft warm elevation. shadcn supplies the discipline — hairline borders, restrained radii, a muted-foreground hierarchy, `cva` variants.

**Palette** (`app/globals.css`, all tokens live in `@theme`)

| Token | Hex | Role |
| --- | --- | --- |
| `canvas` | `#FDFCFB` | Page ground |
| `ink` | `#1C1917` | Primary text |
| `ink-muted` | `#6B6259` | Secondary text |
| `ink-subtle` | `#7A7066` | Tertiary — pinned at 4.7:1, the lightest that clears AA |
| `berry` | `#C2185B` | Brand, CTAs |
| `blush` | `#FCE7F0` | Tinted sections |
| `sand` / `line` | `#E7E2DB` / `#EAE5DE` | Structure |

**Type** — Gabarito (display) + Hanken Grotesk (body). Deliberately not Inter, Roboto, or Space Grotesk, per the frontend-design and Bencium skills' guidance on defaults. Display sizes are fluid `clamp()`.

**The signature.** Their own event copy says *"one you'll definitely want to tick off your bucket list."* So saving an experience is **a tick being drawn**, not a heart — a ghost tick shows the unsaved state, the live stroke animates on when saved (`components/bucket-list-toggle.tsx`). The hero repeats the idea with a half-ticked list card, and sits on a faintly ruled ground like a sheet you'd write a list on. Everything else is kept quiet so this is the one thing the page is remembered by.

---

## Content: what is real vs. placeholder

`lib/events.ts` is the single source of content.

- **Real** — the SALT candle-making listing: title, venue, date, times, AED 169, full body copy and inclusions are copied from the live site. Its three photos are downloaded to `public/events/`.
- **Sample** — the other six listings are marked `isSample: true` and exist only so the category rails can be judged with content in them. They have no photography; they render as duotone grounds via `components/experience-media.tsx`. **Replace these with live API data before shipping.**

The live site shows "No Event Found" in four of five rails. Rather than reproduce that, the rails take real content and `Summer in the City` is left empty on purpose to demonstrate the designed empty state.

---

## Skills applied

- **Anthropic frontend-design** — committed to one direction, spent the boldness in a single signature element, avoided the templated defaults.
- **Vercel Web Interface Guidelines** — audited against the full rule list. Curly apostrophes, `…` not `...`, tabular numerals on prices and dates, `Intl` for all dates/currency (fixed `en-AE` + `Asia/Dubai` so server and client can't disagree), `text-wrap: balance` headings, `min-w-0` on truncating flex children, explicit image `width`/`height`, lazy below the fold, `touch-action: manipulation`, `overscroll-contain` on the drawer, `env(safe-area-inset-bottom)` on the mobile booking bar, search state in the URL, skip link, `:focus-visible` rings, `prefers-reduced-motion`, Title Case buttons and headings.
- **Vercel React best practices** — pages are Server Components; only the four genuinely interactive leaves are client (`search-panel`, `booking-panel`, `bucket-list-toggle`, `newsletter-form`, `site-header`). Uncontrolled inputs read via `FormData`. `Intl` formatters hoisted to module scope. `useSearchParams` wrapped in `Suspense` so the shell still prerenders. Drawer close moved from an effect into the click handler (`rerender-move-effect-to-event`). All 12 routes prerender static.
- **Bencium UX designer** — a chosen tone committed to fully, characterful type, atmosphere over flat fills, 44×44 hit targets, WCAG AA verified by measurement.

## Accessibility

Measured in-browser, not assumed: text contrast 4.7–17.5:1 (all AA); every icon-only control has an `aria-label` and a 44×44 hit area via the `.tap-target` utility (visual size unchanged); the tick reports `aria-pressed` and swaps its label; guest count and running total are `aria-live`; no horizontal overflow at 375px.

## Known gaps

- `Book Now`, `Sign In`, and the newsletter are UI-only — no backend is wired.
- Nav routes other than the three above (`/about-us`, `/faq`, `/contact`, …) are not built.
- Date fields are native `<input type="date">`, so the placeholder format follows the visitor's browser locale.
