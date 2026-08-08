/**
 * The header hydrates its signed-in state once on mount from Supabase, so it
 * has no way to learn about a profile edit made later on `/account` without
 * either polling or a shared store. A CustomEvent is the smallest thing that
 * works: the account page emits after a successful save, the header listens.
 */
export const PROFILE_UPDATED_EVENT = "profile-updated";

export type ProfileUpdatedDetail = {
  fullName?: string;
  avatarUrl?: string | null;
};

export function emitProfileUpdated(detail: ProfileUpdatedDetail) {
  window.dispatchEvent(
    new CustomEvent<ProfileUpdatedDetail>(PROFILE_UPDATED_EVENT, { detail }),
  );
}
