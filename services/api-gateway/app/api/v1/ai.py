import httpx
from fastapi import APIRouter, HTTPException
from app.config import settings

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

async def forward_request(method: str, path: str, json_data: dict = None):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.request(method, f"{settings.AI_SERVICE_URL}{path}", json=json_data)
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/scan")
async def scan_code(body: dict):
    return await forward_request("POST", "/api/v1/scan", body)

@router.post("/batch-scan")
async def batch_scan_code(body: dict):
    return await forward_request("POST", "/api/v1/batch-scan", body)

@router.post("/roadmap")
async def generate_roadmap(body: dict):
    return await forward_request("POST", "/api/v1/roadmap", body)

@router.post("/refactor")
async def refactor_code(body: dict):
    return await forward_request("POST", "/api/v1/refactor", body)

@router.get("/threat-feed")
async def get_threat_feed():
    return await forward_request("GET", "/api/v1/threat-feed")
