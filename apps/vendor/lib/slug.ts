const COMBINING_DIACRITICS = new RegExp("[̀-ͯ]", "g");

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "") // strip diacritics left behind by NFKD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Dubai has no DST, so a fixed +04:00 offset is always correct — treats a
 *  `datetime-local` value as Dubai wall-clock time regardless of the
 *  vendor's own browser timezone. */
export function dubaiDateTimeToISO(value: string): string | null {
  if (!value) return null;
  const iso = new Date(`${value}:00+04:00`).toISOString();
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}
