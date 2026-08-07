import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { LogoMark, Wordmark } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { fill, localePath, type Dictionary, type Locale } from "@/lib/i18n";
import { FOOTER_COLUMNS, SITE } from "@/lib/site";

/** lucide v1 dropped brand glyphs, so the Instagram mark is drawn inline. */
function InstagramMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-[1.125rem]"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiteFooter({
  locale,
  t,
}: {
  locale: Locale;
  t: Dictionary["footer"];
}) {
  return (
    <footer className="mt-24 border-t border-line bg-sand-soft/60">
      <div className="mx-auto max-w-[86rem] px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-10" />
              <Wordmark className="text-xl" />
            </div>
            <p className="mt-3 max-w-xs text-[0.9375rem] leading-relaxed text-ink-muted">
              {t.tagline}
            </p>

            <ul className="mt-6 space-y-2.5 text-[0.9375rem] text-ink-muted">
              <li className="flex items-center gap-2.5">
                <MapPin
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-subtle"
                />
                {t.city}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-subtle"
                />
                <a
                  href={`mailto:${SITE.email}`}
                  className="hover:text-accent-deep hover:underline"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-subtle"
                />
                <a
                  href={SITE.phoneHref}
                  dir="ltr"
                  className="tabular hover:text-accent-deep hover:underline"
                >
                  {SITE.phone}
                </a>
              </li>
            </ul>

            <a
              href={SITE.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={t.instagramAria}
              className="mt-6 inline-grid size-10 place-items-center rounded-full border border-line-strong text-ink transition-colors duration-150 hover:border-accent hover:text-accent-deep"
            >
              <InstagramMark />
            </a>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={t[column.heading]}>
              <h2 className="text-[0.6875rem] font-semibold tracking-[0.12em] text-ink uppercase">
                {t[column.heading]}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={localePath(locale, link.href)}
                      className="text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:text-accent-deep hover:underline"
                    >
                      {t[link.key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-[0.6875rem] font-semibold tracking-[0.12em] text-ink uppercase">
              {t.newsletter}
            </h2>
            <div className="mt-4">
              <NewsletterForm t={t} />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-sm text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p className="tabular">
            {fill(t.rights, { year: new Date().getFullYear() })}
          </p>
          <p>
            {t.expert}{" "}
            <a
              href={SITE.phoneHref}
              dir="ltr"
              className="tabular font-medium text-ink hover:text-accent-deep hover:underline"
            >
              {SITE.phone}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
