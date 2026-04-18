import { getSessionUser } from "@/lib/auth/session";
import { getVendorById, getVendorByUserId } from "@/lib/data/vendors";
import { listProductsForVendor } from "@/lib/data/products";
import { getForecast } from "@/lib/data/crowd";
import { NewFlashSaleWizard } from "@/components/flash-sale/wizard";

export default async function NewFlashSalePage() {
  const user = await getSessionUser();
  const vendor = user
    ? (await getVendorByUserId(user.id)) ?? (await getVendorById("v-01"))
    : await getVendorById("v-01");
  if (!vendor) return null;
  const [products, forecast] = await Promise.all([
    listProductsForVendor(vendor.id),
    getForecast(24),
  ]);
  return (
    <NewFlashSaleWizard
      vendorShopName={vendor.shopName}
      products={products}
      initialPeak={Math.max(...forecast.map((p) => p.count))}
    />
  );
}
