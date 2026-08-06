import Image from "next/image";

import type { Experience } from "@/lib/events";
import { cn } from "@/lib/utils";

/**
 * Duotone grounds stand in for listings that have no photography yet. Which
 * one a listing gets is derived from its slug rather than stored on it: the
 * grounds are interchangeable, so an author choosing between them is a
 * decision with no right answer — and a field that can hold a value nothing
 * renders. Deriving it keeps neighbouring cards from matching by accident and
 * keeps the same listing on the same ground between renders.
 */
const TONE_GROUNDS = [
  "from-[#f8d6e4] via-[#f2b9d0] to-[#d9749f]",
  "from-[#d5e5e1] via-[#a8c8c1] to-[#3f6f68]",
  "from-[#f6e4c6] via-[#eccb98] to-[#c9964a]",
  "from-[#efe9e0] via-[#ddd2c2] to-[#b3a390]",
] as const;

const groundFor = (slug: string) => {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  return TONE_GROUNDS[Math.abs(hash) % TONE_GROUNDS.length];
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
        groundFor(experience.slug),
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
