import { cookies } from "next/headers";

import type { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/lib/types";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

const VENDOR_COLUMNS =
  "id, name, slug, contact_email, contact_phone, logo_url, bio, status, commission_rate";

/**
 * The vendors this account actually belongs to, and which one is active.
 *
 * Scoped through my_vendor_ids() rather than letting RLS pick: `vendor`
 * also carries an "admins read all vendors" policy (0007) that the admin
 * app needs, and both apps share one database — so an unfiltered select
 * here hands a platform admin every vendor on the platform and quietly
 * turns this dashboard into a cross-vendor viewer. That mode half-works,
 * which is worse than not working: reads succeed, event writes silently
 * fail (every write policy is membership-only), but check-in and cancel
 * *do* fire, against another vendor's bookings. Cross-vendor oversight
 * belongs in apps/admin, which has its own surface for it.
 *
 * Team management (0020) makes belonging to more than one vendor real (an
 * agency staffer on two clients' teams) — the active_vendor cookie picks
 * which, defaulting to the first alphabetically when unset or no longer
 * valid. VendorSwitcher (in the sidebar) sets it.
 */
export async function resolveActiveVendor(supabase: ServerClient): Promise<{
  vendors: Vendor[];
  vendor: Vendor | null;
}> {
  const [{ data: vendorIds }, cookieStore] = await Promise.all([
    supabase.rpc("my_vendor_ids"),
    cookies(),
  ]);

  const ids = (vendorIds ?? []) as string[];
  if (ids.length === 0) return { vendors: [], vendor: null };

  const { data } = await supabase
    .from("vendor")
    .select(VENDOR_COLUMNS)
    .in("id", ids)
    .order("name");

  const vendors = (data ?? []) as unknown as Vendor[];
  const activeVendorId = cookieStore.get("active_vendor")?.value;

  return {
    vendors,
    vendor: vendors.find((v) => v.id === activeVendorId) ?? vendors[0] ?? null,
  };
}
