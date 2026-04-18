import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import {
  FLASH_SALES,
  flashSaleById as mockById,
  flashSalesForVendor as mockForVendor,
  activeFlashSales as mockActive,
} from "@/lib/mock-data";
import type { FlashSale } from "@/lib/types";

function toView(row: any): FlashSale {
  return {
    id: row.id,
    vendorId: row.vendorId,
    title: row.title,
    description: row.description ?? "",
    startAt:
      typeof row.startAt === "string" ? row.startAt : row.startAt.toISOString(),
    endAt:
      typeof row.endAt === "string" ? row.endAt : row.endAt.toISOString(),
    status: row.status,
    items: (row.items ?? []).map((it: any) => ({
      productId: it.productId,
      salePrice: Number(it.salePrice),
      stockLimit: it.stockLimit ?? undefined,
      stockSold: it.stockSold ?? 0,
    })),
  };
}

async function tryDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!ready.db || !prisma) return fallback;
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

export async function listFlashSales(opts?: {
  status?: FlashSale["status"];
}): Promise<FlashSale[]> {
  const rows = await tryDb(
    () =>
      prisma!.flashSale.findMany({
        where: opts?.status ? { status: opts.status } : undefined,
        orderBy: { endAt: "asc" },
        include: { items: true },
      }),
    [] as any[],
  );
  if (rows.length > 0) return rows.map(toView);
  let src = FLASH_SALES;
  if (opts?.status) src = src.filter((s) => s.status === opts.status);
  return src;
}

export async function getFlashSaleById(id: string): Promise<FlashSale | null> {
  const row = await tryDb(
    () =>
      prisma!.flashSale.findUnique({
        where: { id },
        include: { items: true },
      }),
    null,
  );
  if (row) return toView(row);
  return mockById(id) ?? null;
}

export async function listActiveFlashSales(): Promise<FlashSale[]> {
  const rows = await tryDb(
    () =>
      prisma!.flashSale.findMany({
        where: { status: "ACTIVE" },
        orderBy: { endAt: "asc" },
        include: { items: true },
      }),
    [] as any[],
  );
  if (rows.length > 0) return rows.map(toView);
  return mockActive();
}

export async function listFlashSalesForVendor(vendorId: string): Promise<FlashSale[]> {
  const rows = await tryDb(
    () =>
      prisma!.flashSale.findMany({
        where: { vendorId },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    [] as any[],
  );
  if (rows.length > 0) return rows.map(toView);
  return mockForVendor(vendorId);
}
