-- One row per user, created automatically on signup. See docs/accounts-and-dashboard.md.

create table public.profile (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profile enable row level security;

create policy "users read own profile"
  on public.profile for select
  using (auth.uid() = id);

create policy "users update own profile"
  on public.profile for update
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = false);

-- Runs as the table owner (bypassing RLS) so it can insert a row for a user
-- who, at signup time, has no session yet to satisfy the policies above.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profile (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
