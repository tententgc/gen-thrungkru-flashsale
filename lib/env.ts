// Env feature flags. Each "ready" check returns true only when every variable
// that service needs is present. The app reads these flags to decide between
// the real implementation and the mock fallback.

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  directUrl: process.env.DIRECT_URL ?? "",
  mapboxToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "",
  vapidPublic: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  vapidPrivate: process.env.VAPID_PRIVATE_KEY ?? "",
  vapidSubject: process.env.VAPID_SUBJECT ?? "",
  openWeatherKey: process.env.OPENWEATHER_API_KEY ?? "",
  forecastServiceUrl: process.env.FORECAST_SERVICE_URL ?? "",
  forecastServiceKey: process.env.FORECAST_SERVICE_API_KEY ?? "",
};

export const ready = {
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  supabaseServer: Boolean(env.supabaseUrl && env.supabaseServiceKey),
  db: Boolean(env.databaseUrl),
  mapbox: Boolean(env.mapboxToken),
  webPush: Boolean(env.vapidPublic && env.vapidPrivate),
  forecast: Boolean(env.forecastServiceUrl),
  weather: Boolean(env.openWeatherKey),
};
