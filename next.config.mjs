/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
  },
  typedRoutes: false,
  // Keep compiled routes in memory long enough that back-nav between pages
  // during dev doesn't trigger a fresh ~5s compile. Default is 25s which is
  // too aggressive — first visit compiles, coming back 30s later recompiles.
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 12,
  },
  // Skip bundling Prisma (native binary engine) into the server graph — huge
  // dev compile-time win and a smaller serverless function. NOTE: do NOT add
  // mapbox-gl or web-push here under Turbopack — both have caused the dev
  // server to hang at "Compiling / ..." in this project. Keep the list lean.
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    // Tree-shake only symbols the app actually imports from these libs.
    // mapbox-gl is NOT listed — it has side-effectful init code that the
    // tree-shaker strips, breaking the client bundle. react/react-dom stay out
    // for the same reason (JSX runtime entry).
    optimizePackageImports: [
      "@supabase/ssr",
      "@supabase/supabase-js",
      "zod",
      "clsx",
      "tailwind-merge",
    ],
  },
};

export default nextConfig;
