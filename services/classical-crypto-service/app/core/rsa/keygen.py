import base64
import time
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes

def generate_rsa_keypair(key_size: int = 2048):
    start_time = time.perf_counter()
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size,
    )
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

def rsa_encrypt(pub_pem: str, plaintext: str):
    start_time = time.perf_counter()
    public_key = serialization.load_pem_public_key(pub_pem.encode('utf-8'))
    
    ciphertext = public_key.encrypt(
        plaintext.encode('utf-8'),
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    encrypt_ms = (time.perf_counter() - start_time) * 1000
    
    return {"ciphertext_b64": base64.b64encode(ciphertext).decode('utf-8'), "encrypt_ms": encrypt_ms}

def rsa_decrypt(priv_pem: str, ciphertext_b64: str):
    start_time = time.perf_counter()
    private_key = serialization.load_pem_private_key(priv_pem.encode('utf-8'), password=None)
    ciphertext = base64.b64decode(ciphertext_b64)
    
    plaintext = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    decrypt_ms = (time.perf_counter() - start_time) * 1000
    
    return {"plaintext": plaintext.decode('utf-8'), "decrypt_ms": decrypt_ms}
