import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getVendorByUserId } from "@/lib/data/vendors";
import { ready } from "@/lib/env";
import { VENDORS } from "@/lib/mock-data";
import type { Vendor } from "@/lib/types";

// Resolve the signed-in user's vendor record or send them somewhere sensible.
//
// - No session → /login (with `next` param so they come back here)
// - DB not configured (mock mode) → return the first mock vendor so the
//   demo experience skips the onboarding wall entirely.
// - Session, no vendor row → /vendor/onboarding (CUSTOMER user lands here)
// - Vendor row found → returned
export async function requireVendor(returnTo: string): Promise<Vendor> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  if (!ready.db) return VENDORS[0];
  const vendor = await getVendorByUserId(user.id);
  if (!vendor) redirect("/vendor/onboarding");
  return vendor;
}
