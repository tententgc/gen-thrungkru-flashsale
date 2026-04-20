"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSupabaseServer } from "@/lib/supabase/server";
import { requireRole, requireSession } from "@/lib/auth/session";
import { ready } from "@/lib/env";

const shopSchema = z.object({
  shopName: z.string().min(2).max(60),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "slug ต้องเป็น a-z 0-9 และ - เท่านั้น"),
  description: z.string().max(500).optional(),
  category: z.enum([
    "FOOD_STREET",
    "FOOD_MAIN",
    "DRINKS",
    "DESSERTS",
    "FRUITS",
    "CLOTHES",
    "ACCESSORIES",
    "COSMETICS",
    "GROCERIES",
    "OTHER",
  ]),
  phone: z.string().min(9).max(15),
  lineId: z.string().optional(),
  logoEmoji: z.string().emoji().or(z.string().min(1).max(4)).default("🏪"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  boothNumber: z.string().optional(),
  openTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  openDays: z
    .array(z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]))
    .default([]),
});

export type ShopInput = z.infer<typeof shopSchema>;

export async function upsertVendor(input: Partial<ShopInput>) {
  const user = await requireRole(["VENDOR", "ADMIN"]);
  if (!ready.db || !prisma) {
    return { ok: false as const, error: "ฐานข้อมูลยังไม่ได้ตั้งค่า" };
  }
  const parsed = shopSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  await prisma.vendor.upsert({
    where: { userId: user.id },
    update: {
      shopName: data.shopName,
      slug: data.slug,
      description: data.description,
      category: data.category,
      phone: data.phone,
      lineId: data.lineId,
      logoEmoji: data.logoEmoji,
      latitude: data.latitude,
      longitude: data.longitude,
      boothNumber: data.boothNumber,
      openTime: data.openTime,
      closeTime: data.closeTime,
      openDays: data.openDays,
    },
    create: {
      userId: user.id,
      shopName: data.shopName,
      slug: data.slug,
      description: data.description,
      category: data.category,
      phone: data.phone,
      lineId: data.lineId,
      logoEmoji: data.logoEmoji,
      latitude: data.latitude,
      longitude: data.longitude,
      boothNumber: data.boothNumber,
      openTime: data.openTime,
      closeTime: data.closeTime,
      openDays: data.openDays,
    },
  });

  revalidatePath("/vendor/dashboard");
  revalidatePath("/shops");
  revalidatePath(`/shops/${data.slug}`);
  return { ok: true as const };
}

export async function toggleShopOpen() {
  const user = await requireRole(["VENDOR"]);
  if (!ready.db || !prisma) return { ok: false as const, error: "DB offline" };
  const v = await prisma.vendor.findUnique({ where: { userId: user.id } });
  if (!v) return { ok: false as const, error: "ยังไม่มีร้าน" };
  await prisma.vendor.update({
    where: { id: v.id },
    data: { isActive: !v.isActive },
  });
  revalidatePath("/vendor/dashboard");
  return { ok: true as const, isActive: !v.isActive };
}

const uploadSchema = z.object({
  kind: z.enum(["logo", "cover", "product"]),
  contentType: z.string().min(3),
});

export async function createUploadUrl(input: z.infer<typeof uploadSchema>) {
  const user = await requireRole(["VENDOR", "ADMIN"]);
  const parsed = uploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid input" };

  const { createSupabaseService } = await import("@/lib/supabase/server");
  const supabase = createSupabaseService();
  if (!supabase) return { ok: false as const, error: "supabase service offline" };

  const ext = parsed.data.contentType.split("/")[1] ?? "bin";
  const path = `${user.id}/${parsed.data.kind}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from("shop-media")
    .createSignedUploadUrl(path, 3600); // URL valid for 1 hour

  if (error) return { ok: false as const, error: error.message };
  return {
    ok: true as const,
    path: data.signedUrl, // Use the signedUrl directly
    token: "", // Not needed for signed URLs
    publicUrl: supabase.storage.from("shop-media").getPublicUrl(path).data.publicUrl,
  };
}

export async function approveVendor(vendorId: string, approved: boolean) {
  await requireRole(["ADMIN"]);
  if (!ready.db || !prisma) return { ok: false as const, error: "DB offline" };
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { isVerified: approved },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/vendors");
  return { ok: true as const };
}

export async function deleteVendor(vendorId: string) {
  await requireRole(["ADMIN"]);
  if (!ready.db || !prisma) return { ok: false as const, error: "DB offline" };
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { isActive: false },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/vendors");
  return { ok: true as const };
}

export async function completeOnboarding(form: FormData) {
  // Onboarding is the first step a new account takes, so a CUSTOMER role is
  // expected here — promote to VENDOR before the upsert instead of rejecting.
  const user = await requireSession();
  if (!ready.db || !prisma) {
    return { ok: false as const, error: "ฐานข้อมูลยังไม่ได้ตั้งค่า" };
  }
  const rawSlug = String(form.get("slug") ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const parsed = shopSchema.safeParse({
    shopName: String(form.get("shopName") ?? ""),
    slug: rawSlug || `shop-${user.id.slice(0, 8)}`,
    description: String(form.get("description") ?? "") || undefined,
    category: form.get("category") as ShopInput["category"],
    phone: String(form.get("phone") ?? ""),
    logoEmoji: String(form.get("logoEmoji") ?? "🏪"),
    latitude: Number(form.get("latitude")),
    longitude: Number(form.get("longitude")),
    boothNumber: String(form.get("boothNumber") ?? "") || undefined,
    openTime: String(form.get("openTime") ?? ""),
    closeTime: String(form.get("closeTime") ?? ""),
    openDays: (form.getAll("openDays") as string[]).filter(Boolean) as ShopInput["openDays"],
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง",
    };
  }
  const data = parsed.data;

  // Slug must be unique — append a short id suffix if someone already took it.
  let slug = data.slug;
  const collision = await prisma.vendor.findFirst({
    where: { slug, userId: { not: user.id } },
    select: { id: true },
  });
  if (collision) slug = `${slug}-${user.id.slice(0, 6)}`;

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "VENDOR" },
  });

  await prisma.vendor.upsert({
    where: { userId: user.id },
    update: {
      shopName: data.shopName,
      slug,
      description: data.description,
      category: data.category,
      phone: data.phone,
      logoEmoji: data.logoEmoji,
      latitude: data.latitude,
      longitude: data.longitude,
      boothNumber: data.boothNumber,
      openTime: data.openTime,
      closeTime: data.closeTime,
      openDays: data.openDays,
    },
    create: {
      userId: user.id,
      shopName: data.shopName,
      slug,
      description: data.description,
      category: data.category,
      phone: data.phone,
      logoEmoji: data.logoEmoji,
      latitude: data.latitude,
      longitude: data.longitude,
      boothNumber: data.boothNumber,
      openTime: data.openTime,
      closeTime: data.closeTime,
      openDays: data.openDays,
    },
  });

  // Mirror the role bump into Supabase user metadata so future sessions see it
  // even before the next Prisma read.
  try {
    const { createSupabaseService } = await import("@/lib/supabase/server");
    const admin = createSupabaseService();
    if (admin) {
      await admin.auth.admin.updateUserById(user.id, {
        user_metadata: { role: "VENDOR", displayName: user.displayName },
      });
    }
  } catch {
    // Non-fatal — Prisma is the source of truth for role on every render.
  }

  revalidatePath("/vendor/dashboard");
  revalidatePath("/shops");
  revalidatePath(`/shops/${slug}`);
  redirect("/vendor/dashboard");
}
