-- A vendor may permanently delete an event only while it's still entirely
-- theirs to control — draft (never submitted) or rejected (sent back by an
-- admin, never published) — the same two statuses that already unlock
-- "Submit for review" in the UI. Submitted/published/archived rows carry
-- real review or booking history and must only ever be archived, not
-- deleted.
--
-- ticket_type/event_image/event_translation all reference event with
-- `on delete cascade`; Postgres always bypasses row security for
-- referential-integrity cascade actions, so no extra delete policy is
-- needed on those tables for the cascade itself to work.
create policy "vendors delete own draft or rejected events" on public.event for delete
  using (
    vendor_id in (select public.my_vendor_ids())
    and status in ('draft', 'rejected')
  );
