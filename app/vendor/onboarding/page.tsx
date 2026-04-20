"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { CheckIcon } from "@/components/icons";
import { completeOnboarding } from "@/lib/actions/vendor";
import { MARKET_CENTER } from "@/lib/geo";

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

function slugify(s: string) {
  const base = s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0E00-\u0E7F-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `shop-${Math.random().toString(36).slice(2, 8)}`;
}

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("FOOD_MAIN");
  const [booth, setBooth] = useState("");
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState("17:00");
  const [close, setClose] = useState("22:00");
  const [days, setDays] = useState<Set<string>>(
    new Set(DAYS.slice(0, 5).map((d) => d.k)),
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleDay(k: string) {
    setDays((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function finish() {
    setError(null);
    if (!name.trim()) {
      setStep(1);
      setError("กรุณากรอกชื่อร้าน");
      return;
    }
    const fd = new FormData();
    fd.set("shopName", name.trim());
    fd.set("slug", slugify(name));
    fd.set("category", category);
    fd.set("phone", phone.trim() || "0000000000");
    fd.set("logoEmoji", "🏪");
    fd.set("latitude", String(MARKET_CENTER.lat));
    fd.set("longitude", String(MARKET_CENTER.lng));
    if (booth.trim()) fd.set("boothNumber", booth.trim());
    fd.set("openTime", open);
    fd.set("closeTime", close);
    for (const d of days) fd.append("openDays", d);

    startTransition(async () => {
      try {
        await completeOnboarding(fd);
        // completeOnboarding redirects on success — if it returns, it failed.
      } catch (e) {
        // NEXT_REDIRECT throws to signal the redirect; treat as success.
        if (e instanceof Error && /NEXT_REDIRECT/.test(e.message)) {
          router.push("/vendor/dashboard");
          return;
        }
        setError(e instanceof Error ? e.message : "ไม่สามารถสร้างร้านได้");
      }
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
            <label className="block space-y-1">
              <span className="text-xs font-semibold">
                เบอร์โทร (ไม่บังคับ)
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812345678"
                inputMode="tel"
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
              <span className="text-xs font-semibold">
                เลขล็อก (Booth Number)
              </span>
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

        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </section>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => (Math.max(1, s - 1) as Step))}
          disabled={step === 1 || isPending}
          className="btn-outline disabled:opacity-40"
        >
          ← ย้อนกลับ
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep((s) => (Math.min(3, s + 1) as Step))}
            disabled={step === 1 && !name.trim()}
            className="btn-primary disabled:opacity-40"
          >
            ต่อไป →
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={isPending}
            className="btn-primary disabled:opacity-50"
          >
            {isPending ? "กำลังสร้าง..." : "เสร็จสิ้น — เข้า Dashboard"}
          </button>
        )}
      </div>
    </div>
  );
}
