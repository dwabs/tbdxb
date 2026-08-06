import Image from "next/image";

import { ExperienceMedia } from "@/components/experience-media";
import type { Experience } from "@/lib/events";
import { cn } from "@/lib/utils";

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

  /**
   * A single photo has no mosaic to fill. Stretching it across the full 86rem
   * column would mean either a 2.9:1 letterbox or a 700px-tall wall, so it
   * gets its own narrower measure instead: a centred 16/9 hero, which is a
   * light crop on the 3:2 photography these listings use.
   */
  if (rest.length === 0) {
    return (
      <figure className="mx-auto aspect-[16/10] w-full overflow-hidden rounded-card bg-sand-soft md:aspect-[16/9] md:max-w-5xl">
        <Image
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 64rem"
          preload
          className="size-full object-cover"
        />
      </figure>
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
          className={cn(
            "relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-card bg-sand-soft md:w-auto",
            // One image beside the cover takes the whole side column; two
            // stack. Past three the grid would spill its fixed height, so
            // listings are capped at three photos for now.
            rest.length === 1 && "md:row-span-2",
          )}
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
