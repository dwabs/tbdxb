import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>No platform stats yet</CardTitle>
          <CardDescription>
            Review queue, vendor management, and admin management are live
            in the nav above. Vendor/event counts, bookings, views, and
            revenue land here next.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
