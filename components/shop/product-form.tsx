"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { createProduct, updateProduct, deleteProduct } from "@/lib/actions/products";
import { ImageUpload } from "./image-upload";

const CATEGORIES = [
  "อาหาร (คาว)",
  "อาหาร (หวาน)",
  "เครื่องดื่ม",
  "ผลไม้",
  "เสื้อผ้า/เครื่องแต่งกาย",
  "ของใช้ทั่วไป",
  "อื่นๆ",
];

const EMOJIS = ["🍴", "🍲", "🥤", "🍦", "🍎", "👕", "👜", "💄", "🏪", "🎁"];

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [regularPrice, setRegularPrice] = useState(product?.regularPrice?.toString() ?? "");
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0]);
  const [imageEmoji, setImageEmoji] = useState(product?.imageEmoji ?? EMOJIS[0]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data = {
      name,
      description,
      imageUrl,
      regularPrice: parseFloat(regularPrice),
      category,
      imageEmoji,
    };

    startTransition(async () => {
      const res = product
        ? await updateProduct(product.id, data)
        : await createProduct(data);

      if (res.ok) {
        router.push("/vendor/products");
        router.refresh();
      } else {
        setError(res.error ?? "เกิดข้อผิดพลาด");
      }
    });
  }

  async function handleDelete() {
    if (!product || !confirm("ยืนยันการลบสินค้านี้?")) return;
    
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res.ok) {
        router.push("/vendor/products");
        router.refresh();
      } else {
        setError(res.error ?? "ลบไม่สำเร็จ");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-5 space-y-6">
        <ImageUpload value={imageUrl} onChange={setImageUrl} />

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">ไอคอนสินค้า (หากไม่มีรูป)</span>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-2xl ring-1 ring-primary/20">
              {imageEmoji}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setImageEmoji(e)}
                className={`h-10 w-10 rounded-lg text-xl transition-all ${
                  imageEmoji === e ? "bg-primary text-white scale-110" : "bg-surface hover:bg-primary-50"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">ชื่อสินค้า</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ข้าวกะเพราหมูสับ"
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">รายละเอียด (ไม่บังคับ)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น รสชาติจัดจ้าน ใช้หมูสับอนามัย..."
              rows={3}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">ราคาปกติ (บาท)</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="50"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-semibold">หมวดหมู่</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-danger font-medium text-center">{error}</p>}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-3 text-base shadow-lg shadow-primary/20"
        >
          {isPending ? "กำลังบันทึก..." : product ? "บันทึกการแก้ไข" : "เพิ่มสินค้าใหม่"}
        </button>
        
        {product && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-sm text-danger font-medium py-2 hover:underline"
          >
            ลบสินค้านี้
          </button>
        )}
      </div>
    </form>
  );
}
