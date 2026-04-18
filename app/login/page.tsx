import Link from "next/link";
import { DEMO_USERS } from "@/lib/mock-data";

export const metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="container-page py-10 grid gap-6 md:grid-cols-2 max-w-5xl">
      <div className="space-y-4">
        <h1 className="heading-hero">เข้าสู่ระบบ</h1>
        <p className="text-muted text-sm">
          ยังไม่มีบัญชี? <Link className="text-primary font-semibold" href="/register">สมัครสมาชิกฟรี</Link>
        </p>

        <form className="card p-6 space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold">อีเมล</span>
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold">รหัสผ่าน</span>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="inline-flex items-center gap-1 text-muted">
              <input type="checkbox" /> จำฉันไว้
            </label>
            <Link href="/forgot-password" className="text-primary">ลืมรหัสผ่าน?</Link>
          </div>
          <button type="submit" className="btn-primary w-full">
            เข้าสู่ระบบ
          </button>
          <div className="flex items-center gap-2 py-2">
            <span className="flex-1 border-t border-border" />
            <span className="text-xs text-muted">หรือ</span>
            <span className="flex-1 border-t border-border" />
          </div>
          <button type="button" className="btn-outline w-full">
            📱 เข้าสู่ระบบด้วย OTP เบอร์โทร
          </button>
        </form>
      </div>

      <div className="card p-6 space-y-3 bg-primary-50/50">
        <h2 className="font-semibold">บัญชีทดลอง</h2>
        <p className="text-xs text-muted">
          ระบบนี้เป็นเดโม — ใช้บัญชีด้านล่างเพื่อดูหน้าต่าง ๆ
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
