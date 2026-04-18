"use client";

import { useMemo } from "react";
import type { CrowdForecastPoint } from "@/lib/types";

const W = 720;
const H = 220;
const PADDING = { top: 20, right: 16, bottom: 30, left: 36 };

export function CrowdLineChart({ points }: { points: CrowdForecastPoint[] }) {
  const { linePath, areaPath, markers, maxCount, nowIdx } = useMemo(() => {
    if (points.length === 0) {
      return {
        linePath: "",
        areaPath: "",
        markers: [],
        maxCount: 1,
        nowIdx: 0,
      };
    }
    const maxCount = Math.max(...points.map((p) => p.upper), 1);
    const innerW = W - PADDING.left - PADDING.right;
    const innerH = H - PADDING.top - PADDING.bottom;

    const x = (i: number) => PADDING.left + (i / (points.length - 1)) * innerW;
    const y = (c: number) => PADDING.top + innerH - (c / maxCount) * innerH;

    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(p.count).toFixed(2)}`)
      .join(" ");

    const areaPath = [
      ...points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(2)} ${y(p.upper).toFixed(2)}`),
      ...[...points]
        .reverse()
        .map((p, i) => {
          const idx = points.length - 1 - i;
          return `L ${x(idx).toFixed(2)} ${y(p.lower).toFixed(2)}`;
        }),
      "Z",
    ].join(" ");

    const markers = [0, 6, 12, 18, 23].map((i) => ({
      x: x(i),
      y: H - PADDING.bottom + 14,
      label: new Date(points[i].time).getHours() + ":00",
    }));

    return { linePath, areaPath, markers, maxCount, nowIdx: 0 };
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="card grid min-h-[240px] place-items-center p-6 text-sm text-muted">
        ไม่มีข้อมูลพยากรณ์
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="heading-section">พยากรณ์ 24 ชั่วโมงถัดไป</h3>
          <p className="text-sm text-muted">
            เส้นหลัก = ค่าคาดการณ์ · พื้นที่แรเงา = ช่วงความมั่นใจ 80%
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-full bg-primary" />
            predicted
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-full bg-primary/30" />
            confidence
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Forecast line chart">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y =
            PADDING.top + (1 - t) * (H - PADDING.top - PADDING.bottom);
          return (
            <g key={t}>
              <line
                x1={PADDING.left}
                x2={W - PADDING.right}
                y1={y}
                y2={y}
                stroke="#E5E0D8"
                strokeDasharray="3 4"
              />
              <text x={8} y={y + 4} fontSize="10" fill="#6B7280">
                {Math.round(maxCount * t)}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="#C84B3133" />
        <path d={linePath} fill="none" stroke="#C84B31" strokeWidth={2} />
        {/* now marker */}
        <circle cx={PADDING.left + 0} cy={0} r={0} />
        {markers.map((m, i) => (
          <text key={i} x={m.x} y={m.y} fontSize="10" fill="#6B7280" textAnchor="middle">
            {m.label}
          </text>
        ))}
        <g transform={`translate(${PADDING.left}, ${PADDING.top - 6})`}>
          <circle r={4} fill="#C84B31" stroke="#FFF" strokeWidth={2} />
          <text x={8} y={4} fontSize="10" fill="#C84B31" fontWeight={600}>
            ตอนนี้
          </text>
        </g>
      </svg>
    </div>
  );
}
