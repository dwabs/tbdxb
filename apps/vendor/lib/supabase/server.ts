import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Components can't write cookies, only read them. The `setAll` still
 * runs there — the try/catch swallows it — because proxy.ts refreshes the
 * session on every request anyway.
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
            // Server Component — proxy.ts already refreshed this request.
          }
        },
      },
    },
  );
}
