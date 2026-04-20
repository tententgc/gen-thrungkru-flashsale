"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { MapboxMap as MapboxMapType } from "./mapbox-map";

type Props = ComponentProps<typeof MapboxMapType>;

// Lazy-load mapbox-gl (~400KB client dep) only after hydration on pages that
// actually render the map. Keeps the initial Turbopack compile + first-page
// client bundle lean.
const MapboxMapInner = dynamic<Props>(
  () => import("./mapbox-map").then((m) => m.MapboxMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full overflow-hidden rounded-2xl border border-border bg-border/40 animate-pulse"
        style={{ height: 480 }}
      />
    ),
  },
);

export function MapboxMap(props: Props) {
  return <MapboxMapInner {...props} />;
}
