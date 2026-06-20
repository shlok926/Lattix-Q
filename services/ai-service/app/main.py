from fastapi import FastAPI
from app.api.v1.router import router as v1_router

app = FastAPI(title="QuantumShield AI Intelligence Service", version="1.0.0")

app.include_router(v1_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-intelligence"}
