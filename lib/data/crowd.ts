import { cache } from "react";
import { generateWeeklyForecast, bestTimesOnDate } from "@/lib/mock-data";
import type { CrowdForecastPoint } from "@/lib/types";

// Crowd forecast is fully synthesised from lib/mock-data.generateWeeklyForecast
// — a deterministic sinusoidal busyness curve shaped by the day of week.
// Zero network, zero DB — keeps dev + prod snappy and unblocks boot even when
// the upstream forecast service or Supabase are unreachable. To plug the real
// LightGBM model back in, wrap this with a timed fetch + DB fallback; the
// callers (getForecast, getBestTimes) don't need to change.

const MAX_HOURS = 168;

const baseline = (): CrowdForecastPoint[] =>
  generateWeeklyForecast().slice(0, MAX_HOURS);

export const getForecast = cache(
  async (hours = MAX_HOURS): Promise<CrowdForecastPoint[]> => {
    const clamped = Math.min(Math.max(hours, 1), MAX_HOURS);
    return baseline().slice(0, clamped);
  },
);

export const getBestTimes = cache(async (date: Date, n = 3) => {
  const series = baseline();
  return bestTimesOnDate(series, date, n);
});
