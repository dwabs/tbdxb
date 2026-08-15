import { BookingsFilterBar } from "@/components/bookings/bookings-filter-bar";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { PageStats } from "@/components/page-stats";
import { resolveActiveVendor } from "@/lib/active-vendor";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_META, type Booking, type BookingStatus } from "@/lib/types";

const STATUSES = Object.keys(BOOKING_STATUS_META) as BookingStatus[];
const NUMBER = new Intl.NumberFormat("en-AE");

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

  // Only the active vendor's bookings, not every vendor this account can
  // reach — see resolveActiveVendor for why RLS alone isn't the filter.
  const { vendor } = await resolveActiveVendor(supabase);
  const vendorId = vendor?.id;

  // "own events" bookings, scoped explicitly rather than relying on RLS
  // alone: the vendor policy is additive to the customer "own bookings"
  // policy, so an operator account that has also booked as a customer
  // would otherwise see those personal rows mixed into this list too.
  const { data: ownEvents } = await supabase
    .from("event")
    .select("id")
    .eq("vendor_id", vendorId ?? "00000000-0000-0000-0000-000000000000");
  const eventIds = (ownEvents ?? []).map((e) => e.id);

  // Unfiltered totals for the stats strip — independent of the list's own
  // search/status/when filters below, so the numbers stay stable while
  // filtering the table.
  let bookingsTotal = 0;
  let ticketsSold = 0;
  let viewsTotal = 0;
  if (eventIds.length > 0) {
    const [{ count }, { data: eventStats }] = await Promise.all([
      supabase
        .from("booking")
        .select("id", { count: "exact", head: true })
        .in("event_id", eventIds)
        .neq("status", "cancelled")
        .eq("is_sample", false),
      supabase.from("vendor_event_stats").select("view_count, tickets_sold").eq("vendor_id", vendorId ?? ""),
    ]);
    bookingsTotal = count ?? 0;
    for (const row of eventStats ?? []) {
      ticketsSold += row.tickets_sold as number;
      viewsTotal += row.view_count as number;
    }
  }

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

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
      </div>

      <PageStats
        items={[
          { label: "Bookings", value: NUMBER.format(bookingsTotal) },
          { label: "Tickets sold", value: NUMBER.format(ticketsSold) },
          { label: "Views", value: NUMBER.format(viewsTotal) },
        ]}
      />

      <BookingsFilterBar />

      <BookingsTable
        bookings={bookings}
        emptyMessage={hasFilters ? "No bookings match these filters." : "No bookings yet."}
      />
    </div>
  );
}
