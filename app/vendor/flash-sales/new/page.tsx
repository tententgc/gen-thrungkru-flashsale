import { requireVendor } from "@/lib/auth/vendor";
import { listProductsForVendor } from "@/lib/data/products";
import { getForecast } from "@/lib/data/crowd";
import { NewFlashSaleWizard } from "@/components/flash-sale/wizard";

export default async function NewFlashSalePage() {
  const vendor = await requireVendor("/vendor/flash-sales/new");
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
