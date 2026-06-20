from fastapi import APIRouter
from pydantic import BaseModel
from app.core.kyber.kem import kyber_keygen, kyber_encapsulate, kyber_decapsulate

router = APIRouter(prefix="/pqc/kyber", tags=["Kyber"])

class KeygenReq(BaseModel):
    variant: int = 768

class EncapReq(BaseModel):
    pub_b64: str
    variant: int = 768

class DecapReq(BaseModel):
    priv_b64: str
    ct_b64: str
    variant: int = 768

@router.post("/keygen")
def api_kyber_keygen(req: KeygenReq):
    return kyber_keygen(req.variant)

@router.post("/encapsulate")
def api_kyber_encapsulate(req: EncapReq):
    return kyber_encapsulate(req.pub_b64, req.variant)

@router.post("/decapsulate")
def api_kyber_decapsulate(req: DecapReq):
    return kyber_decapsulate(req.priv_b64, req.ct_b64, req.variant)
