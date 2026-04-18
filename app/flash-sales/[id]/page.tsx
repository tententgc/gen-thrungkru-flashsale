import Link from "next/link";
import { notFound } from "next/navigation";
import { getFlashSaleById, listActiveFlashSales } from "@/lib/data/flash-sales";
import { getProductById } from "@/lib/data/products";
import { getVendorById } from "@/lib/data/vendors";
import { Countdown } from "@/components/flash-sale/countdown";
import { formatTHB, percentOff, formatTimeTH, formatDateTH } from "@/lib/utils";
import { categoryMeta } from "@/lib/categories";
import { PinIcon, PhoneIcon, ShareIcon, StarIcon } from "@/components/icons";
import { FlashSaleCard } from "@/components/flash-sale/flash-sale-card";

export default async function FlashSaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await getFlashSaleById(id);
  if (!sale) notFound();
  const vendor = await getVendorById(sale.vendorId);
  if (!vendor) notFound();
  const cat = categoryMeta(vendor.category);
  const others = (await listActiveFlashSales())
    .filter((f) => f.id !== sale.id)
    .slice(0, 3);
  const productMap = new Map(
    (await Promise.all(sale.items.map((it) => getProductById(it.productId))))
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map((p) => [p.id, p]),
  );

  return (
    <div className="container-page py-4 md:py-8 space-y-6">
      <nav className="text-sm text-muted">
        <Link href="/flash-sales" className="hover:text-ink">
          Flash Sale
        </Link>
        <span className="mx-2">/</span>
        <span>{sale.title}</span>
      </nav>

      <header
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-card"
        style={{
          background: `linear-gradient(135deg, ${cat.color}30 0%, ${cat.color}0a 100%)`,
        }}
      >
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-flash">⚡ FLASH SALE</span>
              <span className="chip" style={{ borderColor: `${cat.color}50` }}>
                {cat.emoji} {cat.label}
              </span>
              <span
                className={`chip ${
                  sale.status === "ACTIVE"
                    ? "chip-active"
                    : sale.status === "SCHEDULED"
                      ? "bg-secondary/30"
                      : "bg-border"
                }`}
              >
                {sale.status === "ACTIVE"
                  ? "กำลังลดราคา"
                  : sale.status === "SCHEDULED"
                    ? "รอเริ่ม"
                    : "จบแล้ว"}
              </span>
            </div>
            <h1 className="heading-hero">{sale.title}</h1>
            <p className="text-sm md:text-base text-muted">{sale.description}</p>
          </div>
          <div className="space-y-2">
            <Countdown endAt={sale.endAt} startAt={sale.startAt} />
            <div className="text-xs text-muted">
              {formatDateTH(sale.startAt)} · {formatTimeTH(sale.startAt)} – {formatTimeTH(sale.endAt)}
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 text-[200px] opacity-20">
          {vendor.logoEmoji}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="heading-section">สินค้าในโปรโมชั่น</h2>
          <ul className="space-y-3">
            {sale.items.map((item) => {
              const product = productMap.get(item.productId);
              if (!product) return null;
              const off = percentOff(product.regularPrice, item.salePrice);
              const soldRatio = item.stockLimit
                ? Math.min(1, item.stockSold / item.stockLimit)
                : 0;
              return (
                <li key={item.productId} className="card flex gap-4 p-4">
                  <div
                    className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl text-4xl"
                    style={{ background: `${cat.color}22` }}
                  >
                    {product.imageEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h3 className="font-bold">{product.name}</h3>
                      {off > 0 ? (
                        <span className="text-[11px] font-semibold text-flash">
                          -{off}%
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted line-clamp-2">{product.description}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-primary">
                        {formatTHB(item.salePrice)}
                      </span>
                      <span className="text-xs text-muted line-through">
                        {formatTHB(product.regularPrice)}
                      </span>
                    </div>
                    {item.stockLimit ? (
                      <div className="mt-2">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${soldRatio * 100}%` }}
                          />
                        </div>
                        <div className="mt-1 text-[11px] text-muted">
                          เหลือ {Math.max(0, item.stockLimit - item.stockSold)} ชิ้น จาก {item.stockLimit}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="card p-4 text-sm">
            <h3 className="font-semibold mb-2">กติกาของ Flash Sale</h3>
            <ul className="list-disc list-inside space-y-1 text-muted">
              <li>ราคาพิเศษใช้ได้เฉพาะภายในเวลา Flash Sale เท่านั้น</li>
              <li>จำกัดจำนวน stock ต่อ flash sale ตามที่ระบุ</li>
              <li>ชำระเงินที่ร้านด้วยเงินสด (ยังไม่รองรับจ่ายออนไลน์)</li>
              <li>เมื่อครบจำนวน stock ระบบจะปิด flash sale อัตโนมัติ</li>
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="grid h-14 w-14 place-items-center rounded-2xl text-3xl"
                style={{ background: `${cat.color}22` }}
              >
                {vendor.logoEmoji}
              </div>
              <div className="min-w-0">
                <div className="font-bold truncate">{vendor.shopName}</div>
                <div className="text-xs text-muted flex items-center gap-1">
                  <StarIcon className="h-3 w-3 text-secondary" />
                  {vendor.rating.toFixed(1)} · {vendor.reviewCount} รีวิว
                </div>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2 text-muted">
                <PinIcon className="h-4 w-4" /> {vendor.boothNumber}
              </div>
              <div className="flex items-center gap-2 text-muted">
                <PhoneIcon className="h-4 w-4" /> {vendor.phone}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/shops/${vendor.slug}`} className="btn-primary flex-1">
                ดูร้าน
              </Link>
              <a
                className="btn-outline"
                aria-label="แชร์"
                href={`sms:?body=Flash sale ที่ ${vendor.shopName} ${typeof window !== "undefined" ? window.location.href : ""}`}
              >
                <ShareIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="card p-4 space-y-2 text-sm">
            <div className="font-semibold">เปิดการแจ้งเตือนใช่ไหม?</div>
            <p className="text-xs text-muted">
              รับแจ้งเตือนเมื่อร้านนี้ปล่อย Flash Sale ใหม่ ใช้ได้แม้ไม่ได้เปิดแอป
            </p>
            <button className="btn-secondary w-full">🔔 เปิดแจ้งเตือนร้านนี้</button>
          </div>
        </aside>
      </section>

      {others.length > 0 ? (
        <section className="space-y-3">
          <h2 className="heading-section">Flash Sale อื่นที่กำลังลด</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((f) => (
              <FlashSaleCard key={f.id} sale={f} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
