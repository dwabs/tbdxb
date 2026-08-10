import { cookies } from "next/headers";

import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { SessionTimeoutForm } from "@/components/settings/session-timeout-form";
import { VendorSettingsForm } from "@/components/settings/vendor-settings-form";
import { AddTeamMemberForm } from "@/components/team/add-team-member-form";
import { TeamList } from "@/components/team/team-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Same active_vendor cookie as layout.tsx (0020's team management is what
  // first makes multi-vendor membership real) — kept consistent so the Team
  // card below manages the same vendor the sidebar/switcher is showing.
  const cookieStore = await cookies();
  const activeVendorId = cookieStore.get("active_vendor")?.value;

  const [{ data: vendors }, { data: profileData }] = await Promise.all([
    supabase
      .from("vendor")
      .select("id, name, contact_email, contact_phone, logo_url, bio")
      .order("name"),
    supabase
      .from("profile")
      .select("session_timeout_minutes")
      .eq("id", user!.id)
      .single(),
  ]);

  const vendor = ((vendors ?? []).find((v) => v.id === activeVendorId) ??
    vendors?.[0] ??
    null) as Pick<
    Vendor,
    "id" | "name" | "contact_email" | "contact_phone" | "logo_url" | "bio"
  > | null;

  const { data: membership } = vendor
    ? await supabase
        .from("vendor_member")
        .select("role")
        .eq("vendor_id", vendor.id)
        .eq("user_id", user!.id)
        .maybeSingle()
    : { data: null };

  const isOwner = membership?.role === "owner";

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      {vendor ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Business profile</CardTitle>
            </CardHeader>
            <CardContent>
              <VendorSettingsForm vendor={vendor} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {isOwner ? <AddTeamMemberForm vendorId={vendor.id} /> : null}
              <TeamList vendorId={vendor.id} canManage={isOwner} />
            </CardContent>
          </Card>
        </>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <SessionTimeoutForm
            userId={user!.id}
            minutes={profileData?.session_timeout_minutes ?? 30}
          />
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
