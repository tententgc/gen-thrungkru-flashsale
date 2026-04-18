import { listVendors } from "@/lib/data/vendors";
import { listActiveFlashSales } from "@/lib/data/flash-sales";
import { MarketMapSwitcher as MarketMap } from "@/components/map/market-map-switcher";
import { ShopCard } from "@/components/shop/shop-card";

export const metadata = { title: "แผนที่ตลาด" };

export default async function MapPage() {
  const [vendors, active] = await Promise.all([listVendors(), listActiveFlashSales()]);
  const liveIds = new Set(active.map((fs) => fs.vendorId));
  const flashFirst = [...vendors].sort(
    (a, b) => Number(liveIds.has(b.id)) - Number(liveIds.has(a.id)),
  );

  return (
    <div className="container-page space-y-6 py-4 md:py-8">
      <header>
        <h1 className="heading-hero">แผนที่ตลาดทุ่งครุ 61</h1>
        <p className="text-sm text-muted">
          แตะหมุดเพื่อดูรายละเอียดร้าน — วงแหวนกะพริบหมายถึงร้านนั้นกำลังมี Flash Sale
        </p>
      </header>

      <MarketMap vendors={vendors} height={560} />

      <section className="space-y-3">
        <h2 className="heading-section">ร้านในแผนที่ ({vendors.length} ร้าน)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {flashFirst.map((v) => (
            <ShopCard key={v.id} vendor={v} />
          ))}
        </div>
      </section>
    </div>
  );
}
