import { NextResponse } from "next/server";
import { listVendors } from "@/lib/data/vendors";
import { listActiveFlashSales } from "@/lib/data/flash-sales";
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

  const [vendors, active] = await Promise.all([
    listVendors(),
    listActiveFlashSales(),
  ]);
  const liveIds = new Set(active.map((fs) => fs.vendorId));

  // Compute distance once per vendor; reuse across filter/map.
  const origin = { lat, lng };
  const shops = vendors
    .map((v) => ({
      vendor: v,
      distance: haversineMeters(origin, { lat: v.latitude, lng: v.longitude }),
    }))
    .filter(({ vendor, distance }) => {
      if (distance > radius) return false;
      if (category && vendor.category !== category) return false;
      if (only === "flash-sale" && !liveIds.has(vendor.id)) return false;
      return true;
    });

  return NextResponse.json(
    {
      data: shops.map(({ vendor, distance }) => ({
        ...vendor,
        hasActiveFlashSale: liveIds.has(vendor.id),
        distance,
      })),
      meta: { total: shops.length, radius, center: origin },
    },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
