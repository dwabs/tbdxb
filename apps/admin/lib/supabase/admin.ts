import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely and can call the GoTrue admin
 * API (`auth.admin.*`). Deliberately its own file, separate from
 * client.ts/server.ts: never import this into a "use client" file, and only
 * ever call it from a Route Handler that has already checked the caller's
 * own authorization first.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
