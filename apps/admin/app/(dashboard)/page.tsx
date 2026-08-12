import { TrendSparkline } from "@/components/dashboard/mini-charts";
import { StatTile } from "@/components/dashboard/stat-tile";
import { createClient } from "@/lib/supabase/server";
import type { AdminPlatformStats } from "@/lib/types";

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

const NUMBER = new Intl.NumberFormat("en-AE");
const WEEK_LABEL = new Intl.DateTimeFormat("en-AE", { day: "numeric", month: "short" });

/** Sunday-start week buckets for the last 12 weeks, oldest first — same
 *  bucketing apps/vendor's Overview chart uses, just platform-wide here. */
function lastTwelveWeeks(): { start: Date; end: Date; label: string }[] {
  const weeks: { start: Date; end: Date; label: string }[] = [];
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setHours(0, 0, 0, 0);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

  for (let i = 11; i >= 0; i--) {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    weeks.push({ start, end, label: WEEK_LABEL.format(start) });
  }
  return weeks;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const weeks = lastTwelveWeeks();

  const [{ data, error }, { data: bookingRows }, { data: viewRows }] = await Promise.all([
    supabase.rpc("admin_platform_stats").single(),
    supabase
      .from("booking")
      .select("created_at, quantity")
      .neq("status", "cancelled")
      .eq("is_sample", false)
      .gte("created_at", weeks[0].start.toISOString()),
    supabase
      .from("event_view_log")
      .select("viewed_at")
      .gte("viewed_at", weeks[0].start.toISOString()),
  ]);

  if (error) console.error("admin_platform_stats:", error.message);

  const stats = data as AdminPlatformStats | null;

  // Bookings/tickets/views all get a real 12-week trend now — event_view_log
  // (migration 0025) gives views the same timestamped history bookings
  // already had. It only starts counting from its own deploy date, same as
  // view_count itself did (0018), so it reads mostly flat until it fills in.
  const bookingsSeries = weeks.map((w) => ({ label: w.label, value: 0 }));
  const ticketsSeries = weeks.map((w) => ({ label: w.label, value: 0 }));
  const viewsSeries = weeks.map((w) => ({ label: w.label, value: 0 }));
  for (const row of bookingRows ?? []) {
    const createdAt = new Date(row.created_at as string);
    const bucket = weeks.findIndex((w) => createdAt >= w.start && createdAt < w.end);
    if (bucket === -1) continue;
    bookingsSeries[bucket].value += 1;
    ticketsSeries[bucket].value += row.quantity as number;
  }
  for (const row of viewRows ?? []) {
    const viewedAt = new Date(row.viewed_at as string);
    const bucket = weeks.findIndex((w) => viewedAt >= w.start && viewedAt < w.end);
    if (bucket === -1) continue;
    viewsSeries[bucket].value += 1;
  }

  return (
    <div className="grid gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">
          Vendors
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Pending" value={stats?.vendors_pending ?? 0} />
          <StatTile label="Approved" value={stats?.vendors_approved ?? 0} />
          <StatTile label="Suspended" value={stats?.vendors_suspended ?? 0} />
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">
          Events
        </h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Draft" value={stats?.events_draft ?? 0} />
          <StatTile label="In review" value={stats?.events_submitted ?? 0} />
          <StatTile label="Approved" value={stats?.events_approved ?? 0} />
          <StatTile label="Live" value={stats?.events_published ?? 0} />
          <StatTile label="Rejected" value={stats?.events_rejected ?? 0} />
          <StatTile label="Archived" value={stats?.events_archived ?? 0} />
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">
          Bookings &amp; views
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Bookings"
            value={NUMBER.format(stats?.bookings_total ?? 0)}
            caption="Last 12 weeks"
            chart={<TrendSparkline data={bookingsSeries} tooltipLabel="Bookings" />}
          />
          <StatTile
            label="Tickets sold"
            value={NUMBER.format(stats?.tickets_sold ?? 0)}
            caption="Last 12 weeks"
            chart={<TrendSparkline data={ticketsSeries} tooltipLabel="Tickets" />}
          />
          <StatTile
            label="Views"
            value={NUMBER.format(stats?.views_total ?? 0)}
            caption="Last 12 weeks — only reflects visits since tracking was added"
            chart={<TrendSparkline data={viewsSeries} tooltipLabel="Views" />}
          />
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase">
          Revenue
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatTile
            label="Gross ticket sales"
            value={AED.format(stats?.gross_revenue_aed ?? 0)}
          />
          <StatTile
            label="Platform commission"
            value={AED.format(stats?.commission_revenue_aed ?? 0)}
          />
        </div>
      </section>
    </div>
  );
}
