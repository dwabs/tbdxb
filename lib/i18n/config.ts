export const LOCALES = ["en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

/** English is served unprefixed (`/faq`); Arabic is prefixed (`/ar/faq`). */
export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

export const DIRECTION: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

/**
 * Prefix a path for a locale. The default locale stays bare so the English
 * URLs never carry a redundant `/en`.
 */
export function localePath(locale: Locale, path: string) {
  const clean = path === "/" ? "" : path;
  return locale === DEFAULT_LOCALE ? clean || "/" : `/${locale}${clean}`;
}

/** Strip a locale prefix back off, for building the language switch link. */
export function stripLocale(pathname: string) {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`))
      return pathname.slice(locale.length + 1);
  }
  return pathname;
}
