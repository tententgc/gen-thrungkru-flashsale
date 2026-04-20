"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ready } from "@/lib/env";

const itemSchema = z.object({
  productId: z.string().uuid(),
  salePrice: z.coerce.number().positive(),
  stockLimit: z.coerce.number().int().positive().nullable().default(null),
});

const flashSaleSchema = z
  .object({
    title: z.string().min(3).max(80),
    description: z.string().max(280).optional(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    items: z.array(itemSchema).min(1, "เลือกสินค้าอย่างน้อย 1 รายการ"),
  })
  .superRefine((val, ctx) => {
    const diffMin = (val.endAt.getTime() - val.startAt.getTime()) / 60_000;
    if (diffMin < 15) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "ระยะเวลาต้อง ≥ 15 นาที",
      });
    }
    if (diffMin > 360) {
      ctx.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "ระยะเวลาต้อง ≤ 6 ชั่วโมง",
      });
    }
  });

type VendorCtx = Awaited<ReturnType<NonNullable<typeof prisma>["vendor"]["findUnique"]>>;
type VendorResult =
  | { ok: true; user: Awaited<ReturnType<typeof requireRole>>; vendor: NonNullable<VendorCtx> }
  | { ok: false; error: string };

// Resolve the signed-in vendor for a server action. Returns a Result instead
// of throwing so callers surface a friendly form error instead of a 500.
async function getVendorForUser(): Promise<VendorResult> {
  try {
    const user = await requireRole(["VENDOR", "ADMIN"]);
    if (!ready.db || !prisma) return { ok: false, error: "ฐานข้อมูลยังไม่พร้อม ลองใหม่อีกครั้ง" };
    const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
    if (!vendor) {
      return {
        ok: false,
        error: "ยังไม่ได้ลงทะเบียนร้าน — ไปที่ /vendor/onboarding เพื่อสร้างร้านก่อน",
      };
    }
    return { ok: true, user, vendor };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "ไม่ได้รับอนุญาต" };
  }
}

export async function createFlashSale(input: unknown) {
  const ctx = await getVendorForUser();
  if (!ctx.ok) return { ok: false as const, error: ctx.error };
  const { vendor } = ctx;
  const parsed = flashSaleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  // No overlapping flash sales for same vendor
  const overlapping = await prisma!.flashSale.findFirst({
    where: {
      vendorId: vendor.id,
      status: { in: ["SCHEDULED", "ACTIVE"] },
      OR: [
        { startAt: { lte: data.endAt }, endAt: { gte: data.startAt } },
      ],
    },
  });
  if (overlapping) {
    return { ok: false as const, error: "มี flash sale ซ้อนเวลากันอยู่" };
  }

  // Ensure every discount is ≥ 10%
  const productIds = data.items.map((i) => i.productId);
  const products = await prisma!.product.findMany({
    where: { id: { in: productIds }, vendorId: vendor.id },
  });
  if (products.length !== productIds.length) {
    return { ok: false as const, error: "สินค้าบางรายการไม่ใช่ของร้านคุณ" };
  }
  for (const it of data.items) {
    const p = products.find((pp) => pp.id === it.productId)!;
    if (Number(p.regularPrice) * 0.9 < it.salePrice) {
      return {
        ok: false as const,
        error: `ราคาลดต้อง ≤ ${(Number(p.regularPrice) * 0.9).toFixed(0)} บาท สำหรับ ${p.name}`,
      };
    }
  }

  const status = data.startAt <= new Date() ? "ACTIVE" : "SCHEDULED";
  const fs = await prisma!.flashSale.create({
    data: {
      vendorId: vendor.id,
      title: data.title,
      description: data.description,
      startAt: data.startAt,
      endAt: data.endAt,
      status,
      items: {
        create: data.items.map((it) => ({
          productId: it.productId,
          salePrice: it.salePrice,
          stockLimit: it.stockLimit ?? null,
        })),
      },
    },
    include: { items: true },
  });

  revalidatePath("/vendor/flash-sales");
  revalidatePath("/flash-sales");
  revalidatePath("/");
  return { ok: true as const, flashSale: fs };
}

export async function cancelFlashSale(id: string) {
  const ctx = await getVendorForUser();
  if (!ctx.ok) return { ok: false as const, error: ctx.error };
  const { vendor } = ctx;
  const existing = await prisma!.flashSale.findUnique({ where: { id } });
  if (!existing || existing.vendorId !== vendor.id) {
    return { ok: false as const, error: "not found" };
  }
  await prisma!.flashSale.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/vendor/flash-sales");
  revalidatePath("/flash-sales");
  return { ok: true as const };
}
