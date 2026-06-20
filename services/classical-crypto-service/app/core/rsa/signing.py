import base64
import time
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature

def rsa_sign(priv_pem: str, message: str):
    start_time = time.perf_counter()
    private_key = serialization.load_pem_private_key(priv_pem.encode('utf-8'), password=None)
    
    signature = private_key.sign(
        message.encode('utf-8'),
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    sign_ms = (time.perf_counter() - start_time) * 1000
    
    return {"signature_b64": base64.b64encode(signature).decode('utf-8'), "sign_ms": sign_ms}

def rsa_verify(pub_pem: str, message: str, sig_b64: str):
    start_time = time.perf_counter()
    public_key = serialization.load_pem_public_key(pub_pem.encode('utf-8'))
    signature = base64.b64decode(sig_b64)
    
    valid = True
    try:
        public_key.verify(
            signature,
            message.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
    except InvalidSignature:
        valid = False
        
    verify_ms = (time.perf_counter() - start_time) * 1000
    return {"valid": valid, "verify_ms": verify_ms}
