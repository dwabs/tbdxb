import { BookingsFilterBar } from "@/components/bookings/bookings-filter-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_META, type Booking, type BookingStatus } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

const STATUSES = Object.keys(BOOKING_STATUS_META) as BookingStatus[];

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

  const q = first(params.q);
  const status = STATUSES.includes(first(params.status) as BookingStatus)
    ? (first(params.status) as BookingStatus)
    : null;
  const when = first(params.when) || "upcoming";

  const supabase = await createClient();

  // "own events" bookings, scoped explicitly rather than relying on RLS
  // alone: the vendor policy is additive to the customer "own bookings"
  // policy, so an operator account that has also booked as a customer
  // would otherwise see those personal rows mixed into this list too.
  const { data: ownEvents } = await supabase.from("event").select("id");
  const eventIds = (ownEvents ?? []).map((e) => e.id);

  let bookings: Booking[] = [];
  if (eventIds.length > 0) {
    let query = supabase
      .from("booking")
      .select(
        "id, reference, event_id, event_title, event_slug, quantity, total_aed, event_date, status, attendee_name, attendee_phone, created_at",
      )
      .in("event_id", eventIds);

    const qSafe = q.replace(/[,()]/g, "");
    if (status) query = query.eq("status", status);
    if (qSafe) {
      query = query.or(
        `reference.ilike.%${qSafe}%,attendee_name.ilike.%${qSafe}%,event_title.ilike.%${qSafe}%`,
      );
    }
    if (when === "upcoming") query = query.gte("event_date", new Date().toISOString().slice(0, 10));
    if (when === "past") query = query.lt("event_date", new Date().toISOString().slice(0, 10));

    const { data } = await query.order("event_date", {
      ascending: when !== "past",
    });
    bookings = (data ?? []) as Booking[];
  }

  const hasFilters = Boolean(q || status || (when && when !== "upcoming"));

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
      </div>

      <BookingsFilterBar />

      <Card>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {hasFilters
                ? "No bookings match these filters."
                : "No bookings yet."}
            </p>
          ) : (
            <ul className="divide-y">
              {bookings.map((booking) => (
                <li key={booking.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{booking.attendee_name}</p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {booking.event_title} · {booking.quantity}{" "}
                        {booking.quantity === 1 ? "ticket" : "tickets"} ·{" "}
                        <span className="tabular-nums">{booking.reference}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm tabular-nums text-muted-foreground">
                          {DATE.format(new Date(booking.event_date))}
                        </span>
                        <Badge
                          variant="secondary"
                          className={BOOKING_STATUS_META[booking.status].className}
                        >
                          {BOOKING_STATUS_META[booking.status].label}
                        </Badge>
                      </div>
                      <span className="text-sm font-medium tabular-nums">
                        {AED.format(booking.total_aed)}
                      </span>
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
