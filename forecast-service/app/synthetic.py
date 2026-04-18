"""Synthetic data generator used during the cold-start period."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd


def synthetic_forecast(hours: int) -> list[dict]:
    rng = np.random.default_rng(seed=int(datetime.utcnow().timestamp() // 3600))
    out = []
    peak = 230
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    for h in range(hours):
        t = now + timedelta(hours=h)
        weekend = t.weekday() in (4, 5, 6)
        lunch = np.exp(-((t.hour - 12) ** 2) / 4) * 60
        dinner = np.exp(-((t.hour - 18.5) ** 2) / 5) * 160
        base = 20 if 10 <= t.hour <= 23 else 4
        value = (base + lunch + dinner) * (1.25 if weekend else 1.0)
        value += rng.normal(0, 6)
        value = max(0.0, value)
        count = int(round(value))
        ci = max(5, int(value * 0.18))
        r = count / peak
        level = (
            "VERY_QUIET" if r < 0.2
            else "QUIET" if r < 0.4
            else "MODERATE" if r < 0.6
            else "BUSY" if r < 0.8
            else "VERY_BUSY" if r <= 1.0
            else "PEAK"
        )
        out.append(
            {
                "time": t.isoformat(),
                "count": count,
                "lower": max(0, count - ci),
                "upper": count + ci,
                "level": level,
            }
        )
    return out
