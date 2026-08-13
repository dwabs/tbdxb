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
