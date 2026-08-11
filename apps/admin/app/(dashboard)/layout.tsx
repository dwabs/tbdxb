import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/admin-header";
import { createClient } from "@/lib/supabase/server";

/**
 * The auth gate for everything under it. Two checks, not one: signed in,
 * and profile.is_admin. This Supabase project is shared with the public
 * site and the vendor dashboard, so a signed-in customer or vendor account
 * isn't automatically an admin — same pattern as apps/vendor's "isn't a
 * vendor" gate.
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

  const { data: profile } = await supabase
    .from("profile")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold">This account isn&apos;t an admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user.email} is signed in, but doesn&apos;t have admin access. If
            you think that&apos;s wrong, contact the team at The Bucket List
            DXB.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AdminHeader email={user.email ?? ""} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
