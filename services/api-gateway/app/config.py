from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # JWT & Auth
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Infrastructure
    REDIS_URL: str = "redis://redis:6379/0"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "https://quantumshield.app"]
    
    # Service URLs
    QUANTUM_ATTACK_SERVICE_URL: str = "http://quantum-attack-service:8001"
    CLASSICAL_CRYPTO_SERVICE_URL: str = "http://classical-crypto-service:8002"
    PQC_SERVICE_URL: str = "http://pqc-service:8003"
    BENCHMARK_SERVICE_URL: str = "http://benchmark-service:8004"
    REPORT_SERVICE_URL: str = "http://report-service:8005"
    AI_SERVICE_URL: str = "http://ai-service:8006"
    ANALYST_SVC_URL: str = "http://ai-analyst-service:8006"
    
    # Environment & Keys
    ENVIRONMENT: str = "development"
    DB_ENCRYPTION_KEY: str = "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=" # Matching setup_mfa.py
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
