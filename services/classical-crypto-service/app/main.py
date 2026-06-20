import structlog
from fastapi import FastAPI
from app.api.rsa import router as rsa_router
from app.api.ecc import router as ecc_router
from app.api.aes import router as aes_router
from app.api.dh import router as dh_router

logger = structlog.get_logger()

app = FastAPI(title="Classical Crypto Service", version="1.0.0")

app.include_router(rsa_router)
app.include_router(ecc_router)
app.include_router(aes_router)
app.include_router(dh_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
