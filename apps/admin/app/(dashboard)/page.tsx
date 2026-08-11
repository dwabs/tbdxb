import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nothing here yet</CardTitle>
          <CardDescription>
            This is the shell — sign-in and admin access are wired up.
            Platform stats, vendor management, and the user list move in
            over the next phases.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
