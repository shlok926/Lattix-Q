from fastapi import APIRouter
from pydantic import BaseModel
from app.core.rsa.keygen import generate_rsa_keypair, rsa_encrypt, rsa_decrypt
from app.core.rsa.signing import rsa_sign, rsa_verify

router = APIRouter(prefix="/classical/rsa", tags=["RSA"])

class KeygenReq(BaseModel):
    key_size: int = 2048

class EncryptReq(BaseModel):
    pub_pem: str
    plaintext: str

class DecryptReq(BaseModel):
    priv_pem: str
    ciphertext_b64: str

class SignReq(BaseModel):
    priv_pem: str
    message: str

class VerifyReq(BaseModel):
    pub_pem: str
    message: str
    sig_b64: str

@router.post("/keygen")
def api_rsa_keygen(req: KeygenReq):
    return generate_rsa_keypair(req.key_size)

@router.post("/encrypt")
def api_rsa_encrypt(req: EncryptReq):
    return rsa_encrypt(req.pub_pem, req.plaintext)

@router.post("/decrypt")
def api_rsa_decrypt(req: DecryptReq):
    return rsa_decrypt(req.priv_pem, req.ciphertext_b64)

@router.post("/sign")
def api_rsa_sign(req: SignReq):
    return rsa_sign(req.priv_pem, req.message)

@router.post("/verify")
def api_rsa_verify(req: VerifyReq):
    return rsa_verify(req.pub_pem, req.message, req.sig_b64)
