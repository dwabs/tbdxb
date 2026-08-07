import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Components can't write cookies (Next.js throws), only read them.
 * The `setAll` below still runs there — the try/catch swallows the failure —
 * because proxy.ts refreshes the session on every request anyway, so a
 * Server Component skipping the write is harmless.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — proxy.ts already refreshed
            // the session cookie for this request.
          }
        },
      },
    },
  );
}
