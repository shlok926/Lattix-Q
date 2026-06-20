import os
import json
import redis
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.tasks.simulation_tasks import run_shors_simulation, run_grovers_simulation

router = APIRouter(prefix="/simulate", tags=["Simulation"])
r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/1"))

class ShorsRequest(BaseModel):
    key_size: int
    include_noise: bool = False
    shots: int = 1024

class GroversRequest(BaseModel):
    key_size: int
    include_noise: bool = False

@router.post("/shor")
def simulate_shor(req: ShorsRequest):
    task = run_shors_simulation.apply_async(args=[req.key_size, req.include_noise, req.shots])
    return {"job_id": task.id, "status": "PENDING"}

@router.post("/grover")
def simulate_grover(req: GroversRequest):
    task = run_grovers_simulation.apply_async(args=[req.key_size, req.include_noise])
    return {"job_id": task.id, "status": "PENDING"}

@router.get("/status/{job_id}")
def get_status(job_id: str):
    data = r.get(f"sim:job:{job_id}")
    if not data:
        raise HTTPException(status_code=404, detail="Job not found")
    parsed = json.loads(data)
    return {"job_id": job_id, **parsed}

@router.get("/circuit/{job_id}")
def get_circuit(job_id: str):
    data = r.get(f"sim:job:{job_id}")
    if not data:
        raise HTTPException(status_code=404, detail="Job not found")
    parsed = json.loads(data)
    if parsed.get("status") != "COMPLETED":
        raise HTTPException(status_code=400, detail="Job not completed")
    result = parsed.get("result", {})
    return {"job_id": job_id, "circuit_nodes": result.get("circuit_nodes", []), "circuit_qasm": result.get("circuit_qasm", "")}
