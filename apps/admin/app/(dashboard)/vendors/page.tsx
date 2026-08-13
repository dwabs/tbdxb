import Link from "next/link";

import { CreateVendorForm } from "@/components/admin/create-vendor-form";
import { VendorStatusEditor } from "@/components/admin/vendor-status-editor";
import { PageStats } from "@/components/dashboard/page-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { AdminPlatformStats, Vendor } from "@/lib/types";

export default async function VendorsPage() {
  const supabase = await createClient();

  const [{ data }, { data: statsData }] = await Promise.all([
    supabase
      .from("vendor")
      .select("id, name, slug, contact_email, contact_phone, logo_url, bio, status, commission_rate")
      .order("name"),
    supabase.rpc("admin_platform_stats").single(),
  ]);

  const vendors = (data ?? []) as Vendor[];
  const stats = statsData as AdminPlatformStats | null;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>

      <PageStats
        items={[
          { label: "Pending", value: stats?.vendors_pending ?? 0 },
          { label: "Approved", value: stats?.vendors_approved ?? 0 },
          { label: "Suspended", value: stats?.vendors_suspended ?? 0 },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Create vendor</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateVendorForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {vendors.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No vendors yet.
            </p>
          ) : (
            <ul className="divide-y">
              {vendors.map((vendor) => (
                <li key={vendor.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/vendors/${vendor.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {vendor.name}
                      </Link>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {vendor.contact_email}
                      </p>
                    </div>
                    <VendorStatusEditor vendor={vendor} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
