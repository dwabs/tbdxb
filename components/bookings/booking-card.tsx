import { MapPin, Ticket } from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/bookings";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { formatPrice } from "@/lib/utils";

import { TicketModal } from "./ticket-modal";

const STATUS_VARIANT = {
  confirmed: "blush",
  completed: "sand",
  cancelled: "outline",
} as const;

export function BookingCard({
  booking,
  locale,
  t,
}: {
  booking: Booking;
  locale: Locale;
  t: Dictionary["account"]["bookingsPage"];
}) {
  const statusLabel = {
    confirmed: t.statusConfirmed,
    completed: t.statusCompleted,
    cancelled: t.statusCancelled,
  }[booking.status];

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    booking.location,
  )}`;

  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-paper p-4 sm:flex-row">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-sand-soft sm:w-40">
        <Image
          src={booking.eventImage}
          alt=""
          fill
          sizes="160px"
          className="object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[1.0625rem] leading-snug font-semibold text-ink">
              {booking.eventTitle}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-ink-muted">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{booking.location}</span>
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[booking.status]} size="sm">
            {statusLabel}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[0.8125rem] text-ink-muted">
            {t.totalLabel}{" "}
            <span className="font-semibold text-ink">
              {formatPrice(booking.totalAed, locale)}
            </span>
            {booking.quantity > 1 ? ` · ${booking.quantity}×` : ""}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 text-[0.8125rem] font-medium">
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-accent-deep hover:underline"
          >
            <MapPin aria-hidden="true" className="size-3.5" />
            {t.locationAction}
          </a>

          <TicketModal
            booking={booking}
            t={t}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 text-accent-deep hover:underline [touch-action:manipulation]"
              >
                <Ticket aria-hidden="true" className="size-3.5" />
                {t.ticketAction}
              </button>
            }
          />

          <span
            aria-disabled="true"
            title={t.invoiceAction}
            className="ms-auto cursor-not-allowed text-ink-subtle"
          >
            {t.invoiceAction}
          </span>
        </div>
      </div>
    </article>
  );
}
