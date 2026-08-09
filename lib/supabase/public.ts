import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * For public, unauthenticated reads (published events) — no cookies, no
 * session. Safe to call from generateStaticParams at build time, where
 * next/headers' cookies() has no request to attach to.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
