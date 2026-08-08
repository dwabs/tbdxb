import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { STATUS_META, type EventRow } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function EventsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("event")
    .select("id, slug, title, status, starts_at, venue, area, view_count")
    .order("starts_at", { ascending: true, nullsFirst: false });

  const events = (data ?? []) as Pick<
    EventRow,
    "id" | "slug" | "title" | "status" | "starts_at" | "venue" | "area" | "view_count"
  >[];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <Button asChild>
          <Link href="/events/new">New event</Link>
        </Button>
      </div>

      <Card>
        <CardContent>
          {events.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No events yet.
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
