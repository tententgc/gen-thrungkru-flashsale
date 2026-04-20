import { PrismaClient } from "@prisma/client";
import { ready } from "./env";

declare global {
  var __prisma: PrismaClient | undefined;
}

function create(): PrismaClient | null {
  if (!ready.db) return null;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    transactionOptions: {
      maxWait: 2_000,
      timeout: 5_000,
    },
  });
}

// Singleton: reuse one connected client across hot-reloads in dev and across
// warm serverless invocations. Prevents connection-pool exhaustion and avoids
// the ~200ms handshake cost on cold start.
export const prisma: PrismaClient | null =
  global.__prisma ?? (ready.db ? create() : null);

if (ready.db && process.env.NODE_ENV !== "production") {
  global.__prisma = prisma ?? undefined;
}
