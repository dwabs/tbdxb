import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";

import { ExperienceCard } from "@/components/experience-card";
import { Button } from "@/components/ui/button";
import type { Experience } from "@/lib/events";

export function CategorySection({
  id,
  label,
  experiences,
  eyebrow,
  priority = false,
}: {
  id: string;
  label: string;
  eyebrow?: string;
  experiences: Experience[];
  priority?: boolean;
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
          <h2 id={`${id}-heading`} className="text-section font-semibold text-ink">
            {label}
          </h2>
        </div>

        {experiences.length > 0 ? (
          <Button asChild variant="ghost" size="sm" className="shrink-0 -mr-2">
            <Link href={`/events?category=${id}`}>
              See All
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
      </div>

      {experiences.length > 0 ? (
        <ul
          className="rail -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-4"
        >
          {experiences.map((experience, index) => (
            <li
              key={experience.slug}
              className="w-[78vw] shrink-0 snap-start sm:w-auto sm:shrink"
            >
              <ExperienceCard experience={experience} priority={priority && index === 0} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyCategory label={label} />
      )}
    </section>
  );
}

function EmptyCategory({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-sand-soft/50 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="mx-auto grid size-12 place-items-center rounded-full bg-blush text-accent-deep"
      >
        <Compass className="size-5" />
      </span>
      <p className="mt-4 font-display text-lg font-semibold text-ink">
        Nothing in {label} yet
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-[0.9375rem] text-ink-muted">
        We only list what we would go to ourselves, so this row fills up slowly. Tell us what you
        want here and we will go find it.
      </p>
      <Button asChild variant="secondary" size="sm" className="mt-5">
        <Link href="/contact">Suggest an Experience</Link>
      </Button>
    </div>
  );
}
