import { cookies } from "next/headers";
import Link from "next/link";

import { EventsFilterBar } from "@/components/events/events-filter-bar";
import { PageStats } from "@/components/page-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META, type EventRow, type EventStatus } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const STATUSES = Object.keys(STATUS_META) as EventStatus[];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

  const q = first(params.q);
  const status = STATUSES.includes(first(params.status) as EventStatus)
    ? (first(params.status) as EventStatus)
    : null;
  const when = first(params.when) || "upcoming";

  const supabase = await createClient();

  // Same active_vendor cookie as layout.tsx/settings — a user on more than
  // one vendor's team must only see the active one's events here, not every
  // vendor they belong to merged together.
  const [{ data: vendors }, cookieStore] = await Promise.all([
    supabase.from("vendor").select("id").order("name"),
    cookies(),
  ]);
  const activeVendorId = cookieStore.get("active_vendor")?.value;
  const vendorId =
    (vendors ?? []).find((v) => v.id === activeVendorId)?.id ?? vendors?.[0]?.id;

  // vendorId is always set in practice — the layout above already redirects
  // anyone with zero vendor_member rows before this page can render — but
  // typed as optional rather than asserted, so a future change here fails
  // safe (an empty list) instead of erroring on an invalid filter.
  let query = supabase
    .from("event")
    .select("id, slug, title, status, starts_at, venue, area, view_count")
    .eq("vendor_id", vendorId ?? "00000000-0000-0000-0000-000000000000");

  // Stripped rather than escaped: these characters are structural in
  // PostgREST's .or() filter syntax (condition/group separators), and a
  // search box has no real need for them.
  const qSafe = q.replace(/[,()]/g, "");

  if (status) query = query.eq("status", status);
  if (qSafe) query = query.or(`title.ilike.%${qSafe}%,venue.ilike.%${qSafe}%`);
  if (when === "upcoming") query = query.gte("starts_at", new Date().toISOString());
  if (when === "past") query = query.lt("starts_at", new Date().toISOString());

  // Unfiltered status counts for the stats strip — independent of the list's
  // own search/status/when filters above, so the numbers stay stable while
  // filtering the table.
  const [{ data }, { data: statusRows }] = await Promise.all([
    query.order("starts_at", { ascending: when !== "past", nullsFirst: false }),
    supabase
      .from("event")
      .select("status")
      .eq("vendor_id", vendorId ?? "00000000-0000-0000-0000-000000000000"),
  ]);

  const events = (data ?? []) as Pick<
    EventRow,
    "id" | "slug" | "title" | "status" | "starts_at" | "venue" | "area" | "view_count"
  >[];
  const hasFilters = Boolean(q || status || (when && when !== "upcoming"));

  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<
    EventStatus,
    number
  >;
  for (const row of statusRows ?? []) {
    statusCounts[row.status as EventStatus] += 1;
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <Button asChild>
          <Link href="/events/new">New event</Link>
        </Button>
      </div>

      <PageStats
        items={STATUSES.map((s) => ({
          label: STATUS_META[s].label,
          value: statusCounts[s],
        }))}
      />

      <EventsFilterBar />

      <Card>
        <CardContent>
          {events.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {hasFilters
                ? "No events match these filters."
                : "No events yet."}
            </p>
          ) : (
            <ul className="divide-y">
              {events.map((event) => (
                <li key={event.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {event.title}
                      </Link>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {[event.venue, event.area].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {event.starts_at
                          ? DATE.format(new Date(event.starts_at))
                          : "No date"}
                      </span>
                      <Badge
                        variant="secondary"
                        className={STATUS_META[event.status].className}
                      >
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
    </div>
  );
}
