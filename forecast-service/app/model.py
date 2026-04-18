"""LightGBM + Prophet ensemble training + prediction."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error

from .config import settings
from .features import NUM_FEATS, engineer

FEATURE_COLS = NUM_FEATS + ["wx_clear", "wx_clouds", "wx_rain", "wx_thunderstorm"]


@dataclass
class TrainedModel:
    version: str
    lgb_model: lgb.LGBMRegressor
    prophet_model: Prophet
    mae: float
    mape: float
    rmse: float
    feature_list: list[str]

    def save(self, directory: str) -> str:
        os.makedirs(directory, exist_ok=True)
        path = os.path.join(directory, f"{self.version}.joblib")
        joblib.dump(self, path)
        latest = os.path.join(directory, "latest.joblib")
        joblib.dump(self, latest)
        meta = {
            "version": self.version,
            "mae": self.mae,
            "mape": self.mape,
            "rmse": self.rmse,
            "trained_at": datetime.utcnow().isoformat(),
        }
        with open(os.path.join(directory, "latest.json"), "w") as fh:
            json.dump(meta, fh, indent=2)
        return path


def time_split(df: pd.DataFrame, test_hours: int = 24 * 14):
    n = len(df)
    if n < test_hours + 24:
        return df, df.iloc[0:0], df.iloc[0:0]
    test = df.iloc[-test_hours:]
    remainder = df.iloc[:-test_hours]
    val_hours = min(24 * 7, len(remainder) // 5)
    val = remainder.iloc[-val_hours:] if val_hours else remainder.iloc[0:0]
    train = remainder.iloc[:-val_hours] if val_hours else remainder
    return train, val, test


def train(df: pd.DataFrame) -> TrainedModel:
    feats = engineer(df).dropna()
    train_df, val_df, test_df = time_split(feats)

    X_train = train_df[FEATURE_COLS].values
    y_train = train_df["y"].values
    X_val = val_df[FEATURE_COLS].values if len(val_df) else None
    y_val = val_df["y"].values if len(val_df) else None
    X_test = test_df[FEATURE_COLS].values if len(test_df) else None
    y_test = test_df["y"].values if len(test_df) else None

    lgb_model = lgb.LGBMRegressor(
        n_estimators=600,
        learning_rate=0.05,
        num_leaves=63,
        min_child_samples=10,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=61,
    )
    eval_set = [(X_val, y_val)] if X_val is not None else None
    lgb_model.fit(X_train, y_train, eval_set=eval_set, callbacks=[lgb.early_stopping(40, verbose=False)] if eval_set else [])

    prophet_df = feats[["bucket_start", "y"]].rename(
        columns={"bucket_start": "ds", "y": "y"}
    )
    prophet_df["ds"] = prophet_df["ds"].dt.tz_convert(None)
    prophet = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=False,
        changepoint_prior_scale=0.15,
    )
    prophet.fit(prophet_df)

    if X_test is not None and y_test is not None and len(y_test):
        lgb_pred = lgb_model.predict(X_test)
        prophet_pred = prophet.predict(
            pd.DataFrame({"ds": test_df["bucket_start"].dt.tz_convert(None).values})
        )["yhat"].values
        ensemble = 0.7 * lgb_pred + 0.3 * prophet_pred
        mae = float(mean_absolute_error(y_test, ensemble))
        mape = float(mean_absolute_percentage_error(y_test, ensemble))
        rmse = float(np.sqrt(((y_test - ensemble) ** 2).mean()))
    else:
        mae = mape = rmse = 0.0

    version = f"lgb_ens_{datetime.utcnow().strftime('%Y%m%d_%H%M')}"
    return TrainedModel(
        version=version,
        lgb_model=lgb_model,
        prophet_model=prophet,
        mae=mae,
        mape=mape,
        rmse=rmse,
        feature_list=FEATURE_COLS,
    )


def _busy_level(count: int, peak: int) -> str:
    if peak <= 0:
        return "QUIET"
    r = count / peak
    if r < 0.2:
        return "VERY_QUIET"
    if r < 0.4:
        return "QUIET"
    if r < 0.6:
        return "MODERATE"
    if r < 0.8:
        return "BUSY"
    if r <= 1.0:
        return "VERY_BUSY"
    return "PEAK"


def predict(
    model: TrainedModel,
    history: pd.DataFrame,
    hours: int,
) -> list[dict]:
    feats = engineer(history)
    last_ts = feats["bucket_start"].max()
    peak = max(int(feats["y"].max() or 1), 1)

    out: list[dict] = []
    recent = feats.tail(200).copy()
    for i in range(hours):
        target = last_ts + timedelta(hours=i + 1)
        row = {
            "bucket_start": target,
            "day_of_week": target.dayofweek,
            "hour_of_day": target.hour,
            "is_holiday": 0,
            "active_flash_sales": int(feats["active_flash_sales"].tail(24).mean() or 0),
            "active_vendors": int(feats["active_vendors"].tail(24).mean() or 0),
            "temperature_c": float(feats["temperature_c"].tail(24).mean() or 30.0),
            "rain_mm": float(feats["rain_mm"].tail(24).mean() or 0.0),
            "weather_condition": "clouds",
            "y": 0,
        }
        tmp = pd.concat([recent, pd.DataFrame([row])], ignore_index=True)
        tmp = engineer(tmp).dropna()
        X = tmp[FEATURE_COLS].tail(1).values
        lgb_pred = float(model.lgb_model.predict(X)[0])
        prophet_pred = float(
            model.prophet_model.predict(
                pd.DataFrame({"ds": [target.to_pydatetime().replace(tzinfo=None)]})
            )["yhat"].values[0]
        )
        ensemble = max(0.0, 0.7 * lgb_pred + 0.3 * prophet_pred)
        ci = max(5.0, ensemble * 0.18)
        count = int(round(ensemble))
        out.append(
            {
                "time": target.to_pydatetime()
                .replace(tzinfo=timezone.utc)
                .isoformat(),
                "count": count,
                "lower": int(round(max(0, ensemble - ci))),
                "upper": int(round(ensemble + ci)),
                "level": _busy_level(count, peak),
            }
        )
        recent.loc[len(recent)] = {**row, "y": ensemble}
    return out


def load_latest() -> TrainedModel | None:
    path = os.path.join(settings.model_dir, "latest.joblib")
    if not os.path.exists(path):
        return None
    return joblib.load(path)
