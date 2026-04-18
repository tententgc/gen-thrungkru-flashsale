import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ready, env } from "@/lib/env";
import { sendPushToUsers } from "@/lib/push/send";
import { createSupabaseService } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/notify/flash-sale
 *   body: { flashSaleId: string, radiusMeters?: number }
 *
 * Secured with a simple bearer secret (CRON_SECRET). Invoked from:
 *  - Supabase DB trigger (via pg_net) when a flash sale transitions to ACTIVE
 *  - Manual admin dispatch
 *
 * Uses PostGIS ST_DWithin to find every opted-in user within the radius.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const auth = req.headers.get("authorization") ?? "";
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const flashSaleId = String(body.flashSaleId ?? "");
  const radiusMeters = Number(body.radiusMeters ?? 2000);
  if (!flashSaleId) {
    return NextResponse.json({ error: "flashSaleId required" }, { status: 400 });
  }

  if (!ready.db || !prisma) {
    return NextResponse.json({ error: "DB offline" }, { status: 503 });
  }

  const sale = await prisma.flashSale.findUnique({
    where: { id: flashSaleId },
    include: { vendor: true, items: { include: { product: true } } },
  });
  if (!sale) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Use Supabase service role to run the PostGIS query (bypasses RLS).
  const supabase = createSupabaseService();
  if (!supabase) {
    return NextResponse.json({ error: "service role key missing" }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("users_within_radius", {
    center_lng: sale.vendor.longitude,
    center_lat: sale.vendor.latitude,
    radius_m: radiusMeters,
    exclude_ids: sale.notifiedUserIds,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = ((data ?? []) as { user_id: string }[]).map((r) => r.user_id);

  const payload = {
    title: `⚡ ${sale.vendor.shopName} ปล่อย Flash Sale!`,
    body: `${sale.title} · ใน ${radiusMeters < 1000 ? radiusMeters + " ม." : radiusMeters / 1000 + " กม."} จากคุณ`,
    url: `/flash-sales/${sale.id}`,
    tag: `flash-sale-${sale.id}`,
  };
  const { sent } = await sendPushToUsers(userIds, payload);

  // Log + prevent duplicate notifications
  await prisma.flashSale.update({
    where: { id: sale.id },
    data: { notifiedUserIds: { push: userIds } },
  });
  await prisma.notificationLog.createMany({
    data: userIds.map((uid) => ({
      userId: uid,
      type: "flash_sale",
      title: payload.title,
      body: payload.body,
      payload: { flashSaleId: sale.id, url: payload.url },
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, targeted: userIds.length, sent });
}
