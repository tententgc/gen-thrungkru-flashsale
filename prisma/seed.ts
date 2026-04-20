/**
 * Seed the database from lib/mock-data. Run with:
 *   pnpm db:seed
 *
 * Idempotent: uses upsert by stable slug / id.
 */
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import {
  VENDORS,
  PRODUCTS,
  FLASH_SALES,
  DEMO_USERS,
} from "../lib/mock-data";
import { VENDOR_IMAGES, PRODUCT_IMAGES } from "../lib/images";

const prisma = new PrismaClient();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabaseAdmin =
  SUPABASE_URL && SERVICE_KEY
    ? createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

// Deterministic UUIDv5-ish derivation from a string so mock ids map cleanly.
function uuidFromKey(key: string): string {
  const hex = Buffer.from(key.padEnd(32, "x"))
    .toString("hex")
    .slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// Create the user in Supabase Auth (password-ready) and return its real UUID.
// Falls back to a derived UUID when Supabase isn't configured so local-only runs
// still seed Prisma rows. The returned id is what we store in the users table.
async function upsertAuthUser(opts: {
  email: string;
  password: string;
  displayName: string;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
}): Promise<string> {
  if (!supabaseAdmin) return uuidFromKey(`user:${opts.email}`);
  const meta = { displayName: opts.displayName, role: opts.role };
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
    user_metadata: meta,
  });
  if (created?.user?.id) {
    console.log(`  ✓ auth user created: ${opts.email}`);
    return created.user.id;
  }
  // Most common: "User already registered" — look up + reset password to the demo value.
  if (createErr && !/already|exists|registered/i.test(createErr.message)) {
    console.warn(`  ! auth create warn [${opts.email}]: ${createErr.message}`);
  }
  // Scan pages until we find the email. listUsers defaults to 50/page.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) break;
    const match = data.users.find((u) => u.email?.toLowerCase() === opts.email.toLowerCase());
    if (match) {
      await supabaseAdmin.auth.admin.updateUserById(match.id, {
        password: opts.password,
        user_metadata: { ...(match.user_metadata ?? {}), ...meta },
        email_confirm: true,
      });
      console.log(`  ↻ auth user synced: ${opts.email}`);
      return match.id;
    }
    if (data.users.length < 200) break;
  }
  // Last resort — derived id, logins via Supabase won't work for this user.
  return uuidFromKey(`user:${opts.email}`);
}

