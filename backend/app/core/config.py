from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/autoch"
    DATABASE_URL_SYNC: str = "postgresql://postgres:postgres@db:5432/autoch"

    # Redis
    REDIS_URL: str = "redis://redis:6379"

    # Auth
    SECRET_KEY: str = "changeme-in-production-use-strong-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://frontend:3000"]

    # Storage
    UPLOAD_DIR: str = "/app/uploads"
    MAX_IMAGE_SIZE_MB: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
