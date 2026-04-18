import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import { VENDORS, vendorBySlug as mockBySlug, vendorById as mockById } from "@/lib/mock-data";
import { VENDOR_IMAGES } from "@/lib/images";
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

export async function listVendors(): Promise<Vendor[]> {
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
}

export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  const v = await tryDb(
    () => prisma!.vendor.findUnique({ where: { slug } }),
    null,
  );
  if (v) return prismaVendorToView(v);
  return mockBySlug(slug) ?? null;
}

export async function getVendorById(id: string): Promise<Vendor | null> {
  const v = await tryDb(
    () => prisma!.vendor.findUnique({ where: { id } }),
    null,
  );
  if (v) return prismaVendorToView(v);
  return mockById(id) ?? null;
}

export async function getVendorByUserId(userId: string): Promise<Vendor | null> {
  const v = await tryDb(
    () => prisma!.vendor.findUnique({ where: { userId } }),
    null,
  );
  if (v) return prismaVendorToView(v);
  return null;
}
