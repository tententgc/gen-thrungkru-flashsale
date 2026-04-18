"use client";

import type { CrowdForecastPoint } from "@/lib/types";
import { useMemo, useState } from "react";

const DAY_LABELS_TH = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function cellColor(value: number, max: number): string {
  const t = Math.min(1, Math.max(0, value / max));
  // interpolate HSL: cool green → warm red
  const h = 170 - 170 * t; // 170 → 0
  const s = 60;
  const l = 92 - 50 * t; // 92 → 42
  return `hsl(${h}deg ${s}% ${l}%)`;
}

type Cell = {
  day: number;
  hour: number;
  value: number;
  level: string;
};

export function CrowdHeatmap({ points }: { points: CrowdForecastPoint[] }) {
  const { cells, max } = useMemo(() => {
    const grid: (Cell | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => null),
    );
    let m = 0;
    for (const p of points) {
      const d = new Date(p.time);
      const day = d.getDay();
      const hour = d.getHours();
      if (grid[day][hour] === null) {
        grid[day][hour] = {
          day,
          hour,
          value: p.count,
          level: p.level,
        };
      }
      if (p.count > m) m = p.count;
    }
    return { cells: grid, max: Math.max(1, m) };
  }, [points]);

  const [hover, setHover] = useState<Cell | null>(null);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <h3 className="heading-section">ความหนาแน่นของตลาด 7 วัน</h3>
          <p className="text-sm text-muted">
            พยากรณ์รายชั่วโมง — สีเข้ม = คนเยอะ, สีอ่อน = คนน้อย
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span>น้อย</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.75, 1].map((t) => (
              <span
                key={t}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: cellColor(t * max, max) }}
              />
            ))}
          </div>
          <span>เยอะ</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[560px]">
          <div className="grid" style={{ gridTemplateColumns: "28px repeat(24, 1fr)" }}>
            <div />
            {HOURS.map((h) => (
              <div key={h} className="text-center text-[9px] text-muted leading-none">
                {h % 3 === 0 ? h : ""}
              </div>
            ))}
            {DAY_LABELS_TH.map((label, d) => (
              <FragmentRow
                key={d}
                label={label}
                cells={cells[d]}
                max={max}
                onHover={setHover}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-[2rem] text-xs text-muted">
        {hover
          ? `${DAY_LABELS_TH[hover.day]} · ${String(hover.hour).padStart(2, "0")}:00 — คาดว่า ${hover.value} คน (${labelLevel(hover.level)})`
          : "แตะช่องเพื่อดูรายละเอียด"}
      </div>
    </div>
  );
}

function FragmentRow({
  label,
  cells,
  max,
  onHover,
}: {
  label: string;
  cells: (Cell | null)[];
  max: number;
  onHover: (c: Cell | null) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-end pr-2 text-[11px] font-medium text-muted">
        {label}
      </div>
      {cells.map((c, h) => (
        <button
          key={h}
          onMouseEnter={() => c && onHover(c)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => c && onHover(c)}
          onBlur={() => onHover(null)}
          className="m-[1px] h-6 rounded-[3px] outline-none transition-transform hover:scale-110 focus:ring-2 focus:ring-primary"
          style={{ backgroundColor: c ? cellColor(c.value, max) : "#F1ECE3" }}
          aria-label={c ? `${label} ${h}:00 ${c.value} คน` : `${label} ${h}:00`}
        />
      ))}
    </>
  );
}

function labelLevel(level: string) {
  switch (level) {
    case "VERY_QUIET":
      return "เงียบมาก";
    case "QUIET":
      return "คนน้อย";
    case "MODERATE":
      return "ปานกลาง";
    case "BUSY":
      return "คนเยอะ";
    case "VERY_BUSY":
      return "คนเยอะมาก";
    case "PEAK":
      return "พีค";
    default:
      return level;
  }
}
