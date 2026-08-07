import { createBrowserClient } from "@supabase/ssr";

/**
 * One client per import, not per call — Supabase's browser client is safe to
 * share and re-creating it drops the in-memory session cache.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
