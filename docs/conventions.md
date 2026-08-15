# Conventions

How to write code that fits this codebase, and the traps that have already
cost time. When in doubt, copy the nearest existing example rather than
introducing a new pattern.

## Comments

This codebase comments **why, not what**. A comment explains a decision, a
constraint, or a trap — never a restatement of the line below it.

```ts
// security_invoker = on is load-bearing, not stylistic: a view defaults to
// running as its *owner*, which would hand every vendor's revenue to any
// caller who selects from it.
```

Match this. Do not add `// set the title` noise, and do not strip existing
comments — several encode bugs that were expensive to find.

## Data fetching

Pages are **async Server Components** that query Supabase directly. There is
no API layer, no client-side data library, no server actions.

- Parallelise independent queries with `Promise.all`.
- Client Components (`"use client"`) are for interactivity only — forms,
  dialogs, charts. They use `lib/supabase/client.ts` and call `router.refresh()`
  after a mutation to re-run the server query.
- Mutations go through **RPCs** where authorization is non-trivial, and
  direct `.update()` where an RLS policy already expresses the rule.

Types are hand-written in each app's `lib/types.ts`, not generated. Each app
reads a deliberate subset of the schema; a generated file would drag in every
table. Cast query results explicitly.

## Adding a page to a dashboard

1. `app/(dashboard)/<name>/page.tsx`, async Server Component.
2. **Vendor app:** resolve the vendor with `resolveActiveVendor(supabase)`
   from `lib/active-vendor.ts` and scope every query by it. Never query
   `vendor` unscoped.
3. Add the nav link to `dashboard-sidebar.tsx` / `admin-sidebar.tsx`.
4. Filters go in the URL (`searchParams`), not component state, so views are
   linkable and the back button works. Copy `bookings-filter-bar.tsx`.

## i18n — public site only

The dashboards are English-only. The public site is EN + AR with full RTL.

- All copy lives in `lib/i18n/en.ts` and `ar.ts`. `en.ts` is the source of
  the `Dictionary` type, so **a key added to English fails the build until
  Arabic supplies it.** That is deliberate; do not weaken it.
- `getDictionary(locale)` in a Server Component, pass `t` down as a prop.
- `fill(template, values)` for interpolation — no i18n library.
- English is served unprefixed (`/faq`), Arabic prefixed (`/ar/faq`). The
  proxy *rewrites* rather than redirects so English URLs stay clean.
- **Never render a raw error message.** Postgres errors are English and would
  appear mid-Arabic-page. Show a translated generic message and log the real
  one server-side.

### RTL

Use **logical** Tailwind properties so RTL mirrors automatically:
`ps-*`/`pe-*`, `ms-*`/`me-*`, `text-start`/`text-end` — not `pl-*`/`pr-*`.
Physical properties are a bug on the public site. Test in `/ar`.

## Styling

Tailwind v4 + shadcn-style components. Design tokens, not raw hex.

- **Public site** — brand palette from the logo. The pink `#F47EB4` is light:
  white text on it fails contrast (2.47:1), so primary buttons are pink with
  **maroon** text (5.28:1). Never white-on-pink.
- **Vendor app** — brand-tinted, light mode.
- **Admin app** — **dark only.** `<html>` is hard-coded `className="dark"`
  with no toggle. Plain `bg-red-100 text-red-900` utilities render as a
  near-white chip. Use translucent-on-dark instead: `bg-red-500/15
  text-red-400`. A `dark:` prefix is pointless here — there is no light mode
  to vary from.

Because `components/ui/*` is duplicated per app, a fix in one is not a fix in
the others. Check siblings.

## Feedback patterns

**Every inner save/create/remove action must confirm success.** A silent
success reads as a broken button.

- `useToast()` from `components/ui/toast.tsx`. The provider is mounted **once**
  per app in `app/(dashboard)/layout.tsx` — deliberately, so that several
  row-level actions on one page cannot stack overlapping toasts.
- `showToast("Booking cancelled.")`, or `showToast("…", "error")`.
- Destructive actions get an inline confirm step, not a browser
  `confirm()`. Canonical example: `cancel-booking-button.tsx` — a `confirming`
  boolean swapping one button for a "Keep it" / "Confirm cancel" pair.
- Exception: keep a **persistent** panel where the user must copy something
  (a generated temp password) or where the flow repeats rapidly (door
  check-in). A 3-second toast is wrong for both.

## Error handling

- Show the user something actionable; log the detail server-side.
- **Never relay an error from the service-role client to the browser.** Its
  transport errors can embed the key itself. `console.error` it and return a
  generic message. This actually happened — see `route.ts` in
  `app/api/admin/team/`.
- Relaying `rpcError.message` from the *cookie-bound* client is fine on the
  dashboards (English-only, and the messages are written for humans).

## Money and time

- Prices are **AED**, stored as `numeric`. Format with
  `Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" })`.
- `commission_rate` is a **fraction** (0.15), displayed as a percent.
- Dubai is **UTC+4, no DST**. Read wall-clock fields straight out of the ISO
  string rather than through `Date`'s local getters, which apply the
  browser's offset. See `dubaiDateTimeToISO` / `toDateTimeLocal`.
- Week buckets for charts start Sunday. `lastTwelveWeeks()` is duplicated in
  the vendor and admin dashboards.

## Security checklist for new code

Run through this on anything touching data:

- [ ] New table → RLS enabled **and** policies written?
- [ ] New RPC → authorization check as the **first** statement?
- [ ] Does the admin app need a read policy for this table?
- [ ] Any price, total, or quantity computed client-side? (It must not be.)
- [ ] Service-role client only in a Route Handler, after checking the caller?
- [ ] Could this error message leak a key, a token, or another user's data?
- [ ] Vendor-app query scoped by `resolveActiveVendor`?

## Traps

Each of these has bitten before.

**`security_invoker` views return one row per readable vendor.** Filter by
`vendor_id` or `.maybeSingle()` errors and the page silently renders zeros.

**Admin read policies leak into the vendor app.** Both apps share one
database. `"admins read all vendors"` means an unfiltered vendor-app query
shows a platform admin every vendor. Always scope via `my_vendor_ids()`.

**RLS policies are additive.** The vendor "read bookings for own events"
policy sits alongside the customer "read own bookings" policy, so an operator
who has also booked as a customer sees personal rows in the vendor list
unless you scope by `event_id` explicitly.

**`public` functions are executable by anyone by default.** PostgREST grants
EXECUTE to PUBLIC. `find_user_by_email` was an unauthenticated email→uuid
oracle until `0027`.

**`is_sample` rows must be excluded from every aggregate.** Seed bookings
exist to make screens look alive.

**`quantity_total = 0` means unlimited**, not sold out.

**Booking fields are snapshots.** Do not replace `event_title` with a join.

**Next 16 renamed Middleware to Proxy** (`proxy.ts`). This version differs
from training data in other ways too — check
`node_modules/next/dist/docs/` before assuming an API.

**Stale Turbopack chunks.** After a big refactor the dev server can report a
`ReferenceError` for a symbol you already removed while the page renders
fine. Confirm with `npm run build` before chasing it. Restarting the dev
server mid-request can also invalidate the Supabase refresh token and sign
you out — harmless, just sign back in.

**`npx eslint .` in `apps/vendor` has one pre-existing error** in
`event-form.tsx` (`Math.random()` in render). Not yours; leave it.
