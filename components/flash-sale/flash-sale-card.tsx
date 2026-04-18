import Link from "next/link";
import { Countdown } from "./countdown";
import type { FlashSale, Vendor, Product } from "@/lib/types";
import { categoryMeta } from "@/lib/categories";
import { formatTHB, percentOff } from "@/lib/utils";
import { VENDORS, PRODUCTS } from "@/lib/mock-data";
import { PinIcon, StarIcon } from "@/components/icons";

export function FlashSaleCard({
  sale,
  vendor: vendorProp,
  product: productProp,
}: {
  sale: FlashSale;
  vendor?: Vendor;
  product?: Product;
}) {
  // Fallback to mock lookup when a parent didn't pre-resolve — keeps the card
  // usable in places that don't know vendor/product (search, notifications).
  const vendor = vendorProp ?? VENDORS.find((x) => x.id === sale.vendorId);
  if (!vendor) return null;
  const cat = categoryMeta(vendor.category);
  const firstItem = sale.items[0];
  const product =
    productProp ?? PRODUCTS.find((x) => x.id === firstItem.productId);

  const off = product ? percentOff(product.regularPrice, firstItem.salePrice) : 0;
  const soldRatio = firstItem.stockLimit
    ? Math.min(1, firstItem.stockSold / firstItem.stockLimit)
    : 0;

  return (
    <Link
      href={`/flash-sales/${sale.id}`}
      className="group card overflow-hidden flex flex-col hover:shadow-pop transition-shadow"
    >
      <div
        className="relative h-40 w-full overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${cat.color}30 0%, ${cat.color}10 100%)`,
        }}
      >
        <div className="absolute inset-0 grid place-items-center text-6xl opacity-90">
          {product?.imageEmoji ?? vendor.logoEmoji}
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="badge-flash">⚡ FLASH SALE</span>
          {off > 0 ? (
            <span className="inline-flex items-center rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-bold text-white">
              -{off}%
            </span>
          ) : null}
        </div>
        <div className="absolute right-3 top-3">
          <Countdown endAt={sale.endAt} startAt={sale.startAt} />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-bold text-base line-clamp-1">{sale.title}</h3>
        <p className="text-xs text-muted line-clamp-2">{sale.description}</p>

        {product ? (
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-primary-600">
              {formatTHB(firstItem.salePrice)}
            </span>
            <span className="text-xs text-muted line-through">
              {formatTHB(product.regularPrice)}
            </span>
          </div>
        ) : null}

        {firstItem.stockLimit ? (
          <div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary"
                style={{ width: `${soldRatio * 100}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] text-muted">
              ขายแล้ว {firstItem.stockSold}/{firstItem.stockLimit} ชิ้น
            </div>
          </div>
        ) : null}

        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-xs">
          <div className="flex items-center gap-1 text-muted">
            <PinIcon className="h-3.5 w-3.5" />
            <span>
              {vendor.boothNumber} · {vendor.shopName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-secondary-fg">
            <StarIcon className="h-3.5 w-3.5 text-secondary" />
            <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
