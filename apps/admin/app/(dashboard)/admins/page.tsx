import { GrantAdminForm } from "@/components/admin/grant-admin-form";
import { RevokeAdminButton } from "@/components/admin/revoke-admin-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { AdminProfile } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminsPage() {
  const supabase = await createClient();

  const [{ data: { user } }, { data, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("admin_list_admins"),
  ]);

  if (error) console.error("admin_list_admins:", error.message);

  const admins = (data ?? []) as AdminProfile[];

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Admins</h1>

      <Card>
        <CardHeader>
          <CardTitle>Grant admin access</CardTitle>
        </CardHeader>
        <CardContent>
          <GrantAdminForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <ul className="divide-y">
            {admins.map((admin) => (
              <li key={admin.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {admin.full_name || admin.email}
                      {admin.id === user?.id ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (you)
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {admin.email} · joined {DATE.format(new Date(admin.created_at))}
                    </p>
                  </div>
                  {admin.id !== user?.id ? (
                    <RevokeAdminButton userId={admin.id} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
