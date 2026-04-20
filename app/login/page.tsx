import Link from "next/link";
import { ready } from "@/lib/env";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="container-page py-10 max-w-md">
      <div className="space-y-4">
        <h1 className="heading-hero">เข้าสู่ระบบ</h1>
        <p className="text-muted text-sm">
          ยังไม่มีบัญชี?{" "}
          <Link className="text-primary font-semibold" href="/register">
            สมัครสมาชิกฟรี
          </Link>
        </p>

        {!ready.supabase ? (
          <div className="card p-4 bg-warning/10 border-warning/40 text-sm">
            <div className="font-semibold text-warning">โหมดเดโม</div>
            <p className="text-xs text-muted mt-1">
              Supabase ยังไม่ถูกตั้งค่า — ปุ่มเข้าสู่ระบบจะแสดงข้อผิดพลาด
              กรอก <code className="font-mono">.env.local</code> เพื่อเปิดใช้งานจริง
            </p>
          </div>
        ) : null}

        <LoginForm />
      </div>
    </div>
  );
}
