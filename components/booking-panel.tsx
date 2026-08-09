"use client";

import { Minus, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { CheckoutModal } from "@/components/checkout/checkout-modal";
import { SignInModal } from "@/components/sign-in-modal";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/events";
import { fill, type Dictionary, type Locale } from "@/lib/i18n";
import { formatDateLong, formatPrice, formatTimeRange } from "@/lib/utils";

export function BookingPanel({
  experience,
  locale,
  t,
  checkoutT,
  authT,
  userId: initialUserId,
  fullName: initialFullName,
  phone: initialPhone,
}: {
  experience: Experience;
  locale: Locale;
  t: Dictionary["detail"];
  checkoutT: Dictionary["checkout"];
  authT: Dictionary["auth"];
  userId: string | null;
  fullName: string;
  phone: string | null;
}) {
  const [guests, setGuests] = useState(1);
  const total = experience.priceAED * guests;

  // Empty for an event published before its schedule was set — the row is
  // dropped rather than showing a blank value against a label.
  const dateLabel = formatDateLong(experience.date, locale);
  const timeLabel = formatTimeRange(
    experience.startTime,
    experience.endTime,
    locale,
  );

  const [userId, setUserId] = useState(initialUserId);
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [signInOpen, setSignInOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function handleBookNow() {
    if (userId) setCheckoutOpen(true);
    else setSignInOpen(true);
  }

  return (
    <>
      <div className="rounded-card border border-line bg-paper p-6 shadow-rail">
        <p className="tabular text-[1.75rem] leading-none font-bold tracking-[-0.02em] text-ink">
          {formatPrice(experience.priceAED, locale)}
          <span className="block pt-1.5 text-[0.9375rem] font-normal tracking-normal text-ink-muted">
            {t.perPerson}
          </span>
        </p>

        <dl className="mt-6 divide-y divide-line rounded-xl border border-line">
          {dateLabel ? (
            <div className="flex items-baseline justify-between gap-4 px-4 py-3">
              <dt className="text-[0.8125rem] font-medium text-ink-muted">
                {t.date}
              </dt>
              <dd className="text-end text-[0.9375rem] font-medium text-ink">
                {dateLabel}
              </dd>
            </div>
          ) : null}
          {timeLabel ? (
            <div className="flex items-baseline justify-between gap-4 px-4 py-3">
              <dt className="text-[0.8125rem] font-medium text-ink-muted">
                {t.time}
              </dt>
              <dd className="tabular text-end text-[0.9375rem] font-medium text-ink">
                {timeLabel}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt
              id="guest-label"
              className="text-[0.8125rem] font-medium text-ink-muted"
            >
              {t.guests}
            </dt>
            <dd className="flex items-center gap-3">
              <StepperButton
                label={t.removeGuest}
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
                label={t.addGuest}
                onClick={() => setGuests((n) => Math.min(16, n + 1))}
                disabled={guests === 16}
              >
                <Plus />
              </StepperButton>
            </dd>
          </div>
        </dl>

        <Button size="lg" className="mt-5 w-full" onClick={handleBookNow}>
          {t.bookNow}
        </Button>

        <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
          <span className="text-[0.9375rem] text-ink-muted">
            {fill(t.priceTimes, {
              price: formatPrice(experience.priceAED, locale),
              count: `${guests} ${guests === 1 ? t.guestOne : t.guestOther}`,
            })}
          </span>
          <span
            aria-live="polite"
            className="tabular text-[1.0625rem] font-bold text-ink"
          >
            {formatPrice(total, locale)}
          </span>
        </p>

        <p className="mt-4 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-muted">
          <ShieldCheck
            aria-hidden="true"
            className="mt-px size-4 shrink-0 text-ink-subtle"
          />
          {t.cancellation}
        </p>
      </div>

      {/* Mobile: the price and the action stay reachable without scrolling back. */}
      <div className="mobile-cta-bar fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-line bg-canvas/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <p className="tabular min-w-0 text-[1.0625rem] leading-tight font-bold text-ink">
          {formatPrice(experience.priceAED, locale)}
          <span className="block text-[0.8125rem] font-normal text-ink-muted">
            {t.perPerson}
          </span>
        </p>
        <Button size="lg" className="shrink-0" onClick={handleBookNow}>
          {t.bookNow}
        </Button>
      </div>

      <SignInModal
        t={authT}
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onSignedIn={({ userId: id, fullName: name, phone: nextPhone }) => {
          setUserId(id);
          setFullName(name);
          setPhone(nextPhone);
          setSignInOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {userId ? (
        <CheckoutModal
          t={checkoutT}
          locale={locale}
          userId={userId}
          experience={experience}
          guests={guests}
          fullName={fullName}
          phone={phone}
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
        />
      ) : null}
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
