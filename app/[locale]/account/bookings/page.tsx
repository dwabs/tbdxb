import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BookingTabs } from "@/components/bookings/booking-tabs";
import { PageHeader } from "@/components/page-header";
import type { Booking } from "@/lib/bookings";
import { splitBookings } from "@/lib/bookings";
import { getExperience } from "@/lib/events";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/account/bookings">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).account;
  return { title: t.bookingsPage.title };
}

export default async function BookingsPage({
  params,
}: PageProps<"/[locale]/account/bookings">) {
  const { locale } = await params;
  const t = getDictionary(locale).account;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(localePath(locale as Locale, "/"));

  const { data: rows } = await supabase
    .from("booking")
    .select(
      "id, reference, event_slug, event_title, event_image, location, quantity, total_aed, event_date, status",
    )
    .eq("user_id", user.id);

  // Re-derive title/image/location from the current listing when it still
  // exists, rather than trust the row's own snapshot columns: those are
  // frozen in whatever locale was active at booking time, so a booking made
  // in Arabic would otherwise show Arabic text forever on the English page.
  // The snapshot only serves as a fallback for a listing that's gone.
  const bookings: Booking[] = await Promise.all(
    (rows ?? []).map(async (row) => {
      const experience = await getExperience(row.event_slug, locale as Locale);
      return {
        id: row.id,
        reference: row.reference,
        eventSlug: row.event_slug,
        eventTitle: experience?.title ?? row.event_title,
        eventImage: experience?.images[0]?.src ?? row.event_image,
        location: experience
          ? `${experience.venue}, ${experience.area}`
          : row.location,
        quantity: row.quantity,
        totalAed: Number(row.total_aed),
        eventDate: row.event_date,
        status: row.status,
      };
    }),
  );

  const { upcoming, past } = splitBookings(bookings);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 lg:px-8">
      <PageHeader title={t.bookingsPage.title} />

      <div className="mt-8">
        <BookingTabs
          t={t.bookingsPage}
          locale={locale as Locale}
          upcoming={upcoming}
          past={past}
        />
      </div>
    </div>
  );
}
