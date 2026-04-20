import Link from "next/link";
import { ProductForm } from "@/components/shop/product-form";

export const metadata = { title: "เพิ่มสินค้าใหม่" };

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="heading-hero">เพิ่มสินค้าใหม่</h1>
          <p className="text-sm text-muted">กรอกรายละเอียดสินค้าของคุณ</p>
        </div>
        <Link href="/vendor/products" className="text-sm text-muted hover:text-ink">
          ยกเลิก
        </Link>
      </header>

      <ProductForm />
    </div>
  );
}
