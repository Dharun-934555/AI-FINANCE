import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Finora - RupeeWise AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "rupeewise-super-secret-finora-key-2026-genz")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finora.db")

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
