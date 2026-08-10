import { BookingsFilterBar } from "@/components/bookings/bookings-filter-bar";
import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { CheckInButton } from "@/components/bookings/check-in-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const CHECKED_IN_AT = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
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
        "id, reference, event_id, event_title, event_slug, quantity, total_aed, event_date, status, attendee_name, attendee_phone, checked_in_at, created_at",
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
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
      </div>

      <BookingsFilterBar />

      <Card>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              {hasFilters
                ? "No bookings match these filters."
                : "No bookings yet."}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => {
                  const canCancel =
                    booking.status === "confirmed" &&
                    booking.event_date >= todayISO &&
                    !booking.checked_in_at;
                  return (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.attendee_name}
                        {booking.attendee_phone ? (
                          <span className="block text-xs font-normal text-muted-foreground">
                            {booking.attendee_phone}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-56 truncate">{booking.event_title}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {booking.reference}
                      </TableCell>
                      <TableCell className="tabular-nums">{booking.quantity}</TableCell>
                      <TableCell className="tabular-nums">
                        {DATE.format(new Date(booking.event_date))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={BOOKING_STATUS_META[booking.status].className}
                        >
                          {BOOKING_STATUS_META[booking.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {AED.format(booking.total_aed)}
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.checked_in_at ? (
                          <span className="text-xs text-muted-foreground">
                            Checked in ✓ {CHECKED_IN_AT.format(new Date(booking.checked_in_at))}
                          </span>
                        ) : (
                          <div className="flex justify-end gap-2">
                            {booking.status === "confirmed" ? (
                              <CheckInButton reference={booking.reference} />
                            ) : null}
                            {canCancel ? <CancelBookingButton bookingId={booking.id} /> : null}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
