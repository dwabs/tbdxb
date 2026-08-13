import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { IdleTimeout } from "@/components/idle-timeout";
import { ToastProvider } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/lib/types";

/**
 * The auth gate for everything under it. Two checks, not one: signed in, and
 * a member of some vendor. A signed-in customer from the public site shares
 * this Supabase project, so authentication alone doesn't imply they belong
 * here — RLS would return them an empty dashboard rather than an error, which
 * reads as a bug. Better to say plainly that the account isn't a vendor.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: vendors }, { data: profile }, cookieStore] = await Promise.all([
    supabase
      .from("vendor")
      .select("id, name, slug, contact_email, contact_phone, logo_url, bio, status, commission_rate")
      .order("name"),
    supabase
      .from("profile")
      .select("session_timeout_minutes")
      .eq("id", user.id)
      .single(),
    cookies(),
  ]);

  // Team management (0020) makes belonging to more than one vendor a real
  // case (an agency staffer on two clients' teams) — the active_vendor
  // cookie picks which one, defaulting to the first alphabetically when
  // unset or no longer valid. VendorSwitcher (in the sidebar) sets it.
  const activeVendorId = cookieStore.get("active_vendor")?.value;
  const vendor = ((vendors ?? []).find((v) => v.id === activeVendorId) ??
    vendors?.[0] ??
    null) as Vendor | null;

  if (!vendor) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold">This account isn&apos;t a vendor</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user.email} is signed in, but isn&apos;t linked to a vendor
            account. If you think that&apos;s wrong, contact the team at The
            Bucket List DXB.
          </p>
        </div>
      </main>
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-svh flex-col bg-background lg:flex-row">
        <IdleTimeout minutes={profile?.session_timeout_minutes ?? 30} />
        <DashboardSidebar
          vendorName={vendor.name}
          email={user.email ?? ""}
          vendors={(vendors ?? []) as Vendor[]}
          activeVendorId={vendor.id}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}
