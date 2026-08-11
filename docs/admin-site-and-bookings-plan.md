# Admin site split + booking flow changes — plan

Status: **Phases 1–3 done and deployed. Phase 4 built and verified locally,
not yet deployed** — needs a new Vercel project, see Phase 4 below. Phases
are independently shippable — each ends in something deployed and checkable
before the next begins.

## Goal

1. Split the admin surface out of the vendor dashboard into its own site,
   `admin-tbdxb.vercel.app`, with its own visual identity.
2. Give vendors (and later, admins) a manual + QR-based check-in flow, not
   just the existing per-row "Check in" button.
3. Restructure the event editor so bookings live in a tab inside the event,
   not only in the separate global `/bookings` list.

## Current state (as of this plan)

- Admin pages (`admin/vendors`, `admin/vendors/[id]`, `admin/admins`,
  `admin/review`) live *inside* `apps/vendor`, gated by `profile.is_admin`
  and the `is_admin()` security-definer function. That function already
  works from any front-end — it's not tied to `apps/vendor`.
- No "list all users" surface exists anywhere yet.
- `event.view_count` has only been incremented since a recent fix — any
  "views" figure needs to visibly caveat that pre-fix history is missing.
- No revenue figure is computed anywhere today. Two different numbers are
  possible: gross ticket sales (`ticket_type.price_aed × quantity_sold` on
  confirmed bookings) vs. the platform's cut (`× vendor.commission_rate`).
  Plan is to show both, labeled, rather than pick one silently.
