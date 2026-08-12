-- event.view_count (0007) is a running counter with no history behind it —
-- fine for a total, useless for a trend chart. This adds a timestamped log
-- alongside it so a "views over time" chart becomes possible, without
-- touching view_count itself (it stays canonical for the platform
-- dashboard's total, including pre-log-table history).
--
-- increment_event_view (0018) keeps its own scoping exactly as before —
-- only logs a view when the counter update actually applied (published
-- events only) — so the log and the counter can never drift apart on scope,
-- only on start date.

create table public.event_view_log (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.event (id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create index event_view_log_viewed_at_idx on public.event_view_log (viewed_at);

alter table public.event_view_log enable row level security;

create policy "admins read all event views" on public.event_view_log for select
  using (public.is_admin());

create or replace function public.increment_event_view(p_event_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.event set view_count = view_count + 1
  where id = p_event_id and status = 'published';

  if found then
    insert into public.event_view_log (event_id) values (p_event_id);
  end if;
end;
$$;
