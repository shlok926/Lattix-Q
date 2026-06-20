import base64
import time
from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.primitives import serialization

def dh_generate_parameters(key_size: int = 2048):
    parameters = dh.generate_parameters(generator=2, key_size=key_size)
    pn = parameters.parameter_numbers()
    return {
        "p": pn.p,
        "g": pn.g,
        "parameter_size": key_size,
        "params_pem": parameters.parameter_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.ParameterFormat.PKCS3
        ).decode('utf-8')
    }

def dh_keygen(params_pem: str):
    parameters = serialization.load_pem_parameters(params_pem.encode('utf-8'))
    private_key = parameters.generate_private_key()
    
    priv_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    pub_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    return {"private_key_b64": base64.b64encode(priv_pem.encode()).decode(), "public_key_b64": base64.b64encode(pub_pem.encode()).decode()}

def dh_compute_shared(private_b64: str, peer_public_b64: str):
    priv_pem = base64.b64decode(private_b64).decode()
    pub_pem = base64.b64decode(peer_public_b64).decode()
    
    private_key = serialization.load_pem_private_key(priv_pem.encode('utf-8'), password=None)
    peer_public_key = serialization.load_pem_public_key(pub_pem.encode('utf-8'))
    
    shared_key = private_key.exchange(peer_public_key)
    return {"shared_b64": base64.b64encode(shared_key).decode('utf-8')}
