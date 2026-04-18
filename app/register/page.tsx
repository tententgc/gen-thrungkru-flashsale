import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { ready } from "@/lib/env";

export const metadata = { title: "สมัครสมาชิก" };

export default function RegisterPage() {
  return (
    <div className="container-page py-10 max-w-xl">
      <h1 className="heading-hero">สมัครสมาชิก</h1>
      <p className="text-muted text-sm">เริ่มใช้ ThungKhru61 ใน 1 นาที</p>

      {!ready.supabase ? (
        <div className="card p-4 mt-4 bg-warning/10 border-warning/40 text-xs text-muted">
          Supabase ยังไม่ถูกตั้งค่า — ฟอร์มจะยังทำงานได้เมื่อกรอก env ครบ
        </div>
      ) : null}

      <RegisterForm />

      <p className="text-center text-sm text-muted mt-4">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="text-primary font-semibold">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
