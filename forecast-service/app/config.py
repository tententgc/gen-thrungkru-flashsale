"""Environment-driven settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = ""
    redis_url: str = ""
    api_key: str = "dev"
    model_dir: str = "./models"
    market_lat: float = 13.6489
    market_lng: float = 100.4938
    market_radius_m: float = 180.0
    openweather_api_key: str = ""
    retrain_hour: int = 3  # local hour; APScheduler runs 03:00


settings = Settings()
