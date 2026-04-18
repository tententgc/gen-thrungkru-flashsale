"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ready } from "@/lib/env";

const productSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(400).optional(),
  regularPrice: z.coerce.number().positive().max(1_000_000),
  category: z.string().max(40).optional(),
  tags: z.array(z.string()).max(10).default([]),
  imageEmoji: z.string().min(1).max(4).default("🍴"),
  isAvailable: z.boolean().default(true),
});

async function getVendorForUser() {
  const user = await requireRole(["VENDOR", "ADMIN"]);
  if (!ready.db || !prisma) throw new Error("DB offline");
  const vendor = await prisma.vendor.findUnique({ where: { userId: user.id } });
  if (!vendor) throw new Error("ยังไม่มีร้าน — กรุณาตั้งค่าร้านก่อน");
  return { user, vendor };
}

export async function createProduct(input: unknown) {
  const { vendor } = await getVendorForUser();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message };
  const product = await prisma!.product.create({
    data: {
      vendorId: vendor.id,
      ...parsed.data,
    },
  });
  revalidatePath("/vendor/products");
  return { ok: true as const, product };
}

export async function updateProduct(id: string, input: unknown) {
  const { vendor } = await getVendorForUser();
  const parsed = productSchema.partial().safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message };
  const existing = await prisma!.product.findUnique({ where: { id } });
  if (!existing || existing.vendorId !== vendor.id) {
    return { ok: false as const, error: "not found" };
  }
  const product = await prisma!.product.update({ where: { id }, data: parsed.data });
  revalidatePath("/vendor/products");
  return { ok: true as const, product };
}

export async function deleteProduct(id: string) {
  const { vendor } = await getVendorForUser();
  const existing = await prisma!.product.findUnique({ where: { id } });
  if (!existing || existing.vendorId !== vendor.id) {
    return { ok: false as const, error: "not found" };
  }
  await prisma!.product.delete({ where: { id } });
  revalidatePath("/vendor/products");
  return { ok: true as const };
}
