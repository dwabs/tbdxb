import { ReviewQueueActions } from "@/components/admin/review-queue-actions";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const DATE = new Intl.DateTimeFormat("en-AE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type SubmittedEvent = {
  id: string;
  slug: string;
  title: string;
  starts_at: string | null;
  submitted_at: string | null;
  vendor: { name: string } | null;
};

export default async function ReviewPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("event")
    .select("id, slug, title, starts_at, submitted_at, vendor:vendor_id(name)")
    .eq("status", "submitted")
    .order("submitted_at");

  const submitted = (data ?? []) as unknown as SubmittedEvent[];

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Review queue</h1>

      <Card>
        <CardContent>
          {submitted.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Nothing waiting on review.
            </p>
          ) : (
            <ul className="divide-y">
              {submitted.map((event) => (
                <li key={event.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.vendor?.name ?? "Unknown vendor"}
                        {event.starts_at
                          ? ` · ${DATE.format(new Date(event.starts_at))}`
                          : ""}
                      </p>
                    </div>
                    <ReviewQueueActions eventId={event.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
