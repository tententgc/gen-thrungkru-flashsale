"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { ready } from "@/lib/env";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  isOptedIn: z.boolean().optional(),
});

export async function updateLocation(input: unknown) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "UNAUTHENTICATED" };
  if (!ready.db || !prisma) return { ok: false as const, error: "DB offline" };
  const parsed = locationSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid input" };
  try {
    await prisma.userLocation.upsert({
      where: { userId: user.id },
      update: {
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        accuracy: parsed.data.accuracy,
        isOptedIn: parsed.data.isOptedIn ?? true,
      },
      create: {
        userId: user.id,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        accuracy: parsed.data.accuracy,
        isOptedIn: parsed.data.isOptedIn ?? true,
      },
    });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "save failed" };
  }
}
