import { Check, Phone } from "lucide-react";
import { Suspense } from "react";

import { CategorySection } from "@/components/category-section";
import { SearchPanel } from "@/components/search-panel";
import { Button } from "@/components/ui/button";
import { CATEGORIES, experiencesByCategory } from "@/lib/events";
import { SITE, VALUE_PROPS } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="mx-auto max-w-[86rem] space-y-20 px-5 pt-16 pb-8 lg:px-8">
        {CATEGORIES.map((category, index) => (
          <CategorySection
            key={category.id}
            id={category.id}
            label={category.label}
            eyebrow={index === 0 ? "Fresh this month" : undefined}
            experiences={experiencesByCategory(category.id)}
            priority={index === 0}
          />
        ))}
      </div>

      <WhyUs />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* The ruled ground: the sheet a bucket list gets written on. */}
      <div aria-hidden="true" className="ruled absolute inset-0 opacity-55" />
      <div
        aria-hidden="true"
        className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-blush blur-3xl"
      />

      <div className="relative mx-auto max-w-[86rem] px-5 pt-16 pb-12 sm:pt-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-20">
          <div className="max-w-3xl">
            <p className="animate-rise flex items-center gap-2 text-[0.6875rem] font-semibold tracking-[0.14em] text-accent-deep uppercase">
              <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
              Dubai · Updated weekly
            </p>

          <h1
            className="animate-rise mt-5 text-hero font-extrabold text-ink"
            style={{ animationDelay: "60ms" }}
          >
            Things worth
            <br />
            doing in{" "}
            <span className="relative inline-block">
              Dubai
              <svg
                aria-hidden="true"
                viewBox="0 0 220 22"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-3 w-full text-accent-soft"
              >
                <path
                  d="M3 15C58 6 143 4 217 9"
                  stroke="currentColor"
                  strokeWidth="7"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p
            className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-ink-muted"
            style={{ animationDelay: "120ms" }}
          >
            We don’t list everything — only the experiences we’d book ourselves. Find one, tick it
            off, go again.
          </p>
          </div>

          <ListCard />
        </div>

        <div className="animate-rise mt-10 sm:mt-12" style={{ animationDelay: "180ms" }}>
          {/* useSearchParams needs a boundary so the shell can still prerender. */}
          <Suspense fallback={<div className="h-[5.5rem] rounded-[1.75rem] bg-sand-soft/60" />}>
            <SearchPanel />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

/**
 * The signature: an actual bucket list, half ticked. It says what the product
 * is faster than any strapline, and it gives the hero its second focal point.
 */
const LIST_ITEMS = [
  { label: "Candle making at SALT", done: true },
  { label: "Dhow supper on the creek", done: true },
  { label: "Glassblowing in Al Quoz", done: false },
  { label: "Supper club in the dunes", done: false },
];

function ListCard() {
  return (
    <div
      aria-hidden="true"
      className="animate-rise hidden rotate-[-1.5deg] rounded-card border border-line bg-paper p-6 shadow-lift-lg lg:block"
      style={{ animationDelay: "240ms" }}
    >
      <p className="font-display text-lg font-bold tracking-[-0.02em] text-ink">
        Your bucket list
      </p>
      <p className="mt-0.5 text-[0.8125rem] text-ink-subtle">2 of 4 ticked off</p>

      <ul className="mt-5 space-y-3.5">
        {LIST_ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-3">
            <span
              className={
                item.done
                  ? "grid size-5 shrink-0 place-items-center rounded-md bg-accent text-primary"
                  : "grid size-5 shrink-0 place-items-center rounded-md border border-line-strong"
              }
            >
              {item.done ? <Check className="size-3.5" /> : null}
            </span>
            <span
              className={
                item.done
                  ? "text-[0.9375rem] text-ink-subtle line-through decoration-accent/50"
                  : "text-[0.9375rem] text-ink"
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WhyUs() {
  return (
    <section aria-labelledby="why-heading" className="mt-24 border-y border-line bg-blush/45">
      <div className="mx-auto max-w-[86rem] px-5 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[0.6875rem] font-semibold tracking-[0.12em] text-accent-deep uppercase">
            Why thebucketlistdxb
          </p>
          <h2 id="why-heading" className="mt-3 text-display font-bold text-ink">
            Not just things to do — things worth doing
          </h2>
        </div>

        <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop) => (
            <li key={prop.title} className="border-t border-accent-soft pt-5">
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-full bg-accent text-primary"
              >
                <Check className="size-4" />
              </span>
              <h3 className="mt-4 text-[1.0625rem] leading-snug font-semibold text-ink">
                {prop.title}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{prop.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-16 flex flex-col items-start gap-4 rounded-card border border-accent-soft bg-paper p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink">Planning something bigger?</h3>
            <p className="mt-1 text-[0.9375rem] text-ink-muted">
              Birthdays, team days, proposals — tell us the brief and we’ll build the plan.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <a href={SITE.phoneHref}>
              <Phone aria-hidden="true" />
              <span className="tabular">{SITE.phone}</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
