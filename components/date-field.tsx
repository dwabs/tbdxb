"use client";

import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/** "2026-08-08" ⇄ Date, kept local so no timezone shift can move the day. */
const toDate = (value: string) => {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

/** Latin digits in both locales — see the note in lib/utils.ts. */
const FORMATTERS: Record<Locale, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  ar: new Intl.DateTimeFormat("ar-AE-u-nu-latn", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
};

/**
 * A labelled date cell whose whole surface opens the calendar — the label and
 * the value are both part of the trigger, so there is no small icon to hit.
 * A hidden input carries the value so the surrounding form still submits it.
 */
export function DateField({
  name,
  label,
  locale,
  defaultValue = "",
  anyDate,
  clearLabel,
  className,
  fromDate,
  onValueChange,
}: {
  name: string;
  label: string;
  locale: Locale;
  defaultValue?: string;
  anyDate: string;
  clearLabel: string;
  className?: string;
  fromDate?: string;
  onValueChange?: (value: string) => void;
}) {
  const [selected, setSelected] = useState<Date | undefined>(() =>
    toDate(defaultValue),
  );
  const [open, setOpen] = useState(false);

  const min = toDate(fromDate ?? "");
  const fmt = FORMATTERS[locale];

  return (
    // `display: contents` so the trigger still lays out as a direct child of
    // the search row, while the DOM keeps one element per cell — the pill's
    // dividers select their neighbours with `+`, and a bare fragment would
    // put this hidden input in the way.
    <div className="contents" data-open={open ? "" : undefined}>
      <input
        type="hidden"
        name={name}
        value={selected ? toValue(selected) : ""}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label={`${label} — ${selected ? fmt.format(selected) : anyDate}`}
          className={cn(
            // Matches the text fields beside it: the cell itself lights up on
            // focus, so it opts out of the default ring rather than showing
            // both. Keyboard users still get a clear indicator.
            "group flex min-w-0 flex-col items-start rounded-2xl px-4 py-2.5 text-start transition-colors duration-200 hover:bg-paper/70 focus-visible:bg-paper focus-visible:shadow-lift focus-visible:outline-none data-[state=open]:bg-paper data-[state=open]:shadow-lift [touch-action:manipulation]",
            className,
          )}
        >
          <span className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-muted uppercase">
            {label}
          </span>
          <span
            className={cn(
              "w-full truncate text-[0.9375rem]",
              selected ? "text-ink" : "text-ink-subtle",
            )}
          >
            {selected ? fmt.format(selected) : anyDate}
          </span>
        </PopoverTrigger>

        <PopoverContent>
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? min}
            startMonth={new Date(new Date().getFullYear() - 1, 0)}
            endMonth={new Date(new Date().getFullYear() + 3, 11)}
            disabled={min ? { before: min } : undefined}
            onSelect={(date) => {
              setSelected(date);
              onValueChange?.(date ? toValue(date) : "");
              setOpen(false);
            }}
            autoFocus
          />
          {selected ? (
            <button
              type="button"
              onClick={() => {
                setSelected(undefined);
                onValueChange?.("");
                setOpen(false);
              }}
              className="mt-1 w-full rounded-xl py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-sand-soft hover:text-ink"
            >
              {clearLabel}
            </button>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}
