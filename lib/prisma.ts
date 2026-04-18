import { PrismaClient } from "@prisma/client";
import { ready } from "./env";

declare global {
  var __prisma: PrismaClient | undefined;
}

function create(): PrismaClient | null {
  if (!ready.db) return null;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient | null =
  global.__prisma ?? (ready.db ? create() : null);

if (ready.db && process.env.NODE_ENV !== "production") {
  global.__prisma = prisma ?? undefined;
}
