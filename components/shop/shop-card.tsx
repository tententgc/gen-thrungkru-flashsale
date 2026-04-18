import Link from "next/link";
import Image from "next/image";
import type { Vendor } from "@/lib/types";
import { categoryMeta } from "@/lib/categories";
import { StarIcon, PinIcon, ClockIcon } from "@/components/icons";
import { haversineMeters, formatDistance, MARKET_CENTER } from "@/lib/geo";
import { activeFlashSales as mockActiveFlashSales } from "@/lib/mock-data";

export function ShopCard({
  vendor,
  userLocation,
  liveSaleVendorIds,
}: {
  vendor: Vendor;
  userLocation?: { lat: number; lng: number };
  liveSaleVendorIds?: Set<string>;
}) {
  const cat = categoryMeta(vendor.category);
  const from = userLocation ?? MARKET_CENTER;
  const distance = haversineMeters(from, {
    lat: vendor.latitude,
    lng: vendor.longitude,
  });
  const hasLiveSale = liveSaleVendorIds
    ? liveSaleVendorIds.has(vendor.id)
    : mockActiveFlashSales().some((fs) => fs.vendorId === vendor.id);

  return (
    <Link
      href={`/shops/${vendor.slug}`}
      className="card group flex gap-3 overflow-hidden p-3 hover:shadow-pop"
    >
      <div
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
        style={{ background: `linear-gradient(135deg, ${cat.color}30, ${cat.color}10)` }}
      >
        {vendor.coverImageUrl ? (
          <Image
            src={vendor.coverImageUrl}
            alt={vendor.shopName}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-4xl">
            {vendor.logoEmoji}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold">{vendor.shopName}</h3>
          {vendor.isVerified ? (
            <span className="inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
              ✓ verified
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
          <span className="chip text-[11px]" style={{ borderColor: `${cat.color}40` }}>
            {cat.emoji} {cat.label}
          </span>
          <span className="inline-flex items-center gap-1">
            <PinIcon className="h-3 w-3" />
            {vendor.boothNumber}
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {vendor.openTime}–{vendor.closeTime}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-muted">{vendor.description}</p>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs">
            <StarIcon className="h-3.5 w-3.5 text-secondary" />
            <span className="font-semibold">{vendor.rating.toFixed(1)}</span>
            <span className="text-muted">({vendor.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-muted">{formatDistance(distance)}</span>
            {hasLiveSale ? (
              <span className="badge-flash animate-pulse-flash">Live</span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
