/**
 * Event photos come from two places, and only one of them is absolute:
 *   - Vendor uploads → Supabase Storage, stored as a full public URL.
 *   - The six seeded demo events → app-relative paths (`/events/foo.jpg`)
 *     pointing at files the *public site* serves out of its own `/public`.
 *
 * A relative path is the correct stored value — it's what the public site
 * needs, and hardcoding an origin into the database would break the moment
 * the site moves to its real domain. But this app runs on a different
 * origin, so `<img src="/events/foo.jpg">` would resolve against the vendor
 * dashboard and 404. Resolving at render time keeps the data portable and
 * puts the origin in exactly one place.
 */
const PUBLIC_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tbdxb.vercel.app";

export function resolveImageUrl(url: string): string {
  return url.startsWith("/") ? `${PUBLIC_SITE_URL}${url}` : url;
}
