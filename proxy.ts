import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

/**
 * Every route lives under `app/[locale]`, but the default locale shouldn't
 * carry a redundant `/en` in the URL. So `/faq` is *rewritten* — not
 * redirected — to `/en/faq`: the address bar keeps the clean path while the
 * router still matches the segment. Arabic is prefixed and passes straight
 * through.
 *
 * Named `proxy` because Next 16 renamed Middleware to Proxy.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const prefixed = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (prefixed) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals and anything with a file extension (images, icons).
  matcher: ["/((?!_next|.*\\.).*)"],
};
