import Link from "next/link";
import { DEMO_USERS } from "@/lib/mock-data";
import { ready } from "@/lib/env";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="container-page py-10 grid gap-6 md:grid-cols-2 max-w-5xl">
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

      <div className="card p-6 space-y-3 bg-primary-50/50">
        <h2 className="font-semibold">บัญชีทดลอง</h2>
        <p className="text-xs text-muted">
          {ready.supabase
            ? "รันคำสั่ง pnpm db:seed เพื่อสร้างบัญชีเหล่านี้ในฐานข้อมูลของคุณ"
            : "ใช้บัญชีเหล่านี้ในโหมดเดโม (ยังไม่มี Supabase)"}
        </p>
        <ul className="space-y-2">
          {DEMO_USERS.map((u) => (
            <li key={u.email} className="card p-3 text-sm bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{u.name}</div>
                  <div className="text-xs text-muted truncate">{u.email}</div>
                </div>
                <span
                  className={`chip text-[10px] ${
                    u.role === "ADMIN"
                      ? "bg-ink text-white"
                      : u.role === "VENDOR"
                        ? "bg-accent text-white border-accent"
                        : ""
                  }`}
                >
                  {u.role}
                </span>
              </div>
              <div className="mt-2 font-mono text-[11px] text-muted">
                password: {u.password}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
