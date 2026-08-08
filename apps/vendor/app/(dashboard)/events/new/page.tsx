import { redirect } from "next/navigation";

import { EventForm } from "@/components/events/event-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewEventPage() {
  const supabase = await createClient();

  const { data: vendor } = await supabase.from("vendor").select("id").limit(1).single();
  if (!vendor) redirect("/");

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New event</h1>
      <EventForm mode="create" vendorId={vendor.id} />
    </div>
  );
}
