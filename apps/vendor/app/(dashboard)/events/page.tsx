import Link from "next/link";

import { EventsFilterBar } from "@/components/events/events-filter-bar";
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

  let query = supabase
    .from("event")
    .select("id, slug, title, status, starts_at, venue, area, view_count");

  // Stripped rather than escaped: these characters are structural in
  // PostgREST's .or() filter syntax (condition/group separators), and a
  // search box has no real need for them.
  const qSafe = q.replace(/[,()]/g, "");

  if (status) query = query.eq("status", status);
  if (qSafe) query = query.or(`title.ilike.%${qSafe}%,venue.ilike.%${qSafe}%`);
  if (when === "upcoming") query = query.gte("starts_at", new Date().toISOString());
  if (when === "past") query = query.lt("starts_at", new Date().toISOString());

  const { data } = await query.order("starts_at", {
    ascending: when !== "past",
    nullsFirst: false,
  });

  const events = (data ?? []) as Pick<
    EventRow,
    "id" | "slug" | "title" | "status" | "starts_at" | "venue" | "area" | "view_count"
  >[];
  const hasFilters = Boolean(q || status || (when && when !== "upcoming"));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <Button asChild>
          <Link href="/events/new">New event</Link>
        </Button>
      </div>

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
