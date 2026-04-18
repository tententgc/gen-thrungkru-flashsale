import { prisma } from "@/lib/prisma";
import { ready, env } from "@/lib/env";
import { generateWeeklyForecast, bestTimesOnDate } from "@/lib/mock-data";
import type { CrowdForecastPoint } from "@/lib/types";

export async function getForecast(hours = 168): Promise<CrowdForecastPoint[]> {
  if (ready.forecast) {
    try {
      const res = await fetch(
        `${env.forecastServiceUrl}/forecast?hours=${hours}`,
        {
          headers: env.forecastServiceKey
            ? { "X-API-Key": env.forecastServiceKey }
            : {},
          next: { revalidate: 900 },
        },
      );
      if (res.ok) {
        const body = await res.json();
        const points = (body.predictions ?? []) as CrowdForecastPoint[];
        if (points.length > 0) return points;
      }
    } catch {
      // fall through
    }
  }

  if (ready.db && prisma) {
    try {
      const rows = await prisma.crowdForecast.findMany({
        where: { targetTime: { gte: new Date() } },
        orderBy: { targetTime: "asc" },
        take: hours,
      });
      if (rows.length > 0) {
        return rows.map((r) => ({
          time: r.targetTime.toISOString(),
          count: r.predictedCount,
          lower: r.confidenceLower,
          upper: r.confidenceUpper,
          level: r.busyLevel,
        }));
      }
    } catch {
      // DB unreachable — fall through to synthetic
    }
  }

  return generateWeeklyForecast().slice(0, hours);
}

export async function getBestTimes(date: Date, n = 3) {
  const forecast = await getForecast(72);
  return bestTimesOnDate(forecast, date, n);
}
