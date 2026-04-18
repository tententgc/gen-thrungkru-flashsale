import { NextResponse } from "next/server";
import { VENDORS, activeFlashSales } from "@/lib/mock-data";
import { haversineMeters, MARKET_CENTER } from "@/lib/geo";
import type { ShopCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") as ShopCategory | null;
  const radius = Number(url.searchParams.get("radius") ?? 5000);
  const lat = Number(url.searchParams.get("lat") ?? MARKET_CENTER.lat);
  const lng = Number(url.searchParams.get("lng") ?? MARKET_CENTER.lng);
  const only = url.searchParams.get("only");

  const liveIds = new Set(activeFlashSales().map((fs) => fs.vendorId));

  let shops = VENDORS.filter((v) =>
    haversineMeters({ lat, lng }, { lat: v.latitude, lng: v.longitude }) <= radius,
  );
  if (category) shops = shops.filter((v) => v.category === category);
  if (only === "flash-sale") shops = shops.filter((v) => liveIds.has(v.id));

  return NextResponse.json({
    data: shops.map((v) => ({
      ...v,
      hasActiveFlashSale: liveIds.has(v.id),
      distance: haversineMeters(
        { lat, lng },
        { lat: v.latitude, lng: v.longitude },
      ),
    })),
    meta: { total: shops.length, radius, center: { lat, lng } },
  });
}
