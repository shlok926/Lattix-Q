from fastapi import APIRouter
from pydantic import BaseModel
from app.core.aes.encryption import aes_encrypt, aes_decrypt

router = APIRouter(prefix="/classical/aes", tags=["AES"])

class EncryptReq(BaseModel):
    key_size: int = 256
    plaintext: str

class DecryptReq(BaseModel):
    key_b64: str
    nonce_b64: str
    ciphertext_b64: str

@router.post("/encrypt")
def api_aes_encrypt(req: EncryptReq):
    return aes_encrypt(req.key_size, req.plaintext)

@router.post("/decrypt")
def api_aes_decrypt(req: DecryptReq):
    return aes_decrypt(req.key_b64, req.nonce_b64, req.ciphertext_b64)
