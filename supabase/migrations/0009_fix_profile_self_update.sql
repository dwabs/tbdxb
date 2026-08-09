-- 0001's self-update policy required `is_admin = false` in its WITH CHECK,
-- intending to block a user from self-promoting to admin. But WITH CHECK
-- evaluates the row's stored is_admin value post-update, and the app never
-- touches that column either way — so once 0007 granted the operator
-- account (cremecorp97@gmail.com) admin rights for the vendor review
-- queue, that same account's own /account page started rejecting every
-- save with a 403. Any admin editing their own profile got blocked, not
-- just an attempted is_admin change.
--
-- Column-level privileges are the right tool here: revoke UPDATE on
-- is_admin itself, so no client payload can ever touch it regardless of
-- RLS, and drop the WITH CHECK condition that was blocking unrelated
-- admin self-edits.

revoke update (is_admin) on public.profile from authenticated;

drop policy "users update own profile" on public.profile;
create policy "users update own profile"
  on public.profile for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
