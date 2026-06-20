from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str
    CLAUDE_MODEL: str = "claude-sonnet-4-5"
    CLAUDE_MAX_TOKENS: int = 2048
    CLAUDE_TEMPERATURE: float = 0.3
    STREAM_CHUNK_DELAY_MS: int = 0
    REDIS_URL: str = "redis://redis:6379/2"
    SESSION_TTL_SECONDS: int = 3600
    MAX_HISTORY_MESSAGES: int = 20
    QUANTUMSHIELD_INTERNAL_API: str = "http://api-gateway:8000/v1"
    MAX_REQUESTS_PER_MINUTE: int = 20
    MAX_TOKENS_PER_SESSION: int = 100000
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
