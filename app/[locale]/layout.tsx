import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DIRECTION, getDictionary, isLocale, LOCALES } from "@/lib/i18n";

import "../globals.css";

/** Geist carries the titles; Inter carries the body and UI. */
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

/**
 * Neither Geist nor Inter draws Arabic, so Arabic would otherwise fall back to
 * whatever the OS picks — different on every device. IBM Plex Sans Arabic is
 * the closest companion to a Latin grotesque, and it covers both roles.
 */
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = getDictionary(locale);

  return {
    metadataBase: new URL("https://thebucketlistdxb.com"),
    title: { default: t.meta.title, template: t.meta.titleTemplate },
    description: t.meta.description,
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_AE" : "en_AE",
      siteName: t.meta.title,
    },
    alternates: {
      languages: { en: "/", ar: "/ar" },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fffafc",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
    <html
      lang={locale}
      dir={DIRECTION[locale]}
      className={`${geist.variable} ${inter.variable} ${plexArabic.variable}`}
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-primary px-4 py-2 text-sm text-white focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-100"
        >
          {t.nav.skipToContent}
        </a>
        <SiteHeader locale={locale} t={t.nav} auth={t.auth} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} t={t.footer} />
      </body>
    </html>
  );
}
