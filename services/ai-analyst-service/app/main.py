import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.analyst import router as analyst_router
from app.api.health import router as health_router
from app.config import settings
from app.session.redis_store import RedisSessionStore

log = structlog.get_logger()
session_store: RedisSessionStore = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global session_store
    session_store = RedisSessionStore(settings.REDIS_URL)
    await session_store.connect()
    log.info("AI Analyst Service started", model=settings.CLAUDE_MODEL)
    yield
    await session_store.disconnect()

app = FastAPI(title="QuantumShield — AI Threat Analyst", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analyst_router, prefix="/analyst", tags=["AI Analyst"])
app.include_router(health_router, tags=["Health"])
