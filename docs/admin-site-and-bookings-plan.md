# Admin site split + booking flow changes — plan

Status: **All phases (1–9) done and deployed.** `apps/vendor` has manual +
QR check-in (`/check-in`) and a per-event Details/Bookings tab. `apps/admin`
is live at `admin-tbdxb.vercel.app` with a sidebar nav, platform dashboard,
review queue, vendor management (with a per-vendor Events list), a full
searchable/paginated user list, admin management, and cross-vendor booking
oversight (global list + per-event Details/Bookings tabs). The admin
surface has been fully removed from `apps/vendor`. Phases were
independently shippable — each ended in something deployed and checkable
before the next began.

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
3. **Transition window (Phase 6)** — **resolved**: kept the admin pages
   live inside `apps/vendor` until `apps/admin` was deployed and verified,
   then deleted them in Phase 6, a separate follow-up commit.
4. **User list scope (Phase 8)** — default: all `auth.users` joined to
   `profile`, not just vendor-affiliated accounts. This will be the largest
   table in the app; pagination and search are required from day one, not
   an afterthought.
5. **Does the global `/bookings` list survive Phase 3?** — default: yes,
   kept as a cross-event view (useful for search-by-reference and check-in,
   where the vendor often doesn't know which event a booking belongs to
   ahead of time). The new per-event tab is an additional, more focused
   view, not a replacement. Flag if it should be removed instead.
6. **`apps/admin` nav should be a sidebar, not a header** — **resolved**:
   `AdminHeader` was replaced with `AdminSidebar` (fixed column desktop,
   off-canvas Sheet on mobile, same structural pattern as `apps/vendor`'s
   `DashboardSidebar` but flat `bg-secondary`/token colors, no brand-tinted
   gradient — this app stays deliberately dark/white-only).

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

### Phase 1 — Manual check-in entry (vendor) — **done, deployed**

New standalone `/check-in` route in `apps/vendor` (previously reserved,
never built): a text input, paste/type a reference, hit "Check in." Calls
the existing `check_in_booking` RPC — no migration needed, UI-only. Same
success/already-checked-in/not-found/cancelled states as the current
per-row button, which stays as-is on `/bookings` (both paths hit the same
RPC, no conflict).

### Phase 2 — QR code scanner (vendor) — **done, deployed**

Adds a camera-based scanner to the same `/check-in` route (`@yudiel/react-qr-scanner`,
in `components/bookings/check-in-lookup-form.tsx`) — a decoded code
auto-fills the reference field from Phase 1 rather than being a separate
flow, with a manual-entry fallback and labeled errors for denied/missing/
in-use camera and insecure-context/unsupported-browser cases.

### Phase 3 — Event bookings tab (vendor) — **done, deployed**

The event edit page (`events/[id]`) has tabs:
- **Details** — `EventForm`.
- **Bookings** — a table scoped to just that event's bookings, same
  columns/check-in/cancel actions as the global list, pre-filtered by
  `event_id` (no per-row event-name column needed since it's implicit).

Open decision #5 resolved: the global `/bookings` list survives as a
cross-event view; the per-event tab is additional, not a replacement.

### Phase 4 — Scaffold `apps/admin` — **done, deployed**

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

Deployed: a new Vercel project (`admin-tbdxb`) with root directory
`apps/admin`, live at `admin-tbdxb.vercel.app`, with
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set.
Confirmed the login page renders correctly in production. Nothing here
needed `SUPABASE_SECRET_KEY` — that lands with Phase 5 when the
service-role team route handler moves over.

### Phase 5 — Move existing admin pages into `apps/admin` — **done, deployed**

Copied, not moved: `admin/vendors`, `admin/vendors/[id]`, `admin/admins`,
`admin/review` and their supporting components (`VendorStatusEditor`,
`CreateVendorForm`, `GrantAdminForm`/`RevokeAdminButton`,
`ReviewQueueActions`, `TeamList`, `AddTeamMemberForm`,
`RemoveTeamMemberButton`, the `/api/admin/team` route handler +
`lib/supabase/admin.ts` service-role client, `lib/slug.ts`) from
`apps/vendor` into `apps/admin`, dropping the `/admin` URL prefix since the
whole app is admin-only now (`/vendors`, `/vendors/[id]`, `/admins`,
`/review`). Old copies deliberately stay live in `apps/vendor` — not just
during this phase, but permanently for `TeamList`/`AddTeamMemberForm`/the
route handler, since vendor owners still use those from their own Settings
page for self-service team management. Only the admin-only pages
(`admin/vendors`, `admin/admins`, `admin/review`) and their exclusively-
admin components are candidates for deletion from `apps/vendor` in Phase 6.

New in `apps/admin`: `lib/types.ts` (trimmed to `Vendor`, `AdminProfile`,
`TeamMember`, etc. — no `EventRow`/`Booking`, this app doesn't touch those
yet), `components/ui/select.tsx` + `textarea.tsx` (copied for
`VendorStatusEditor`/`AddTeamMemberForm`), and `@radix-ui/react-select`
added to `package.json`. `AdminHeader` grew a horizontal nav row (Dashboard/
Review queue/Vendors/Admins) — see open decision #6 re: a sidebar instead.

`SUPABASE_SECRET_KEY` added to `admin-tbdxb`'s Vercel project (Sensitive,
Production + Preview) the same way as `vendor-tbdxb`'s — pasted directly
from Supabase's dashboard by the user, not typed by the assistant, since
entering API keys into a field isn't something the assistant does even for
first-party infra. Left unset in `apps/admin/.env.local` (empty value,
matching `apps/vendor`'s own local `.env.local`), so local dev of the
team-management routes still needs it set by hand — same known limitation
already documented for `apps/vendor`.

Verified: `tsc`/`eslint`/`build` clean, and in-browser signed in as the
platform's one real admin — `/admins` (grant form + self row), `/vendors`
(create form + status editor), `/vendors/[id]` (status + team list + add-
member form, Select component renders correctly), `/review` (empty-state
render, no submitted events to review against). No console errors. The
create-vendor/add-member flows themselves weren't exercised live (would
create real test data); the RPC/route-handler code is an unmodified copy of
`apps/vendor`'s already-verified Phase 13 implementation.

