"use client";

import { Loader2, MapPin, Ticket } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/lib/bookings";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/client";
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
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const statusLabel = {
    confirmed: t.statusConfirmed,
    completed: t.statusCompleted,
    cancelled: t.statusCancelled,
  }[booking.status];

  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    booking.location,
  )}`;

  const todayISO = new Date().toISOString().slice(0, 10);
  const canCancel = booking.status === "confirmed" && booking.eventDate >= todayISO;

  async function cancelBooking() {
    setPending(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("cancel_booking", {
      p_booking_id: booking.id,
    });
    setPending(false);
    if (rpcError) {
      setError(rpcError.message || t.cancelError);
      return;
    }
    router.refresh();
  }

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

          {canCancel && !confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-ink-muted hover:text-ink hover:underline [touch-action:manipulation]"
            >
              {t.cancelAction}
            </button>
          ) : null}

          <span
            aria-disabled="true"
            title={t.invoiceAction}
            className="ms-auto cursor-not-allowed text-ink-subtle"
          >
            {t.invoiceAction}
          </span>
        </div>

        {canCancel && confirming ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.8125rem]">
            <span className="text-ink-muted">{t.cancelPrompt}</span>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setConfirming(false);
                setError("");
              }}
              className="font-medium text-ink-muted hover:text-ink hover:underline"
            >
              {t.cancelKeep}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={cancelBooking}
              className="flex items-center gap-1.5 font-medium text-accent-deep hover:underline"
            >
              {pending ? (
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              ) : null}
              {t.cancelConfirm}
            </button>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="mt-2 text-[0.8125rem] text-accent-deep">
            {error}
          </p>
        ) : null}
      </div>
    </article>
  );
}
