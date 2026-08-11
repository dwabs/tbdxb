import { notFound } from "next/navigation";

import { VendorStatusEditor } from "@/components/admin/vendor-status-editor";
import { AddTeamMemberForm } from "@/components/team/add-team-member-form";
import { TeamList } from "@/components/team/team-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/lib/types";

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: vendor } = await supabase
    .from("vendor")
    .select("id, name, slug, contact_email, contact_phone, logo_url, bio, status, commission_rate")
    .eq("id", id)
    .maybeSingle();

  if (!vendor) notFound();

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{vendor.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <VendorStatusEditor vendor={vendor as Vendor} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <AddTeamMemberForm vendorId={vendor.id} />
          <TeamList vendorId={vendor.id} canManage />
        </CardContent>
      </Card>
    </div>
  );
}
