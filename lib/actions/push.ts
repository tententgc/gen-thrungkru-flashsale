"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { ready } from "@/lib/env";

export interface SubscribeInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function subscribePush(input: SubscribeInput) {
  const user = await getSessionUser();
  if (!user) return { ok: false as const, error: "UNAUTHENTICATED" };
  if (!ready.db || !prisma) {
    return { ok: false as const, error: "DB offline" };
  }
  try {
    await prisma.deviceToken.upsert({
      where: { endpoint: input.endpoint },
      update: {
        userId: user.id,
        p256dh: input.keys.p256dh,
        authKey: input.keys.auth,
        lastUsedAt: new Date(),
      },
      create: {
        userId: user.id,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        authKey: input.keys.auth,
        platform: "web",
      },
    });
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "subscribe failed" };
  }
}

export async function unsubscribePush(input: { endpoint: string }) {
  if (!ready.db || !prisma) return { ok: true as const };
  try {
    await prisma.deviceToken.deleteMany({ where: { endpoint: input.endpoint } });
  } catch {
    // best-effort
  }
  return { ok: true as const };
}
