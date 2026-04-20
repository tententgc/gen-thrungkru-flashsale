import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getVendorByUserId } from "@/lib/data/vendors";
import type { Vendor } from "@/lib/types";

// Resolve the signed-in user's vendor record or send them somewhere sensible.
// Replaces the `getVendorByUserId(user.id) ?? getVendorById("v-01")` demo
// fallback used across vendor pages — that pattern silently showed a different
// shop's data to anyone signed in without a vendor profile.
//
// - No session → /login (with `next` param so they come back here)
// - Session, no vendor row → /vendor/onboarding (CUSTOMER user lands here)
// - Vendor row found → returned
export async function requireVendor(returnTo: string): Promise<Vendor> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  const vendor = await getVendorByUserId(user.id);
  if (!vendor) redirect("/vendor/onboarding");
  return vendor;
}
