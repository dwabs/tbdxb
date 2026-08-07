import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";

import { ExperienceCard } from "@/components/experience-card";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/events";
import { fill, localePath, type Dictionary, type Locale } from "@/lib/i18n";

export function CategorySection({
  id,
  label,
  locale,
  experiences,
  eyebrow,
  priority = false,
  t,
}: {
  id: string;
  label: string;
  locale: Locale;
  eyebrow?: string;
  experiences: Experience[];
  priority?: boolean;
  t: Dictionary["home"];
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1.5 text-[0.6875rem] font-semibold tracking-[0.12em] text-accent-deep uppercase">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={`${id}-heading`}
            className="text-section font-semibold text-ink"
          >
            {label}
          </h2>
        </div>

        {experiences.length > 0 ? (
          <Button asChild variant="ghost" size="sm" className="-me-2 shrink-0">
            <Link href={localePath(locale, `/events?category=${id}`)}>
              {t.seeAll}
              <ArrowRight aria-hidden="true" className="rtl:rotate-180" />
            </Link>
          </Button>
        ) : null}
      </div>

      {experiences.length > 0 ? (
        <ul className="rail -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4">
          {experiences.map((experience, index) => (
            <li
              key={experience.slug}
              className="w-[78vw] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              <ExperienceCard
                experience={experience}
                locale={locale}
                priority={priority && index === 0}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyCategory label={label} locale={locale} t={t} />
      )}
    </section>
  );
}

function EmptyCategory({
  label,
  locale,
  t,
}: {
  label: string;
  locale: Locale;
  t: Dictionary["home"];
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-sand-soft/50 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="mx-auto grid size-12 place-items-center rounded-full bg-blush text-accent-deep"
      >
        <Compass className="size-5" />
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-ink">
        {fill(t.emptyTitle, { category: label })}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-[0.9375rem] text-ink-muted">
        {t.emptyBody}
      </p>
      <Button asChild variant="secondary" size="sm" className="mt-5">
        <Link href={localePath(locale, "/contact")}>{t.suggest}</Link>
      </Button>
    </div>
  );
}
