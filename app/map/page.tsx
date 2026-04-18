import { VENDORS, activeFlashSales } from "@/lib/mock-data";
import { MarketMap } from "@/components/map/market-map";
import { ShopCard } from "@/components/shop/shop-card";

export const metadata = { title: "แผนที่ตลาด" };

export default function MapPage() {
  const liveIds = new Set(activeFlashSales().map((fs) => fs.vendorId));
  const flashFirst = [...VENDORS].sort(
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

      <MarketMap vendors={VENDORS} height={560} />

      <section className="space-y-3">
        <h2 className="heading-section">ร้านในแผนที่ ({VENDORS.length} ร้าน)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {flashFirst.map((v) => (
            <ShopCard key={v.id} vendor={v} />
          ))}
        </div>
      </section>
    </div>
  );
}
