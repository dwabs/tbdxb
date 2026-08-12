import { StatTile } from "@/components/dashboard/stat-tile";
import { createClient } from "@/lib/supabase/server";
import type { AdminPlatformStats } from "@/lib/types";

const AED = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 0,
});

const NUMBER = new Intl.NumberFormat("en-AE");

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_platform_stats").single();

  if (error) console.error("admin_platform_stats:", error.message);

  const stats = data as AdminPlatformStats | null;

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
          />
          <StatTile
            label="Tickets sold"
            value={NUMBER.format(stats?.tickets_sold ?? 0)}
          />
          <StatTile
            label="Views"
            value={NUMBER.format(stats?.views_total ?? 0)}
            caption="Only reflects visits since view tracking was added — earlier history isn't counted."
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
