import { FLASH_SALES, VENDORS } from "@/lib/mock-data";
import { FlashSaleCard } from "@/components/flash-sale/flash-sale-card";
import { categoryMeta, CATEGORIES } from "@/lib/categories";
import Link from "next/link";
import { FilterIcon } from "@/components/icons";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Flash Sale ที่ใช้งานอยู่",
};

type SearchParams = {
  status?: string;
  category?: string;
  sort?: string;
};

export default async function FlashSalesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const { status = "all", category, sort = "ending-soon" } = params;

  let sales = [...FLASH_SALES];
  if (status === "active") sales = sales.filter((s) => s.status === "ACTIVE");
  if (status === "scheduled") sales = sales.filter((s) => s.status === "SCHEDULED");
  if (status === "ended") sales = sales.filter((s) => s.status === "ENDED");

  if (category) {
    const vendorIds = new Set(
      VENDORS.filter((v) => v.category === category).map((v) => v.id),
    );
    sales = sales.filter((s) => vendorIds.has(s.vendorId));
  }

  if (sort === "ending-soon") {
    sales.sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());
  }

  if (!sales && !category) notFound();

  const statuses = [
    { k: "all", label: "ทั้งหมด" },
    { k: "active", label: "กำลังลด ⚡" },
    { k: "scheduled", label: "กำลังจะเริ่ม" },
    { k: "ended", label: "จบแล้ว" },
  ];

  return (
    <div className="container-page space-y-6 py-4 md:py-8">
      <header className="flex flex-col gap-2">
        <h1 className="heading-hero">Flash Sale ทั้งหมด</h1>
        <p className="text-sm text-muted">
          ราคาพิเศษจำกัดเวลา — ดูเวลาที่เหลือและจำนวน stock ที่เหลือก่อนรีบไป
        </p>
      </header>

      <div className="card flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FilterIcon className="h-4 w-4" />
          ตัวกรอง
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <Link
              key={s.k}
              href={
                s.k === "all"
                  ? buildHref({ category, sort })
                  : buildHref({ status: s.k, category, sort })
              }
              className={`chip ${status === s.k || (s.k === "all" && status === "all") ? "chip-active" : ""}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Link
            href={buildHref({ status, sort })}
            className={`chip ${!category ? "chip-active" : ""}`}
          >
            ทุกหมวด
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={buildHref({ status, category: c.key, sort })}
              className={`chip whitespace-nowrap ${category === c.key ? "chip-active" : ""}`}
            >
              {c.emoji} {c.label}
            </Link>
          ))}
        </div>
      </div>

      {sales.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sales.map((sale) => (
            <FlashSaleCard key={sale.id} sale={sale} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildHref(p: SearchParams) {
  const qs = new URLSearchParams();
  if (p.status && p.status !== "all") qs.set("status", p.status);
  if (p.category) qs.set("category", p.category);
  if (p.sort) qs.set("sort", p.sort);
  const query = qs.toString();
  return `/flash-sales${query ? `?${query}` : ""}`;
}

function EmptyState() {
  return (
    <div className="card grid place-items-center p-10 text-center">
      <div className="text-5xl">🛒</div>
      <div className="mt-3 font-semibold">ยังไม่มี Flash Sale ในตัวกรองนี้</div>
      <div className="text-sm text-muted">
        ลองปรับตัวกรอง หรือกลับมาดูใหม่ในภายหลัง
      </div>
      <Link href="/flash-sales" className="btn-primary mt-4">
        ล้างตัวกรอง
      </Link>
    </div>
  );
}
