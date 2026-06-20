from fastapi import APIRouter
from pydantic import BaseModel
from app.core.dilithium.signature import dilithium_keygen, dilithium_sign, dilithium_verify

router = APIRouter(prefix="/pqc/dilithium", tags=["Dilithium"])

class KeygenReq(BaseModel):
    level: int = 3

class SignReq(BaseModel):
    priv_b64: str
    message: str
    level: int = 3

class VerifyReq(BaseModel):
    pub_b64: str
    message: str
    sig_b64: str
    level: int = 3

@router.post("/keygen")
def api_dilithium_keygen(req: KeygenReq):
    return dilithium_keygen(req.level)

@router.post("/sign")
def api_dilithium_sign(req: SignReq):
    return dilithium_sign(req.priv_b64, req.message, req.level)

@router.post("/verify")
def api_dilithium_verify(req: VerifyReq):
    return dilithium_verify(req.pub_b64, req.message, req.sig_b64, req.level)
