import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

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
  themeColor: "#fffafc",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="sr-only rounded-full bg-maroon px-4 py-2 text-sm text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100"
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
