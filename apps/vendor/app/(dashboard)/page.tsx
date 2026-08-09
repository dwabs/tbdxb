import Link from "next/link";

import { OverviewCharts } from "@/components/overview/overview-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  STATUS_META,
  type EventRow,
  type VendorEventStats,
  type VendorSummaryStats,
} from "@/lib/types";

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

const WEEK_LABEL = new Intl.DateTimeFormat("en-AE", { day: "numeric", month: "short" });

/** Sunday-start week buckets for the last 12 weeks, oldest first. Simpler
 *  than ISO weeks and good enough for a trend chart, not an invoice. */
function lastTwelveWeeks(): { start: Date; end: Date; label: string }[] {
  const weeks: { start: Date; end: Date; label: string }[] = [];
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

  for (let i = 11; i >= 0; i--) {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    weeks.push({ start, end, label: WEEK_LABEL.format(start) });
  }
  return weeks;
}

export default async function OverviewPage() {
  const supabase = await createClient();

  const [{ data: stats }, { data: events }, { data: ownEvents }, { data: eventStats }] =
    await Promise.all([
      supabase.from("vendor_summary_stats").select("*").maybeSingle(),
      supabase
        .from("event")
        .select("id, slug, title, status, starts_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase.from("event").select("id"),
      supabase.from("vendor_event_stats").select("*"),
    ]);

  const summary = stats as VendorSummaryStats | null;
  const recent = (events ?? []) as Pick<
    EventRow,
    "id" | "slug" | "title" | "status" | "starts_at" | "updated_at"
  >[];
  const perEvent = (eventStats ?? []) as VendorEventStats[];

  const tiles = [
    { label: "Upcoming events", value: String(summary?.upcoming_events ?? 0) },
    { label: "Tickets sold", value: String(summary?.tickets_sold ?? 0) },
    { label: "Net revenue", value: AED.format(summary?.net_aed ?? 0) },
  ];

  // Tickets/revenue over time — booking rows for this vendor's own events,
  // scoped explicitly the same way bookings/page.tsx does (the vendor read
  // policy is additive to "users read own bookings", so an operator account
  // that's also booked as a customer would otherwise leak those rows in).
  const eventIds = (ownEvents ?? []).map((e) => e.id as string);
  const weeks = lastTwelveWeeks();
  const weeklySeries = weeks.map((w) => ({ week: w.label, tickets: 0, revenue: 0 }));

  if (eventIds.length > 0) {
    const { data: bookingRows } = await supabase
      .from("booking")
      .select("created_at, quantity, total_aed")
      .in("event_id", eventIds)
      .neq("status", "cancelled")
      .eq("is_sample", false)
      .gte("created_at", weeks[0].start.toISOString());

    for (const row of bookingRows ?? []) {
      const createdAt = new Date(row.created_at as string);
      const bucket = weeks.findIndex((w) => createdAt >= w.start && createdAt < w.end);
      if (bucket === -1) continue;
      weeklySeries[bucket].tickets += row.quantity as number;
      weeklySeries[bucket].revenue += row.total_aed as number;
    }
  }

  // Views → bookings conversion — view_count is tracked on every event but
  // surfaced nowhere else in the vendor UI. Only events with at least one
  // view are worth showing a rate for.
  const conversionData = [...perEvent]
    .filter((e) => e.view_count > 0)
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6)
    .map((e) => ({
      title: e.title,
      views: e.view_count,
      tickets: e.tickets_sold,
      rate: Math.round((e.tickets_sold / e.view_count) * 1000) / 10,
    }));

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

      <OverviewCharts weeklySeries={weeklySeries} conversionData={conversionData} />

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
