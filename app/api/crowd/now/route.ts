import { NextResponse } from "next/server";
import { generateWeeklyForecast } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const forecast = generateWeeklyForecast();
  const now = forecast[0];
  return NextResponse.json({
    now: now,
    next_3h: forecast.slice(1, 4),
    generated_at: new Date().toISOString(),
    model_version: "lgb_20260418_03",
  });
}
