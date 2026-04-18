import Link from "next/link";
import { VENDORS, FLASH_SALES, generateWeeklyForecast } from "@/lib/mock-data";
import { CrowdLineChart } from "@/components/crowd/crowd-line-chart";
import { categoryMeta } from "@/lib/categories";
import { CheckIcon, ChartIcon } from "@/components/icons";

export const metadata = { title: "Admin Dashboard" };

export default function AdminPage() {
  const pendingVendors = VENDORS.filter((v) => !v.isVerified);
  const forecast = generateWeeklyForecast();
  const totalReviews = VENDORS.reduce((acc, v) => acc + v.reviewCount, 0);
  const activeFlashCount = FLASH_SALES.filter((f) => f.status === "ACTIVE").length;

  return (
    <div className="container-page py-4 md:py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="heading-hero">Admin Dashboard</h1>
          <p className="text-sm text-muted">ภาพรวมระบบตลาดทุ่งครุ 61</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/vendors" className="btn-outline">จัดการร้าน</Link>
          <Link href="/admin/events" className="btn-outline">Event Calendar</Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Kpi title="Monthly Active Users" value="2,487" trend="+14% WoW" />
        <Kpi title="Vendors" value={VENDORS.length.toString()} trend={`${pendingVendors.length} รอตรวจ`} />
        <Kpi title="Flash Sales ตอนนี้" value={activeFlashCount.toString()} trend="ตลอด 24 ชม." />
        <Kpi title="Reviews" value={totalReviews.toString()} trend="+132 สัปดาห์นี้" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CrowdLineChart points={forecast.slice(0, 24)} />
        </div>
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            <ChartIcon className="h-5 w-5 text-accent" /> Model Health
          </div>
          <ul className="text-sm space-y-2">
            <HealthRow label="Model version" value="lgb_20260418_03" />
            <HealthRow label="MAE (14d)" value="18.4 คน/ชม." ok />
            <HealthRow label="MAPE (14d)" value="21.3%" ok />
            <HealthRow label="Daily retrain" value="✓ success 2026-04-18 03:00" ok />
            <HealthRow label="Coverage (80%)" value="83.1%" ok />
            <HealthRow label="Drift detector" value="stable" ok />
          </ul>
          <button className="btn-outline w-full">Trigger Manual Retrain</button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="heading-section">ร้านที่รอการตรวจสอบ ({pendingVendors.length})</h2>
        {pendingVendors.length === 0 ? (
          <div className="card p-8 text-center text-sm text-muted">ไม่มีร้านค้ารออนุมัติ ✓</div>
        ) : (
          <ul className="space-y-2">
            {pendingVendors.map((v) => {
              const cat = categoryMeta(v.category);
              return (
                <li key={v.id} className="card flex items-center gap-3 p-3">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl text-2xl"
                    style={{ background: `${cat.color}22` }}
                  >
                    {v.logoEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{v.shopName}</div>
                    <div className="text-xs text-muted">
                      {cat.label} · {v.boothNumber} · {v.phone}
                    </div>
                  </div>
                  <button className="btn-primary text-xs">
                    <CheckIcon className="h-3 w-3" /> อนุมัติ
                  </button>
                  <button className="btn-outline text-xs">ปฏิเสธ</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold">Top หมวดหมู่ (ตามผู้ติดตาม)</h3>
          <ul className="text-sm space-y-2">
            {aggregateByCategory().map((row) => (
              <li key={row.category} className="flex items-center justify-between">
                <span className="chip">
                  {row.emoji} {row.label}
                </span>
                <span className="font-mono">{row.followers.toLocaleString("th-TH")}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-5 space-y-3">
          <h3 className="font-semibold">Notification Delivery (7 วัน)</h3>
          <ul className="text-sm space-y-2">
            <Row label="ส่งทั้งหมด" value="12,347" />
            <Row label="Delivered" value="11,810 (95.6%)" />
            <Row label="Clicked" value="1,864 (15.1%)" />
            <Row label="Opted out" value="37 (0.3%)" />
            <Row label="Email fallback" value="194" />
          </ul>
        </div>
      </section>
    </div>
  );
}

function Kpi({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs uppercase tracking-wider text-muted">{title}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-muted">{trend}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-mono font-semibold">{value}</span>
    </li>
  );
}

function HealthRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${ok ? "text-success font-semibold" : ""}`}>
        {ok ? "✓ " : ""}{value}
      </span>
    </li>
  );
}

function aggregateByCategory() {
  const map = new Map<string, number>();
  for (const v of VENDORS) {
    map.set(v.category, (map.get(v.category) ?? 0) + v.followerCount);
  }
  return [...map.entries()]
    .map(([k, followers]) => {
      const meta = categoryMeta(k as (typeof VENDORS)[number]["category"]);
      return { category: k, label: meta.label, emoji: meta.emoji, followers };
    })
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 6);
}
