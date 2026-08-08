import { notFound } from "next/navigation";

import { EventForm } from "@/components/events/event-form";
import { createClient } from "@/lib/supabase/server";
import type { EventImage, EventRow, TicketType } from "@/lib/types";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event }, { data: ticketTypes }, { data: images }] = await Promise.all([
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
  ]);

  if (!event) notFound();

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
      <EventForm
        mode="edit"
        vendorId={event.vendor_id}
        event={event as EventRow}
        ticketTypes={(ticketTypes ?? []) as TicketType[]}
        images={(images ?? []) as EventImage[]}
      />
    </div>
  );
}
