import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META, type EventRow, type VendorSummaryStats } from "@/lib/types";

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

export default async function OverviewPage() {
  const supabase = await createClient();

  const [{ data: stats }, { data: events }] = await Promise.all([
    supabase.from("vendor_summary_stats").select("*").maybeSingle(),
    supabase
      .from("event")
      .select("id, slug, title, status, starts_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const summary = stats as VendorSummaryStats | null;
  const recent = (events ?? []) as Pick<
    EventRow,
    "id" | "slug" | "title" | "status" | "starts_at" | "updated_at"
  >[];

  const tiles = [
    { label: "Upcoming events", value: String(summary?.upcoming_events ?? 0) },
    { label: "Tickets sold", value: String(summary?.tickets_sold ?? 0) },
    { label: "Net revenue", value: AED.format(summary?.net_aed ?? 0) },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <Button asChild>
          <Link href="/events/new">New event</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {tile.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{tile.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No events yet.{" "}
              <Link href="/events/new" className="underline underline-offset-4">
                Create your first one
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/events/${event.id}`}
                    className="min-w-0 flex-1 text-sm font-medium hover:underline"
                  >
                    <span className="block truncate">{event.title}</span>
                  </Link>
                  <Badge
                    variant="secondary"
                    className={STATUS_META[event.status].className}
                  >
                    {STATUS_META[event.status].label}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
