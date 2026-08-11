import { notFound } from "next/navigation";

import { BookingsTable } from "@/components/bookings/bookings-table";
import { EventForm } from "@/components/events/event-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import type { Booking, EventImage, EventRow, TicketType } from "@/lib/types";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event }, { data: ticketTypes }, { data: images }, { data: bookingRows }] =
    await Promise.all([
      supabase.from("event").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("ticket_type")
        .select("*")
        .eq("event_id", id)
        .order("position", { ascending: true }),
      supabase
        .from("event_image")
        .select("*")
        .eq("event_id", id)
        .order("position", { ascending: true }),
      supabase
        .from("booking")
        .select(
          "id, reference, event_id, event_title, event_slug, quantity, total_aed, event_date, status, attendee_name, attendee_phone, checked_in_at, created_at",
        )
        .eq("event_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!event) notFound();

  const bookings = (bookingRows ?? []) as Booking[];

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="details">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="details">
          <EventForm
            mode="edit"
            vendorId={event.vendor_id}
            event={event as EventRow}
            ticketTypes={(ticketTypes ?? []) as TicketType[]}
            images={(images ?? []) as EventImage[]}
          />
        </TabsContent>
        <TabsContent value="bookings">
          <BookingsTable
            bookings={bookings}
            showEventColumn={false}
            emptyMessage="No bookings for this event yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
