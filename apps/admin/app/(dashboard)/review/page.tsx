import Link from "next/link";

import { ReviewQueueActions } from "@/components/admin/review-queue-actions";
import { PageStats } from "@/components/dashboard/page-stats";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { AdminPlatformStats } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type SubmittedEvent = {
  id: string;
  vendor_id: string;
  slug: string;
  title: string;
  starts_at: string | null;
  submitted_at: string | null;
  vendor: { name: string } | null;
};

export default async function ReviewPage() {
  const supabase = await createClient();

  const [{ data }, { data: statsData }] = await Promise.all([
    supabase
      .from("event")
      .select("id, vendor_id, slug, title, starts_at, submitted_at, vendor:vendor_id(name)")
      .eq("status", "submitted")
      .order("submitted_at"),
    supabase.rpc("admin_platform_stats").single(),
  ]);

  const submitted = (data ?? []) as unknown as SubmittedEvent[];
  const stats = statsData as AdminPlatformStats | null;

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Review queue</h1>

      <PageStats
        items={[
          { label: "Draft", value: stats?.events_draft ?? 0 },
          { label: "In review", value: stats?.events_submitted ?? 0 },
          { label: "Approved", value: stats?.events_approved ?? 0 },
          { label: "Live", value: stats?.events_published ?? 0 },
          { label: "Rejected", value: stats?.events_rejected ?? 0 },
          { label: "Archived", value: stats?.events_archived ?? 0 },
        ]}
      />

      <Card>
        <CardContent>
          {submitted.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nothing waiting on review.
            </p>
          ) : (
            <ul className="divide-y">
              {submitted.map((event) => (
                <li key={event.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/vendors/${event.vendor_id}/events/${event.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {event.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.vendor?.name ?? "Unknown vendor"}
                        {event.starts_at
                          ? ` · ${DATE.format(new Date(event.starts_at))}`
                          : ""}
                      </p>
                    </div>
                    <ReviewQueueActions eventId={event.id} />
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
