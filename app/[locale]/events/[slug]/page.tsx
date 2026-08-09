import {
  ChevronRight,
  Clock,
  Hourglass,
  MapPin,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingPanel } from "@/components/booking-panel";
import { ExperienceCard } from "@/components/experience-card";
import { ExperienceGallery } from "@/components/experience-gallery";
import { Badge } from "@/components/ui/badge";
import {
  allEventSlugs,
  CATEGORIES,
  getExperience,
  relatedExperiences,
} from "@/lib/events";
import {
  fill,
  getDictionary,
  localePath,
  LOCALES,
  type Locale,
} from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";
import { formatDateLong, formatTimeRange } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await allEventSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const experience = await getExperience(slug, locale as Locale);
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

export default async function EventPage({
  params,
}: PageProps<"/[locale]/events/[slug]">) {
  const { locale, slug } = await params;
  const lang = locale as Locale;
  const experience = await getExperience(slug, lang);
  if (!experience) notFound();

  const dict = getDictionary(locale);
  const t = dict.detail;
  const categoryId = CATEGORIES.find((entry) => entry === experience.category);
  const related = await relatedExperiences(experience, lang);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user
    ? (
        await supabase
          .from("profile")
          .select("full_name, phone")
          .eq("id", user.id)
          .single()
      ).data
    : null;

  const facts = [
    {
      icon: MapPin,
      label: t.where,
      value: fill(t.venueArea, {
        venue: experience.venue,
        area: experience.area,
      }),
    },
    {
      icon: Clock,
      label: t.when,
      value: [
        formatDateLong(experience.date, lang),
        formatTimeRange(experience.startTime, experience.endTime, lang),
      ]
        .filter(Boolean)
        .join(" · "),
    },
    { icon: Hourglass, label: t.duration, value: experience.durationLabel },
    { icon: Users, label: t.groupSize, value: experience.groupSize },
  ].filter((fact) => fact.value);

  return (
    <div className="mx-auto max-w-[86rem] px-5 pt-6 pb-28 lg:px-8 lg:pb-8">
      <Breadcrumb
        locale={lang}
        label={t.breadcrumb}
        home={dict.nav.home}
        categoryId={categoryId}
        categoryLabel={categoryId ? dict.categories[categoryId] : undefined}
        title={experience.shortTitle}
      />

      <header className="mt-5 max-w-4xl">
        <div className="flex flex-wrap items-center gap-2">
          {experience.tags.map((tag) => (
            <Badge key={tag} variant="blush">
              {tag}
            </Badge>
          ))}
        </div>
        <h1 className="mt-4 text-display font-bold text-ink">
          {experience.title}
        </h1>
        <p className="mt-3 flex items-center gap-1.5 text-[0.9375rem] text-ink-muted">
          <MapPin aria-hidden="true" className="size-4 shrink-0" />
          {fill(t.venueArea, {
            venue: experience.venue,
            area: experience.area,
          })}
        </p>
      </header>

      <div className="mt-8">
        <ExperienceGallery experience={experience} />
      </div>

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-16">
        <div className="min-w-0">
          <ul className="grid gap-5 border-y border-line py-6 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <li key={fact.label} className="flex min-w-0 gap-3">
                <fact.icon
                  aria-hidden="true"
                  className="mt-0.5 size-[1.125rem] shrink-0 text-accent-deep"
                />
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
            <h2
              id="about-heading"
              className="text-section font-semibold text-ink"
            >
              {t.about}
            </h2>
            <div className="mt-5 max-w-[65ch] space-y-4 text-[1.0625rem] leading-relaxed text-ink-muted">
              {experience.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section aria-labelledby="includes-heading" className="mt-12">
            <h2
              id="includes-heading"
              className="text-section font-semibold text-ink"
            >
              {t.included}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {experience.includes.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start gap-3 rounded-xl border border-line bg-paper px-4 py-3.5"
                >
                  {/* leading-[1.15] gives the emoji the same line box as the
                      0.9375rem/snug label beside it, so the two tops line up
                      under items-start whether the label wraps or not. */}
                  <span
                    aria-hidden="true"
                    className="emoji shrink-0 text-[1.125rem] leading-[1.15]"
                  >
                    {item.emoji}
                  </span>
                  <span className="text-[0.9375rem] leading-snug text-ink">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="location-heading" className="mt-12">
            <h2
              id="location-heading"
              className="text-section font-semibold text-ink"
            >
              {t.location}
            </h2>
            <div className="mt-5 flex flex-col items-start gap-4 rounded-card border border-line bg-paper p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-ink">
                  {experience.venue}
                </p>
                <p className="mt-1 text-[0.9375rem] text-ink-muted">
                  {fill(t.inDubai, { area: experience.area })}
                </p>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${experience.venue}, Dubai`)}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[0.9375rem] font-medium text-accent-deep underline-offset-4 hover:underline"
              >
                {t.openInMaps}
              </a>
            </div>
          </section>
        </div>

        <aside aria-label={t.booking} className="lg:sticky lg:top-28">
          <BookingPanel
            experience={experience}
            locale={lang}
            t={t}
            checkoutT={dict.checkout}
            authT={dict.auth}
            userId={user?.id ?? null}
            fullName={profile?.full_name ?? ""}
            phone={profile?.phone ?? null}
          />
        </aside>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-24">
          <h2
            id="related-heading"
            className="text-section font-semibold text-ink"
          >
            {t.related}
          </h2>
          <ul className="rail -mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0">
            {related.map((item) => (
              <li
                key={item.slug}
                className="w-[78vw] shrink-0 snap-start sm:w-auto sm:shrink"
              >
                <ExperienceCard experience={item} locale={lang} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Breadcrumb({
  locale,
  label,
  home,
  categoryId,
  categoryLabel,
  title,
}: {
  locale: Locale;
  label: string;
  home: string;
  categoryId?: string;
  categoryLabel?: string;
  title: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-ink-muted">
        <li>
          <Link
            href={localePath(locale, "/")}
            className="hover:text-accent-deep hover:underline"
          >
            {home}
          </Link>
        </li>
        {categoryId && categoryLabel ? (
          <>
            <ChevronRight
              aria-hidden="true"
              className="size-3.5 shrink-0 text-ink-subtle rtl:rotate-180"
            />
            <li>
              <Link
                href={localePath(locale, `/#${categoryId}`)}
                className="hover:text-accent-deep hover:underline"
              >
                {categoryLabel}
              </Link>
            </li>
          </>
        ) : null}
        <ChevronRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-ink-subtle rtl:rotate-180"
        />
        <li
          aria-current="page"
          className="min-w-0 truncate font-medium text-ink"
        >
          {title}
        </li>
      </ol>
    </nav>
  );
}
