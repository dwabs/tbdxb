"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { isValidPhoneNumber, type Value } from "react-phone-number-input";

import { Button } from "@/components/ui/button";
import { Field, fieldInputClass } from "@/components/ui/field";
import { PhoneField } from "@/components/ui/phone-field";
import type { Experience } from "@/lib/events";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDateLong, formatPrice, formatTimeRange } from "@/lib/utils";

type Step = "details" | "review" | "payment" | "confirmation";

const STEPS = [
  { key: "details", labelKey: "stepDetails" },
  { key: "review", labelKey: "stepReview" },
  { key: "payment", labelKey: "stepPayment" },
  { key: "confirmation", labelKey: "stepConfirmation" },
] as const;

export function CheckoutFlow({
  t,
  locale,
  userId,
  experience,
  guests,
  fullName: initialFullName,
  phone: initialPhone,
}: {
  t: Dictionary["checkout"];
  locale: Locale;
  userId: string;
  experience: Experience;
  guests: number;
  fullName: string;
  phone: string | null;
}) {
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState<Step>("details");
  const [fullName, setFullName] = useState(initialFullName);
  const [nameError, setNameError] = useState("");
  const [mobile, setMobile] = useState<Value | undefined>(
    (initialPhone as Value) ?? undefined,
  );
  const [mobileError, setMobileError] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  const total = experience.priceAED * guests;
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function handleDetailsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = fullName.trim();
    const nextNameError = trimmedName.length === 0 ? t.details.nameError : "";
    const nextMobileError =
      !mobile || !isValidPhoneNumber(mobile) ? t.details.mobileError : "";
    setNameError(nextNameError);
    setMobileError(nextMobileError);
    if (nextNameError || nextMobileError) return;
    setStep("review");
  }

  async function handleConfirm() {
    setPending(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("booking")
      .insert({
        user_id: userId,
        event_id: experience.id,
        ticket_type_id: experience.ticketTypeId,
        event_slug: experience.slug,
        event_title: experience.title,
        event_image: experience.images[0]?.src ?? "",
        location: `${experience.venue}, ${experience.area}`,
        quantity: guests,
        total_aed: total,
        event_date: experience.date,
        attendee_name: fullName.trim(),
        attendee_phone: mobile ?? "",
      })
      .select("reference")
      .single();

    setPending(false);
    if (insertError || !data) {
      setError(t.payment.error);
      return;
    }
    setReference(data.reference);
    setStep("confirmation");
  }

  return (
    <div>
      <ol className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          return (
            <li key={s.key} className="flex items-center gap-2">
              {i > 0 ? (
                <span aria-hidden="true" className="h-px w-4 bg-line-strong" />
              ) : null}
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium",
                  current || done
                    ? "bg-blush text-accent-deep"
                    : "text-ink-muted",
                )}
              >
                {done ? (
                  <Check aria-hidden="true" className="size-3.5" />
                ) : null}
                {t[s.labelKey]}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-card border border-line bg-paper p-6">
        {step === "details" ? (
          <>
            <h2 className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
              {t.details.title}
            </h2>
            <form
              onSubmit={handleDetailsSubmit}
              noValidate
              className="mt-4 grid gap-3"
            >
              <Field
                variant="outline"
                errorPlacement="outside"
                label={t.details.nameLabel}
                htmlFor="checkout-name"
                error={nameError}
              >
                <input
                  id="checkout-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    if (nameError) setNameError("");
                  }}
                  aria-invalid={nameError ? true : undefined}
                  className={fieldInputClass()}
                />
              </Field>
              <PhoneField
                label={t.details.mobileLabel}
                htmlFor="checkout-mobile"
                value={mobile}
                onChange={(value) => {
                  setMobile(value);
                  if (mobileError) setMobileError("");
                }}
                error={mobileError}
              />
              <Button type="submit" size="md" className="mt-2">
                {t.details.continue}
              </Button>
            </form>
          </>
        ) : null}

        {step === "review" ? (
          <>
            <h2 className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
              {t.review.title}
            </h2>
            <div className="mt-4 flex gap-4">
              {experience.images[0] ? (
                <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-2xl bg-sand-soft">
                  <Image
                    src={experience.images[0].src}
                    alt=""
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="min-w-0">
                <h3 className="text-[1.0625rem] leading-snug font-semibold text-ink">
                  {experience.title}
                </h3>
                <p className="mt-1 text-[0.8125rem] text-ink-muted">
                  {formatDateLong(experience.date, locale)} ·{" "}
                  {formatTimeRange(
                    experience.startTime,
                    experience.endTime,
                    locale,
                  )}
                </p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-muted">
                  {experience.venue}, {experience.area}
                </p>
              </div>
            </div>

            <dl className="mt-6 divide-y divide-line rounded-xl border border-line">
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-[0.8125rem] font-medium text-ink-muted">
                  {t.review.guestsLabel}
                </dt>
                <dd className="tabular text-end text-[0.9375rem] font-medium text-ink">
                  {guests}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-[0.8125rem] font-medium text-ink-muted">
                  {t.review.unitPriceLabel}
                </dt>
                <dd className="tabular text-end text-[0.9375rem] font-medium text-ink">
                  {formatPrice(experience.priceAED, locale)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-[0.8125rem] font-semibold text-ink">
                  {t.review.totalLabel}
                </dt>
                <dd className="tabular text-end text-[1.0625rem] font-bold text-ink">
                  {formatPrice(total, locale)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("details")}
              >
                {t.review.back}
              </Button>
              <Button type="button" onClick={() => setStep("payment")}>
                {t.review.continue}
              </Button>
            </div>
          </>
        ) : null}

        {step === "payment" ? (
          <>
            <h2 className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
              {t.payment.title}
            </h2>
            <p className="mt-4 rounded-xl border border-dashed border-line-strong bg-sand-soft/50 p-4 text-[0.875rem] leading-relaxed text-ink-muted">
              {t.payment.demoNotice}
            </p>
            {error ? (
              <p role="alert" className="mt-3 text-[0.8125rem] text-accent-deep">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => setStep("review")}
              >
                {t.payment.back}
              </Button>
              <Button type="button" disabled={pending} onClick={handleConfirm}>
                {pending ? t.payment.confirming : t.payment.confirm}
              </Button>
            </div>
          </>
        ) : null}

        {step === "confirmation" ? (
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold text-ink">
              {t.confirmation.title}
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
              {t.confirmation.body}
            </p>
            <div className="mt-6 flex justify-center">
              <div className="rounded-card border border-line bg-white p-4">
                <QRCodeSVG value={reference} size={176} />
              </div>
            </div>
            <p className="mt-4 text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase">
              {t.confirmation.referenceLabel}
            </p>
            <p className="tabular mt-1 select-all font-display text-lg font-semibold text-ink">
              {reference}
            </p>
            <p className="mt-3 text-[0.8125rem] text-ink-muted">
              {t.confirmation.scanHint}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="md">
                <Link href={localePath(locale, "/account/bookings")}>
                  {t.confirmation.viewBookings}
                </Link>
              </Button>
              <Button asChild variant="secondary" size="md">
                <Link href={localePath(locale, "/events")}>
                  {t.confirmation.browseMore}
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
