import { SessionTimeoutForm } from "@/components/settings/session-timeout-form";
import { VendorSettingsForm } from "@/components/settings/vendor-settings-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: vendorData }, { data: profileData }] = await Promise.all([
    supabase
      .from("vendor")
      .select("id, name, contact_email, contact_phone, logo_url, bio")
      .limit(1)
      .single(),
    supabase
      .from("profile")
      .select("session_timeout_minutes")
      .eq("id", user!.id)
      .single(),
  ]);

  const vendor = vendorData as Pick<
    Vendor,
    "id" | "name" | "contact_email" | "contact_phone" | "logo_url" | "bio"
  >;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

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
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionTimeoutForm
            userId={user!.id}
            minutes={profileData?.session_timeout_minutes ?? 30}
          />
        </CardContent>
      </Card>
    </div>
  );
}
