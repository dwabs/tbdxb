-- Lets a vendor/admin choose how long the dashboard stays signed in after
-- no activity — 30, 60, or 90 minutes, 30 by default. Lives on `profile`
-- rather than `vendor`: it's a per-login security preference, not shared
-- business data, and every dashboard account already has a profile row.

alter table public.profile
  add column session_timeout_minutes integer not null default 30
    check (session_timeout_minutes in (30, 60, 90));

grant update (session_timeout_minutes) on public.profile to authenticated;
