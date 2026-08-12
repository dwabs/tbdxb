import { notFound } from "next/navigation";

import { BookingsTable } from "@/components/bookings/bookings-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import {
  STATUS_META,
  type AdminBooking,
  type BookingStatus,
  type EventRow,
  type TicketType,
} from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

type BookingRow = {
  id: string;
  reference: string;
  event_id: string | null;
  event_title: string;
  event_slug: string;
  quantity: number;
  total_aed: number;
  event_date: string;
  status: BookingStatus;
  attendee_name: string;
  attendee_phone: string;
  checked_in_at: string | null;
  created_at: string;
};

export default async function AdminEventPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const { id, eventId } = await params;
  const supabase = await createClient();

  const [{ data: event }, { data: ticketTypes }, { data: bookingRows }] = await Promise.all([
    supabase
      .from("event")
      .select(
        "id, vendor_id, slug, status, title, venue, area, starts_at, ends_at, duration_label, group_size, tags, view_count",
      )
      .eq("id", eventId)
      .eq("vendor_id", id)
      .maybeSingle(),
    supabase
      .from("ticket_type")
      .select("id, event_id, title, price_aed, discount_price_aed, quantity_total, quantity_sold, position")
      .eq("event_id", eventId)
      .order("position", { ascending: true }),
    supabase
      .from("booking")
      .select(
        "id, reference, event_id, event_title, event_slug, quantity, total_aed, event_date, status, attendee_name, attendee_phone, checked_in_at, created_at",
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
  ]);

  if (!event) notFound();

  const eventRow = event as Pick<
    EventRow,
    | "id"
    | "vendor_id"
    | "slug"
    | "status"
    | "title"
    | "venue"
    | "area"
    | "starts_at"
    | "ends_at"
    | "duration_label"
    | "group_size"
    | "tags"
    | "view_count"
  >;
  const tickets = (ticketTypes ?? []) as TicketType[];
  const bookings: AdminBooking[] = ((bookingRows ?? []) as BookingRow[]).map((row) => ({
    ...row,
    vendor_id: null,
    vendor_name: null,
  }));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{eventRow.title}</h1>
        <Badge variant="secondary" className={STATUS_META[eventRow.status].className}>
          {STATUS_META[eventRow.status].label}
        </Badge>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Venue</p>
                <p>{eventRow.venue || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Area</p>
                <p>{eventRow.area || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Starts</p>
                <p>{eventRow.starts_at ? DATE.format(new Date(eventRow.starts_at)) : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ends</p>
                <p>{eventRow.ends_at ? DATE.format(new Date(eventRow.ends_at)) : "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p>{eventRow.duration_label || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Group size</p>
                <p>{eventRow.group_size || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Views</p>
                <p>{eventRow.view_count}</p>
                <p className="text-xs text-muted-foreground">
                  Only reflects visits since view tracking was added.
                </p>
              </div>
              {eventRow.tags.length > 0 ? (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground">Tags</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {eventRow.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ticket types</CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No ticket types.</p>
              ) : (
                <ul className="divide-y">
                  {tickets.map((ticket) => (
                    <li key={ticket.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-medium">{ticket.title}</p>
                      <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
                        {ticket.discount_price_aed ? (
                          <>
                            <span className="line-through">{AED.format(ticket.price_aed)}</span>{" "}
                            {AED.format(ticket.discount_price_aed)}
                          </>
                        ) : (
                          AED.format(ticket.price_aed)
                        )}{" "}
                        · {ticket.quantity_sold}/{ticket.quantity_total} sold
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTable
            bookings={bookings}
            showEventColumn={false}
            showVendorColumn={false}
            emptyMessage="No bookings for this event yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
