import Link from "next/link";
import { notFound } from "next/navigation";

import { VendorStatusEditor } from "@/components/admin/vendor-status-editor";
import { AddTeamMemberForm } from "@/components/team/add-team-member-form";
import { TeamList } from "@/components/team/team-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META, type EventRow, type Vendor } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: vendor }, { data: eventRows }] = await Promise.all([
    supabase
      .from("vendor")
      .select("id, name, slug, contact_email, contact_phone, logo_url, bio, status, commission_rate")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("event")
      .select("id, vendor_id, slug, status, title, starts_at")
      .eq("vendor_id", id)
      .order("starts_at", { ascending: false }),
  ]);

  if (!vendor) notFound();

  const events = (eventRows ?? []) as Pick<EventRow, "id" | "vendor_id" | "slug" | "status" | "title" | "starts_at">[];

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
          <CardTitle>Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <ul className="divide-y">
              {events.map((event) => (
                <li key={event.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={`/vendors/${id}/events/${event.id}`}
                      className="min-w-0 truncate text-sm font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                    <div className="flex shrink-0 items-center gap-3">
                      {event.starts_at ? (
                        <span className="text-xs text-muted-foreground">
                          {DATE.format(new Date(event.starts_at))}
                        </span>
                      ) : null}
                      <Badge variant="secondary" className={STATUS_META[event.status].className}>
                        {STATUS_META[event.status].label}
                      </Badge>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
