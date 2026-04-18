# ThungKhru61 Forecast Service

FastAPI microservice that serves crowd-density predictions for ตลาดทุ่งครุ 61.

## Design

- **Model:** LightGBM + Prophet ensemble (0.7 / 0.3 weighting).
- **Features:** cyclic hour/day, lags (1h/24h/168h), rolling means, weather, Thai holidays, payday, flash-sale count, active vendors.
- **Cold start:** synthetic curve matching Google-Popular-Times shape until ≥ 1 week of real data is in the DB.
- **Retrain:** APScheduler triggers `_train_and_publish` daily at 03:00 UTC (override via `RETRAIN_HOUR`).
- **Contract:** Next.js `/api/crowd/forecast` hits `GET /forecast?hours=N` with `X-API-Key`, falls back to its own synthetic curve if unreachable.

## Run locally

```bash
cd forecast-service
pip install -e .
export DATABASE_URL=postgresql://...
export API_KEY=dev-secret
uvicorn app.server:app --reload --port 8080
```

Health check:

```bash
curl http://localhost:8080/health
```

Force a retrain (uses the 60-day history window):

```bash
curl -X POST -H "X-API-Key: dev-secret" \
  http://localhost:8080/forecast/retrain
```

## Deploy (Railway / Fly.io)

Both platforms can read the Dockerfile directly:

```bash
# Railway
railway up

# Fly.io
fly launch --dockerfile Dockerfile --no-deploy
fly secrets set DATABASE_URL=... API_KEY=... OPENWEATHER_API_KEY=...
fly deploy
```

Then in the root Next.js app's `.env.local`:

```bash
FORECAST_SERVICE_URL="https://your-fly-app.fly.dev"
FORECAST_SERVICE_API_KEY="dev-secret"
```

## Environment

| Var | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | "" | Supabase Postgres (with `DIRECT_URL` semantics OK too) |
| `REDIS_URL` | "" | optional cache |
| `API_KEY` | `dev` | simple bearer used by Next.js |
| `MODEL_DIR` | `./models` | where `latest.joblib` lives |
| `OPENWEATHER_API_KEY` | "" | to enrich features on retrain |
| `RETRAIN_HOUR` | `3` | UTC hour for daily APScheduler cron |
