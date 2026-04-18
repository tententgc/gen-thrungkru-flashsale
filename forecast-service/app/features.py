"""Feature engineering shared by training + serving."""

from __future__ import annotations

import numpy as np
import pandas as pd
import holidays as hl

TH_HOLIDAYS = hl.country_holidays("TH")

CAT_FEATS = ["weather_condition"]
NUM_FEATS = [
    "hour_sin",
    "hour_cos",
    "dow_sin",
    "dow_cos",
    "is_weekend",
    "is_holiday",
    "is_payday",
    "temperature_c",
    "rain_mm",
    "active_flash_sales",
    "active_vendors",
    "lag_1h",
    "lag_24h",
    "lag_168h",
    "rolling_24h_mean",
    "rolling_7d_mean",
]


def add_calendar(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["bucket_start"] = pd.to_datetime(df["bucket_start"], utc=True)
    df["hour_sin"] = np.sin(2 * np.pi * df["hour_of_day"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour_of_day"] / 24)
    df["dow_sin"] = np.sin(2 * np.pi * df["day_of_week"] / 7)
    df["dow_cos"] = np.cos(2 * np.pi * df["day_of_week"] / 7)
    df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
    df["is_holiday"] = df["is_holiday"].fillna(False).astype(int)
    df["is_payday"] = df["bucket_start"].dt.day.isin([15, 30, 31]).astype(int)
    return df


def add_lags(df: pd.DataFrame, y_col: str = "y") -> pd.DataFrame:
    df = df.sort_values("bucket_start").reset_index(drop=True)
    for lag in (1, 24, 168):
        df[f"lag_{lag}h"] = df[y_col].shift(lag)
    df["rolling_24h_mean"] = df[y_col].rolling(24).mean()
    df["rolling_7d_mean"] = df[y_col].rolling(168).mean()
    return df


def engineer(df: pd.DataFrame) -> pd.DataFrame:
    df = add_calendar(df)
    df = add_lags(df)
    # One-hot weather condition (fixed small vocab keeps feature set stable)
    for c in ("clear", "clouds", "rain", "thunderstorm"):
        df[f"wx_{c}"] = (df["weather_condition"] == c).astype(int)
    return df
