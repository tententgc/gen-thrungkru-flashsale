import { env, ready } from "@/lib/env";
import type { Vendor } from "@/lib/types";
import { MarketMap } from "./market-map";
import { MapboxMap } from "./mapbox-map-lazy";
import { listActiveFlashSales } from "@/lib/data/flash-sales";

export async function MarketMapSwitcher({
  vendors,
  liveVendorIds,
  height = 480,
}: {
  vendors: Vendor[];
  liveVendorIds?: string[];
  height?: number;
}) {
  const ids = liveVendorIds ?? (await listActiveFlashSales()).map((s) => s.vendorId);
  if (!ready.mapbox) {
    return <MarketMap vendors={vendors} liveVendorIds={ids} height={height} />;
  }
  return (
    <MapboxMap
      vendors={vendors}
      liveSaleVendorIds={ids}
      token={env.mapboxToken}
      height={height}
    />
  );
}
