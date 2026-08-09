import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ExperienceCard } from "@/components/experience-card";
import { SearchPanel } from "@/components/search-panel";
import { Button } from "@/components/ui/button";
import { allExperiences, CATEGORIES, type Experience } from "@/lib/events";
import { fill, getDictionary, localePath, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale).events;
  return { title: t.title, description: t.metaDescription };
}

type Search = Promise<{ [key: string]: string | string[] | undefined }>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

function filterExperiences(
  rows: Experience[],
  params: Awaited<Search>,
): Experience[] {
  const q = first(params.q).toLowerCase();
  const category = first(params.category);
  const from = first(params.from);
  const to = first(params.to);
  const guests = Number(first(params.guests)) || 0;

  return rows.filter((experience) => {
    if (category && experience.category !== category) return false;
    if (from && experience.date < from) return false;
    if (to && experience.date > to) return false;

    // "Up to 16 people" / "8 – 24 people" → the largest number is the cap.
    if (guests > 0) {
      const capacity = Math.max(
        ...(experience.groupSize.match(/\d+/g) ?? ["0"]).map(Number),
      );
      if (capacity > 0 && guests > capacity) return false;
    }

    if (q) {
      const haystack = [
        experience.title,
        experience.venue,
        experience.area,
        experience.summary,
        ...experience.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export default async function EventsPage({
  params: routeParams,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Search;
}) {
  const [{ locale }, params] = await Promise.all([routeParams, searchParams]);
  const dict = getDictionary(locale);
  const t = dict.events;
  const results = filterExperiences(
    await allExperiences(locale as Locale),
    params,
  );
  const categoryId = CATEGORIES.find(
    (entry) => entry === first(params.category),
  );
  const query = first(params.q);

  return (
    <div className="mx-auto max-w-[86rem] px-5 py-10 lg:px-8">
      <h1 className="text-display font-bold text-ink">
        {categoryId ? dict.categories[categoryId] : t.title}
      </h1>
      <p aria-live="polite" className="mt-3 text-[0.9375rem] text-ink-muted">
        {fill(results.length === 1 ? t.countOne : t.countOther, {
          count: results.length,
        })}
        {query ? fill(t.matching, { query }) : ""}
      </p>

      <div className="mt-8">
        <Suspense
          fallback={
            <div className="h-[5.5rem] rounded-[1.75rem] bg-sand-soft/60" />
          }
        >
          <SearchPanel locale={locale as Locale} t={dict.search} />
        </Suspense>
      </div>

      {results.length > 0 ? (
        <ul className="mt-12 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((experience, index) => (
            <li key={experience.slug}>
              <ExperienceCard
                experience={experience}
                locale={locale as Locale}
                priority={index < 4}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-12 rounded-card border border-dashed border-line-strong bg-sand-soft/50 px-6 py-16 text-center">
          <span
            aria-hidden="true"
            className="mx-auto grid size-12 place-items-center rounded-full bg-blush text-accent-deep"
          >
            <SearchX className="size-5" />
          </span>
          <p className="mt-4 font-display text-lg font-semibold text-ink">
            {t.noMatchTitle}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-[0.9375rem] text-ink-muted">
            {t.noMatchBody}
          </p>
          <Button asChild variant="secondary" size="sm" className="mt-5">
            <Link href={localePath(locale as Locale, "/events")}>
              {t.clearFilters}
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
