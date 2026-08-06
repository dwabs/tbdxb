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

**The signature** is the hero: the headline sits on a faintly ruled ground, like the sheet you'd write a bucket list on, with a half-ticked list card beside it. Checkmarks were removed from the event cards — as a save affordance a tick was ambiguous, and the cards read better as pure Airbnb: photo, venue, title, date, price. The save control still exists on the detail page's booking panel; say the word if that should go too.

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
- **Vercel React best practices** — pages are Server Components; only the four genuinely interactive leaves are client (`search-panel`, `booking-panel`, `bucket-list-toggle`, `newsletter-form`, `site-header`). Uncontrolled inputs read via `FormData`. `Intl` formatters hoisted to module scope. `useSearchParams` wrapped in `Suspense` so the shell still prerenders. Drawer close moved from an effect into the click handler (`rerender-move-effect-to-event`). All 12 routes prerender static.
- **Bencium UX designer** — a chosen tone committed to fully, characterful type, atmosphere over flat fills, 44×44 hit targets, WCAG AA verified by measurement.

## Accessibility

Measured in-browser, not assumed: every text pairing clears WCAG AA, verified against the live DOM after the palette change (primary button 5.28:1, dark button 13.05:1, pink eyebrow 5.09:1); every icon-only control has an `aria-label` and a 44×44 hit area via the `.tap-target` utility (visual size unchanged); the tick reports `aria-pressed` and swaps its label; guest count and running total are `aria-live`; no horizontal overflow at 375px.

## Known gaps

- `Book Now`, `Sign In`, and the newsletter are UI-only — no backend is wired.
- Nav routes other than the three above (`/about-us`, `/faq`, `/contact`, …) are not built.
- Date fields are native `<input type="date">`, so the placeholder format follows the visitor's browser locale.
