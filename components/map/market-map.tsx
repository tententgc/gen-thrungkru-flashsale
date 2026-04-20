"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Vendor, ShopCategory } from "@/lib/types";
import { categoryMeta } from "@/lib/categories";
import { MARKET_CENTER, haversineMeters, formatDistance } from "@/lib/geo";
import { PinIcon, StarIcon } from "@/components/icons";

/**
 * Lightweight SVG-based market map.
 * - No external tile provider (demo uses stylized market bounds).
 * - Markers are placed inside the labeled zone band that matches their category,
 *   spread horizontally so they don't overlap. (Real lat/lng is mock-jittered
 *   around MARKET_CENTER, so projecting it produces a useless pile in the middle.)
 * - Markers clickable → popup with shop metadata.
 */

const W = 600;
const H = 520;

const PAD_X = 40;
const BAND_TOP = 70;
const BAND_GAP = 24;
const HEADER_H = 28;
const ROW_H = 56;
const MARKER_R = 14;
const MARKER_PITCH = 56;

type ZoneKey = "A" | "B" | "C";

const ZONES: { key: ZoneKey; label: string }[] = [
  { key: "A", label: "โซน A · อาหาร" },
  { key: "B", label: "โซน B · เครื่องดื่ม / ของหวาน" },
  { key: "C", label: "โซน C/D/E · ทั่วไป" },
];

const CATEGORY_TO_ZONE: Record<ShopCategory, ZoneKey> = {
  FOOD_MAIN: "A",
  FOOD_STREET: "A",
  FRUITS: "A",
  DRINKS: "B",
  DESSERTS: "B",
  CLOTHES: "C",
  ACCESSORIES: "C",
  COSMETICS: "C",
  GROCERIES: "C",
  OTHER: "C",
};

type Placed = {
  x: number;
  y: number;
  bandTop: number;
  bandHeight: number;
};

type Layout = {
  positions: Map<string, Placed>;
  bands: { key: ZoneKey; label: string; y: number; height: number; count: number }[];
  totalHeight: number;
};

function layoutVendors(vendors: Vendor[]): Layout {
  const byZone: Record<ZoneKey, Vendor[]> = { A: [], B: [], C: [] };
  for (const v of vendors) byZone[CATEGORY_TO_ZONE[v.category] ?? "C"].push(v);

  const innerW = W - PAD_X * 2 - 24;
  const perRow = Math.max(1, Math.floor(innerW / MARKER_PITCH));

  const positions = new Map<string, Placed>();
  const bands: Layout["bands"] = [];
  let cursor = BAND_TOP;

  for (const { key, label } of ZONES) {
    const list = byZone[key];
    const rows = Math.max(1, Math.ceil(list.length / perRow));
    const bandHeight = HEADER_H + rows * ROW_H;
    const bandTop = cursor;

    list.forEach((v, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const inThisRow = Math.min(perRow, list.length - row * perRow);
      const span = innerW;
      const slot = inThisRow === 1 ? span / 2 : (span / (inThisRow - 1)) * col;
      const x = PAD_X + 12 + slot;
      const y = bandTop + HEADER_H + row * ROW_H + ROW_H / 2;
      positions.set(v.id, { x, y, bandTop, bandHeight });
    });

    bands.push({ key, label, y: bandTop, height: bandHeight, count: list.length });
    cursor += bandHeight + BAND_GAP;
  }

  return { positions, bands, totalHeight: cursor };
}

