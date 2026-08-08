import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // `[locale]/layout.tsx` stands in as the root layout (no page/layout at
    // the true app root), which is the case Next's docs flag as needing
    // this instead of a plain root `not-found.tsx` — see app/global-not-found.tsx.
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vjvpujzkhsykzfhdicvr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
