import { CheckInLookupForm } from "@/components/bookings/check-in-lookup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckInPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Check-in</h1>

      <Card className="mx-auto w-full max-w-lg">
        <CardHeader>
          <CardTitle>Look up a booking</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckInLookupForm />
        </CardContent>
      </Card>
    </div>
  );
}
