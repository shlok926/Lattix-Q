from fastapi import APIRouter
from pydantic import BaseModel
from app.core.falcon.signature import falcon_keygen, falcon_sign, falcon_verify

router = APIRouter(prefix="/pqc/falcon", tags=["Falcon"])

class KeygenReq(BaseModel):
    variant: int = 512

class SignReq(BaseModel):
    priv_b64: str
    message: str
    variant: int = 512

class VerifyReq(BaseModel):
    pub_b64: str
    message: str
    sig_b64: str
    variant: int = 512

@router.post("/keygen")
def api_falcon_keygen(req: KeygenReq):
    return falcon_keygen(req.variant)

@router.post("/sign")
def api_falcon_sign(req: SignReq):
    return falcon_sign(req.priv_b64, req.message, req.variant)

@router.post("/verify")
def api_falcon_verify(req: VerifyReq):
    return falcon_verify(req.pub_b64, req.message, req.sig_b64, req.variant)
