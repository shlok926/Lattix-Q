import structlog
import json
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from contextlib import asynccontextmanager

from app.api.router import v1_router
from app.websocket.simulation_ws import ws_router
from app.websocket.visualizer_ws import router as vis_ws_router
from app.middleware.rate_limit import setup_rate_limiting
from app.middleware.security import SecurityHeadersMiddleware
from app.utils.logging import log_security_event
from app.config import settings

logger = structlog.get_logger()

# Patch prometheus-fastapi-instrumentator to prevent crash with _IncludedRouter in FastAPI 0.110+
try:
    import prometheus_fastapi_instrumentator.routing
    original_get_route_name = prometheus_fastapi_instrumentator.routing._get_route_name
    def patched_get_route_name(scope, routes):
        safe_routes = [r for r in routes if hasattr(r, "path")]
        return original_get_route_name(scope, safe_routes)
    prometheus_fastapi_instrumentator.routing._get_route_name = patched_get_route_name
except Exception as e:
    logger.warning("Failed to patch prometheus_fastapi_instrumentator", error=str(e))

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting API Gateway...")
    yield
    logger.info("Shutting down API Gateway...")

app = FastAPI(
    title="QuantumShield API Gateway",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None
)

# Layer 6 - Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# Layer 12 - CORS (Whitelist only)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Rate Limiting
setup_rate_limiting(app)

# Prometheus
Instrumentator().instrument(app).expose(app)

# Routers
app.include_router(v1_router)
app.include_router(ws_router)
app.include_router(vis_ws_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Layer 10 - Global Error Handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full error internally (Layer 9)
    log_security_event(
        "unhandled_exception",
        "error",
        {"error": str(exc), "path": request.url.path},
        request=request
    )
    
    if settings.ENVIRONMENT == "production":
        return Response(
            content=json.dumps({"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred"}}),
            status_code=500,
            media_type="application/json"
        )
    else:
        # In dev, return the actual error for debugging
        return Response(
            content=json.dumps({"error": {"code": "DEV_ERROR", "message": str(exc)}}),
            status_code=500,
            media_type="application/json"
        )
