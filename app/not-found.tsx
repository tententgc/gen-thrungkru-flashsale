import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid place-items-center py-24 text-center">
      <div className="text-7xl">🏪</div>
      <h1 className="heading-hero mt-4">ไม่พบหน้าที่ค้นหา</h1>
      <p className="text-muted max-w-md mt-2">
        หน้านี้อาจถูกย้าย หรือ link ที่ใช้อาจไม่ถูกต้อง ลองกลับไปหน้าแรกเพื่อเริ่มใหม่
      </p>
      <Link href="/" className="btn-primary mt-6">กลับหน้าแรก</Link>
    </div>
  );
}
