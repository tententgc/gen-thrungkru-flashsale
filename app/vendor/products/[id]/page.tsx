import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/shop/product-form";
import { getProductById } from "@/lib/data/products";
import { requireVendor } from "@/lib/auth/vendor";

export const metadata = { title: "แก้ไขสินค้า" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await requireVendor("/vendor/products");
  const product = await getProductById(id);

  if (!product) notFound();
  
  // Security check: only the owner can edit
  if (product.vendorId !== vendor.id) {
    redirect("/vendor/products");
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="heading-hero">แก้ไขสินค้า</h1>
          <p className="text-sm text-muted">{product.name}</p>
        </div>
        <Link href="/vendor/products" className="text-sm text-muted hover:text-ink">
          ยกเลิก
        </Link>
      </header>

      <ProductForm product={product} />
    </div>
  );
}
