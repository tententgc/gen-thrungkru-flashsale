import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { FlashSaleCard } from "@/components/flash-sale/flash-sale-card";
import type { FlashSale, Vendor } from "@/lib/types";

export const metadata = { title: "ฟีดของฉัน" };
export const dynamic = "force-dynamic";

function prismaVendorToView(v: any): Vendor {
  return {
    id: v.id,
    slug: v.slug,
    shopName: v.shopName,
    description: v.description ?? "",
    category: v.category,
    phone: v.phone,
    lineId: v.lineId ?? undefined,
    coverImageUrl: v.coverImageUrl ?? "",
    logoEmoji: v.logoEmoji ?? "🏪",
    latitude: v.latitude,
    longitude: v.longitude,
    boothNumber: v.boothNumber ?? "",
    openTime: v.openTime ?? "",
    closeTime: v.closeTime ?? "",
    openDays: v.openDays ?? [],
    isActive: v.isActive,
    isVerified: v.isVerified,
    rating: v.rating,
    reviewCount: v.reviewCount,
    followerCount: v.followerCount,
  };
}

function toFlashView(row: any): FlashSale {
  return {
    id: row.id,
    vendorId: row.vendorId,
    title: row.title,
    description: row.description ?? "",
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    status: row.status,
    items: row.items.map((it: any) => ({
      productId: it.productId,
      salePrice: Number(it.salePrice),
      stockLimit: it.stockLimit ?? undefined,
      stockSold: it.stockSold ?? 0,
    })),
  };
}

export default async function FeedPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="container-page py-10 text-center">
        <h1 className="heading-hero">ฟีดของคุณ</h1>
        <p className="text-muted mt-2">
          เข้าสู่ระบบเพื่อดูร้านที่คุณติดตาม
        </p>
        <Link href="/login" className="btn-primary mt-4">เข้าสู่ระบบ</Link>
      </div>
    );
  }

  if (!ready.db || !prisma) {
    return (
      <div className="container-page py-10 text-center text-muted">
        ฐานข้อมูลยังไม่พร้อม — กรอก DATABASE_URL เพื่อใช้งานฟีด
      </div>
    );
  }

  let sales: Array<{ sale: FlashSale; vendor: Vendor }> = [];
  try {
    const follows = await prisma.follow.findMany({
      where: { userId: user.id },
      select: { vendorId: true },
    });
    const vendorIds = follows.map((f) => f.vendorId);
    if (vendorIds.length > 0) {
      const rows = await prisma.flashSale.findMany({
        where: {
          vendorId: { in: vendorIds },
          status: { in: ["ACTIVE", "SCHEDULED"] },
        },
        orderBy: { startAt: "desc" },
        include: { vendor: true, items: true },
        take: 30,
      });
      sales = rows.map((r) => ({
        sale: toFlashView(r),
        vendor: prismaVendorToView(r.vendor),
      }));
    }
  } catch {
    // ignore — show empty feed
  }

  return (
    <div className="container-page py-4 md:py-8 space-y-6">
      <header>
        <h1 className="heading-hero">ฟีดของฉัน</h1>
        <p className="text-sm text-muted">
          อัปเดตจากร้านที่คุณติดตาม · รู้ก่อนใครเมื่อมี flash sale
        </p>
      </header>

      {sales.length === 0 ? (
        <div className="card grid place-items-center p-10 text-center">
          <div className="text-5xl">🔖</div>
          <div className="mt-3 font-semibold">ยังไม่ได้ติดตามร้านใด</div>
          <p className="text-sm text-muted">
            ไปหน้าร้านและกดติดตามเพื่อไม่พลาด flash sale
          </p>
          <Link href="/shops" className="btn-primary mt-4">
            ดูร้านทั้งหมด
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sales.map(({ sale, vendor }) => (
            <FlashSaleCard key={sale.id} sale={sale} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