export function MarketMap({
  vendors,
  liveVendorIds = [],
  height = 480,
  showLegend = true,
}: {
  vendors: Vendor[];
  liveVendorIds?: string[];
  height?: number;
  showLegend?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const liveSaleVendorIds = useMemo(
    () => new Set(liveVendorIds),
    [liveVendorIds],
  );
  const layout = useMemo(() => layoutVendors(vendors), [vendors]);
  const viewH = Math.max(H, layout.totalHeight + 24);
  const selected = vendors.find((v) => v.id === selectedId);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,#F6ECD8_0%,#FBF4E4_100%)] shadow-card">
      <svg
        viewBox={`0 0 ${W} ${viewH}`}
        width="100%"
        height={height}
        role="img"
        aria-label="แผนที่ตลาดทุ่งครุ 61"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M40 0L0 0L0 40"
              fill="none"
              stroke="#E5E0D8"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width={W} height={viewH} fill="url(#grid)" />

        {/* zone bands */}
        {layout.bands.map((b) => (
          <g key={b.key}>
            <rect
              x={PAD_X}
              y={b.y}
              width={W - PAD_X * 2}
              height={b.height}
              rx={18}
              fill="#FFFFFF"
              stroke="#E5E0D8"
            />
            <text
              x={PAD_X + 16}
              y={b.y + 19}
              fill="#8B7A5E"
              fontSize="13"
              fontWeight={700}
            >
              {b.label}
            </text>
            <text
              x={W - PAD_X - 16}
              y={b.y + 19}
              fill="#A89576"
              fontSize="11"
              textAnchor="end"
            >
              {b.count} ร้าน
            </text>
          </g>
        ))}

        {/* vendor markers */}
        {vendors.map((v) => {
          const pos = layout.positions.get(v.id);
          if (!pos) return null;
          const { x, y } = pos;
          const cat = categoryMeta(v.category);
          const isLive = liveSaleVendorIds.has(v.id);
          const isSelected = selectedId === v.id;
          return (
            <g
              key={v.id}
              transform={`translate(${x} ${y})`}
              className="cursor-pointer"
              onClick={() => setSelectedId(v.id)}
            >
              {isLive ? (
                <circle r={MARKER_R + 8} fill={cat.color} opacity="0.18">
                  <animate
                    attributeName="r"
                    values={`${MARKER_R + 4};${MARKER_R + 12};${MARKER_R + 4}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              ) : null}
              <circle
                r={isSelected ? MARKER_R + 4 : MARKER_R}
                fill={cat.color}
                stroke="#FFF"
                strokeWidth={3}
              />
              <text
                textAnchor="middle"
                y={5}
                fontSize={isSelected ? "17" : "15"}
                style={{ pointerEvents: "none" }}
              >
                {v.logoEmoji}
              </text>
              <text
                textAnchor="middle"
                y={MARKER_R + 14}
                fontSize="10"
                fontWeight={600}
                fill="#6B5A3F"
                style={{ pointerEvents: "none" }}
              >
                {v.boothNumber}
              </text>
            </g>
          );
        })}
      </svg>

      {selected ? (
        <div className="absolute inset-x-3 bottom-3 z-10 animate-slide-up">
          <div className="card flex gap-3 p-3">
            <div
              className="grid h-16 w-16 shrink-0 place-items-center rounded-xl text-3xl"
              style={{
                background: `linear-gradient(135deg, ${categoryMeta(selected.category).color}30, ${categoryMeta(selected.category).color}10)`,
              }}
            >
              {selected.logoEmoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-bold">{selected.shopName}</h4>
                {liveSaleVendorIds.has(selected.id) ? (
                  <span className="badge-flash animate-pulse-flash">Live</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <PinIcon className="h-3 w-3" /> {selected.boothNumber}
                <span>·</span>
                <StarIcon className="h-3 w-3 text-secondary" />
                <span>{selected.rating.toFixed(1)}</span>
                <span>·</span>
                <span>
                  {formatDistance(
                    haversineMeters(MARKET_CENTER, {
                      lat: selected.latitude,
                      lng: selected.longitude,
                    }),
                  )}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{selected.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-muted hover:text-ink"
              >
                ปิด
              </button>
              <Link href={`/shops/${selected.slug}`} className="btn-primary text-xs">
                ดูร้าน
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {showLegend ? (
        <div className="absolute right-3 top-3 hidden rounded-xl bg-surface/95 p-2 text-[11px] shadow-card sm:block">
          <div className="mb-1 font-semibold text-ink">หมวดหมู่</div>
          <ul className="space-y-1">
            {["FOOD_MAIN", "FOOD_STREET", "DRINKS", "DESSERTS"].map((k) => {
              const c = categoryMeta(k as Vendor["category"]);
              return (
                <li key={k} className="flex items-center gap-1">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span>{c.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
