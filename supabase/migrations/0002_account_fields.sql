-- Account page (phase 7): profile fields for avatar, address and notification
-- preferences, plus the storage bucket the avatar upload writes to. See
-- docs/roadmap.md phase 7 and docs/accounts-and-dashboard.md.

alter table public.profile
  add column avatar_url text,
  add column address_line1 text,
  add column address_line2 text,
  add column city text,
  add column country text,
  add column notify_marketing boolean not null default false,
  add column notify_reminders boolean not null default true;

-- Existing "users read own profile" / "users update own profile" policies
-- already cover these new columns — same row, same owner check.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view an avatar (they're rendered publicly in the header etc.);
-- only the owner can write to their own folder. Files are keyed
-- `${user_id}/avatar.<ext>`, so the first path segment is the owner check.
create policy "avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users manage own avatar"
  on storage.objects for all
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
