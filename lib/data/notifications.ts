import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";

// Per-render dedup so the header, page, and any other component that asks for
// the unread count in the same render only hit the DB once. Cross-request
// dedup is handled by the client router's stale time (see
// experimental.staleTimes in next.config.mjs) — the layout's RSC payload is
// reused for 30s of navigation without re-running this query server-side.
export const getUnreadNotificationCount = cache(
  async (userId: string): Promise<number> => {
    if (!ready.db || !prisma) return 0;
    try {
      return await prisma.notificationLog.count({
        where: { userId, readAt: null },
      });
    } catch {
      return 0;
    }
  },
);
