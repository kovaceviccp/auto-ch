from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/autoch"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@db:5432/autoch"
    DB_SSL: bool = False  # Set to true for Neon

    # Redis
    REDIS_URL: str = "redis://redis:6379"

    # Auth
    SECRET_KEY: str = "changeme-in-production-use-strong-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    # CORS — comma-separated or JSON list string
    CORS_ORIGINS: str = "http://localhost:3000,http://frontend:3000"

    def get_cors_origins(self) -> List[str]:
        v = self.CORS_ORIGINS.strip()
        if v.startswith("["):
            return json.loads(v)
        return [i.strip() for i in v.split(",")]

    # Local storage (fallback)
    UPLOAD_DIR: str = "/tmp/uploads"
    MAX_IMAGE_SIZE_MB: int = 10

    # Supabase Storage
    USE_SUPABASE: bool = False
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_BUCKET: str = "autoch-images"

    class Config:
        env_file = ".env"


settings = Settings()
