import { env, ready } from "@/lib/env";
import type { Vendor } from "@/lib/types";
import { MarketMap } from "./market-map";
import { MapboxMap } from "./mapbox-map";
import { listActiveFlashSales } from "@/lib/data/flash-sales";

export async function MarketMapSwitcher({
  vendors,
  height = 480,
}: {
  vendors: Vendor[];
  height?: number;
}) {
  if (!ready.mapbox) {
    return <MarketMap vendors={vendors} height={height} />;
  }
  const liveSales = await listActiveFlashSales();
  return (
    <MapboxMap
      vendors={vendors}
      liveSaleVendorIds={liveSales.map((s) => s.vendorId)}
      token={env.mapboxToken}
      height={height}
    />
  );
}
