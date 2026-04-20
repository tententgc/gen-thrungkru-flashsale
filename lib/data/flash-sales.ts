import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import {
  FLASH_SALES,
  flashSaleById as mockById,
  flashSalesForVendor as mockForVendor,
  activeFlashSales as mockActive,
} from "@/lib/mock-data";
import { isUuid } from "@/lib/utils";
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

// Flash sales are time-sensitive — keep TTL short (15s) but still absorb
// bursts of traffic across multiple concurrent page renders.
const fetchFlashSales = unstable_cache(
  async (status?: FlashSale["status"]): Promise<FlashSale[]> => {
    const rows = await tryDb(
      () =>
        prisma!.flashSale.findMany({
          where: status ? { status } : undefined,
          orderBy: { endAt: "asc" },
          include: { items: true },
        }),
      [] as any[],
    );
    if (rows.length > 0) return rows.map(toView);
    let src = FLASH_SALES;
    if (status) src = src.filter((s) => s.status === status);
    return src;
  },
  ["flash-sales:list"],
  { revalidate: 15, tags: ["flash-sales"] },
);

export const listFlashSales = cache(
  async (opts?: { status?: FlashSale["status"] }): Promise<FlashSale[]> =>
    fetchFlashSales(opts?.status),
);

const fetchFlashSaleById = unstable_cache(
  async (id: string): Promise<FlashSale | null> => {
    const row = isUuid(id)
      ? await tryDb(
          () =>
            prisma!.flashSale.findUnique({
              where: { id },
              include: { items: true },
            }),
          null,
        )
      : null;
    if (row) return toView(row);
    return mockById(id) ?? null;
  },
  ["flash-sales:by-id"],
  { revalidate: 15, tags: ["flash-sales"] },
);

export const getFlashSaleById = cache(fetchFlashSaleById);

const fetchActiveFlashSales = unstable_cache(
  async (): Promise<FlashSale[]> => {
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
  },
  ["flash-sales:list:active"],
  { revalidate: 15, tags: ["flash-sales"] },
);

export const listActiveFlashSales = cache(fetchActiveFlashSales);

const fetchFlashSalesForVendor = unstable_cache(
  async (vendorId: string): Promise<FlashSale[]> => {
    const rows = isUuid(vendorId)
      ? await tryDb(
          () =>
            prisma!.flashSale.findMany({
              where: { vendorId },
              orderBy: { createdAt: "desc" },
              include: { items: true },
            }),
          [] as any[],
        )
      : ([] as any[]);
    if (rows.length > 0) return rows.map(toView);
    return mockForVendor(vendorId);
  },
  ["flash-sales:by-vendor"],
  { revalidate: 30, tags: ["flash-sales"] },
);

export const listFlashSalesForVendor = cache(fetchFlashSalesForVendor);
