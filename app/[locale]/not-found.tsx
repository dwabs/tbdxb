import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, getDictionary, localePath } from "@/lib/i18n";
import { SECONDARY_NAV } from "@/lib/site";

/**
 * `not-found` renders below the locale segment but cannot read its param, so
 * it falls back to the default locale. An Arabic 404 would need its own
 * boundary; not worth a route file until the site has Arabic traffic.
 */
export default function NotFound() {
  const locale = DEFAULT_LOCALE;
  const t = getDictionary(locale);
  return (
    <div className="mx-auto flex max-w-[86rem] flex-col items-start px-5 pt-20 pb-28 lg:px-8">
      {/* Same type as the heading below it, so the two read as one block. */}
      <p className="font-display text-display font-bold text-accent-deep">
        404
      </p>
      <h1 className="mt-4 max-w-2xl text-display font-bold text-ink">
        {t.notFound.title}
      </h1>
      <p className="mt-4 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-muted">
        {t.notFound.body}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href={localePath(locale, "/events")}>{t.notFound.browse}</Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href={localePath(locale, "/")}>{t.notFound.backHome}</Link>
        </Button>
      </div>

      <nav
        aria-label={t.notFound.otherPages}
        className="mt-14 w-full border-t border-line pt-6"
      >
        <h2 className="font-display text-[0.6875rem] font-semibold tracking-[0.1em] text-ink-subtle uppercase">
          {t.notFound.orTry}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
          {SECONDARY_NAV.map((link) => (
            <li key={link.key}>
              <Link
                href={localePath(locale, link.href)}
                className="text-[0.9375rem] text-ink-muted underline-offset-4 hover:text-accent-deep hover:underline"
              >
                {t.secondaryNav[link.key]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
