"""Lightweight SQLAlchemy engine for reading crowd + weather tables."""

from __future__ import annotations

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine

from .config import settings

_engine: Engine | None = None


def get_engine() -> Engine | None:
    global _engine
    if not settings.database_url:
        return None
    if _engine is None:
        _engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)
    return _engine


def load_hourly_snapshots(start: str, end: str) -> pd.DataFrame:
    engine = get_engine()
    if engine is None:
        return pd.DataFrame()
    sql = """
    SELECT
      chs."bucketStart"      AS bucket_start,
      chs."estimatedCount"   AS y,
      chs."dayOfWeek"        AS day_of_week,
      chs."hourOfDay"        AS hour_of_day,
      chs."isHoliday"        AS is_holiday,
      chs."activeFlashSales" AS active_flash_sales,
      chs."activeVendors"    AS active_vendors,
      ws."temperatureC"      AS temperature_c,
      ws."rainMm"            AS rain_mm,
      ws."condition"         AS weather_condition
    FROM public.crowd_hourly_snapshots chs
    LEFT JOIN public.weather_snapshots ws
      ON date_trunc('hour', ws."timestamp") = chs."bucketStart"
    WHERE chs."bucketStart" BETWEEN %(start)s AND %(end)s
    ORDER BY chs."bucketStart"
    """
    return pd.read_sql(sql, engine, params={"start": start, "end": end})


def upsert_forecast(rows: list[dict]) -> None:
    """Persist predictions so Next.js can read them without hitting FastAPI."""
    engine = get_engine()
    if engine is None or not rows:
        return
    with engine.begin() as conn:
        conn.execute(
            """
            INSERT INTO public.crowd_forecasts
              (id, "targetTime", "predictedCount", "confidenceLower",
               "confidenceUpper", "busyLevel", "modelVersion", "generatedAt")
            VALUES
              (gen_random_uuid(), :target_time, :count, :lower, :upper, :level, :version, now())
            ON CONFLICT ("targetTime", "modelVersion") DO UPDATE SET
              "predictedCount" = EXCLUDED."predictedCount",
              "confidenceLower" = EXCLUDED."confidenceLower",
              "confidenceUpper" = EXCLUDED."confidenceUpper",
              "busyLevel" = EXCLUDED."busyLevel",
              "generatedAt" = now()
            """,
            rows,
        )
