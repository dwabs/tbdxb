import { redirect } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
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

  const { data: vendors } = await supabase
    .from("vendor")
    .select("id, name, slug, contact_email, contact_phone, logo_url, bio, status, commission_rate")
    .order("name");

  const vendor = (vendors?.[0] ?? null) as Vendor | null;

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
    <div className="min-h-svh bg-muted/40">
      <DashboardNav vendorName={vendor.name} email={user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
