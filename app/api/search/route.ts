import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import { VENDORS, PRODUCTS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) {
    return NextResponse.json(
      { data: { shops: [], products: [] } },
      { headers: CACHE_HEADERS },
    );
  }

  if (ready.db && prisma) {
    try {
      const [shops, products] = await Promise.all([
        prisma.vendor.findMany({
          where: {
            isActive: true,
            OR: [
              { shopName: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 6,
          orderBy: { followerCount: "desc" },
        }),
        prisma.product.findMany({
          where: {
            isAvailable: true,
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 6,
          include: { vendor: { select: { slug: true, shopName: true } } },
        }),
      ]);
      return NextResponse.json(
        {
          data: {
            shops: shops.map((s) => ({
              id: s.id,
              slug: s.slug,
              shopName: s.shopName,
              logoEmoji: s.logoEmoji,
              boothNumber: s.boothNumber,
              category: s.category,
            })),
            products: products.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              imageEmoji: p.imageEmoji,
              regularPrice: Number(p.regularPrice),
              vendor: p.vendor,
            })),
          },
        },
        { headers: CACHE_HEADERS },
      );
    } catch {
      // fall through to mock below
    }
  }

  const needle = q.toLowerCase();
  return NextResponse.json(
    {
      data: {
        shops: VENDORS.filter(
          (v) =>
            v.shopName.toLowerCase().includes(needle) ||
            v.description.toLowerCase().includes(needle),
        ).slice(0, 6),
        products: PRODUCTS.filter((p) =>
          p.name.toLowerCase().includes(needle),
        ).slice(0, 6),
      },
    },
    { headers: CACHE_HEADERS },
  );
}
