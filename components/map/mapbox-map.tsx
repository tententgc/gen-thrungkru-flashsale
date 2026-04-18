"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Vendor } from "@/lib/types";
import { categoryMeta } from "@/lib/categories";
import { MARKET_CENTER, haversineMeters, formatDistance } from "@/lib/geo";
import { PinIcon, StarIcon } from "@/components/icons";

export function MapboxMap({
  vendors,
  liveSaleVendorIds,
  token,
  height = 480,
}: {
  vendors: Vendor[];
  liveSaleVendorIds: string[];
  token: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const liveSet = useMemo(() => new Set(liveSaleVendorIds), [liveSaleVendorIds]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [MARKET_CENTER.lng, MARKET_CENTER.lat],
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      }),
      "top-right",
    );
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: mapboxgl.Marker[] = [];

    function add() {
      if (!map) return;
      for (const v of vendors) {
        const cat = categoryMeta(v.category);
        const isLive = liveSet.has(v.id);
        const el = document.createElement("button");
        el.className = "vendor-marker";
        el.setAttribute("aria-label", v.shopName);
        el.style.cssText = `
          position: relative;
          width: 34px; height: 34px;
          display: grid; place-items: center;
          background: ${cat.color};
          border: 3px solid #fff;
          border-radius: 999px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.25);
          font-size: 16px;
          cursor: pointer;
          padding: 0;
        `;
        el.textContent = v.logoEmoji;
        if (isLive) {
          const pulse = document.createElement("span");
          pulse.style.cssText = `
            position: absolute; inset: -6px;
            border-radius: 999px;
            background: ${cat.color};
            opacity: 0.3;
            animation: pulse-ring 1.6s ease-out infinite;
          `;
          el.appendChild(pulse);
        }
        el.addEventListener("click", () => setSelected(v));
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([v.longitude, v.latitude])
          .addTo(map);
        markers.push(marker);
      }
    }

    if (map.loaded()) add();
    else map.once("load", add);

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [vendors, liveSet]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-card">
      <div ref={containerRef} style={{ height }} />
      {selected ? (
        <div className="absolute inset-x-3 bottom-3 z-10 animate-slide-up">
          <div className="card flex gap-3 p-3 bg-surface/95 backdrop-blur">
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
                {liveSet.has(selected.id) ? (
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
              <p className="mt-1 line-clamp-2 text-xs text-muted">
                {selected.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button onClick={() => setSelected(null)} className="text-xs text-muted hover:text-ink">
                ปิด
              </button>
              <Link href={`/shops/${selected.slug}`} className="btn-primary text-xs">
                ดูร้าน
              </Link>
            </div>
          </div>
        </div>
      ) : null}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
