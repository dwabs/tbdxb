"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, getDictionary, isLocale, localePath } from "@/lib/i18n";

/**
 * `not-found.tsx` renders below the `[locale]` segment but the App Router
 * never passes that segment's `params` down to a not-found boundary, so it
 * can't read which locale it's serving. `usePathname()` sidesteps that: it
 * reflects the actual matched URL (untouched by proxy's rewrite of the
 * default-locale routes), so the leading `/ar` segment is still there to
 * detect even though params aren't.
 */
export function NotFoundContent() {
  const pathname = usePathname();
  const first = pathname?.split("/")[1] ?? "";
  const locale = isLocale(first) ? first : DEFAULT_LOCALE;
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
    </div>
  );
}