- Check-in today is a per-row "Check in" button on the global `/bookings`
  table (uses that row's own `reference`). There is no free-text input to
  type/paste a reference, and no QR scanning. The `check_in_booking(p_reference)`
  RPC already exists and handles all of this — the gap is UI-only.
- The vendor app has a shared `Logo` component
  (`apps/vendor/components/logo.tsx`) and brand mark (`public/dxb-logo.svg`),
  copied from the main site the same way — a precedent for how the admin
  site should reuse the same logo without reinventing it.

## Open decisions (flagged, not yet resolved)

1. **Revenue definition** — show gross and commission both, labeled.
2. **View-count caveat** — surface the "counting started on [date]" caveat
   wherever views are shown.
3. **Transition window (Phase 6)** — keep the admin pages live inside
   `apps/vendor` until `apps/admin` is deployed and verified, then delete
   them in a separate follow-up commit. Do not delete and rebuild in the
   same PR.
4. **User list scope (Phase 8)** — default: all `auth.users` joined to
   `profile`, not just vendor-affiliated accounts. This will be the largest
   table in the app; pagination and search are required from day one, not
   an afterthought.
5. **Does the global `/bookings` list survive Phase 3?** — default: yes,
   kept as a cross-event view (useful for search-by-reference and check-in,
   where the vendor often doesn't know which event a booking belongs to
   ahead of time). The new per-event tab is an additional, more focused
   view, not a replacement. Flag if it should be removed instead.

## Design note (Phase 4)

The admin site gets its own visual identity, separate from the vendor
dashboard's warm/brand-tinted palette: a **dark/white scheme**, not
`apps/vendor`'s pink-tinted `#fffafc`/`#331924` tokens. Same logo mark
throughout — the `Logo` component, copied over the same way `apps/vendor`
copied it from the main site (one shared SVG, not reinvented per app).
Structurally reuse the same shadcn token setup (`--background`,
`--foreground`, etc. in `globals.css`) so components (`Card`, `Button`,
etc.) port over cleanly; only the token *values* change. **Resolved in
Phase 4: dark-only**, no light toggle — nothing has needed one, and it's a
small addition later if that changes (the `.dark` class pattern is already
proven in `apps/vendor`).

## Phases

### Phase 1 — Manual check-in entry (vendor)

New standalone `/check-in` route in `apps/vendor` (previously reserved,
never built): a text input, paste/type a reference, hit "Check in." Calls
the existing `check_in_booking` RPC — no migration needed, UI-only. Same
success/already-checked-in/not-found/cancelled states as the current
per-row button, which stays as-is on `/bookings` (both paths hit the same
RPC, no conflict).

### Phase 2 — QR code scanner (vendor)

Adds a camera-based scanner to the same `/check-in` route — a decoded code
auto-fills the reference field from Phase 1 rather than being a separate
flow. New dependency (no scan/decode library exists in the repo today).
Needs real per-device testing (iOS Safari vs. Android Chrome `getUserMedia`
behave differently) and a manual-entry fallback when the camera is denied
or unavailable.

### Phase 3 — Event bookings tab (vendor)

The event edit page (`events/[id]`) gets tabs:
- **Details** — today's `EventForm`, unchanged.
- **Bookings** — a table scoped to just that event's bookings, same
  columns/check-in/cancel actions as today's global list, pre-filtered by
  `event_id` (no per-row event-name column needed since it's implicit).

See open decision #5 above re: whether the global `/bookings` list
survives this phase.

### Phase 4 — Scaffold `apps/admin` — **built, pending deploy**

New Next.js app at `apps/admin` (own `package.json`/`node_modules`,
mirroring `apps/vendor`'s config verbatim: tsconfig, eslint, postcss,
`proxy.ts`), sharing the one Supabase project. Dark/white theme per the
Design note above — resolved **dark-only**, no light toggle, since nothing
needed it yet and it's cheap to add later. Auth gate in
`app/(dashboard)/layout.tsx` checks signed-in + `profile.is_admin`
server-side (same shape as `apps/vendor`'s "isn't a vendor" gate) and
rejects with a plain message, not just a hidden nav link. Ships as an empty
shell — one placeholder dashboard page, a header with sign-out, no real
admin pages yet (those move in during Phase 5).

Verified locally: `tsc`/`eslint`/`build` clean, and in-browser that a
signed-out visit to `/` redirects to `/login` with no console errors. Local
dev runs on port 3300 (`npm --prefix apps/admin run dev`, or the `admin`
entry in `.claude/launch.json`).

**Still outstanding, infra not code:** a new Vercel project pointing its
root directory at `apps/admin`, deployed to `admin-tbdxb.vercel.app`, plus
its environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Nothing here needs
`SUPABASE_SECRET_KEY` yet — that lands with Phase 5 when the service-role
team route handler moves over.

### Phase 5 — Move existing admin pages into `apps/admin`

Move `admin/vendors`, `admin/vendors/[id]`, `admin/admins`, `admin/review`
and their supporting components (`VendorStatusEditor`, `CreateVendorForm`,
`TeamList`, admin grant/revoke, the `/api/admin/team` route handler +
service-role client) from `apps/vendor` to `apps/admin`. Old copies stay
live in `apps/vendor` during this phase (see decision #3) so nothing breaks
mid-move. Verify full parity before moving on.

### Phase 6 — Remove admin surface from `apps/vendor`

Delete the now-duplicated pages/components/route from `apps/vendor`, drop
the admin nav links, update docs (roadmap, README, vendor-dashboard.md).
`apps/vendor` is vendor-only from here on — a vendor owner/staff signs in,
manages their own events, bookings, team, and settings, with no path to any
other vendor's data or platform-wide info.

### Phase 7 — Platform dashboard (admin)

Total vendors (by status: pending/approved/suspended), total events (by
status: draft/submitted/published/rejected/archived), total bookings, total
views (with the undercounting caveat), and revenue (gross + commission, per
decision #1).

### Phase 8 — Full user list (admin)

All `auth.users` rows joined to `profile` (per decision #4), paginated and
searchable from the start. New RPC or the service-role
`auth.admin.listUsers()` API.

### Phase 9 — Cross-vendor booking oversight (admin)

A global bookings list/search across all vendors (today bookings are only
visible one vendor at a time, inside `apps/vendor`), plus the same
Details/Bookings tab pattern from Phase 3 when admin drills into any
vendor's specific event.

## Explicit non-goals for this pass

Audit logging of admin actions, real-time/live-updating dashboard numbers
(a page-load fetch is enough), CSV/export tooling, and cross-app
single-sign-on between the three sites — each app keeps its own
independent Supabase session, no shared-cookie complexity needed since
they're separate subdomains.
