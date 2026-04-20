"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { PhotoIcon, TrashIcon, SparkIcon } from "@/components/icons";
import { createUploadUrl } from "@/lib/actions/vendor";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  kind?: "product" | "logo" | "cover";
}

export function ImageUpload({ value, onChange, kind = "product" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 4MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const res = await createUploadUrl({
        kind,
        contentType: file.type,
      });

      if (!res.ok) throw new Error(res.error);

      // Upload to Supabase Storage
      const uploadRes = await fetch(res.path, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      onChange(res.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">รูปภาพสินค้า</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-danger flex items-center gap-1 hover:underline"
          >
            <TrashIcon className="h-3 w-3" /> ลบรูปภาพ
          </button>
        )}
      </div>

      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative aspect-square w-full max-w-[200px] overflow-hidden rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
          value ? "border-transparent" : "border-border hover:border-primary hover:bg-primary-50"
        } ${isUploading ? "opacity-50 cursor-wait" : ""}`}
      >
        {value ? (
          <Image
            src={value}
            alt="Product image"
            fill
            className="object-cover"
          />
        ) : (
          <>
            <PhotoIcon className="h-8 w-8 text-muted" />
            <span className="text-xs text-muted font-medium">อัปโหลดรูปภาพ</span>
          </>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-background/50 grid place-items-center">
            <SparkIcon className="h-6 w-6 text-primary animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      <p className="text-[10px] text-muted italic">ไฟล์ JPG, PNG ไม่เกิน 4MB</p>
    </div>
  );
}
