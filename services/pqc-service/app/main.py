import structlog
from fastapi import FastAPI
from app.api.kyber import router as kyber_router
from app.api.dilithium import router as dilithium_router
from app.api.falcon import router as falcon_router
from app.api.sphincs import router as sphincs_router

logger = structlog.get_logger()

app = FastAPI(title="PQC Service", version="1.0.0")

app.include_router(kyber_router)
app.include_router(dilithium_router)
app.include_router(falcon_router)
app.include_router(sphincs_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
