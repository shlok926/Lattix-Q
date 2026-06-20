from fastapi import APIRouter
from pydantic import BaseModel
from app.core.ecc.ecdsa import generate_ecc_keypair, ecdsa_sign, ecdsa_verify
from app.core.ecc.ecdh import ecdh_exchange

router = APIRouter(prefix="/classical/ecc", tags=["ECC"])

class KeygenReq(BaseModel):
    curve_bits: int = 256

class SignReq(BaseModel):
    priv_pem: str
    message: str

class VerifyReq(BaseModel):
    pub_pem: str
    message: str
    sig_b64: str

class ExchangeReq(BaseModel):
    priv_pem_a: str
    pub_pem_b: str

@router.post("/keygen")
def api_ecc_keygen(req: KeygenReq):
    return generate_ecc_keypair(req.curve_bits)

@router.post("/sign")
def api_ecc_sign(req: SignReq):
    return ecdsa_sign(req.priv_pem, req.message)

@router.post("/verify")
def api_ecc_verify(req: VerifyReq):
    return ecdsa_verify(req.pub_pem, req.message, req.sig_b64)

@router.post("/exchange")
def api_ecc_exchange(req: ExchangeReq):
    return ecdh_exchange(req.priv_pem_a, req.pub_pem_b)
