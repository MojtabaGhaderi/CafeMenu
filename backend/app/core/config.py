from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]  # .../backend
ENV_FILES = [
    BACKEND_DIR / ".env",
    BACKEND_DIR.parent / ".env",
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(p) for p in ENV_FILES],
        env_ignore_empty=True,
        extra="ignore",   # ✅ don't crash on unused env vars
    )

    DATABASE_URL: str

    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALG: str = "HS256"
    JWT_ACCESS_TTL_MIN: int = 60


settings = Settings()
