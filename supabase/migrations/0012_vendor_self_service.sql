-- A vendor can now update their own row (name/contact/logo/bio), but never
-- status or commission_rate — those stay admin-only. Column-level revoke,
-- not a `with check` condition: RLS with-check runs on the row a vendor
-- could still include those keys in their update payload, and the revoke
-- rejects the whole statement before RLS is even evaluated for that column
-- — same defense used for profile.is_admin in 0009.
revoke update (status, commission_rate) on public.vendor from authenticated;

create policy "vendors update own row" on public.vendor for update
  using (id in (select public.my_vendor_ids()))
  with check (id in (select public.my_vendor_ids()));

-- The admin vendor-status editor (9e) currently writes status/
-- commission_rate via a direct client .update() under "admins manage
-- vendors" — that still works off an admin's own session privileges, but
-- the column revoke above applies to the `authenticated` role as a whole,
-- so it would now block admins too. Move that write behind a
-- security-definer RPC instead, same admin_publish_event pattern.
create or replace function public.admin_set_vendor_status(
  p_vendor_id uuid, p_status public.vendor_status, p_commission_rate numeric
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  update public.vendor
    set status = p_status, commission_rate = p_commission_rate
    where id = p_vendor_id;
end;
$$;

-- Logo storage — same shape as event-images (0007): public read, write
-- scoped to the vendor's own folder.
insert into storage.buckets (id, name, public)
values ('vendor-logos', 'vendor-logos', true)
on conflict (id) do nothing;

create policy "vendor logos are publicly readable" on storage.objects for select
  using (bucket_id = 'vendor-logos');

create policy "vendors manage own logo" on storage.objects for all
  using (
    bucket_id = 'vendor-logos'
    and (storage.foldername(name))[1]::uuid in (select public.my_vendor_ids())
  )
  with check (
    bucket_id = 'vendor-logos'
    and (storage.foldername(name))[1]::uuid in (select public.my_vendor_ids())
  );
