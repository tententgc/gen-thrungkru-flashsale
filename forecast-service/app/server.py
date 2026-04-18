"""FastAPI serving entry point."""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from .config import settings
from .db import load_hourly_snapshots, upsert_forecast
from .model import load_latest, predict, train
from .synthetic import synthetic_forecast


def _auth(x_api_key: str | None = Header(default=None)) -> None:
    if settings.api_key and x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="bad api key")


def _train_and_publish() -> None:
    end = datetime.utcnow()
    start = end - timedelta(days=60)
    df = load_hourly_snapshots(start.isoformat(), end.isoformat())
    if df.empty or len(df) < 24 * 7:
        return
    model = train(df)
    model.save(settings.model_dir)

    # persist 168h forecast to DB for Next.js fallback
    forecast = predict(model, df, 168)
    upsert_forecast(
        [
            {
                "target_time": p["time"],
                "count": p["count"],
                "lower": p["lower"],
                "upper": p["upper"],
                "level": p["level"],
                "version": model.version,
            }
            for p in forecast
        ]
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        _train_and_publish,
        trigger="cron",
        hour=settings.retrain_hour,
        minute=0,
        id="daily-retrain",
    )
    scheduler.start()
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


app = FastAPI(title="ThungKhru61 Forecast", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "ok": True,
        "model_loaded": load_latest() is not None,
        "has_db": bool(settings.database_url),
    }


@app.get("/forecast", dependencies=[Depends(_auth)])
def forecast_endpoint(hours: int = 24, _from: str | None = None):
    hours = max(1, min(hours, 168))
    model = load_latest()
    if model is None:
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "model_version": "synthetic_coldstart",
            "predictions": synthetic_forecast(hours),
        }
    end = datetime.utcnow()
    start = end - timedelta(days=14)
    df = load_hourly_snapshots(start.isoformat(), end.isoformat())
    if df.empty:
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "model_version": "synthetic_coldstart",
            "predictions": synthetic_forecast(hours),
        }
    preds = predict(model, df, hours)
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "model_version": model.version,
        "mae": model.mae,
        "mape": model.mape,
        "predictions": preds,
    }


@app.get("/forecast/now", dependencies=[Depends(_auth)])
def forecast_now():
    resp = forecast_endpoint(hours=4)
    return {
        "now": resp["predictions"][0],
        "next_3h": resp["predictions"][1:4],
        "generated_at": resp["generated_at"],
        "model_version": resp["model_version"],
    }


@app.post("/forecast/retrain", dependencies=[Depends(_auth)])
def retrain_endpoint():
    _train_and_publish()
    model = load_latest()
    if model is None:
        return {"ok": False, "reason": "not enough data"}
    return {
        "ok": True,
        "version": model.version,
        "mae": model.mae,
        "mape": model.mape,
    }
