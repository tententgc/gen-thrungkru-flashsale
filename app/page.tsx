import Link from "next/link";
import {
  VENDORS,
  activeFlashSales,
  generateWeeklyForecast,
  bestTimesOnDate,
} from "@/lib/mock-data";
import { FlashSaleCard } from "@/components/flash-sale/flash-sale-card";
import { ShopCard } from "@/components/shop/shop-card";
import { MarketMap } from "@/components/map/market-map";
import { CrowdLineChart } from "@/components/crowd/crowd-line-chart";
import { BusyBadge } from "@/components/crowd/busy-badge";
import { CATEGORIES } from "@/lib/categories";
import { formatTimeTH } from "@/lib/utils";
import { FlashIcon, ChevronIcon, TrendingIcon } from "@/components/icons";

export default function HomePage() {
  const sales = activeFlashSales().slice(0, 6);
  const shops = VENDORS.slice(0, 6);
  const forecast = generateWeeklyForecast();
  const next24 = forecast.slice(0, 24);
  const nowLevel = forecast[0]?.level ?? "MODERATE";
  const best = bestTimesOnDate(forecast, new Date(), 3);

  return (
    <div className="container-page space-y-10 py-4 md:py-8">
      <HeroSection nowLevel={nowLevel} />

      {/* Flash sale section */}
      <section>
        <SectionHeader
          icon={<FlashIcon className="h-5 w-5 text-flash" />}
          title="Flash Sale ตอนนี้"
          subtitle="ลดราคาจำกัดเวลา — รีบก่อนหมด"
          href="/flash-sales"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sales.map((sale) => (
            <FlashSaleCard key={sale.id} sale={sale} />
          ))}
        </div>
      </section>

      {/* Map section */}
      <section>
        <SectionHeader
          title="แผนที่ตลาดทุ่งครุ 61"
          subtitle="หมุดแสดงตำแหน่งร้านค้า — วงแหวนกะพริบ = มี flash sale"
          href="/map"
        />
        <MarketMap vendors={VENDORS} />
      </section>

      {/* Categories */}
      <section>
        <SectionHeader
          title="หมวดหมู่"
          subtitle="เลือกประเภทร้านที่สนใจ"
          href="/shops"
        />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-10">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/shops?category=${c.key}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3 transition-transform hover:-translate-y-0.5 hover:shadow-card"
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl text-2xl"
                style={{ background: `${c.color}22` }}
              >
                {c.emoji}
              </span>
              <span className="text-[11px] text-center text-muted line-clamp-2">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Crowd forecast */}
      <section>
        <SectionHeader
          icon={<TrendingIcon className="h-5 w-5 text-accent" />}
          title="ตอนนี้ตลาดเป็นยังไง?"
          subtitle="พยากรณ์ความหนาแน่นด้วย LightGBM (MAE < 20 คน/ชม.)"
          href="/crowd"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              ตอนนี้
            </div>
            <div className="mt-2 flex items-center gap-2">
              <BusyBadge level={nowLevel} size="lg" />
              <span className="text-xs text-muted">· {formatTimeTH(new Date())}</span>
            </div>
            <div className="mt-4 text-2xl font-extrabold">
              {forecast[0]?.count.toLocaleString("th-TH")} คน
            </div>
            <div className="text-xs text-muted">
              คาดว่าอยู่ในตลาดโดยประมาณในชั่วโมงนี้
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted">
                เวลาที่ดีที่สุดวันนี้
              </div>
              <ul className="mt-2 space-y-1.5">
                {best.map((b) => (
                  <li
                    key={b.time}
                    className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-1.5 text-sm"
                  >
                    <span className="font-mono font-semibold">
                      {formatTimeTH(b.time)}
                    </span>
                    <span className="text-xs text-muted">{b.count} คน</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-2">
            <CrowdLineChart points={next24} />
          </div>
        </div>
      </section>

      {/* Shops */}
      <section>
        <SectionHeader
          title="ร้านแนะนำ"
          subtitle="ร้านยอดนิยมและร้านใหม่ในตลาด"
          href="/shops"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shops.map((v) => (
            <ShopCard key={v.id} vendor={v} />
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroSection({ nowLevel }: { nowLevel: "VERY_QUIET" | "QUIET" | "MODERATE" | "BUSY" | "VERY_BUSY" | "PEAK" }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-100 via-secondary/30 to-background p-6 sm:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            ⚡ Real-time Flash Sale
          </span>
          <h1 className="heading-hero">
            ตลาดทุ่งครุ 61
            <br />
            <span className="text-primary">ไม่พลาดดีลเด็ด รู้ก่อนใกล้ตัว</span>
          </h1>
          <p className="text-sm text-muted sm:text-base">
            รวมร้านค้าในตลาด + แจ้งเตือน Flash Sale เมื่อคุณอยู่ในรัศมี 1 กม. พร้อมพยากรณ์ความหนาแน่นของคนในตลาดล่วงหน้า 7 วัน
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/flash-sales" className="btn-primary">
              ดู Flash Sale ⚡
            </Link>
            <Link href="/map" className="btn-outline">
              เปิดแผนที่
            </Link>
            <Link href="/vendor/onboarding" className="btn-ghost">
              ลงทะเบียนร้าน →
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-surface/70 p-4 backdrop-blur">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted">ตอนนี้ที่ตลาด</div>
            <div className="mt-1">
              <BusyBadge level={nowLevel} size="lg" />
            </div>
            <div className="mt-2 font-mono text-xs text-muted">
              อัปเดตสด ทุก 15 นาที
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  subtitle,
  href,
  icon,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="heading-section">{title}</h2>
        </div>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
          ดูทั้งหมด <ChevronIcon className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