### Phase 6 — Remove admin surface from `apps/vendor` — **done, deployed**

Deleted the duplicated `admin/{review,vendors,vendors/[id],admins}` pages
and their exclusively-admin components from `apps/vendor`, dropped the
admin nav links (and the now-dead `isAdmin` prop) from
`dashboard-sidebar.tsx`, updated README.md and docs/vendor-dashboard.md.
`apps/vendor` is vendor-only from here on — a vendor owner/staff signs in,
manages their own events, bookings, team, and settings, with no path to any
other vendor's data or platform-wide info. `TeamList`/`AddTeamMemberForm`/
the `/api/admin/team` route handler stay in `apps/vendor` permanently, per
Phase 5's note, since vendor Settings still uses them for self-service.

### Phase 7 — Platform dashboard (admin) — **done, deployed**

`admin_platform_stats()` (migration `0022_admin_platform_stats.sql`, one
row/one round trip) returns vendor counts by status, event counts by
status, total bookings/tickets sold, total views (with the undercounting
caveat shown on the tile), and revenue as gross ticket sales *and* platform
commission, separately labeled per decision #1. Commission is
`total_aed * vendor.commission_rate` summed per booking (the platform's
cut), not `vendor_event_stats.net_aed` (the vendor's take).

### Phase 8 — Full user list (admin) — **done, deployed**

`admin_list_users(p_query, p_limit, p_offset)` (migration
`0024_admin_list_users.sql`) joins `profile` to `auth.users` (same
live-join pattern as `admin_list_admins`/`vendor_list_team`, since
`profile` has no `email` column), aggregates each user's vendor
affiliations, and carries the total match count via `count(*) over()` for
pagination — the first paginated feature in the codebase. `/users` in
`apps/admin` renders it with a search bar (name/email substring) and
Prev/Next paging, per decision #4 (all users, not just vendor-affiliated).

### Phase 9 — Cross-vendor booking oversight (admin) — **done, deployed**

`/bookings` in `apps/admin` lists/searches bookings across every vendor
(optionally scoped to one via a vendor filter), backed by a new
`"admins read all bookings"` RLS policy on `public.booking` (migration
`0022_admin_booking_access.sql`, alongside `is_admin()` bypasses added to
`check_in_booking`/`cancel_booking` so an admin account with zero
`vendor_member` rows — the normal case — can act on any vendor's booking).
`/vendors/[id]/events/[eventId]` gives admin the same Details/Bookings tab
pattern as Phase 3, but **read-only** on Details (no ticket-type editor or
image upload — oversight only, content editing stays a vendor
responsibility).

## Explicit non-goals for this pass

Audit logging of admin actions, real-time/live-updating dashboard numbers
(a page-load fetch is enough), CSV/export tooling, and cross-app
single-sign-on between the three sites — each app keeps its own
independent Supabase session, no shared-cookie complexity needed since
they're separate subdomains.
