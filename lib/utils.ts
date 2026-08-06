import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatters are hoisted to module scope — constructing an Intl formatter is
 * expensive and these are pure. Locale is fixed to en-AE so server and client
 * always agree (a hydration mismatch here would swap the date format).
 */
const LOCALE = "en-AE";

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "AED",
  currencyDisplay: "code",
  maximumFractionDigits: 0,
});

const dateLongFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Asia/Dubai",
});

const dateShortFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  timeZone: "Asia/Dubai",
});

export const formatPrice = (aed: number) => priceFormatter.format(aed);

export const formatDateLong = (iso: string) => dateLongFormatter.format(new Date(`${iso}T00:00:00Z`));

export const formatDateShort = (iso: string) =>
  dateShortFormatter.format(new Date(`${iso}T00:00:00Z`));

/** "16:00" → "4:00 PM" without pulling in a date library. */
export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

export const formatTimeRange = (start: string, end: string) =>
  `${formatTime(start)} – ${formatTime(end)}`;
