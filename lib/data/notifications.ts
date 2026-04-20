import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";

// Per-render dedup so the header, page, and any other component that asks for
// the unread count in the same render only hit the DB once. Notifications are
// user-specific so we deliberately skip `unstable_cache` (which is a global
// cross-request cache) — the count must reflect the latest read state.
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
