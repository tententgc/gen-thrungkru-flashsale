import { NextResponse } from "next/server";
import { FLASH_SALES, VENDORS, productById } from "@/lib/mock-data";
import { haversineMeters, MARKET_CENTER } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const near = url.searchParams.get("near");
  const radius = Number(url.searchParams.get("radius") ?? 2000);

  let origin = MARKET_CENTER;
  if (near) {
    const [lat, lng] = near.split(",").map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng)) origin = { lat, lng };
  }

  let sales = [...FLASH_SALES];
  if (status) sales = sales.filter((s) => s.status === status.toUpperCase());

  const enriched = sales
    .map((s) => {
      const vendor = VENDORS.find((v) => v.id === s.vendorId);
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
        items: s.items.map((it) => ({ ...it, product: productById(it.productId) })),
      };
    })
    .filter(
      (s): s is NonNullable<typeof s> =>
        s !== null && (near ? s.distance <= radius : true),
    )
    .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());

  return NextResponse.json({ data: enriched, meta: { total: enriched.length } });
}
