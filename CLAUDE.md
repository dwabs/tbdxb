@AGENTS.md

# thebucketlistdxb — agent guide

Read this first. It is the map; the linked docs are the detail. Keep changes
consistent with what is already here — this codebase has strong conventions
and most "obvious" shortcuts have already been tried and rejected for
reasons recorded in the docs.

## What this is

An events marketplace for Dubai. **Three Next.js 16 apps, one Supabase
project, one repo:**

| App | Path | Runs on | Who uses it |
| --- | --- | --- | --- |
| Public site | `app/`, `components/`, `lib/` (repo root) | `tbdxb.vercel.app` · port 3000 | Customers. Bilingual EN/AR |
| Vendor dashboard | `apps/vendor/` | `vendor-tbdxb.vercel.app` · port 3200 | Vendors managing their own events |
| Admin dashboard | `apps/admin/` | `admin-tbdxb.vercel.app` · port 3300 | Platform staff. Dark-only, English-only |

Each app has its own `package.json` and deploys as a separate Vercel project
from the same repo (distinguished by Root Directory). They share **one**
database. `supabase/migrations/` stays at the repo root — one schema, one
migration history.

Apps cannot import across each other. Shared-looking files (`lib/utils.ts`,
`components/ui/*`, `components/logo.tsx`) are deliberate copies, not a shared
package. Changing one does not change the others.

## The rules that matter most

1. **Security lives in the database, not the UI.** Every table has Row Level
   Security. Never "fix" a permissions problem by hiding a button.
2. **Never trust the client for money or quantity.** Checkout goes through
   the `create_booking` RPC, which computes price server-side. See
   `0026_secure_checkout.sql`.
3. **Every admin/vendor RPC opens with an authorization check** —
   `if not public.is_admin() then raise exception 'not authorized'; end if;`
   or an ownership `exists(...)`. A new RPC without one is a bug.
4. **Functions in `public` are callable by anyone by default.** PostgREST
   grants EXECUTE to PUBLIC unless revoked. Assume every RPC is reachable by
   an anonymous user and gate it accordingly.
5. **The service-role client (`lib/supabase/admin.ts`) bypasses RLS
   entirely.** Only ever call it from a Route Handler that has already
   checked the caller. Never import it into a `"use client"` file. Never
   relay its raw error text to the browser — the message can contain the key.
6. **Never leak English into the public site's Arabic UI.** All user-facing
   copy comes from `lib/i18n/{en,ar}.ts`. Raw Postgres error messages are
   English; show a translated generic message instead.
7. **Migrations are append-only and applied by hand** in the Supabase SQL
   Editor. Never edit an applied migration. See `docs/operations.md`.

## Where to look

| Doc | Use it for |
| --- | --- |
| [`docs/architecture.md`](docs/architecture.md) | How the three apps fit together, auth, request flow |
| [`docs/data-model.md`](docs/data-model.md) | Tables, columns, RLS policies, every RPC — read before touching the schema |
| [`docs/conventions.md`](docs/conventions.md) | How to write code here + the traps that have already bitten |
| [`docs/operations.md`](docs/operations.md) | Env vars, running locally, applying migrations, deploying |
| `docs/roadmap.md`, `docs/vendor-dashboard.md`, `docs/accounts-and-dashboard.md`, `docs/admin-site-and-bookings-plan.md` | **History, not reference.** Why decisions were made. Large — read a section, not the file |

## Commands

Run these in the app directory you changed (repo root for the public site):

```bash
npm run dev
```

```bash
npx tsc --noEmit && npx eslint . && npm run build
```

Before saying a change works, typecheck and build the app you touched. If the
change is visible in a browser, look at it — do not assume.

Known pre-existing lint error: `apps/vendor/components/events/event-form.tsx`
line ~218, `Math.random()` in render (`react-hooks/purity`). Unrelated to new
work; leave it unless you are fixing it deliberately.
