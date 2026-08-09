import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Locale } from "@/lib/i18n/config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatters are built once per locale and cached — constructing an Intl
 * formatter is expensive and these are pure. Locale tags are fixed so server
 * and client always agree; a mismatch here would be a hydration error.
 *
 * Arabic uses `-u-nu-latn` to keep Western digits. Arabic-Indic numerals
 * (٠١٢٣) are correct for the language but uncommon in UAE commerce, where
 * prices and dates are read in Latin digits even in Arabic copy.
 */
const TAG: Record<Locale, string> = { en: "en-AE", ar: "ar-AE-u-nu-latn" };

const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();

function memo<T extends Intl.NumberFormat | Intl.DateTimeFormat>(
  key: string,
  make: () => T,
): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const made = make();
  cache.set(key, made);
  return made;
}

const priceFormatter = (locale: Locale) =>
  memo(
    `price:${locale}`,
    () =>
      new Intl.NumberFormat(TAG[locale], {
        style: "currency",
        currency: "AED",
        currencyDisplay: "code",
        maximumFractionDigits: 0,
      }),
  );

const dateLongFormatter = (locale: Locale) =>
  memo(
    `long:${locale}`,
    () =>
      new Intl.DateTimeFormat(TAG[locale], {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Asia/Dubai",
      }),
  );

const dateShortFormatter = (locale: Locale) =>
  memo(
    `short:${locale}`,
    () =>
      new Intl.DateTimeFormat(TAG[locale], {
        day: "numeric",
        month: "short",
        timeZone: "Asia/Dubai",
      }),
  );

export const formatPrice = (aed: number, locale: Locale) =>
  priceFormatter(locale).format(aed);

/**
 * An event can be published before its schedule is filled in, so
 * `Experience.date`/`startTime` can legitimately arrive empty (see
 * `lib/events.ts` — a null `starts_at` maps to ""). `Intl` throws a
 * RangeError on an invalid Date, and inside a prerender that aborts the
 * *entire* production build rather than the one card at fault — which is
 * exactly what happened once a dateless event went live. Every formatter
 * below returns "" for anything unparseable instead; call sites drop the
 * line when it comes back empty.
 */
function parseISODate(iso: string): Date | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const formatDateLong = (iso: string, locale: Locale) => {
  const date = parseISODate(iso);
  return date ? dateLongFormatter(locale).format(date) : "";
};

export const formatDateShort = (iso: string, locale: Locale) => {
  const date = parseISODate(iso);
  return date ? dateShortFormatter(locale).format(date) : "";
};

/** "16:00" → "4:00 PM" / "٤:٠٠ م" without pulling in a date library. */
export function formatTime(time: string, locale: Locale) {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
  if (locale === "ar") {
    const suffix = hours >= 12 ? "م" : "ص";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
  }
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export const formatTimeRange = (start: string, end: string, locale: Locale) => {
  const from = formatTime(start, locale);
  const to = formatTime(end, locale);
  if (!from) return "";
  return to ? `${from} – ${to}` : from;
};
