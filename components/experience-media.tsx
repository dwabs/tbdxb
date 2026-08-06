import Image from "next/image";

import type { Experience } from "@/lib/events";
import { cn } from "@/lib/utils";

/** Duotone grounds stand in for listings that have no photography yet. */
const TONE_GROUND: Record<Exclude<Experience["tone"], "photo">, string> = {
  berry: "from-[#f8d6e4] via-[#f2b9d0] to-[#d9749f]",
  teal: "from-[#d5e5e1] via-[#a8c8c1] to-[#3f6f68]",
  amber: "from-[#f6e4c6] via-[#eccb98] to-[#c9964a]",
  sand: "from-[#efe9e0] via-[#ddd2c2] to-[#b3a390]",
};

export function ExperienceMedia({
  experience,
  sizes,
  priority = false,
  className,
}: {
  experience: Experience;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const cover = experience.images[0];

  if (cover) {
    return (
      <Image
        src={cover.src}
        alt={cover.alt}
        width={cover.width}
        height={cover.height}
        sizes={sizes}
        preload={priority}
        loading={priority ? "eager" : "lazy"}
        className={cn("size-full object-cover", className)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Placeholder artwork for ${experience.title}`}
      className={cn(
        "relative size-full bg-gradient-to-br",
        TONE_GROUND[experience.tone as Exclude<Experience["tone"], "photo">],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center px-6 text-center font-display text-lg leading-tight font-semibold text-white/85 drop-shadow-[0_1px_6px_rgba(28,25,23,0.28)]"
      >
        {experience.shortTitle}
      </span>
    </div>
  );
}
