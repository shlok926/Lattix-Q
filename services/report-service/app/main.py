import structlog
from fastapi import FastAPI
from app.api.report import router as report_router

logger = structlog.get_logger()

app = FastAPI(title="Report Service", version="1.0.0")
app.include_router(report_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
