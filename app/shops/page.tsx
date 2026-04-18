import Link from "next/link";
import { listVendors } from "@/lib/data/vendors";
import { listActiveFlashSales } from "@/lib/data/flash-sales";
import { ShopCard } from "@/components/shop/shop-card";
import { CATEGORIES } from "@/lib/categories";
import { FilterIcon } from "@/components/icons";

export const metadata = { title: "ร้านค้าทั้งหมด" };

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; only?: string }>;
}) {
  const { category, sort = "popular", only } = (await searchParams) ?? {};

  const [vendors, active] = await Promise.all([listVendors(), listActiveFlashSales()]);
  let shops = [...vendors];
  if (category) shops = shops.filter((v) => v.category === category);
  if (only === "flash-sale") {
    const liveIds = new Set(active.map((fs) => fs.vendorId));
    shops = shops.filter((v) => liveIds.has(v.id));
  }
  if (sort === "popular") shops.sort((a, b) => b.followerCount - a.followerCount);
  if (sort === "rating") shops.sort((a, b) => b.rating - a.rating);

  return (
    <div className="container-page space-y-6 py-4 md:py-8">
      <header>
        <h1 className="heading-hero">ร้านค้าในตลาด</h1>
        <p className="text-sm text-muted">
          {vendors.length} ร้าน · คัดสรรโดยทีมตลาดทุ่งครุ 61
        </p>
      </header>

      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FilterIcon className="h-4 w-4" /> ตัวกรอง
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
          <Link
            href={buildHref({ sort, only })}
            className={`chip ${!category ? "chip-active" : ""}`}
          >
            ทุกหมวด
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={buildHref({ category: c.key, sort, only })}
              className={`chip whitespace-nowrap ${category === c.key ? "chip-active" : ""}`}
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Link
            href={buildHref({ category, sort: "popular", only })}
            className={`chip ${sort === "popular" ? "chip-active" : ""}`}
          >
            ยอดนิยม
          </Link>
          <Link
            href={buildHref({ category, sort: "rating", only })}
            className={`chip ${sort === "rating" ? "chip-active" : ""}`}
          >
            คะแนนสูง
          </Link>
          <Link
            href={buildHref({ category, sort, only: only === "flash-sale" ? undefined : "flash-sale" })}
            className={`chip ${only === "flash-sale" ? "chip-active" : ""}`}
          >
            ⚡ กำลังลดราคา
          </Link>
        </div>
      </div>

      {shops.length === 0 ? (
        <div className="card grid place-items-center p-10 text-center">
          <div className="text-5xl">🏪</div>
          <div className="mt-3 font-semibold">ไม่พบร้านค้าในตัวกรองนี้</div>
          <Link href="/shops" className="btn-primary mt-4">ล้างตัวกรอง</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shops.map((v) => <ShopCard key={v.id} vendor={v} />)}
        </div>
      )}
    </div>
  );
}

function buildHref(p: { category?: string; sort?: string; only?: string }) {
  const qs = new URLSearchParams();
  if (p.category) qs.set("category", p.category);
  if (p.sort && p.sort !== "popular") qs.set("sort", p.sort);
  if (p.only) qs.set("only", p.only);
  const s = qs.toString();
  return `/shops${s ? `?${s}` : ""}`;
}
