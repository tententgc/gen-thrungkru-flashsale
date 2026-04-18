import { NextResponse } from "next/server";
import { getForecast } from "@/lib/data/crowd";

export const dynamic = "force-dynamic";

export async function GET() {
  const forecast = await getForecast(4);
  const now = forecast[0];
  return NextResponse.json({
    now,
    next_3h: forecast.slice(1, 4),
    generated_at: new Date().toISOString(),
    model_version: "lgb_20260418_03",
  });
}
