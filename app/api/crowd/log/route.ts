import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { haversineMeters, MARKET_CENTER } from "@/lib/geo";

export const dynamic = "force-dynamic";

// Geofence radius for "in market" classification (meters)
const MARKET_RADIUS = 180;

const payloadSchema = z.object({
  source: z.enum([
    "APP_OPEN_NEARBY",
    "GEOFENCE_ENTER",
    "GEOFENCE_EXIT",
    "QR_CHECKIN",
    "VENDOR_REPORT_BUSY",
    "VENDOR_REPORT_QUIET",
    "FLASH_SALE_VIEW",
    "MANUAL_ESTIMATE",
  ]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  checkpointId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const WEIGHT: Record<string, number> = {
  APP_OPEN_NEARBY: 1.0,
  GEOFENCE_ENTER: 2.0,
  GEOFENCE_EXIT: 1.0,
  QR_CHECKIN: 5.0,
  VENDOR_REPORT_BUSY: 3.0,
  VENDOR_REPORT_QUIET: 3.0,
  FLASH_SALE_VIEW: 0.5,
  MANUAL_ESTIMATE: 4.0,
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  const data = parsed.data;

  if (!ready.db || !prisma) {
    // Dry-run acknowledge when DB isn't wired yet
    return NextResponse.json({ ok: true, dryRun: true });
  }

  const user = await getSessionUser();
  let distanceM: number | null = null;
  let inMarket = false;
  if (data.latitude != null && data.longitude != null) {
    distanceM = haversineMeters(MARKET_CENTER, {
      lat: data.latitude,
      lng: data.longitude,
    });
    inMarket = distanceM <= MARKET_RADIUS;
  }
  if (data.source === "QR_CHECKIN") inMarket = true;

  try {
    await prisma.crowdDataPoint.create({
      data: {
        source: data.source,
        signalWeight: WEIGHT[data.source] ?? 1.0,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        distanceM,
        inMarket,
        userId: user?.id ?? null,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    if (data.source === "QR_CHECKIN") {
      await prisma.checkIn.create({
        data: {
          userId: user?.id ?? null,
          checkpointId: data.checkpointId ?? "unknown",
        },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "log failed" },
      { status: 500 },
    );
  }
}
