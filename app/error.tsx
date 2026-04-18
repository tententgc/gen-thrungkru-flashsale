"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page grid place-items-center py-24 text-center">
      <div className="text-7xl">🧯</div>
      <h1 className="heading-hero mt-4">เกิดข้อผิดพลาดบางอย่าง</h1>
      <p className="text-muted max-w-md mt-2">
        ระบบพบปัญหาระหว่างโหลดหน้านี้ — ลองรีเฟรชหรือย้อนกลับไปยังหน้าแรก
      </p>
      <p className="mt-2 text-xs text-muted font-mono">
        {error.message}
        {error.digest ? ` · ${error.digest}` : ""}
      </p>
      <div className="flex gap-2 mt-6">
        <button onClick={() => reset()} className="btn-primary">ลองใหม่</button>
        <Link href="/" className="btn-outline">กลับหน้าแรก</Link>
      </div>
    </div>
  );
}
