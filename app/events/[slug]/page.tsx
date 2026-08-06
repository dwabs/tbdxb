import { Check, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingPanel } from "@/components/booking-panel";
import { ExperienceCard } from "@/components/experience-card";
import { ExperienceGallery } from "@/components/experience-gallery";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, EXPERIENCES, getExperience, relatedExperiences } from "@/lib/events";
import { formatDateLong, formatTimeRange } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = () =>
  EXPERIENCES.map((experience) => ({ slug: experience.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) return {};

  return {
    title: `${experience.title} — ${experience.venue}`,
    description: experience.summary,
    openGraph: {
      title: experience.title,
      description: experience.summary,
      images: experience.images[0] ? [experience.images[0].src] : undefined,
    },
  };
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const experience = getExperience(slug);
  if (!experience) notFound();

  const category = CATEGORIES.find((entry) => entry.id === experience.category);
  const related = relatedExperiences(experience);

  const facts = [
    { icon: MapPin, label: "Where", value: `${experience.venue}, ${experience.area}` },
    {
      icon: Clock,
      label: "When",
      value: `${formatDateLong(experience.date)} · ${formatTimeRange(experience.startTime, experience.endTime)}`,
    },
    { icon: Users, label: "Group size", value: experience.groupSize },
  ];

  return (
    <div className="mx-auto max-w-[86rem] px-5 pt-6 pb-28 lg:px-8 lg:pb-8">
      <Breadcrumb category={category} title={experience.shortTitle} />

      <header className="mt-5 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          {experience.tags.map((tag) => (
            <Badge key={tag} variant="blush">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="mt-4 text-display font-bold text-ink">{experience.title}</h1>
        <p className="mt-3 flex items-center gap-1.5 text-[0.9375rem] text-ink-muted">
          <MapPin aria-hidden="true" className="size-4 shrink-0" />
          {experience.venue}, {experience.area}
        </p>
      </header>

      <div className="mt-8">
        <ExperienceGallery experience={experience} />
      </div>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-16">
        <div className="min-w-0">
          <ul className="grid gap-5 border-y border-line py-6 sm:grid-cols-3">
            {facts.map((fact) => (
              <li key={fact.label} className="flex min-w-0 gap-3">
                <fact.icon aria-hidden="true" className="mt-0.5 size-[1.125rem] shrink-0 text-berry" />
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-[0.9375rem] leading-snug font-medium text-ink">
                    {fact.value}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <section aria-labelledby="about-heading" className="mt-10">
            <h2 id="about-heading" className="text-section font-semibold text-ink">
              About This Experience
            </h2>
            <div className="mt-5 max-w-[65ch] space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted">
              {experience.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="includes-heading" className="mt-12">
            <h2 id="includes-heading" className="text-section font-semibold text-ink">
              What’s Included
            </h2>
            <ul className="mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
              {experience.includes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-line bg-paper px-4 py-3.5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-blush text-berry"
                  >
                    <Check className="size-3" />
                  </span>
                  <span className="text-[0.9375rem] leading-snug text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="location-heading" className="mt-12">
            <h2 id="location-heading" className="text-section font-semibold text-ink">
              Where You’ll Be
            </h2>
            <div className="mt-5 flex flex-col items-start gap-4 rounded-card border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-ink">{experience.venue}</p>
                <p className="mt-1 text-[0.9375rem] text-ink-muted">{experience.area}, Dubai</p>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${experience.venue}, Dubai`)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[0.9375rem] font-medium text-berry underline-offset-4 hover:underline"
              >
                Open in Maps
              </a>
            </div>
          </section>
        </div>

        <aside aria-label="Booking" className="lg:sticky lg:top-28">
          <BookingPanel experience={experience} />
        </aside>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-24">
          <h2 id="related-heading" className="text-section font-semibold text-ink">
            You Might Also Like
          </h2>
          <ul className="rail -mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0">
            {related.map((item) => (
              <li key={item.slug} className="w-[78vw] shrink-0 snap-start sm:w-auto sm:shrink">
                <ExperienceCard experience={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Breadcrumb({
  category,
  title,
}: {
  category?: { id: string; label: string };
  title: string;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-ink-muted">
        <li>
          <Link href="/" className="hover:text-berry hover:underline">
            Home
          </Link>
        </li>
        {category ? (
          <>
            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-ink-subtle" />
            <li>
              <Link href={`/#${category.id}`} className="hover:text-berry hover:underline">
                {category.label}
              </Link>
            </li>
          </>
        ) : null}
        <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-ink-subtle" />
        <li aria-current="page" className="min-w-0 truncate font-medium text-ink">
          {title}
        </li>
      </ol>
    </nav>
  );
}
