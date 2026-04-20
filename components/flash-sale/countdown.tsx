"use client";

import { useEffect, useRef, useState } from "react";

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function Countdown({
  endAt,
  startAt,
  onTick,
  compact = false,
}: {
  endAt: string;
  startAt?: string;
  onTick?: (msLeft: number) => void;
  compact?: boolean;
}) {
  // Use numeric timestamps as effect deps so Date identity doesn't restart the
  // interval each render.
  const endMs = new Date(endAt).getTime();
  const startMs = startAt ? new Date(startAt).getTime() : null;
  const [mounted, setMounted] = useState(false);
  const [msLeft, setMsLeft] = useState<number>(0);
  const [notStarted, setNotStarted] = useState<boolean>(false);

  // Keep the latest onTick in a ref — inline callbacks from the parent would
  // otherwise tear down and rebuild the interval on every render.
  const onTickRef = useRef(onTick);
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const msToEnd = endMs - Date.now();
      setMsLeft(msToEnd);
      if (startMs != null) setNotStarted(Date.now() < startMs);
      onTickRef.current?.(msToEnd);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [endMs, startMs]);

  const target = notStarted && startMs != null ? startMs : endMs;
  const ms = mounted ? Math.max(0, target - Date.now()) : 0;
  const totalSec = Math.floor(ms / 1000);
  const hh = Math.floor(totalSec / 3600);
  const mm = Math.floor((totalSec % 3600) / 60);
  const ss = totalSec % 60;

  const label = notStarted ? "เริ่มใน" : msLeft <= 0 ? "จบแล้ว" : "เหลือเวลา";
  const urgent = !notStarted && msLeft > 0 && msLeft < 10 * 60_000;

  if (compact) {
    return (
      <span className="font-mono tabular-nums text-sm font-semibold">
        {hh > 0 ? `${pad(hh)}:` : ""}
        {pad(mm)}:{pad(ss)}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
        urgent ? "bg-flash text-white animate-pulse-flash" : "bg-primary-50 text-primary-700"
      }`}
    >
      <span className="text-xs opacity-80">{label}</span>
      <span className="font-mono tabular-nums">
        {hh > 0 ? `${pad(hh)}:` : ""}
        {pad(mm)}:{pad(ss)}
      </span>
    </div>
  );
}
