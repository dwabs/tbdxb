import { ar } from "./ar";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import { en, type Dictionary } from "./en";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar };

/**
 * Dictionaries are plain modules rather than dynamic JSON imports: there are
 * two of them, they're small, and being static means the type flows through
 * to every call site.
 */
export function getDictionary(locale: string): Dictionary {
  return DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

/** `t("{count} experiences", { count: 3 })` — no library needed for five uses. */
export function fill(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

export type { Dictionary };
export * from "./config";
