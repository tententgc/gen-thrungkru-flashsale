import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import { VENDORS, vendorBySlug as mockBySlug, vendorById as mockById } from "@/lib/mock-data";
import { VENDOR_IMAGES } from "@/lib/images";
import { isUuid } from "@/lib/utils";
import type { Vendor } from "@/lib/types";

function prismaVendorToView(v: any): Vendor {
  // Fall back to curated Unsplash photo keyed by slug if DB column is empty.
  const curated = VENDOR_IMAGES[v.slug];
  return {
    id: v.id,
    slug: v.slug,
    shopName: v.shopName,
    description: v.description ?? "",
    category: v.category,
    phone: v.phone,
    lineId: v.lineId ?? undefined,
    coverImageUrl: v.coverImageUrl || curated?.cover || "",
    logoUrl: v.logoUrl || curated?.logo,
    logoEmoji: v.logoEmoji ?? "🏪",
    latitude: v.latitude,
    longitude: v.longitude,
    boothNumber: v.boothNumber ?? "",
    openTime: v.openTime ?? "",
    closeTime: v.closeTime ?? "",
    openDays: v.openDays ?? [],
    isActive: v.isActive,
    isVerified: v.isVerified,
    rating: v.rating,
    reviewCount: v.reviewCount,
    followerCount: v.followerCount,
  };
}

async function tryDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!ready.db || !prisma) return fallback;
  try {
    return await fn();
  } catch {
    // DB unreachable or misconfigured — fall back silently so the app keeps working.
    return fallback;
  }
}

// Vendor catalog changes rarely — cache for 5 minutes across requests,
// deduplicate within a single render via React.cache().
const fetchVendors = unstable_cache(
  async (): Promise<Vendor[]> => {
    const rows = await tryDb(
      () =>
        prisma!.vendor.findMany({
          where: { isActive: true },
          orderBy: { followerCount: "desc" },
        }),
      [] as any[],
    );
    if (rows.length > 0) return rows.map(prismaVendorToView);
    return VENDORS;
  },
  ["vendors:list:active"],
  { revalidate: 300, tags: ["vendors"] },
);

export const listVendors = cache(fetchVendors);

const fetchVendorBySlug = unstable_cache(
  async (slug: string): Promise<Vendor | null> => {
    const v = await tryDb(
      () => prisma!.vendor.findUnique({ where: { slug } }),
      null,
    );
    if (v) return prismaVendorToView(v);
    return mockBySlug(slug) ?? null;
  },
  ["vendors:by-slug"],
  { revalidate: 300, tags: ["vendors"] },
);

export const getVendorBySlug = cache(fetchVendorBySlug);

const fetchVendorById = unstable_cache(
  async (id: string): Promise<Vendor | null> => {
    const v = isUuid(id)
      ? await tryDb(() => prisma!.vendor.findUnique({ where: { id } }), null)
      : null;
    if (v) return prismaVendorToView(v);
    return mockById(id) ?? null;
  },
  ["vendors:by-id"],
  { revalidate: 300, tags: ["vendors"] },
);

export const getVendorById = cache(fetchVendorById);

// Owner-scoped: skip unstable_cache (user-specific) but keep React.cache()
// so a single render deduplicates repeated lookups.
export const getVendorByUserId = cache(
  async (userId: string): Promise<Vendor | null> => {
    const v = await tryDb(
      () => prisma!.vendor.findUnique({ where: { userId } }),
      null,
    );
    if (v) return prismaVendorToView(v);
    return null;
  },
);
