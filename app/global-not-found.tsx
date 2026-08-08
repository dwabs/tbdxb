import type { Metadata } from "next";
import Link from "next/link";
import { Geist, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { DEFAULT_LOCALE, DIRECTION, getDictionary, localePath } from "@/lib/i18n";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Not found",
};

/**
 * `app/[locale]/layout.tsx` is the effective root layout (there's no page at
 * the true app root, only the `[locale]` segment), which is exactly the case
 * Next's docs call out as needing `global-not-found.tsx` instead of a normal
 * root `not-found.tsx`: a URL that doesn't match any route at all — a typo,
 * a dead link — never reaches into `[locale]`'s tree, so `[locale]/not-found.tsx`
 * only ever catches an explicit `notFound()` thrown by a page *inside* that
 * tree (a bad event slug, say), not a genuinely unmatched path. Without this
 * file, an unmatched URL fell through to Next's bare framework-default 404.
 *
 * This can't read a locale param — there isn't one to read — so, same as
 * `[locale]/not-found.tsx`, it renders the default locale.
 */
export default function GlobalNotFound() {
  const locale = DEFAULT_LOCALE;
  const t = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={DIRECTION[locale]}
      className={`${geist.variable} ${inter.variable} ${plexArabic.variable}`}
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader locale={locale} t={t.nav} auth={t.auth} />
        <main id="main" className="flex-1">
          <div className="mx-auto flex max-w-[86rem] flex-col items-start px-5 pt-20 pb-28 lg:px-8">
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
                <Link href={localePath(locale, "/events")}>
                  {t.notFound.browse}
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={localePath(locale, "/")}>
                  {t.notFound.backHome}
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter locale={locale} t={t.footer} />
      </body>
    </html>
  );
}
