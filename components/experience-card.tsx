import { MapPin } from "lucide-react";
import Link from "next/link";

import { ExperienceMedia } from "@/components/experience-media";
import { Badge } from "@/components/ui/badge";
import type { Experience } from "@/lib/events";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { formatDateShort, formatPrice, formatTime } from "@/lib/utils";

export function ExperienceCard({
  experience,
  locale,
  priority = false,
}: {
  experience: Experience;
  locale: Locale;
  priority?: boolean;
}) {
  // A Server Component, so it reads the dictionary rather than having one
  // string drilled through every list that renders a card.
  const t = getDictionary(locale);
  // Either half can be empty for an event published before its schedule was
  // set, so the separator is only earned when both sides are there.
  const schedule = [
    formatDateShort(experience.date, locale),
    formatTime(experience.startTime, locale),
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="group relative flex min-w-0 flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-sand-soft">
        <ExperienceMedia
          experience={experience}
          priority={priority}
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 44vw, 24vw"
          className="transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
        />

        {experience.tags[0] ? (
          <Badge
            variant="ink"
            size="sm"
            className="absolute bottom-3 start-3 z-10 bg-primary/85 backdrop-blur-sm"
          >
            {experience.tags[0]}
          </Badge>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-3.5">
        <p className="flex min-w-0 items-center gap-1.5 text-[0.8125rem] text-ink-muted">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{experience.venue}</span>
        </p>

        <h3 className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.015em] text-ink">
          <Link
            href={localePath(locale, `/events/${experience.slug}`)}
            className="after:absolute after:inset-0 after:z-10"
          >
            <span className="line-clamp-2">{experience.title}</span>
          </Link>
        </h3>

        {schedule ? (
          <p className="tabular text-[0.8125rem] text-ink-muted">{schedule}</p>
        ) : null}

        <p className="tabular mt-auto pt-1.5 text-[0.9375rem] font-semibold text-ink">
          {formatPrice(experience.priceAED, locale)}
          <span className="font-normal text-ink-muted">
            {" "}
            {t.detail.perPerson}
          </span>
        </p>
      </div>
    </article>
  );
}