async function main() {
  console.log("🌱 seeding ThungKhru61...");
  if (!supabaseAdmin) {
    console.warn(
      "  ⚠ SUPABASE_SERVICE_ROLE_KEY not set — demo login won't work until you rerun with the key",
    );
  }

  // Demo users — create in Supabase Auth so password login works.
  const userIds = new Map<string, string>();
  // DEMO_USERS may pre-claim a vendor (`vendorId: "v-01"`). We build the
  // claim map first so the vendor loop below uses the demo VENDOR account
  // as the shop owner instead of spinning up a parallel `<slug>@thungkhru.th`
  // account that nobody can log into.
  const claimedVendorOwner = new Map<string, string>();
  for (const u of DEMO_USERS) {
    const id = await upsertAuthUser({
      email: u.email,
      password: u.password,
      displayName: u.name,
      role: u.role,
    });
    await prisma.user.upsert({
      where: { email: u.email },
      update: { id, displayName: u.name, role: u.role },
      create: { id, email: u.email, displayName: u.name, role: u.role },
    });
    userIds.set(u.email, id);
    if ("vendorId" in u && typeof u.vendorId === "string") {
      claimedVendorOwner.set(u.vendorId, id);
    }
  }

  // Vendor owners — for each shop, prefer a pre-claim from DEMO_USERS so the
  // demo VENDOR login lands on a real dashboard. Fall back to a per-shop
  // auth account (<slug>@thungkhru.th, password demo1234) for the rest.
  const vendorOwnerId = new Map<string, string>();
  for (const v of VENDORS) {
    const claimed = claimedVendorOwner.get(v.id);
    if (claimed) {
      vendorOwnerId.set(v.id, claimed);
      continue;
    }
    const ownerEmail = `${v.slug}@thungkhru.th`;
    const id = await upsertAuthUser({
      email: ownerEmail,
      password: "demo1234",
      displayName: v.shopName,
      role: "VENDOR",
    });
    await prisma.user.upsert({
      where: { email: ownerEmail },
      update: { id, displayName: v.shopName, role: "VENDOR" },
      create: { id, email: ownerEmail, displayName: v.shopName, role: "VENDOR" },
    });
    vendorOwnerId.set(v.id, id);
  }

  // Vendors
  const vendorIdMap = new Map<string, string>();
  for (const v of VENDORS) {
    const id = uuidFromKey(`vendor:${v.id}`);
    vendorIdMap.set(v.id, id);
    const imgs = VENDOR_IMAGES[v.slug];
    await prisma.vendor.upsert({
      where: { slug: v.slug },
      update: {
        // Re-link ownership on every seed run so a DEMO_USERS pre-claim
        // (e.g. vendor@thungkhru.th → "v-01") wins even if a previous run
        // already created the row pointing at the per-slug fallback account.
        userId: vendorOwnerId.get(v.id)!,
        shopName: v.shopName,
        description: v.description,
        category: v.category,
        phone: v.phone,
        lineId: v.lineId ?? null,
        logoEmoji: v.logoEmoji,
        logoUrl: imgs?.logo ?? null,
        coverImageUrl: imgs?.cover ?? null,
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
        logoUrl: imgs?.logo ?? null,
        coverImageUrl: imgs?.cover ?? null,
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
    const imageUrl = PRODUCT_IMAGES[p.id] ?? null;
    await prisma.product.upsert({
      where: { id },
      update: {
        name: p.name,
        description: p.description,
        imageEmoji: p.imageEmoji,
        imageUrl,
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
        imageUrl,
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

  // Realistic notifications for the CUSTOMER demo account so the bell isn't empty.
  const customerId = userIds.get("student@kmutt.ac.th");
  if (customerId) {
    await prisma.notificationLog.deleteMany({ where: { userId: customerId } });
    const activeSales = FLASH_SALES.filter((s) => s.status === "ACTIVE").slice(0, 3);
    for (let i = 0; i < activeSales.length; i++) {
      const s = activeSales[i];
      const vendor = VENDORS.find((v) => v.id === s.vendorId);
      const flashId = uuidFromKey(`flash:${s.id}`);
      await prisma.notificationLog.create({
        data: {
          userId: customerId,
          type: "FLASH_SALE",
          title: `⚡ ${vendor?.shopName ?? "ร้านในตลาด"} ปล่อย Flash Sale!`,
          body: s.title,
          payload: { url: `/flash-sales/${flashId}` },
          sentAt: new Date(Date.now() - (i + 1) * 900_000),
          readAt: i >= 2 ? new Date() : null,
        },
      });
    }
    await prisma.notificationLog.create({
      data: {
        userId: customerId,
        type: "CROWD_ALERT",
        title: "ตลาดเริ่มคนน้อยแล้ว",
        body: "ตอนนี้เหมาะไปทานข้าวแบบไม่ต้องรอคิว",
        payload: { url: "/crowd" },
        sentAt: new Date(Date.now() - 45 * 60_000),
        readAt: new Date(),
      },
    });
    await prisma.notificationLog.create({
      data: {
        userId: customerId,
        type: "CROWD_ALERT",
        title: "พรุ่งนี้คาดว่าคนเยอะมาก",
        body: "แนะนำไปก่อน 17:00 หรือหลัง 20:30",
        payload: { url: "/crowd" },
        sentAt: new Date(Date.now() - 2 * 3_600_000),
        readAt: new Date(),
      },
    });
  }

  console.log("✓ seed complete");
  console.log(
    `  vendors=${VENDORS.length} products=${PRODUCTS.length} flash_sales=${FLASH_SALES.length}`,
  );
  console.log("\n🔑 demo login (Supabase Auth):");
  for (const u of DEMO_USERS) {
    console.log(`  ${u.role.padEnd(9)} ${u.email}  / ${u.password}`);
  }
}

main()
  .catch((err) => {
    console.error("seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
