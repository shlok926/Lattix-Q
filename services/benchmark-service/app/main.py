import structlog
from fastapi import FastAPI
from app.api.benchmark import router as bench_router

logger = structlog.get_logger()

app = FastAPI(title="Benchmark Service", version="1.0.0")
app.include_router(bench_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
