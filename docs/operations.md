# Operations

Running, deploying and maintaining the three apps.

## Environment variables

Copy `.env.local.example` → `.env.local`. **Each app needs its own copy** —
repo root, `apps/vendor/`, and `apps/admin/` — because each is a separate
Next.js project. `.env.local` is gitignored.

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | all three | |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | all three | `sb_publishable_…`. Safe in the browser — RLS is the guard |
| `SUPABASE_SECRET_KEY` | `apps/vendor`, `apps/admin` | `sb_secret_…`. **Bypasses RLS.** Server only, never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | dashboards | Public site origin, for resolving relative image paths. Defaults to `https://tbdxb.vercel.app` |

This project uses the **new** Supabase key format (`sb_publishable_…` /
`sb_secret_…`), not the legacy `anon`/`service_role` JWTs. Do not mix them.

There is **no email API key here.** The app never sends email itself — the
sign-in OTP goes through `supabase.auth.signInWithOtp`, and Supabase Auth
sends it using Resend configured as its SMTP provider. That is set in the
**Supabase dashboard** (Authentication → Emails → SMTP), not in this repo.

> **Copy keys with the dashboard's copy button, never by selecting text.**
> The key display wraps, and dragging a selection across the wrap silently
> inserts a space. A space makes the key an invalid HTTP header value and
> every service-role call fails. This has happened.

## Running locally

One command per app, from that app's directory:

```bash
npm install && npm run dev
```

| App | Directory | URL |
| --- | --- | --- |
| Public site | repo root | http://localhost:3000 |
| Vendor | `apps/vendor` | http://localhost:3200 |
| Admin | `apps/admin` | http://localhost:3300 |

The dashboards pin their port in their `package.json` dev script; the public
site uses Next's default 3000. All three can run at once against the same
Supabase project. `.claude/launch.json` defines the same three for tooling.

## Verifying a change

From the app directory you changed:

```bash
npx tsc --noEmit && npx eslint . && npm run build
```

`npm run build` is the decisive check — it typechecks and compiles for real,
and will catch things the dev server's incremental cache hides.

If the change is visible in a browser, open it. A green build is not evidence
that a page looks right.

## Migrations

There is **no Supabase CLI in this workflow.** Migrations are plain SQL files
applied by hand through the Supabase dashboard's SQL Editor.

To add one:

1. Write `supabase/migrations/00NN_short_name.sql` — next number in sequence.
2. Open Supabase → **SQL Editor**, paste the file, run it.
3. Confirm the result (`Success. No rows returned.` for DDL).
4. Commit the file.

Rules:

- **Never edit a migration that has been applied.** Write a new one that
  alters. The files are the only record of what the live database contains.
- Migrations are not run automatically by any deploy. Applying them is a
  manual step — if you ship code that depends on a new migration without
  running it, production breaks.
- Apply the migration **before** deploying the code that needs it.
- Keep them idempotent-ish where cheap (`create or replace function`,
  `drop policy if exists`) so a re-run is not destructive.

Verify a migration landed:

```sql
select proname from pg_proc where proname like 'admin_%';
select polname, tablename from pg_policies where tablename = 'booking';
```

## Deploying

Three Vercel projects, all from this one repo, distinguished by **Root
Directory**:

| Vercel project | Root Directory | Domain |
| --- | --- | --- |
| (root) | `.` | `tbdxb.vercel.app` |
| vendor-tbdxb | `apps/vendor` | `vendor-tbdxb.vercel.app` |
| admin-tbdxb | `apps/admin` | `admin-tbdxb.vercel.app` |

Push to `main` and all three rebuild automatically. A change to only one app
still triggers all three builds; that is expected and harmless.

Environment variables are set **per Vercel project** — adding a variable in
one does not add it to the others. After changing one, redeploy that project.

## Common failures

**"Couldn't create the account. Check server logs."** on Create vendor or Add
team member → `SUPABASE_SECRET_KEY` is wrong, missing, or has a stray space,
in that app's Vercel project. Check the function logs for the real error.

**"No account found for that email — they need to sign up first."** on Grant
admin → working as designed. `admin_grant_admin` only elevates an *existing*
account; the person must sign up on the public site first. There is no
invite-by-email flow for admins (unlike vendor team members, which do create
the account).

**A dashboard shows all zeros** → almost always an unfiltered query against a
`security_invoker` view returning multiple rows. See
[`conventions.md`](conventions.md).

**Admin can't see rows in a table** → the table is probably missing an
`admins read all …` policy. That was the `ticket_type` bug (`0028`).

## Handover to another owner

Have the new owner create and pay for their own accounts first, then transfer
in this order:

1. **Supabase** — Settings → General → Transfer project. Data, auth users and
   storage move with it. Confirm their plan covers the features in use.
2. **Vercel** — Project Settings → Advanced → Transfer Project, for all three
   projects. Domains may need re-verification.
3. **GitHub** — Settings → Transfer ownership.
4. **Resend** — no transfer exists. They create an account, re-verify the
   sending domain via DNS, then update the SMTP credentials in **Supabase**
   (Authentication → Emails → SMTP). Nothing in this repo changes.
5. **Domain** — transfer the registrar or repoint DNS.
6. **Rotate every secret afterwards** — Supabase secret key, Resend key,
   database password — and update the Vercel env vars.

Do Supabase before Vercel, or the Vercel env vars point at a project you no
longer control.
