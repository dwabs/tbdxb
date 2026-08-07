import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

/**
 * Every route lives under `app/[locale]`, but the default locale shouldn't
 * carry a redundant `/en` in the URL. So `/faq` is *rewritten* — not
 * redirected — to `/en/faq`: the address bar keeps the clean path while the
 * router still matches the segment. Arabic is prefixed and passes straight
 * through.
 *
 * Also refreshes the Supabase session cookie on every request — this is the
 * one place in the app that reliably runs before a session's access token
 * expires, so it's what keeps `@/lib/supabase/server`'s reads from silently
 * going stale in Server Components (which can't write cookies themselves).
 *
 * Named `proxy` because Next 16 renamed Middleware to Proxy.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const prefixed = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  function buildResponse() {
    if (prefixed) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.rewrite(url, { request });
  }

  let response = buildResponse();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = buildResponse();
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Touches the session so an expiring access token gets refreshed; the
  // value isn't needed here, only the cookie writes triggered above.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip Next internals and anything with a file extension (images, icons).
  matcher: ["/((?!_next|.*\\.).*)"],
};
