import webpush from "web-push";
import { env, ready } from "@/lib/env";
import { prisma } from "@/lib/prisma";

let configured = false;
function configure() {
  if (configured || !ready.webPush) return;
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublic, env.vapidPrivate);
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  image?: string;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!ready.webPush || !ready.db || !prisma) return { sent: 0 };
  configure();
  const tokens = await prisma.deviceToken.findMany({ where: { userId } });
  let sent = 0;
  const gone: string[] = [];
  for (const t of tokens) {
    try {
      await webpush.sendNotification(
        {
          endpoint: t.endpoint,
          keys: { p256dh: t.p256dh, auth: t.authKey },
        },
        JSON.stringify(payload),
      );
      sent++;
    } catch (err: unknown) {
      // 404/410 => subscription dead; prune.
      const statusCode = (err as { statusCode?: number } | null)?.statusCode;
      if (statusCode === 404 || statusCode === 410) gone.push(t.endpoint);
    }
  }
  if (gone.length) {
    await prisma.deviceToken.deleteMany({ where: { endpoint: { in: gone } } });
  }
  return { sent };
}

export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  let total = 0;
  for (const id of userIds) {
    const res = await sendPushToUser(id, payload);
    total += res.sent;
  }
  return { sent: total };
}
