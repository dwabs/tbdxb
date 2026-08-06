"use client";

import { Minus, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/events";
import { formatDateLong, formatPrice, formatTimeRange } from "@/lib/utils";

export function BookingPanel({ experience }: { experience: Experience }) {
  const [guests, setGuests] = useState(1);
  const total = experience.priceAED * guests;

  return (
    <>
      <div className="rounded-card border border-line bg-paper p-6 shadow-rail">
        <p className="tabular text-[1.75rem] leading-none font-bold tracking-[-0.02em] text-ink">
          {formatPrice(experience.priceAED)}
          <span className="block pt-1.5 text-[0.9375rem] font-normal tracking-normal text-ink-muted">
            per person
          </span>
        </p>

        <dl className="mt-6 divide-y divide-line rounded-xl border border-line">
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-[0.8125rem] font-medium text-ink-muted">Date</dt>
            <dd className="text-right text-[0.9375rem] font-medium text-ink">
              {formatDateLong(experience.date)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-[0.8125rem] font-medium text-ink-muted">Time</dt>
            <dd className="tabular text-right text-[0.9375rem] font-medium text-ink">
              {formatTimeRange(experience.startTime, experience.endTime)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt id="guest-label" className="text-[0.8125rem] font-medium text-ink-muted">
              Guests
            </dt>
            <dd className="flex items-center gap-3">
              <StepperButton
                label="Remove a guest"
                onClick={() => setGuests((n) => Math.max(1, n - 1))}
                disabled={guests === 1}
              >
                <Minus />
              </StepperButton>
              <output
                aria-live="polite"
                aria-labelledby="guest-label"
                className="tabular w-5 text-center text-[0.9375rem] font-semibold text-ink"
              >
                {guests}
              </output>
              <StepperButton
                label="Add a guest"
                onClick={() => setGuests((n) => Math.min(16, n + 1))}
                disabled={guests === 16}
              >
                <Plus />
              </StepperButton>
            </dd>
          </div>
        </dl>

        <Button size="lg" className="mt-5 w-full">
          Book Now
        </Button>

        <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <span className="text-[0.9375rem] text-ink-muted">
            {formatPrice(experience.priceAED)} × {guests} {guests === 1 ? "guest" : "guests"}
          </span>
          <span aria-live="polite" className="tabular text-[1.0625rem] font-bold text-ink">
            {formatPrice(total)}
          </span>
        </p>

        <p className="mt-4 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-muted">
          <ShieldCheck aria-hidden="true" className="mt-px size-4 shrink-0 text-ink-subtle" />
          Free cancellation up to 48 hours before. You won’t be charged yet.
        </p>
      </div>

      {/* Mobile: the price and the action stay reachable without scrolling back. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-canvas/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <p className="tabular min-w-0 text-[1.0625rem] leading-tight font-bold text-ink">
          {formatPrice(experience.priceAED)}
          <span className="block text-[0.8125rem] font-normal text-ink-muted">per person</span>
        </p>
        <Button size="lg" className="shrink-0">
          Book Now
        </Button>
      </div>
    </>
  );
}

function StepperButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="tap-target grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-150 hover:border-ink disabled:opacity-35 disabled:hover:border-line-strong [touch-action:manipulation] [&_svg]:size-3.5"
    >
      {children}
    </button>
  );
}
