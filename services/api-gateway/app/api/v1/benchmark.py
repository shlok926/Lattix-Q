import httpx
from fastapi import APIRouter, Request, HTTPException
from app.config import settings
from app.middleware.rate_limit import limiter

router = APIRouter(prefix="/benchmark", tags=["Benchmark"])

async def forward_request(method: str, path: str, json_data: dict = None):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.request(method, f"{settings.BENCHMARK_SERVICE_URL}{path}", json=json_data)
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/run")
@limiter.limit("5/minute")
async def run_benchmark(request: Request, body: dict):
    return await forward_request("POST", "/benchmark/run", body)

@router.get("/results")
async def get_benchmark_results():
    return await forward_request("GET", "/benchmark/results")
