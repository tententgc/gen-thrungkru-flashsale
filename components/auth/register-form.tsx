"use client";

import { useState, useTransition } from "react";
import { signUpWithPassword } from "@/lib/auth/actions";
import { CheckIcon } from "@/components/icons";

export function RegisterForm() {
  const [role, setRole] = useState<"CUSTOMER" | "VENDOR">("CUSTOMER");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submit(fd: FormData) {
    setError(null);
    fd.set("role", role);
    startTransition(async () => {
      const res = await signUpWithPassword(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form action={submit} className="card p-6 mt-6 space-y-4">
      <div>
        <span className="text-xs font-semibold">เลือกบทบาท</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <RoleCard
            active={role === "CUSTOMER"}
            title="นักศึกษา / ลูกค้า"
            desc="ดู flash sale รับแจ้งเตือน"
            emoji="🎒"
            onClick={() => setRole("CUSTOMER")}
          />
          <RoleCard
            active={role === "VENDOR"}
            title="พ่อค้าแม่ค้า"
            desc="สร้างร้าน + flash sale"
            emoji="🏪"
            onClick={() => setRole("VENDOR")}
          />
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-semibold">ชื่อที่แสดง</span>
        <input
          name="displayName"
          type="text"
          required
          placeholder="ชื่อเล่น หรือ ชื่อร้าน"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold">อีเมล</span>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold">เบอร์โทร (ไม่บังคับ)</span>
        <input
          name="phone"
          type="tel"
          placeholder="0812345678"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold">รหัสผ่าน</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="อย่างน้อย 8 ตัวอักษร"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      <label className="flex items-start gap-2 text-xs text-muted">
        <input type="checkbox" required className="mt-0.5" />
        <span>
          ฉันยอมรับข้อตกลงการใช้งานและนโยบายความเป็นส่วนตัว (PDPA)
        </span>
      </label>

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-50">
        {isPending
          ? "กำลังสร้างบัญชี..."
          : role === "VENDOR"
            ? "สร้างบัญชีและตั้งร้าน →"
            : "สร้างบัญชี"}
      </button>
    </form>
  );
}

function RoleCard({
  active,
  title,
  desc,
  emoji,
  onClick,
}: {
  active: boolean;
  title: string;
  desc: string;
  emoji: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card p-4 text-left relative ${active ? "ring-2 ring-primary" : "hover:border-primary-300"}`}
    >
      <div className="text-3xl">{emoji}</div>
      <div className="mt-1 font-semibold text-sm">{title}</div>
      <div className="text-xs text-muted">{desc}</div>
      {active ? (
        <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-white">
          <CheckIcon className="h-4 w-4" />
        </span>
      ) : null}
    </button>
  );
}
