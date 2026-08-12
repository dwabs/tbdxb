import Link from "next/link";

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
import { BOOKING_STATUS_META, type AdminBooking } from "@/lib/types";

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

/**
 * Shared between the global /bookings list (all vendors, filterable) and the
 * per-event Bookings tab (one event, no filters) — same table, same
 * actions. showEventColumn/showVendorColumn hide columns already implicit
 * from context.
 */
export function BookingsTable({
  bookings,
  showEventColumn = true,
  showVendorColumn = true,
  emptyMessage = "No bookings yet.",
}: {
  bookings: AdminBooking[];
  showEventColumn?: boolean;
  showVendorColumn?: boolean;
  emptyMessage?: string;
}) {
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <CardContent className="p-0">
        {bookings.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attendee</TableHead>
                {showEventColumn ? <TableHead>Event</TableHead> : null}
                {showVendorColumn ? <TableHead>Vendor</TableHead> : null}
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
                const eventLink =
                  booking.vendor_id && booking.event_id
                    ? `/vendors/${booking.vendor_id}/events/${booking.event_id}`
                    : null;
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
                    {showEventColumn ? (
                      <TableCell className="max-w-56 truncate">
                        {eventLink ? (
                          <Link href={eventLink} className="hover:underline">
                            {booking.event_title}
                          </Link>
                        ) : (
                          booking.event_title
                        )}
                      </TableCell>
                    ) : null}
                    {showVendorColumn ? (
                      <TableCell className="max-w-40 truncate text-muted-foreground">
                        {booking.vendor_name ?? "—"}
                      </TableCell>
                    ) : null}
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
  );
}
