import type { BusyLevel } from "@/lib/types";

const MAP: Record<BusyLevel, { label: string; color: string; bg: string }> = {
  VERY_QUIET: { label: "เงียบมาก", color: "#2D7D6E", bg: "#D9EEE9" },
  QUIET: { label: "คนน้อย", color: "#2D7D6E", bg: "#E6F2EF" },
  MODERATE: { label: "ปานกลาง", color: "#B58F24", bg: "#FFF3D1" },
  BUSY: { label: "คนเยอะ", color: "#A53A24", bg: "#FADFD7" },
  VERY_BUSY: { label: "คนเยอะมาก", color: "#A53A24", bg: "#F3B3A3" },
  PEAK: { label: "พีค 🔥", color: "#FFFFFF", bg: "#C84B31" },
};

export function BusyBadge({ level, size = "sm" }: { level: BusyLevel; size?: "sm" | "md" | "lg" }) {
  const m = MAP[level];
  const sizeClass =
    size === "lg"
      ? "text-sm px-3 py-1"
      : size === "md"
        ? "text-xs px-2.5 py-0.5"
        : "text-[11px] px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass}`}
      style={{ color: m.color, backgroundColor: m.bg }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: m.color }}
      />
      {m.label}
    </span>
  );
}
