import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import { PRODUCTS, productById as mockById } from "@/lib/mock-data";
import { PRODUCT_IMAGES } from "@/lib/images";
import { isUuid } from "@/lib/utils";
import type { Product } from "@/lib/types";

function toView(row: any): Product {
  // Match DB row back to the curated mock image by name-based heuristic
  // until each row carries its own imageUrl in storage.
  const mockMatch = PRODUCTS.find((p) => p.name === row.name);
  const fallback = mockMatch ? PRODUCT_IMAGES[mockMatch.id] : undefined;
  return {
    id: row.id,
    vendorId: row.vendorId,
    name: row.name,
    description: row.description ?? "",
    imageEmoji: row.imageEmoji ?? "🍴",
    imageUrl: row.imageUrl || fallback,
    regularPrice: Number(row.regularPrice),
    category: row.category ?? "",
    isAvailable: row.isAvailable,
    tags: row.tags ?? [],
  };
}

async function tryDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!ready.db || !prisma) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

const fetchProductsForVendor = unstable_cache(
  async (vendorId: string): Promise<Product[]> => {
    const rows = isUuid(vendorId)
      ? await tryDb(
          () =>
            prisma!.product.findMany({
              where: { vendorId },
              orderBy: { createdAt: "asc" },
            }),
          [] as any[],
        )
      : ([] as any[]);
    if (rows.length > 0) return rows.map(toView);
    return PRODUCTS.filter((p) => p.vendorId === vendorId);
  },
  ["products:by-vendor"],
  { revalidate: 300, tags: ["products"] },
);

export const listProductsForVendor = cache(fetchProductsForVendor);

const fetchProductById = unstable_cache(
  async (id: string): Promise<Product | null> => {
    const row = isUuid(id)
      ? await tryDb(() => prisma!.product.findUnique({ where: { id } }), null)
      : null;
    if (row) return toView(row);
    return mockById(id) ?? null;
  },
  ["products:by-id"],
  { revalidate: 300, tags: ["products"] },
);

export const getProductById = cache(fetchProductById);

// Batch fetch for N+1 elimination — one DB round-trip per render regardless of
// how many products a caller needs. Returns a Map keyed by product id.
const fetchProductsByIds = unstable_cache(
  async (idsKey: string): Promise<Product[]> => {
    const ids = idsKey ? idsKey.split(",") : [];
    if (ids.length === 0) return [];
    const uuidIds = ids.filter(isUuid);
    const rows =
      uuidIds.length > 0
        ? await tryDb(
            () => prisma!.product.findMany({ where: { id: { in: uuidIds } } }),
            [] as any[],
          )
        : ([] as any[]);
    if (rows.length > 0) return rows.map(toView);
    return ids
      .map((id) => mockById(id))
      .filter((p): p is Product => p != null);
  },
  ["products:by-ids"],
  { revalidate: 300, tags: ["products"] },
);

export const listProductsByIds = cache(
  async (ids: readonly string[]): Promise<Map<string, Product>> => {
    const unique = Array.from(new Set(ids)).sort();
    const rows = await fetchProductsByIds(unique.join(","));
    return new Map(rows.map((p) => [p.id, p]));
  },
);
