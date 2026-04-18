import { NextResponse } from "next/server";
import { generateWeeklyForecast } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const hours = Math.min(168, Math.max(1, Number(url.searchParams.get("hours") ?? 24)));
  const from = url.searchParams.get("from");
  const base = from ? new Date(from) : new Date();

  const forecast = generateWeeklyForecast(base).slice(0, hours);

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    model_version: "lgb_20260418_03",
    predictions: forecast.map((p) => ({
      time: p.time,
      count: p.count,
      lower: p.lower,
      upper: p.upper,
      level: p.level,
    })),
  });
}
