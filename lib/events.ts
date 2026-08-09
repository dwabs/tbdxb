import { createPublicClient } from "./supabase/public";
import type { Locale } from "./i18n/config";

export type Experience = {
  slug: string;
  title: string;
  shortTitle: string;
  venue: string;
  area: string;
  category: string;
  priceAED: number;
  date: string; // ISO
  endTime: string; // 24h "HH:MM"
  startTime: string; // 24h "HH:MM"
  durationLabel: string;
  groupSize: string;
  images: { src: string; alt: string; width: number; height: number }[];
  tags: string[];
  summary: string;
  body: string[];
  /**
   * The emoji is part of the row, not decoration bolted on at render time:
   * only whoever writes the line knows whether "All materials" is a paint
   * palette or a toolbox. It carries no meaning a screen reader needs — the
   * label says everything — so it is hidden from the accessibility tree.
   */
  includes: { emoji: string; label: string }[];
};

/** Order matters — this is the order the rails appear in. Labels live in the
 *  dictionaries, keyed by these ids. */
export const CATEGORIES = [
  "best-this-month",
  "date-night",
  "group-plans",
  "try-something-new",
  "summer-in-the-city",
] as const;

type DbTranslation = {
  locale: string;
  title: string;
  short_title: string;
  summary: string;
  body: string;
  venue: string | null;
  area: string | null;
  duration_label: string | null;
  group_size: string | null;
  tags: string[] | null;
  /** Labels only, English order — the emoji is paired back on from the
   *  English row in mapEventRow, the same way the old static overlay did. */
  includes: string[] | null;
};

type DbEventRow = {
  slug: string;
  title: string;
  short_title: string;
  summary: string;
  body: string;
  venue: string;
  area: string;
  category: string;
  starts_at: string | null;
  ends_at: string | null;
  duration_label: string;
  group_size: string;
  tags: string[];
  includes: { emoji: string; label: string }[];
  ticket_type: { price_aed: number; position: number }[];
  event_image: {
    url: string;
    alt: string;
    width: number;
    height: number;
    position: number;
  }[];
  event_translation: DbTranslation[];
};

const SELECT_EVENT = `
  slug, title, short_title, summary, body, venue, area, category,
  starts_at, ends_at, duration_label, group_size, tags, includes,
  ticket_type ( price_aed, position ),
  event_image ( url, alt, width, height, position ),
  event_translation ( locale, title, short_title, summary, body, venue, area, duration_label, group_size, tags, includes )
`;

/** Dubai has no DST, so a fixed +04:00 offset is always correct: adding 4h to
 *  a UTC instant and reading its UTC calendar fields gives Dubai wall time. */
function dubaiParts(iso: string) {
  const dubai = new Date(new Date(iso).getTime() + 4 * 60 * 60 * 1000);
  return {
    date: dubai.toISOString().slice(0, 10),
    time: dubai.toISOString().slice(11, 16),
  };
}

function mapEventRow(row: DbEventRow, locale: Locale): Experience {
  const translation =
    locale !== "en"
      ? row.event_translation.find((t) => t.locale === locale)
      : undefined;

  const price = [...row.ticket_type].sort((a, b) => a.position - b.position)[0]
    ?.price_aed;
  const images = [...row.event_image]
    .sort((a, b) => a.position - b.position)
    .map(({ url, alt, width, height }) => ({ src: url, alt, width, height }));

  const starts = row.starts_at ? dubaiParts(row.starts_at) : null;
  const ends = row.ends_at ? dubaiParts(row.ends_at) : null;

  // Emoji comes from the English row; only the label is translated. Walking
  // the English list rather than the overlay means a short or over-long
  // translation can never add or drop a bullet — the worst case is one line
  // falling back to English.
  const includes = row.includes.map(({ emoji, label }, i) => ({
    emoji,
    label: translation?.includes?.[i] ?? label,
  }));

  return {
    slug: row.slug,
    title: translation?.title ?? row.title,
    shortTitle: translation?.short_title ?? row.short_title,
    venue: translation?.venue ?? row.venue,
    area: translation?.area ?? row.area,
    category: row.category,
    priceAED: Number(price ?? 0),
    date: starts?.date ?? "",
    startTime: starts?.time ?? "",
    endTime: ends?.time ?? "",
    durationLabel: translation?.duration_label ?? row.duration_label,
    groupSize: translation?.group_size ?? row.group_size,
    images,
    tags: translation?.tags ?? row.tags,
    summary: translation?.summary ?? row.summary,
    body: (translation?.body ?? row.body).split("\n\n").filter(Boolean),
    includes,
  };
}

export async function allExperiences(locale: Locale): Promise<Experience[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("event")
    .select(SELECT_EVENT)
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  if (error) console.error("allExperiences:", error.message);

  return ((data ?? []) as unknown as DbEventRow[]).map((row) =>
    mapEventRow(row, locale),
  );
}

export async function getExperience(slug: string, locale: Locale) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("event")
    .select(SELECT_EVENT)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) console.error("getExperience:", error.message);

  return data ? mapEventRow(data as unknown as DbEventRow, locale) : undefined;
}

export async function relatedExperiences(
  experience: Experience,
  locale: Locale,
  limit = 3,
) {
  const experiences = await allExperiences(locale);
  return experiences
    .filter((candidate) => candidate.slug !== experience.slug)
    .slice(0, limit);
}

/** Every published slug, for generateStaticParams — no locale needed. */
export async function allEventSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("event")
    .select("slug")
    .eq("status", "published");
  if (error) console.error("allEventSlugs:", error.message);
  return (data ?? []).map((row) => row.slug);
}
