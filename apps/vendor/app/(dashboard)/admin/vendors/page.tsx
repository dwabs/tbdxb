import Link from "next/link";

import { CreateVendorForm } from "@/components/admin/create-vendor-form";
import { VendorStatusEditor } from "@/components/admin/vendor-status-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/lib/types";

export default async function AdminVendorsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("vendor")
    .select("id, name, slug, contact_email, contact_phone, logo_url, bio, status, commission_rate")
    .order("name");

  const vendors = (data ?? []) as Vendor[];

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Vendors</h1>

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
                        href={`/admin/vendors/${vendor.id}`}
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
