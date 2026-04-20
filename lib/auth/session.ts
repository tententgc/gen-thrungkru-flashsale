import { cache } from "react";
import { createSupabaseServer } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ready } from "@/lib/env";
import type { UserRole } from "@/lib/types";

export interface SessionUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string;
  role: UserRole;
}

// `cache()` dedupes within a single render — the layout header, the user menu,
// and a page handler can all call this and only the first triggers Supabase
// cookie read + DB lookup.
export const getSessionUser = cache(
  async (): Promise<SessionUser | null> => {
    const supabase = await createSupabaseServer();
    if (!supabase) return null;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const meta = user.user_metadata as Record<string, unknown> | null;
    const metaName = meta?.["displayName"];
    const metaRole = meta?.["role"];
    let displayName =
      (typeof metaName === "string" ? metaName : undefined) ??
      user.email?.split("@")[0] ??
      "ผู้ใช้";
    let role: UserRole =
      metaRole === "VENDOR" || metaRole === "ADMIN" || metaRole === "CUSTOMER"
        ? (metaRole as UserRole)
        : "CUSTOMER";

    // Read-first, provision-on-miss. Previous code upserted on every render,
    // so every page navigation triggered a DB write.
    if (ready.db && prisma) {
      try {
        let db = await prisma.user.findUnique({ where: { id: user.id } });
        if (!db) {
          db = await prisma.user.create({
            data: {
              id: user.id,
              email: user.email ?? null,
              phone: user.phone ?? null,
              displayName,
              role,
            },
          });
        }
        role = db.role;
        displayName = db.displayName;
      } catch {
        // DB unreachable — fall back to Supabase metadata we already parsed.
      }
    }

    return {
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      displayName,
      role,
    };
  },
);

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(allowed: UserRole[]): Promise<SessionUser> {
  const user = await requireSession();
  if (!allowed.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
