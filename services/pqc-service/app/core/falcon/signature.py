import base64
import time
import oqs

def _get_falcon_name(variant: int):
    if variant in [512, 1024]:
        return f"Falcon-{variant}"
    raise ValueError("Invalid Falcon variant")

def falcon_keygen(variant: int = 512):
    alg_name = _get_falcon_name(variant)
    start_time = time.perf_counter()
    with oqs.Signature(alg_name) as sig:
        pub_key = sig.generate_keypair()
        priv_key = sig.export_secret_key()
        keygen_ms = (time.perf_counter() - start_time) * 1000
        
        return {
            "pub_b64": base64.b64encode(pub_key).decode('utf-8'),
            "priv_b64": base64.b64encode(priv_key).decode('utf-8'),
            "pk_size": sig.details['length_public_key'],
            "sk_size": sig.details['length_secret_key'],
            "keygen_ms": keygen_ms
        }

def falcon_sign(priv_b64: str, message: str, variant: int = 512):
    alg_name = _get_falcon_name(variant)
    priv_key = base64.b64decode(priv_b64)
    msg_bytes = message.encode('utf-8')
    start_time = time.perf_counter()
    
    with oqs.Signature(alg_name) as sig:
        sig.secret_key = priv_key
        signature = sig.sign(msg_bytes)
        sign_ms = (time.perf_counter() - start_time) * 1000
        
        return {
            "sig_b64": base64.b64encode(signature).decode('utf-8'),
            "sig_size": len(signature),
            "sign_ms": sign_ms
        }

def falcon_verify(pub_b64: str, message: str, sig_b64: str, variant: int = 512):
    alg_name = _get_falcon_name(variant)
    pub_key = base64.b64decode(pub_b64)
    signature = base64.b64decode(sig_b64)
    msg_bytes = message.encode('utf-8')
    start_time = time.perf_counter()
    
    with oqs.Signature(alg_name) as sig:
        is_valid = sig.verify(msg_bytes, signature, pub_key)
        verify_ms = (time.perf_counter() - start_time) * 1000
        
        return {
            "valid": is_valid,
            "verify_ms": verify_ms
        }
