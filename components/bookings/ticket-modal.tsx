"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Booking } from "@/lib/bookings";
import type { Dictionary } from "@/lib/i18n";

/**
 * The live site's own ticket detail (QR + reference) only renders after
 * clicking into a booking — a view outside what was available to inspect —
 * so this is a reasonable reconstruction of that pattern, not a copy of it.
 * The QR encodes the booking reference only; nothing leaves the browser.
 */
export function TicketModal({
  booking,
  t,
  trigger,
}: {
  booking: Booking;
  t: Dictionary["account"]["bookingsPage"];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={t.ticketModal.close} className="text-center">
        <DialogTitle className="font-display text-xl font-semibold text-ink">
          {t.ticketModal.title}
        </DialogTitle>
        <DialogDescription className="mt-1 text-[0.9375rem] text-ink-muted">
          {booking.eventTitle}
        </DialogDescription>

        <div className="mt-6 flex justify-center">
          <div className="rounded-card border border-line bg-white p-4">
            <QRCodeSVG value={booking.reference} size={176} />
          </div>
        </div>

        <p className="mt-4 text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase">
          {t.ticketModal.referenceLabel}
        </p>
        <p className="tabular mt-1 select-all font-display text-lg font-semibold text-ink">
          {booking.reference}
        </p>
        <p className="mt-3 text-[0.8125rem] text-ink-muted">
          {t.ticketModal.scanHint}
        </p>
      </DialogContent>
    </Dialog>
  );
}
