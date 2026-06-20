from fastapi import APIRouter
from pydantic import BaseModel
from app.core.sphincs.signature import sphincs_keygen, sphincs_sign, sphincs_verify

router = APIRouter(prefix="/pqc/sphincs", tags=["SPHINCS+"])

class KeygenReq(BaseModel):
    variant: str = "sha2_128f"

class SignReq(BaseModel):
    priv_b64: str
    message: str
    variant: str = "sha2_128f"

class VerifyReq(BaseModel):
    pub_b64: str
    message: str
    sig_b64: str
    variant: str = "sha2_128f"

@router.post("/keygen")
def api_sphincs_keygen(req: KeygenReq):
    return sphincs_keygen(req.variant)

@router.post("/sign")
def api_sphincs_sign(req: SignReq):
    return sphincs_sign(req.priv_b64, req.message, req.variant)

@router.post("/verify")
def api_sphincs_verify(req: VerifyReq):
    return sphincs_verify(req.pub_b64, req.message, req.sig_b64, req.variant)
