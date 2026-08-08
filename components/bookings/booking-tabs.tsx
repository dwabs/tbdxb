"use client";

import { useState } from "react";

import { BookingCard } from "@/components/bookings/booking-card";
import { BookingsEmpty } from "@/components/bookings/bookings-empty";
import type { Booking } from "@/lib/bookings";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function BookingTabs({
  t,
  locale,
  upcoming,
  past,
}: {
  t: Dictionary["account"]["bookingsPage"];
  locale: Locale;
  upcoming: Booking[];
  past: Booking[];
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const rows = tab === "upcoming" ? upcoming : past;

  return (
    <div>
      <div role="tablist" className="flex gap-2">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
          className={cn(
            "rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors duration-150",
            tab === "upcoming"
              ? "bg-blush text-accent-deep"
              : "text-ink-muted hover:bg-sand-soft hover:text-ink",
          )}
        >
          {t.upcomingTab}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "past"}
          onClick={() => setTab("past")}
          className={cn(
            "rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors duration-150",
            tab === "past"
              ? "bg-blush text-accent-deep"
              : "text-ink-muted hover:bg-sand-soft hover:text-ink",
          )}
        >
          {t.pastTab}
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {rows.length === 0 ? (
          <BookingsEmpty
            title={tab === "upcoming" ? t.emptyUpcomingTitle : t.emptyPastTitle}
            body={tab === "upcoming" ? t.emptyUpcomingBody : t.emptyPastBody}
            browseLabel={t.browse}
            locale={locale}
          />
        ) : (
          rows.map((booking) => (
            <BookingCard key={booking.id} booking={booking} locale={locale} t={t} />
          ))
        )}
      </div>
    </div>
  );
}
