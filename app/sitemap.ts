import type { MetadataRoute } from "next";
import { listVendors } from "@/lib/data/vendors";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://thungkhru61.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vendors = await listVendors();
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/flash-sales",
    "/shops",
    "/map",
    "/crowd",
    "/feed",
    "/login",
    "/register",
  ].map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "/" ? "hourly" : "daily",
    priority: p === "/" ? 1 : 0.7,
  }));
  const shops: MetadataRoute.Sitemap = vendors.map((v) => ({
    url: `${BASE}/shops/${v.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));
  return [...staticRoutes, ...shops];
}
