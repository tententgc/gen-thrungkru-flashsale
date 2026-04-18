"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { CheckIcon } from "@/components/icons";

type Prefs = {
  pushAll: boolean;
  flashSale: boolean;
  crowdAlert: boolean;
  radiusKm: 0.5 | 1 | 2 | 5;
  quietStart: string;
  quietEnd: string;
  categories: Set<string>;
};

export default function NotificationPrefsPage() {
  const [prefs, setPrefs] = useState<Prefs>({
    pushAll: true,
    flashSale: true,
    crowdAlert: true,
    radiusKm: 1,
    quietStart: "23:00",
    quietEnd: "07:00",
    categories: new Set(CATEGORIES.slice(0, 4).map((c) => c.key)),
  });

  function toggleCategory(key: string) {
    setPrefs((p) => {
      const next = new Set(p.categories);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...p, categories: next };
    });
  }

  return (
    <div className="container-page space-y-6 py-4 md:py-8 max-w-3xl">
      <header>
        <h1 className="heading-hero">ตั้งค่าการแจ้งเตือน</h1>
        <p className="text-sm text-muted">
          ควบคุมประเภท รัศมี และช่วงเวลาที่คุณอยากรับแจ้งเตือน
        </p>
      </header>

      <section className="card divide-y divide-border">
        <Toggle
          label="เปิดแจ้งเตือนทั้งหมด"
          description="ปิดจะไม่รับ push notification ทุกประเภท"
          checked={prefs.pushAll}
          onChange={(v) => setPrefs({ ...prefs, pushAll: v })}
        />
        <Toggle
          label="Flash Sale ใกล้ตัว"
          description="แจ้งเตือนเมื่อร้านในรัศมีปล่อย Flash Sale"
          checked={prefs.flashSale}
          onChange={(v) => setPrefs({ ...prefs, flashSale: v })}
          disabled={!prefs.pushAll}
        />
        <Toggle
          label="ความหนาแน่นของตลาด"
          description='เช่น "ตอนนี้คนน้อยแล้ว" หรือ "พรุ่งนี้คาดว่าคนเยอะมาก"'
          checked={prefs.crowdAlert}
          onChange={(v) => setPrefs({ ...prefs, crowdAlert: v })}
          disabled={!prefs.pushAll}
        />
      </section>

      <section className="card p-5 space-y-3">
        <div>
          <div className="font-semibold">รัศมีการแจ้งเตือน</div>
          <p className="text-xs text-muted">รับแจ้งเมื่ออยู่ในรัศมีจากตลาด</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[0.5, 1, 2, 5].map((r) => (
            <button
              key={r}
              onClick={() => setPrefs({ ...prefs, radiusKm: r as Prefs["radiusKm"] })}
              className={`chip ${prefs.radiusKm === r ? "chip-active" : ""}`}
            >
              {r < 1 ? `${r * 1000} ม.` : `${r} กม.`}
            </button>
          ))}
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <div>
          <div className="font-semibold">หมวดหมู่ที่สนใจ</div>
          <p className="text-xs text-muted">
            จะแจ้งเตือนเฉพาะร้านในหมวดที่เลือก (ค่าเริ่มต้น: ทุกหมวด)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = prefs.categories.has(c.key);
            return (
              <button
                key={c.key}
                onClick={() => toggleCategory(c.key)}
                className={`chip ${active ? "chip-active" : ""}`}
              >
                {active ? <CheckIcon className="h-3 w-3" /> : null}
                {c.emoji} {c.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card p-5 space-y-3">
        <div>
          <div className="font-semibold">Quiet Hours</div>
          <p className="text-xs text-muted">
            ช่วงเวลาที่ระบบจะไม่ส่ง push (in-app ยังอยู่)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">จาก</label>
          <input
            type="time"
            value={prefs.quietStart}
            onChange={(e) => setPrefs({ ...prefs, quietStart: e.target.value })}
            className="rounded-lg border border-border bg-surface px-3 py-1 text-sm"
          />
          <label className="text-sm">ถึง</label>
          <input
            type="time"
            value={prefs.quietEnd}
            onChange={(e) => setPrefs({ ...prefs, quietEnd: e.target.value })}
            className="rounded-lg border border-border bg-surface px-3 py-1 text-sm"
          />
        </div>
      </section>

      <div className="flex justify-end gap-2">
        <button className="btn-outline">ยกเลิก</button>
        <button className="btn-primary">บันทึกการตั้งค่า</button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-5 cursor-pointer ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex-1">
        <div className="font-semibold">{label}</div>
        {description ? <div className="text-xs text-muted mt-0.5">{description}</div> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
