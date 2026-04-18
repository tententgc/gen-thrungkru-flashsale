"use client";

import { useEffect, useState } from "react";

function diffMs(to: Date) {
  return to.getTime() - Date.now();
}

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
  const end = new Date(endAt);
  const start = startAt ? new Date(startAt) : null;
  const [msLeft, setMsLeft] = useState<number>(() => diffMs(end));
  const [notStarted, setNotStarted] = useState<boolean>(() =>
    start ? Date.now() < start.getTime() : false,
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      const msToEnd = diffMs(end);
      setMsLeft(msToEnd);
      if (start) setNotStarted(Date.now() < start.getTime());
      onTick?.(msToEnd);
    }, 1000);
    return () => window.clearInterval(id);
  }, [end, start, onTick]);

  const target = notStarted && start ? start : end;
  const ms = Math.max(0, target.getTime() - Date.now());
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
