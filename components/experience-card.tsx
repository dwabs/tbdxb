import { MapPin } from "lucide-react";
import Link from "next/link";

import { ExperienceMedia } from "@/components/experience-media";
import { Badge } from "@/components/ui/badge";
import type { Experience } from "@/lib/events";
import { formatDateShort, formatPrice, formatTime } from "@/lib/utils";

export function ExperienceCard({
  experience,
  priority = false,
}: {
  experience: Experience;
  priority?: boolean;
}) {
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
          <Badge variant="ink" size="sm" className="absolute bottom-3 left-3 z-10 bg-ink/85 backdrop-blur-sm">
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
          <Link href={`/events/${experience.slug}`} className="after:absolute after:inset-0 after:z-10">
            <span className="line-clamp-2">{experience.title}</span>
          </Link>
        </h3>

        <p className="tabular text-[0.8125rem] text-ink-muted">
          {formatDateShort(experience.date)} · {formatTime(experience.startTime)}
        </p>

        <p className="tabular mt-auto pt-1.5 text-[0.9375rem] font-semibold text-ink">
          {formatPrice(experience.priceAED)}
          <span className="font-normal text-ink-muted"> per person</span>
        </p>
      </div>
    </article>
  );
}
