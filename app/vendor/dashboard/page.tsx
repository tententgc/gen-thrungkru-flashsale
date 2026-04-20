import Link from "next/link";
import { requireVendor } from "@/lib/auth/vendor";
import { listProductsForVendor } from "@/lib/data/products";
import { listFlashSalesForVendor } from "@/lib/data/flash-sales";
import { getForecast } from "@/lib/data/crowd";
import { FlashSaleCard } from "@/components/flash-sale/flash-sale-card";
import { CrowdLineChart } from "@/components/crowd/crowd-line-chart";
import { BusyBadge } from "@/components/crowd/busy-badge";
import { formatTHB, formatTimeTH } from "@/lib/utils";
import { FlashIcon, PlusIcon, TrendingIcon } from "@/components/icons";

export const metadata = { title: "ภาพรวมร้านของฉัน" };

export default async function VendorDashboardPage() {
  const vendor = await requireVendor("/vendor/dashboard");
  const [products, sales, forecast] = await Promise.all([
    listProductsForVendor(vendor.id),
    listFlashSalesForVendor(vendor.id),
    getForecast(48),
  ]);
  const active = sales.filter((f) => f.status === "ACTIVE");

  // Sales figures come from the vendor's own flash sales — no shared demo
  // numbers. A brand-new account has nothing sold yet, so these show as 0.
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const salesToday = sales.filter((s) => {
    const end = new Date(s.endAt).getTime();
    return end >= todayStart.getTime() && s.status !== "CANCELLED";
  });
  const revenueTodayBaht = salesToday.reduce(
    (sum, s) =>
      sum + s.items.reduce((x, it) => x + it.stockSold * it.salePrice, 0),
    0,
  );
  const itemsSoldToday = salesToday.reduce(
    (sum, s) => sum + s.items.reduce((x, it) => x + it.stockSold, 0),
    0,
  );

  const tomorrow = forecast.slice(24, 48);
  const peakIdx = tomorrow.reduce(
    (best, p, i) => (p.count > tomorrow[best].count ? i : best),
    0,
  );
  const peakTomorrow = tomorrow[peakIdx]?.count ?? 0;
  const peakStart = tomorrow[peakIdx]?.time;
  const peakEnd = tomorrow[peakIdx + 1]?.time ?? peakStart;
  const peakWindow =
    peakStart && peakEnd
      ? `${formatTimeTH(peakStart)} – ${formatTimeTH(peakEnd)}`
      : "—";
  const nowLevel = forecast[0].level;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-hero">สวัสดี คุณ{vendor.shopName.replace(/^(ก๋วยเตี๋ยว)?/, "")}</h1>
          <p className="text-sm text-muted">สรุปร้านของคุณวันนี้</p>
        </div>
        <Link href="/vendor/flash-sales/new" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> สร้าง Flash Sale
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Kpi
          title="ยอดขายวันนี้"
          value={formatTHB(revenueTodayBaht)}
          trend={itemsSoldToday > 0 ? `${itemsSoldToday} ชิ้น` : "ยังไม่มียอดขาย"}
        />
        <Kpi
          title="สินค้าในร้าน"
          value={products.length.toString()}
          trend={products.length > 0 ? "พร้อมขาย" : "ยังไม่มีสินค้า"}
        />
        <Kpi
          title="ผู้ติดตาม"
          value={vendor.followerCount.toString()}
          trend={vendor.followerCount > 0 ? "คนกด follow" : "ยังไม่มีผู้ติดตาม"}
        />
        <Kpi
          title="Flash Sale ตอนนี้"
          value={active.length.toString()}
          trend={sales.length > 0 ? `${sales.length} ครั้งทั้งหมด` : "ยังไม่เคยสร้าง"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <TrendingIcon className="h-5 w-5 text-accent" /> Smart Scheduling
          </div>
          <p className="text-sm text-muted">
            AI แนะนำเวลาปล่อย flash sale ที่คาดว่าจะมีคนเห็นมากที่สุด
          </p>
          <div className="rounded-xl bg-accent/10 p-3 mt-2 space-y-1">
            <div className="text-xs text-muted">พรุ่งนี้พีค</div>
            <div className="font-mono text-2xl font-extrabold">{peakWindow}</div>
            <div className="text-xs text-muted">
              คาดว่า ~{peakTomorrow} คนจะอยู่ในตลาด
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted pt-2">
            ตอนนี้: <BusyBadge level={nowLevel} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <CrowdLineChart points={forecast.slice(0, 24)} />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="heading-section">
            <FlashIcon className="inline h-5 w-5 text-flash" /> Flash Sale ของร้าน
          </h2>
          <Link href="/vendor/flash-sales" className="text-sm text-primary font-semibold">
            ดูทั้งหมด →
          </Link>
        </div>
        {sales.length === 0 ? (
          <EmptyFlashSale />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sales.map((s) => (
              <FlashSaleCard key={s.id} sale={s} />
            ))}
          </div>
        )}
      </section>

      <section className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">สินค้าในร้าน ({products.length} รายการ)</h3>
            <p className="text-xs text-muted">อัปเดตราคา/รูปให้สดใหม่เสมอ</p>
          </div>
          <Link href="/vendor/products" className="btn-outline text-xs">
            จัดการสินค้า
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="card p-3 text-sm">
              <div className="grid h-20 place-items-center rounded-xl bg-primary-50 text-3xl">
                {p.imageEmoji}
              </div>
              <div className="mt-2 font-semibold line-clamp-1">{p.name}</div>
              <div className="text-primary font-bold">{formatTHB(p.regularPrice)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  title,
  value,
  trend,
}: {
  title: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{title}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs font-semibold text-muted">{trend}</div>
    </div>
  );
}

function EmptyFlashSale() {
  return (
    <div className="card grid place-items-center p-10 text-center">
      <div className="text-5xl">⚡</div>
      <div className="mt-3 font-semibold">ยังไม่มี Flash Sale</div>
      <p className="text-sm text-muted">
        ปล่อย Flash Sale เพื่อดึงลูกค้าจากรัศมี 1 กม. เข้าร้านคุณ
      </p>
      <Link href="/vendor/flash-sales/new" className="btn-primary mt-3">
        <PlusIcon className="h-4 w-4" /> สร้าง Flash Sale
      </Link>
    </div>
  );
}
