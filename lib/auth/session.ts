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

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServer();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  let role: UserRole = "CUSTOMER";
  let displayName =
    (user.user_metadata as Record<string, unknown> | null)?.["displayName"] as
      | string
      | undefined ??
    user.email?.split("@")[0] ??
    "ผู้ใช้";

  if (ready.db && prisma) {
    try {
      const db = await prisma.user.upsert({
        where: { id: user.id },
        update: {
          email: user.email ?? null,
          phone: user.phone ?? null,
        },
        create: {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
          displayName,
          role:
            ((user.user_metadata as Record<string, unknown> | null)?.["role"] as
              | UserRole
              | undefined) ?? "CUSTOMER",
        },
      });
      role = db.role;
      displayName = db.displayName;
    } catch {
      const meta = user.user_metadata as Record<string, unknown> | null;
      if (meta?.["role"]) role = meta["role"] as UserRole;
    }
  }

  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    displayName,
    role,
  };
}

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
