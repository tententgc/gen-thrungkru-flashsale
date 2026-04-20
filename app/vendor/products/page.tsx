import Link from "next/link";
import { listProductsForVendor } from "@/lib/data/products";
import { requireVendor } from "@/lib/auth/vendor";
import { formatTHB } from "@/lib/utils";
import { PlusIcon } from "@/components/icons";

export const metadata = { title: "สินค้าของร้าน" };

export default async function VendorProductsPage() {
  const vendor = await requireVendor("/vendor/products");
  const products = await listProductsForVendor(vendor.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-hero">สินค้าของร้าน</h1>
          <p className="text-sm text-muted">{products.length} รายการ</p>
        </div>
        <Link href="/vendor/products/new" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> เพิ่มสินค้า
        </Link>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50/50 text-left text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">สินค้า</th>
              <th className="px-4 py-3 hidden sm:table-cell">หมวดหมู่</th>
              <th className="px-4 py-3">ราคาปกติ</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-primary-50/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-50 text-2xl">
                      {p.imageEmoji}
                    </span>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted line-clamp-1">
                        {p.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-muted">
                  {p.category}
                </td>
                <td className="px-4 py-3 font-bold">{formatTHB(p.regularPrice)}</td>
                <td className="px-4 py-3">
                  <span className="chip chip-active">ขายอยู่</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/vendor/products/${p.id}`} className="text-sm text-primary font-semibold">
                    แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
