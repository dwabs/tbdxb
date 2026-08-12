import { BookingsFilterBar } from "@/components/bookings/bookings-filter-bar";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUS_META, type AdminBooking, type BookingStatus } from "@/lib/types";

const STATUSES = Object.keys(BOOKING_STATUS_META) as BookingStatus[];

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
  event: { vendor_id: string; vendor: { name: string } | null } | null;
};

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
  const vendorId = first(params.vendor);

  const supabase = await createClient();

  const { data: vendorRows } = await supabase
    .from("vendor")
    .select("id, name")
    .order("name");
  const vendors = vendorRows ?? [];

  let eventIds: string[] | null = null;
  if (vendorId) {
    const { data: vendorEvents } = await supabase
      .from("event")
      .select("id")
      .eq("vendor_id", vendorId);
    eventIds = (vendorEvents ?? []).map((e) => e.id);
  }

  let query = supabase
    .from("booking")
    .select(
      "id, reference, event_id, event_title, event_slug, quantity, total_aed, event_date, status, attendee_name, attendee_phone, checked_in_at, created_at, event:event_id(vendor_id, vendor:vendor_id(name))",
    );

  if (eventIds) query = query.in("event_id", eventIds);

  const qSafe = q.replace(/[,()]/g, "");
  if (status) query = query.eq("status", status);
  if (qSafe) {
    query = query.or(
      `reference.ilike.%${qSafe}%,attendee_name.ilike.%${qSafe}%,event_title.ilike.%${qSafe}%`,
    );
  }
  if (when === "upcoming") query = query.gte("event_date", new Date().toISOString().slice(0, 10));
  if (when === "past") query = query.lt("event_date", new Date().toISOString().slice(0, 10));

  const { data, error } = await query.order("event_date", { ascending: when !== "past" });
  if (error) console.error("admin bookings query:", error.message);

  const rows = (data ?? []) as unknown as BookingRow[];
  const bookings: AdminBooking[] = rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    event_id: row.event_id,
    event_title: row.event_title,
    event_slug: row.event_slug,
    quantity: row.quantity,
    total_aed: row.total_aed,
    event_date: row.event_date,
    status: row.status,
    attendee_name: row.attendee_name,
    attendee_phone: row.attendee_phone,
    checked_in_at: row.checked_in_at,
    created_at: row.created_at,
    vendor_id: row.event?.vendor_id ?? null,
    vendor_name: row.event?.vendor?.name ?? null,
  }));

  const hasFilters = Boolean(q || status || vendorId || (when && when !== "upcoming"));

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>

      <BookingsFilterBar vendors={vendors} />

      <BookingsTable
        bookings={bookings}
        emptyMessage={hasFilters ? "No bookings match these filters." : "No bookings yet."}
      />
    </div>
  );
}
