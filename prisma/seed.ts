/**
 * Seed the database from lib/mock-data. Run with:
 *   pnpm db:seed
 *
 * Idempotent: uses upsert by stable slug / id.
 */
import { PrismaClient } from "@prisma/client";
import {
  VENDORS,
  PRODUCTS,
  FLASH_SALES,
  DEMO_USERS,
} from "../lib/mock-data";

const prisma = new PrismaClient();

// Deterministic UUIDv5-ish derivation from a string so mock ids map cleanly.
function uuidFromKey(key: string): string {
  const hex = Buffer.from(key.padEnd(32, "x"))
    .toString("hex")
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

async function main() {
  console.log("🌱 seeding ThungKhru61...");

  // Users (one per DEMO_USERS entry + one per vendor to own the shop)
  const userIds = new Map<string, string>();
  for (const u of DEMO_USERS) {
    const id = uuidFromKey(`user:${u.email}`);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { displayName: u.name, role: u.role },
      create: {
        id,
        email: u.email,
        displayName: u.name,
        role: u.role,
      },
    });
    userIds.set(u.email, id);
  }

  // For each mocked vendor, ensure an owning user exists.
  const vendorOwnerId = new Map<string, string>();
  for (const v of VENDORS) {
    const ownerEmail = `${v.slug}@thungkhru.th`;
    const id = uuidFromKey(`user:${ownerEmail}`);
    await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: {
        id,
        email: ownerEmail,
        displayName: v.shopName,
        role: "VENDOR",
      },
    });
    vendorOwnerId.set(v.id, id);
  }

  // Vendors
  const vendorIdMap = new Map<string, string>();
  for (const v of VENDORS) {
    const id = uuidFromKey(`vendor:${v.id}`);
    vendorIdMap.set(v.id, id);
    await prisma.vendor.upsert({
      where: { slug: v.slug },
      update: {
        shopName: v.shopName,
        description: v.description,
        category: v.category,
        phone: v.phone,
        lineId: v.lineId ?? null,
        logoEmoji: v.logoEmoji,
        latitude: v.latitude,
        longitude: v.longitude,
        boothNumber: v.boothNumber,
        openTime: v.openTime,
        closeTime: v.closeTime,
        openDays: v.openDays,
        isActive: v.isActive,
        isVerified: v.isVerified,
        rating: v.rating,
        reviewCount: v.reviewCount,
        followerCount: v.followerCount,
      },
      create: {
        id,
        slug: v.slug,
        userId: vendorOwnerId.get(v.id)!,
        shopName: v.shopName,
        description: v.description,
        category: v.category,
        phone: v.phone,
        lineId: v.lineId ?? null,
        logoEmoji: v.logoEmoji,
        latitude: v.latitude,
        longitude: v.longitude,
        boothNumber: v.boothNumber,
        openTime: v.openTime,
        closeTime: v.closeTime,
        openDays: v.openDays,
        isActive: v.isActive,
        isVerified: v.isVerified,
        rating: v.rating,
        reviewCount: v.reviewCount,
        followerCount: v.followerCount,
      },
    });
  }

  // Products
  const productIdMap = new Map<string, string>();
  for (const p of PRODUCTS) {
    const id = uuidFromKey(`product:${p.id}`);
    productIdMap.set(p.id, id);
    const vendorId = vendorIdMap.get(p.vendorId);
    if (!vendorId) continue;
    await prisma.product.upsert({
      where: { id },
      update: {
        name: p.name,
        description: p.description,
        imageEmoji: p.imageEmoji,
        regularPrice: p.regularPrice,
        category: p.category,
        isAvailable: p.isAvailable,
        tags: p.tags,
      },
      create: {
        id,
        vendorId,
        name: p.name,
        description: p.description,
        imageEmoji: p.imageEmoji,
        regularPrice: p.regularPrice,
        category: p.category,
        isAvailable: p.isAvailable,
        tags: p.tags,
      },
    });
  }

  // Flash sales
  for (const fs of FLASH_SALES) {
    const fsId = uuidFromKey(`flash:${fs.id}`);
    const vendorId = vendorIdMap.get(fs.vendorId);
    if (!vendorId) continue;
    await prisma.flashSale.upsert({
      where: { id: fsId },
      update: {
        title: fs.title,
        description: fs.description,
        startAt: new Date(fs.startAt),
        endAt: new Date(fs.endAt),
        status: fs.status,
      },
      create: {
        id: fsId,
        vendorId,
        title: fs.title,
        description: fs.description,
        startAt: new Date(fs.startAt),
        endAt: new Date(fs.endAt),
        status: fs.status,
      },
    });
    await prisma.flashSaleItem.deleteMany({ where: { flashSaleId: fsId } });
    for (const it of fs.items) {
      const productId = productIdMap.get(it.productId);
      if (!productId) continue;
      await prisma.flashSaleItem.create({
        data: {
          flashSaleId: fsId,
          productId,
          salePrice: it.salePrice,
          stockLimit: it.stockLimit ?? null,
          stockSold: it.stockSold,
        },
      });
    }
  }

  console.log("✓ seed complete");
  console.log(
    `  vendors=${VENDORS.length} products=${PRODUCTS.length} flash_sales=${FLASH_SALES.length}`,
  );
}

main()
  .catch((err) => {
    console.error("seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
