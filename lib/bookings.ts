type BookingStatus = "confirmed" | "cancelled" | "completed";

export type Booking = {
  id: string;
  reference: string;
  eventSlug: string;
  eventTitle: string;
  eventImage: string;
  location: string;
  quantity: number;
  totalAed: number;
  eventDate: string;
  status: BookingStatus;
};

/** A cancelled booking is never "upcoming" — there's nothing left to attend. */
function isUpcoming(booking: Booking, todayISO: string): boolean {
  return booking.status !== "cancelled" && booking.eventDate >= todayISO;
}

export function splitBookings(bookings: Booking[]) {
  const todayISO = new Date().toISOString().slice(0, 10);
  const upcoming: Booking[] = [];
  const past: Booking[] = [];

  for (const booking of bookings) {
    (isUpcoming(booking, todayISO) ? upcoming : past).push(booking);
  }

  upcoming.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  past.sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  return { upcoming, past };
}
