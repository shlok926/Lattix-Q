import httpx
from fastapi import APIRouter, Request, HTTPException
from app.models.simulation import ShorsRequest, GroversRequest, SimulationResponse
from app.config import settings
from app.middleware.rate_limit import limiter

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.post("/shor", response_model=SimulationResponse)
@limiter.limit("10/minute")
async def simulate_shor(request: Request, body: ShorsRequest):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{settings.QUANTUM_ATTACK_SERVICE_URL}/simulate/shor", json=body.model_dump())
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/grover", response_model=SimulationResponse)
@limiter.limit("10/minute")
async def simulate_grover(request: Request, body: GroversRequest):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(f"{settings.QUANTUM_ATTACK_SERVICE_URL}/simulate/grover", json=body.model_dump())
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{job_id}", response_model=SimulationResponse)
async def get_simulation_status(job_id: str):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{settings.QUANTUM_ATTACK_SERVICE_URL}/simulate/status/{job_id}")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/circuit/{job_id}")
async def get_circuit(job_id: str):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{settings.QUANTUM_ATTACK_SERVICE_URL}/circuit/{job_id}")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))
