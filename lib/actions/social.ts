"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { ready } from "@/lib/env";

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (!ready.db || !prisma) throw new Error("DB offline");
  return user;
}

export async function followVendor(vendorId: string) {
  try {
    const user = await requireUser();
    await prisma!.follow.upsert({
      where: { userId_vendorId: { userId: user.id, vendorId } },
      update: {},
      create: { userId: user.id, vendorId },
    });
    await prisma!.vendor.update({
      where: { id: vendorId },
      data: { followerCount: { increment: 1 } },
    });
    revalidatePath("/feed");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "failed" };
  }
}

export async function unfollowVendor(vendorId: string) {
  try {
    const user = await requireUser();
    const existing = await prisma!.follow.findUnique({
      where: { userId_vendorId: { userId: user.id, vendorId } },
    });
    if (!existing) return { ok: true as const };
    await prisma!.follow.delete({
      where: { userId_vendorId: { userId: user.id, vendorId } },
    });
    await prisma!.vendor.update({
      where: { id: vendorId },
      data: { followerCount: { decrement: 1 } },
    });
    revalidatePath("/feed");
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "failed" };
  }
}

export async function favoriteProduct(productId: string) {
  try {
    const user = await requireUser();
    await prisma!.favorite.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: {},
      create: { userId: user.id, productId },
    });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "failed" };
  }
}

export async function unfavoriteProduct(productId: string) {
  try {
    const user = await requireUser();
    await prisma!.favorite.deleteMany({
      where: { userId: user.id, productId },
    });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "failed" };
  }
}

const reviewSchema = z.object({
  vendorId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function postReview(input: unknown) {
  try {
    const user = await requireUser();
    const parsed = reviewSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false as const, error: parsed.error.issues[0]?.message ?? "invalid" };
    }
    const d = parsed.data;
    const review = await prisma!.review.create({
      data: {
        userId: user.id,
        vendorId: d.vendorId,
        productId: d.productId,
        rating: d.rating,
        comment: d.comment,
      },
    });

    if (d.vendorId) {
      const agg = await prisma!.review.aggregate({
        where: { vendorId: d.vendorId },
        _avg: { rating: true },
        _count: { _all: true },
      });
      await prisma!.vendor.update({
        where: { id: d.vendorId },
        data: {
          rating: agg._avg.rating ?? 0,
          reviewCount: agg._count._all,
        },
      });
    }
    if (d.vendorId) revalidatePath(`/shops/${d.vendorId}`);
    return { ok: true as const, review };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "failed" };
  }
}
