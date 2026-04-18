"use client";

import { useState, useTransition } from "react";
import { signInWithPassword, requestPhoneOtp, verifyPhoneOtp } from "@/lib/auth/actions";

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "otp">("password");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function submitPassword(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await signInWithPassword(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  async function requestOtp(fd: FormData) {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const res = await requestPhoneOtp(fd);
      if (res.ok) {
        setOtpSent(true);
        setInfo(res.message ?? "ส่ง OTP แล้ว");
      } else {
        setError(res.error);
      }
    });
  }

  async function verifyOtp(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await verifyPhoneOtp(fd);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="card p-6 space-y-3">
      <div className="flex gap-2 p-1 rounded-full bg-primary-50 text-xs">
        <button
          onClick={() => setMode("password")}
          className={`flex-1 py-1.5 rounded-full ${mode === "password" ? "bg-white shadow-sm font-semibold" : "text-muted"}`}
          type="button"
        >
          อีเมล + รหัสผ่าน
        </button>
        <button
          onClick={() => setMode("otp")}
          className={`flex-1 py-1.5 rounded-full ${mode === "otp" ? "bg-white shadow-sm font-semibold" : "text-muted"}`}
          type="button"
        >
          เบอร์โทร + OTP
        </button>
      </div>

      {mode === "password" ? (
        <form action={submitPassword} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold">อีเมล</span>
            <input name="email" type="email" required placeholder="you@example.com" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold">รหัสผ่าน</span>
            <input name="password" type="password" required placeholder="••••••••" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-50">
            {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      ) : null}

      {mode === "otp" ? (
        <div className="space-y-3">
          <form action={requestOtp} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold">เบอร์โทร</span>
              <input name="phone" type="tel" required placeholder="0812345678" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" />
            </label>
            <button type="submit" disabled={isPending} className="btn-outline w-full disabled:opacity-50">
              {otpSent ? "ส่งอีกครั้ง" : "ส่ง OTP"}
            </button>
          </form>

          {otpSent ? (
            <form action={verifyOtp} className="space-y-3">
              <input type="hidden" name="phone" value="" />
              <label className="block space-y-1">
                <span className="text-xs font-semibold">รหัส OTP (6 หลัก)</span>
                <input
                  name="token"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-center font-mono text-lg tracking-widest"
                />
              </label>
              <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-50">
                ยืนยัน OTP
              </button>
            </form>
          ) : null}

          {info ? <p className="text-xs text-success">{info}</p> : null}
          {error ? <p className="text-xs text-danger">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
