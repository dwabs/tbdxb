import type { Metadata, Viewport } from "next";
import { Gabarito, Hanken_Grotesk } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

/**
 * Display: Gabarito — geometric with soft, slightly quirky terminals. Warm
 * enough for a leisure brand without tipping into novelty.
 * Body/UI: Hanken Grotesk — a neutral humanist that stays legible at 13–15px.
 */
const gabarito = Gabarito({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-gabarito",
  display: "swap",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thebucketlistdxb.com"),
  title: {
    default: "The Bucket List DXB — Things worth doing in Dubai",
    template: "%s · The Bucket List DXB",
  },
  description:
    "Not just things to do — things worth doing. Hand-picked experiences, workshops and nights out across Dubai, chosen for people who actually live here.",
  openGraph: {
    type: "website",
    locale: "en_AE",
    siteName: "The Bucket List DXB",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfcfb",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${gabarito.variable} ${hanken.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-ink px-4 py-2 text-sm text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
