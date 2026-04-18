import { NextResponse } from "next/server";
import { getForecast } from "@/lib/data/crowd";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const hours = Math.min(168, Math.max(1, Number(url.searchParams.get("hours") ?? 24)));
  const predictions = await getForecast(hours);
  return NextResponse.json({
    generated_at: new Date().toISOString(),
    model_version: "lgb_20260418_03",
    predictions,
  });
}
