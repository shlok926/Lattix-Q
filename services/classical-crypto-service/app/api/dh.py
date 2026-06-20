from fastapi import APIRouter
from pydantic import BaseModel
from app.core.dh.exchange import dh_generate_parameters, dh_keygen, dh_compute_shared

router = APIRouter(prefix="/classical/dh", tags=["DH"])

class ParamsReq(BaseModel):
    key_size: int = 2048

class KeygenReq(BaseModel):
    params_pem: str

class SharedReq(BaseModel):
    private_b64: str
    peer_public_b64: str

@router.post("/parameters")
def api_dh_parameters(req: ParamsReq):
    return dh_generate_parameters(req.key_size)

@router.post("/keygen")
def api_dh_keygen(req: KeygenReq):
    return dh_keygen(req.params_pem)

@router.post("/exchange")
def api_dh_exchange(req: SharedReq):
    return dh_compute_shared(req.private_b64, req.peer_public_b64)
