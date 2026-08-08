/**
 * Fixed to the five ids the public site knows how to label
 * (lib/i18n/en.ts's `categories` dict) — a value outside this set would
 * insert fine but show up unlabeled once phase 9b reads events from here.
 */
export const CATEGORIES = [
  { id: "best-this-month", label: "Best Things to Do This Month" },
  { id: "date-night", label: "Date Night" },
  { id: "group-plans", label: "Group Plans" },
  { id: "try-something-new", label: "Try Something New" },
  { id: "summer-in-the-city", label: "Summer in the City" },
] as const;
