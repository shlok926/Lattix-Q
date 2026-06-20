import structlog
from fastapi import FastAPI
from app.api.simulation import router as sim_router
from app.api.visualizer import router as vis_router

logger = structlog.get_logger()

app = FastAPI(title="Quantum Attack Service", version="1.0.0")
app.include_router(sim_router)
app.include_router(vis_router)

@app.get("/circuit/{job_id}")
def circuit_redirect(job_id: str):
    from app.api.simulation import get_circuit
    return get_circuit(job_id)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
