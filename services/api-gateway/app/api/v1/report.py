import httpx
from fastapi import APIRouter, Request, HTTPException, Depends
from app.config import settings
from app.middleware.auth import verify_jwt

router = APIRouter(prefix="/report", tags=["Reports"])

async def forward_request(method: str, path: str, json_data: dict = None):
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.request(method, f"{settings.REPORT_SERVICE_URL}{path}", json=json_data)
            if resp.status_code >= 400:
                raise HTTPException(status_code=resp.status_code, detail=resp.text)
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=str(e))

@router.post("/assess")
async def assess_vulnerability(body: dict):
    return await forward_request("POST", "/report/assess", body)

@router.post("/generate/{report_format}")
async def generate_report(report_format: str, body: dict):
    return await forward_request("POST", f"/report/generate/{report_format}", body)
