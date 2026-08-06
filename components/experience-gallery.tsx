import Image from "next/image";

import { ExperienceMedia } from "@/components/experience-media";
import type { Experience } from "@/lib/events";

/**
 * Pure CSS: a snap carousel on mobile, a mosaic from md up. No JS, no
 * measurement — the layout does the work.
 */
export function ExperienceGallery({ experience }: { experience: Experience }) {
  const [cover, ...rest] = experience.images;

  if (!cover) {
    return (
      <div className="aspect-[16/10] overflow-hidden rounded-card md:aspect-[2/1]">
        <ExperienceMedia experience={experience} sizes="100vw" priority={true} />
      </div>
    );
  }

  return (
    <div className="rail -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 md:mx-0 md:grid md:h-[30rem] md:grid-cols-3 md:grid-rows-2 md:gap-3 md:overflow-visible md:px-0">
      <figure className="relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-card bg-sand-soft md:col-span-2 md:row-span-2 md:w-auto">
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 768px) 85vw, 55vw"
          preload
          className="size-full object-cover"
        />
      </figure>

      {rest.map((image) => (
        <figure
          key={image.src}
          className="relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-card bg-sand-soft md:w-auto"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 768px) 85vw, 28vw"
            loading="lazy"
            className="size-full object-cover"
          />
        </figure>
      ))}
    </div>
  );
}
