import httpx
from fastapi import APIRouter, Request, HTTPException, Depends
from app.config import settings
from app.middleware.auth import verify_jwt
from app.middleware.rate_limit import limiter

router = APIRouter(
    prefix="/pqc", 
    tags=["Post-Quantum Cryptography"],
    dependencies=[Depends(verify_jwt)]
)

async def forward_request(method: str, path: str, json_data: dict = None):
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.request(method, f"{settings.PQC_SERVICE_URL}{path}", json=json_data)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            # Layer 10 - Error Handling: Generic error internally logged
            raise HTTPException(status_code=500, detail="Service Unavailable")

@router.post("/kyber/keygen")
@limiter.limit("5/minute")
async def kyber_keygen(request: Request, body: dict):
    return await forward_request("POST", "/pqc/kyber/keygen", body)

@router.post("/kyber/encapsulate")
@limiter.limit("20/minute")
async def kyber_encapsulate(request: Request, body: dict):
    return await forward_request("POST", "/pqc/kyber/encapsulate", body)

@router.post("/kyber/decapsulate")
@limiter.limit("20/minute")
async def kyber_decapsulate(request: Request, body: dict):
    return await forward_request("POST", "/pqc/kyber/decapsulate", body)

@router.post("/dilithium/keygen")
@limiter.limit("5/minute")
async def dilithium_keygen(request: Request, body: dict):
    return await forward_request("POST", "/pqc/dilithium/keygen", body)

@router.post("/dilithium/sign")
@limiter.limit("20/minute")
async def dilithium_sign(request: Request, body: dict):
    return await forward_request("POST", "/pqc/dilithium/sign", body)

@router.post("/dilithium/verify")
@limiter.limit("20/minute")
async def dilithium_verify(request: Request, body: dict):
    return await forward_request("POST", "/pqc/dilithium/verify", body)

@router.post("/falcon/keygen")
@limiter.limit("5/minute")
async def falcon_keygen(request: Request, body: dict):
    return await forward_request("POST", "/pqc/falcon/keygen", body)

@router.post("/falcon/sign")
@limiter.limit("20/minute")
async def falcon_sign(request: Request, body: dict):
    return await forward_request("POST", "/pqc/falcon/sign", body)

@router.post("/sphincs/keygen")
@limiter.limit("5/minute")
async def sphincs_keygen(request: Request, body: dict):
    return await forward_request("POST", "/pqc/sphincs/keygen", body)

@router.post("/sphincs/sign")
@limiter.limit("20/minute")
async def sphincs_sign(request: Request, body: dict):
    return await forward_request("POST", "/pqc/sphincs/sign", body)
