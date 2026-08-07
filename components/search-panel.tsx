"use client";

import { Minus, Plus, Search, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { DateField } from "@/components/date-field";
import { Button } from "@/components/ui/button";
import { Field, fieldInputClass } from "@/components/ui/field";
import { localePath, type Dictionary, type Locale } from "@/lib/i18n";

const MAX_GUESTS = 16;

export function SearchPanel({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary["search"];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Seeded from the URL so a shared search link restores its own state, but
  // clamped — a hand-edited ?guests=30 must not escape the stepper's range.
  const [guests, setGuests] = useState(() => {
    const seeded = Number(params.get("guests"));
    if (!Number.isFinite(seeded)) return 0;
    return Math.min(MAX_GUESTS, Math.max(0, Math.trunc(seeded)));
  });

  // "From" bounds "To", so the range can never be inverted.
  const [from, setFrom] = useState(() => params.get("from") ?? "");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();

    for (const key of ["q", "from", "to"] as const) {
      const value = String(data.get(key) ?? "").trim();
      if (value) next.set(key, value);
    }
    if (guests > 0) next.set("guests", String(guests));

    startTransition(() =>
      router.push(localePath(locale, `/events?${next.toString()}`)),
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label={t.label}
      className="rounded-[1.75rem] border border-line bg-sand-soft/80 p-2 shadow-rail backdrop-blur-sm lg:rounded-full"
    >
      {/* Stacked on phones, 2×2 on tablets, a single row only once it fits. */}
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:flex lg:items-center lg:gap-0">
        <Field
          label={t.keyword}
          htmlFor="search-q"
          icon={<Search />}
          className="rounded-2xl sm:col-span-2 lg:flex-[1.4] lg:rounded-full"
        >
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={params.get("q") ?? ""}
            placeholder={t.keywordPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className={fieldInputClass()}
          />
        </Field>

        <Divider />

        <DateField
          name="from"
          locale={locale}
          anyDate={t.anyDate}
          clearLabel={t.clear}
          label={t.from}
          defaultValue={params.get("from") ?? ""}
          onValueChange={setFrom}
          className="lg:flex-1 lg:rounded-full"
        />

        <Divider />

        <DateField
          name="to"
          locale={locale}
          anyDate={t.anyDate}
          clearLabel={t.clear}
          label={t.to}
          defaultValue={params.get("to") ?? ""}
          fromDate={from}
          className="lg:flex-1 lg:rounded-full"
        />

        <Divider />

        <Field
          label={t.guests}
          htmlFor="search-guests"
          icon={<Users />}
          className="rounded-2xl lg:flex-1 lg:rounded-full"
        >
          <div className="flex items-center gap-2">
            <StepperButton
              label={t.removeGuest}
              onClick={() => setGuests((n) => Math.max(0, n - 1))}
              disabled={guests === 0}
            >
              <Minus />
            </StepperButton>
            <output
              id="search-guests"
              aria-live="polite"
              className="tabular w-8 text-center text-[0.9375rem] font-medium text-ink"
            >
              {guests === 0 ? t.any : guests}
            </output>
            <StepperButton
              label={t.addGuest}
              onClick={() => setGuests((n) => Math.min(MAX_GUESTS, n + 1))}
              disabled={guests === MAX_GUESTS}
            >
              <Plus />
            </StepperButton>
          </div>
        </Field>

        {/* lg:me-1.5 makes the gap past the button match the 15px above and
            below it — the pill's rows are taller than the button. */}
        <div className="mt-1 flex shrink-0 items-center gap-2 sm:col-span-2 lg:mt-0 lg:me-1.5 lg:ms-1">
          <Button type="submit" size="lg" className="w-full lg:w-auto lg:px-6">
            <Search aria-hidden="true" />
            {isPending ? t.submitting : t.submit}
          </Button>
        </div>
      </div>
    </form>
  );
}

const Divider = () => (
  <span
    aria-hidden="true"
    className="field-divider hidden h-8 w-px shrink-0 bg-line-strong lg:block"
  />
);

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
      className="tap-target grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-150 hover:border-ink disabled:opacity-35 disabled:hover:border-line-strong [touch-action:manipulation] [&_svg]:size-3.5"
    >
      {children}
    </button>
  );
}
