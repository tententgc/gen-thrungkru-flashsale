import Link from "next/link";
import { flashSalesForVendor } from "@/lib/mock-data";
import { FlashSaleCard } from "@/components/flash-sale/flash-sale-card";
import { PlusIcon } from "@/components/icons";

export const metadata = { title: "Flash Sale ของร้าน" };

export default function VendorFlashSalesPage() {
  const sales = flashSalesForVendor("v-01");

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="heading-hero">Flash Sale ของร้าน</h1>
          <p className="text-sm text-muted">{sales.length} รายการ · ทุกสถานะ</p>
        </div>
        <Link href="/vendor/flash-sales/new" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> สร้างใหม่
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sales.map((s) => <FlashSaleCard key={s.id} sale={s} />)}
      </div>
    </div>
  );
}
