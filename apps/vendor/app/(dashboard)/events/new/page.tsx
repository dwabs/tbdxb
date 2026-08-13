import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { EventForm } from "@/components/events/event-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewEventPage() {
  const supabase = await createClient();

  // Same active_vendor cookie as layout.tsx/settings — .limit(1).single()
  // with no ordering picked an arbitrary vendor (whichever Postgres
  // returned first), so a staffer on two teams could have a new event
  // silently filed under the wrong vendor: wrong owner, wrong
  // commission_rate, and it wouldn't show up under the vendor they meant
  // to create it for.
  const [{ data: vendors }, cookieStore] = await Promise.all([
    supabase.from("vendor").select("id").order("name"),
    cookies(),
  ]);
  const activeVendorId = cookieStore.get("active_vendor")?.value;
  const vendor =
    (vendors ?? []).find((v) => v.id === activeVendorId) ?? vendors?.[0] ?? null;
  if (!vendor) redirect("/");

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New event</h1>
      <EventForm mode="create" vendorId={vendor.id} />
    </div>
  );
}
