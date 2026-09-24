import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resume_screening.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "insecure-dev-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    AUTH_USERNAME: str = os.getenv("AUTH_USERNAME", "admin")
    AUTH_PASSWORD: str = os.getenv("AUTH_PASSWORD", "admin123")

    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "5"))
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

settings = Settings()