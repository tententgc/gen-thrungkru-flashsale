"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { CheckIcon } from "@/components/icons";

type Step = 1 | 2 | 3;
const DAYS = [
  { k: "mon", label: "จ" },
  { k: "tue", label: "อ" },
  { k: "wed", label: "พ" },
  { k: "thu", label: "พฤ" },
  { k: "fri", label: "ศ" },
  { k: "sat", label: "ส" },
  { k: "sun", label: "อา" },
];

export default function VendorOnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("FOOD_MAIN");
  const [booth, setBooth] = useState("");
  const [open, setOpen] = useState("17:00");
  const [close, setClose] = useState("22:00");
  const [days, setDays] = useState<Set<string>>(new Set(DAYS.slice(0, 5).map((d) => d.k)));

  function toggleDay(k: string) {
    setDays((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  return (
    <div className="container-page py-6 max-w-2xl">
      <h1 className="heading-hero">ตั้งร้านใหม่</h1>
      <p className="text-sm text-muted">3 ขั้นตอน ใช้เวลา ~3 นาที</p>

      <ol className="flex gap-2 mt-4 text-xs">
        {["ข้อมูลร้าน", "ตำแหน่ง", "เวลาเปิด-ปิด"].map((l, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const done = step > n;
          return (
            <li
              key={l}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
                active
                  ? "border-primary bg-primary text-white"
                  : done
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted"
              }`}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/30 text-[10px] font-bold">
                {done ? <CheckIcon className="h-3 w-3" /> : n}
              </span>
              {l}
            </li>
          );
        })}
      </ol>

      <section className="card p-6 mt-6 space-y-4 min-h-[320px]">
        {step === 1 ? (
          <>
            <label className="block space-y-1">
              <span className="text-xs font-semibold">ชื่อร้าน</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น ก๋วยเตี๋ยวป้านวล"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            </label>
            <div>
              <span className="text-xs font-semibold">หมวดหมู่</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={`card p-3 text-left ${category === c.key ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className="text-2xl">{c.emoji}</div>
                    <div className="text-xs font-semibold">{c.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <div className="text-sm text-muted">
              ลากหมุดบนแผนที่จำลองเพื่อระบุตำแหน่งร้าน หรือกรอกเลขล็อก
            </div>
            <div className="grid place-items-center rounded-2xl bg-[linear-gradient(180deg,#F3E9D7,#F9F2E2)] border border-border p-8">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 rounded-xl bg-[url('/icon.svg')] bg-center bg-no-repeat bg-[length:64px_64px] opacity-30" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                  <div className="rounded-full bg-primary text-white px-3 py-1 text-xs font-semibold shadow-pop">
                    📍 ร้านของฉัน
                  </div>
                </div>
              </div>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-semibold">เลขล็อก (Booth Number)</span>
              <input
                value={booth}
                onChange={(e) => setBooth(e.target.value)}
                placeholder="เช่น A-12"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            </label>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-semibold">เวลาเปิด</span>
                <input
                  type="time"
                  value={open}
                  onChange={(e) => setOpen(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold">เวลาปิด</span>
                <input
                  type="time"
                  value={close}
                  onChange={(e) => setClose(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div>
              <span className="text-xs font-semibold">เปิดวันใดบ้าง</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAYS.map((d) => (
                  <button
                    type="button"
                    key={d.k}
                    onClick={() => toggleDay(d.k)}
                    className={`chip ${days.has(d.k) ? "chip-active" : ""}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </section>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => (Math.max(1, s - 1) as Step))}
          disabled={step === 1}
          className="btn-outline disabled:opacity-40"
        >
          ← ย้อนกลับ
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => (Math.min(3, s + 1) as Step))}
            className="btn-primary"
          >
            ต่อไป →
          </button>
        ) : (
          <Link href="/vendor/dashboard" className="btn-primary">
            เสร็จสิ้น — เข้า Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
