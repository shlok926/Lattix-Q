import base64
import time
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature

def _get_curve(curve_bits: int):
    if curve_bits == 256:
        return ec.SECP256R1()
    elif curve_bits == 384:
        return ec.SECP384R1()
    elif curve_bits == 521:
        return ec.SECP521R1()
    else:
        raise ValueError("Unsupported curve bits")

def generate_ecc_keypair(curve_bits: int = 256):
    start_time = time.perf_counter()
    curve = _get_curve(curve_bits)
    private_key = ec.generate_private_key(curve)
    keygen_ms = (time.perf_counter() - start_time) * 1000

    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    pub_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')

    return {"pub_pem": pub_pem, "priv_pem": priv_pem, "keygen_ms": keygen_ms}

def ecdsa_sign(priv_pem: str, message: str):
    start_time = time.perf_counter()
    private_key = serialization.load_pem_private_key(priv_pem.encode('utf-8'), password=None)
    
    signature = private_key.sign(
        message.encode('utf-8'),
        ec.ECDSA(hashes.SHA256())
    )
    sign_ms = (time.perf_counter() - start_time) * 1000
    
    return {"signature_b64": base64.b64encode(signature).decode('utf-8'), "sign_ms": sign_ms}

def ecdsa_verify(pub_pem: str, message: str, sig_b64: str):
    start_time = time.perf_counter()
    public_key = serialization.load_pem_public_key(pub_pem.encode('utf-8'))
    signature = base64.b64decode(sig_b64)
    
    valid = True
    try:
        public_key.verify(
            signature,
            message.encode('utf-8'),
            ec.ECDSA(hashes.SHA256())
        )
    except InvalidSignature:
        valid = False
        
    verify_ms = (time.perf_counter() - start_time) * 1000
    return {"valid": valid, "verify_ms": verify_ms}
