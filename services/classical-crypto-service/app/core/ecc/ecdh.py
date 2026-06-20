import base64
import time
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

def ecdh_exchange(priv_pem_a: str, pub_pem_b: str):
    start_time = time.perf_counter()
    private_key = serialization.load_pem_private_key(priv_pem_a.encode('utf-8'), password=None)
    peer_public_key = serialization.load_pem_public_key(pub_pem_b.encode('utf-8'))
    
    shared_secret = private_key.exchange(ec.ECDH(), peer_public_key)
    ms = (time.perf_counter() - start_time) * 1000
    
    return {"shared_secret_b64": base64.b64encode(shared_secret).decode('utf-8'), "ms": ms}
