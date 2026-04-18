"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PRODUCTS, vendorById, generateWeeklyForecast } from "@/lib/mock-data";
import { formatTHB, percentOff } from "@/lib/utils";
import { Countdown } from "@/components/flash-sale/countdown";
import { CheckIcon, FlashIcon } from "@/components/icons";

type Step = 1 | 2 | 3 | 4;

const VENDOR_ID = "v-01";

export default function NewFlashSalePage() {
  const vendor = vendorById(VENDOR_ID);
  const vendorProducts = useMemo(
    () => PRODUCTS.filter((p) => p.vendorId === VENDOR_ID),
    [],
  );
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState("Happy Hour 2 ทุ่ม");
  const [description, setDescription] = useState("ลดพิเศษสำหรับลูกค้าหิวดึก");
  const [selected, setSelected] = useState<string[]>([vendorProducts[0]?.id].filter(Boolean) as string[]);
  const [prices, setPrices] = useState<Record<string, number>>(() => {
    const p = vendorProducts[0];
    return p ? { [p.id]: Math.round(p.regularPrice * 0.8) } : {};
  });
  const [durationMin, setDurationMin] = useState(60);

  const impact = useMemo(() => {
    // Simulate reach using the crowd forecast peak in the next `durationMin`
    const points = generateWeeklyForecast().slice(0, Math.ceil(durationMin / 60) + 1);
    const peak = Math.max(...points.map((p) => p.count));
    const nearbyMultiplier = 2.6;
    return Math.round(peak * nearbyMultiplier);
  }, [durationMin]);

  function toggleProduct(id: string) {
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      const p = vendorProducts.find((x) => x.id === id);
      if (p) setPrices((pp) => ({ ...pp, [id]: Math.round(p.regularPrice * 0.8) }));
      return [...s, id];
    });
  }

  function startAtIso() {
    return new Date().toISOString();
  }
  function endAtIso() {
    return new Date(Date.now() + durationMin * 60_000).toISOString();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-hero">
            <FlashIcon className="inline h-6 w-6 text-flash" /> สร้าง Flash Sale
          </h1>
          <p className="text-sm text-muted">ใช้เวลา ~3 นาที · 4 ขั้นตอน</p>
        </div>
        <Link href="/vendor/flash-sales" className="text-sm text-muted hover:text-ink">
          ยกเลิก
        </Link>
      </header>

      <ol className="flex flex-wrap gap-2 text-xs">
        {["เลือกสินค้า", "ตั้งราคา", "กำหนดเวลา", "ตรวจ & เผยแพร่"].map((label, i) => {
          const n = (i + 1) as Step;
          const state = step === n ? "active" : step > n ? "done" : "todo";
          return (
            <li
              key={label}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 ${
                state === "active"
                  ? "border-primary bg-primary text-white"
                  : state === "done"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted"
              }`}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/30 text-[10px] font-bold">
                {state === "done" ? <CheckIcon className="h-3 w-3" /> : n}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      <section className="card p-5 min-h-[320px]">
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <h2 className="heading-section">เลือกสินค้าที่จะเข้า Flash Sale</h2>
              <p className="text-sm text-muted">เลือกได้ 1 รายการขึ้นไป</p>
            </div>
            <ul className="grid gap-2 md:grid-cols-2">
              {vendorProducts.map((p) => {
                const isSelected = selected.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => toggleProduct(p.id)}
                      className={`card w-full flex items-center gap-3 p-3 text-left ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <div className="grid h-14 w-14 place-items-center rounded-xl bg-primary-50 text-2xl">
                        {p.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold line-clamp-1">{p.name}</div>
                        <div className="text-xs text-muted">{formatTHB(p.regularPrice)}</div>
                      </div>
                      {isSelected ? (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-white">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div>
              <h2 className="heading-section">ตั้งราคาลด</h2>
              <p className="text-sm text-muted">
                ราคาต้องต่ำกว่าราคาปกติอย่างน้อย 10%
              </p>
            </div>
            <ul className="space-y-3">
              {selected.map((id) => {
                const p = vendorProducts.find((x) => x.id === id);
                if (!p) return null;
                const price = prices[id] ?? Math.round(p.regularPrice * 0.8);
                const off = percentOff(p.regularPrice, price);
                const invalid = off < 10;
                return (
                  <li key={id} className="card p-3 flex flex-wrap items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary-50 text-2xl">
                      {p.imageEmoji}
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted">
                        ราคาปกติ {formatTHB(p.regularPrice)}
                      </div>
                    </div>
                    <label className="flex items-center gap-2">
                      <span className="text-xs text-muted">ราคาลด</span>
                      <input
                        type="number"
                        min={1}
                        value={price}
                        onChange={(e) =>
                          setPrices((pp) => ({ ...pp, [id]: Number(e.target.value) || 0 }))
                        }
                        className="w-24 rounded-lg border border-border bg-surface px-2 py-1 text-sm"
                      />
                      <span className="text-sm">฿</span>
                    </label>
                    <span
                      className={`chip ${
                        invalid ? "bg-danger text-white border-danger" : "chip-active"
                      }`}
                    >
                      {invalid ? "ต้อง ≥10%" : `-${off}%`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div>
              <h2 className="heading-section">กำหนดเวลา</h2>
              <p className="text-sm text-muted">
                ระยะเวลาต้องอยู่ในช่วง 15 นาที – 6 ชั่วโมง
              </p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-semibold">ชื่อโปรโมชั่น</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold">คำอธิบาย</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            </label>
            <div>
              <span className="text-sm font-semibold">ระยะเวลา (นาที)</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[15, 30, 60, 120, 240, 360].map((m) => (
                  <button
                    key={m}
                    onClick={() => setDurationMin(m)}
                    className={`chip ${durationMin === m ? "chip-active" : ""}`}
                  >
                    {m} นาที
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-accent/10 p-4">
              <div className="text-xs uppercase tracking-wider text-accent font-semibold">
                AI Smart Insight
              </div>
              <div className="font-semibold">
                คาดว่าจะมีผู้ชมประมาณ {impact} คน
              </div>
              <p className="text-xs text-muted">
                คำนวณจากพยากรณ์ความหนาแน่นคูณด้วย factor ของผู้ได้รับ push notification ในรัศมี 1 กม.
              </p>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-4">
            <div>
              <h2 className="heading-section">ตรวจสอบ & เผยแพร่</h2>
              <p className="text-sm text-muted">
                ตรวจรายละเอียดก่อนส่ง push notification ไปยังลูกค้า
              </p>
            </div>
            <div className="card p-4 space-y-3 bg-primary-50/40">
              <div className="flex items-center gap-2">
                <FlashIcon className="h-5 w-5 text-flash" />
                <div className="font-bold">{title}</div>
                <Countdown endAt={endAtIso()} startAt={startAtIso()} />
              </div>
              <p className="text-sm text-muted">{description}</p>
              <ul className="divide-y divide-border">
                {selected.map((id) => {
                  const p = vendorProducts.find((x) => x.id === id);
                  if (!p) return null;
                  const price = prices[id];
                  return (
                    <li key={id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{p.imageEmoji}</span>
                        <span>{p.name}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-primary">{formatTHB(price)}</span>
                        <span className="text-xs text-muted line-through">
                          {formatTHB(p.regularPrice)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="flex items-center justify-between text-xs text-muted pt-2 border-t border-border">
                <span>ผู้เห็นโดยประมาณ: {impact} คน</span>
                <span>ร้าน: {vendor?.shopName}</span>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => (Math.max(1, s - 1) as Step))}
          disabled={step === 1}
          className="btn-outline disabled:opacity-40"
        >
          ← ย้อนกลับ
        </button>
        {step < 4 ? (
          <button
            onClick={() => setStep((s) => (Math.min(4, s + 1) as Step))}
            disabled={step === 1 && selected.length === 0}
            className="btn-primary"
          >
            ต่อไป →
          </button>
        ) : (
          <Link href="/vendor/flash-sales" className="btn-primary">
            ✓ เผยแพร่ Flash Sale
          </Link>
        )}
      </div>
    </div>
  );
}
