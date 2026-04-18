"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Vendor } from "@/lib/types";
import { categoryMeta } from "@/lib/categories";
import { MARKET_CENTER, haversineMeters, formatDistance } from "@/lib/geo";
import { activeFlashSales } from "@/lib/mock-data";
import { PinIcon, StarIcon } from "@/components/icons";

/**
 * Lightweight SVG-based market map.
 * - No external tile provider (demo uses stylized market bounds).
 * - Vendors are projected onto a 600x480 canvas using an equirectangular approx.
 * - Markers clickable → popup with shop metadata.
 *
 * The real Sprint 4 impl will swap this for Mapbox GL JS + custom style,
 * but the data contract + marker behavior lines up 1:1.
 */

const W = 600;
const H = 480;
const METERS_PER_DEG_LAT = 111_000;

function project(v: { lat: number; lng: number }, zoomMeters = 600) {
  const metersPerDegLng = 111_000 * Math.cos((MARKET_CENTER.lat * Math.PI) / 180);
  const dx = (v.lng - MARKET_CENTER.lng) * metersPerDegLng;
  const dy = (v.lat - MARKET_CENTER.lat) * METERS_PER_DEG_LAT;
  const x = W / 2 + (dx / zoomMeters) * (W / 2);
  // SVG y axis is inverted relative to geo
  const y = H / 2 - (dy / zoomMeters) * (H / 2);
  return { x, y };
}

export function MarketMap({
  vendors,
  height = 480,
  showLegend = true,
}: {
  vendors: Vendor[];
  height?: number;
  showLegend?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const liveSaleVendorIds = useMemo(
    () => new Set(activeFlashSales().map((fs) => fs.vendorId)),
    [],
  );
  const selected = vendors.find((v) => v.id === selectedId);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-[linear-gradient(180deg,#F3E9D7_0%,#F9F2E2_100%)] shadow-card">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={height}
        role="img"
        aria-label="แผนที่ตลาดทุ่งครุ 61"
      >
        {/* background market boundary */}
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
        <rect width={W} height={H} fill="url(#grid)" />

        {/* faux alleys / market zones */}
        <g opacity="0.5">
          <rect x="90" y="70" width="420" height="70" rx="16" fill="#FFFFFF" stroke="#E5E0D8" />
          <rect x="90" y="200" width="420" height="70" rx="16" fill="#FFFFFF" stroke="#E5E0D8" />
          <rect x="90" y="330" width="420" height="70" rx="16" fill="#FFFFFF" stroke="#E5E0D8" />
          <text x="100" y="102" fill="#8B7A5E" fontSize="14" fontWeight={600}>โซน A · อาหาร</text>
          <text x="100" y="232" fill="#8B7A5E" fontSize="14" fontWeight={600}>โซน B · เครื่องดื่ม</text>
          <text x="100" y="362" fill="#8B7A5E" fontSize="14" fontWeight={600}>โซน C/D/E · อื่น ๆ</text>
        </g>

        {/* center marker: market entrance */}
        <g>
          <circle cx={W / 2} cy={H / 2} r={8} fill="#C84B31" opacity="0.25" />
          <circle cx={W / 2} cy={H / 2} r={4} fill="#C84B31" />
          <text
            x={W / 2 + 10}
            y={H / 2 + 4}
            fontSize="11"
            fill="#6B7280"
            fontWeight={500}
          >
            ทางเข้าตลาด
          </text>
        </g>

        {/* vendor markers */}
        {vendors.map((v) => {
          const { x, y } = project({ lat: v.latitude, lng: v.longitude });
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
                <circle r={20} fill={cat.color} opacity="0.2">
                  <animate
                    attributeName="r"
                    values="14;24;14"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              ) : null}
              <circle
                r={isSelected ? 16 : 12}
                fill={cat.color}
                stroke="#FFF"
                strokeWidth={3}
              />
              <text
                textAnchor="middle"
                y={5}
                fontSize={isSelected ? "16" : "13"}
                style={{ pointerEvents: "none" }}
              >
                {v.logoEmoji}
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
