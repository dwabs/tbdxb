import { redirect } from "next/navigation";

import { EventForm } from "@/components/events/event-form";
import { resolveActiveVendor } from "@/lib/active-vendor";
import { createClient } from "@/lib/supabase/server";

export default async function NewEventPage() {
  const supabase = await createClient();

  // Files the new event under the active vendor specifically: an arbitrary
  // pick would mean the wrong owner and wrong commission_rate, and the
  // event wouldn't appear under the vendor it was meant for.
  const { vendor } = await resolveActiveVendor(supabase);
  if (!vendor) redirect("/");

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New event</h1>
      <EventForm mode="create" vendorId={vendor.id} />
    </div>
  );
}
