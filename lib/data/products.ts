import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import { PRODUCTS, productById as mockById } from "@/lib/mock-data";
import { PRODUCT_IMAGES } from "@/lib/images";
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

export async function listProductsForVendor(vendorId: string): Promise<Product[]> {
  const rows = await tryDb(
    () =>
      prisma!.product.findMany({
        where: { vendorId },
        orderBy: { createdAt: "asc" },
      }),
    [] as any[],
  );
  if (rows.length > 0) return rows.map(toView);
  return PRODUCTS.filter((p) => p.vendorId === vendorId);
}

export async function getProductById(id: string): Promise<Product | null> {
  const row = await tryDb(
    () => prisma!.product.findUnique({ where: { id } }),
    null,
  );
  if (row) return toView(row);
  return mockById(id) ?? null;
}
