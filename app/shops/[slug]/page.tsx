import Link from "next/link";
import { notFound } from "next/navigation";
import {
  vendorBySlug,
  productsOfVendor,
  flashSalesForVendor,
  VENDORS,
} from "@/lib/mock-data";
import { categoryMeta } from "@/lib/categories";
import { formatTHB } from "@/lib/utils";
import { MARKET_CENTER, haversineMeters, formatDistance } from "@/lib/geo";
import {
  StarIcon,
  PinIcon,
  PhoneIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon,
} from "@/components/icons";
import { FlashSaleCard } from "@/components/flash-sale/flash-sale-card";

export async function generateStaticParams() {
  return VENDORS.map((v) => ({ slug: v.slug }));
}

export default async function ShopDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vendor = vendorBySlug(slug);
  if (!vendor) notFound();
  const cat = categoryMeta(vendor.category);
  const products = productsOfVendor(vendor.id);
  const sales = flashSalesForVendor(vendor.id);
  const activeSales = sales.filter((f) => f.status === "ACTIVE" || f.status === "SCHEDULED");
  const distance = haversineMeters(MARKET_CENTER, {
    lat: vendor.latitude,
    lng: vendor.longitude,
  });

  return (
    <div className="container-page space-y-6 py-4 md:py-8">
      <nav className="text-sm text-muted">
        <Link href="/shops" className="hover:text-ink">ร้านค้า</Link>
        <span className="mx-2">/</span>
        <span>{vendor.shopName}</span>
      </nav>

      <header
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-card"
        style={{ background: `linear-gradient(135deg, ${cat.color}30 0%, ${cat.color}10 100%)` }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="grid h-20 w-20 md:h-24 md:w-24 place-items-center rounded-3xl text-5xl bg-surface shadow-sm"
            >
              {vendor.logoEmoji}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="heading-hero">{vendor.shopName}</h1>
                {vendor.isVerified ? (
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                    ✓ verified
                  </span>
                ) : null}
              </div>
              <p className="text-sm md:text-base text-muted mt-1 max-w-xl">
                {vendor.description}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span className="chip" style={{ borderColor: `${cat.color}40` }}>
                  {cat.emoji} {cat.label}
                </span>
                <span className="inline-flex items-center gap-1">
                  <StarIcon className="h-3.5 w-3.5 text-secondary" />
                  {vendor.rating.toFixed(1)} · {vendor.reviewCount} รีวิว
                </span>
                <span className="inline-flex items-center gap-1">
                  <PinIcon className="h-3.5 w-3.5" /> {vendor.boothNumber} · {formatDistance(distance)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="h-3.5 w-3.5" /> {vendor.openTime}–{vendor.closeTime}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary">
              <HeartIcon className="h-4 w-4" /> ติดตาม ({vendor.followerCount})
            </button>
            <a
              href={`tel:${vendor.phone.replace(/-/g, "")}`}
              className="btn-outline"
              aria-label="โทร"
            >
              <PhoneIcon className="h-4 w-4" />
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
              aria-label="ไปยังร้าน"
            >
              <PinIcon className="h-4 w-4" />
            </a>
            <button className="btn-outline" aria-label="แชร์">
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {activeSales.length > 0 ? (
        <section className="space-y-3">
          <h2 className="heading-section">Flash Sale ของร้าน</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeSales.map((f) => (
              <FlashSaleCard key={f.id} sale={f} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="heading-section">เมนู / สินค้า</h2>
        {products.length === 0 ? (
          <p className="text-muted text-sm">ร้านยังไม่มีเมนูในระบบ</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <article key={p.id} className="card p-3 flex flex-col gap-2">
                <div
                  className="grid h-28 place-items-center rounded-xl text-5xl"
                  style={{ background: `${cat.color}1f` }}
                >
                  {p.imageEmoji}
                </div>
                <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
                <p className="text-xs text-muted line-clamp-2">{p.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-primary">
                    {formatTHB(p.regularPrice)}
                  </span>
                  <button className="btn-ghost text-xs px-2 py-1">
                    <HeartIcon className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
