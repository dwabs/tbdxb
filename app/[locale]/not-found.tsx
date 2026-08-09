import type { Metadata } from "next";

import { NotFoundContent } from "@/components/not-found-content";

// Without this, the tab title falls back to the root layout's default
// metadata — the homepage's title — since this file doesn't otherwise
// override it. Stays English: metadata exports only run on the server,
// where the locale param this boundary is missing (see NotFoundContent)
// isn't available either.
export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return <NotFoundContent />;
}
