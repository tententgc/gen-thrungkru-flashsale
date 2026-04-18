import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://thungkhru61.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/vendor", "/api/notify"] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
