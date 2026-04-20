import { NextResponse } from "next/server";
import { listFlashSales } from "@/lib/data/flash-sales";
import { listVendors } from "@/lib/data/vendors";
import { listProductsByIds } from "@/lib/data/products";
import { haversineMeters, MARKET_CENTER } from "@/lib/geo";
import type { FlashSale } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const statusParam = url.searchParams.get("status");
  const near = url.searchParams.get("near");
  const radius = Number(url.searchParams.get("radius") ?? 2000);

  let origin = MARKET_CENTER;
  if (near) {
    const [lat, lng] = near.split(",").map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng)) origin = { lat, lng };
  }

  const status = statusParam
    ? (statusParam.toUpperCase() as FlashSale["status"])
    : undefined;

  // Parallelise sales + vendor lookups; then batch all product ids into a
  // single query (was N+1: one `getProductById` per item per sale).
  const [sales, vendors] = await Promise.all([
    listFlashSales({ status }),
    listVendors(),
  ]);

  const vendorMap = new Map(vendors.map((v) => [v.id, v]));
  const productIds = sales.flatMap((s) => s.items.map((it) => it.productId));
  const productMap = await listProductsByIds(productIds);

  const enriched = sales
    .map((s) => {
      const vendor = vendorMap.get(s.vendorId);
      if (!vendor) return null;
      const distance = haversineMeters(origin, {
        lat: vendor.latitude,
        lng: vendor.longitude,
      });
      return {
        ...s,
        vendor: {
          id: vendor.id,
          slug: vendor.slug,
          shopName: vendor.shopName,
          boothNumber: vendor.boothNumber,
          rating: vendor.rating,
          logoEmoji: vendor.logoEmoji,
          category: vendor.category,
        },
        distance,
        items: s.items.map((it) => ({
          ...it,
          product: productMap.get(it.productId) ?? null,
        })),
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .filter((s) => (near ? s.distance <= radius : true))
    .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());

  return NextResponse.json(
    { data: enriched, meta: { total: enriched.length } },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=15, stale-while-revalidate=60",
      },
    },
  );
}
