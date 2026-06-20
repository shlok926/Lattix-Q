import os
import base64
import time
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def aes_encrypt(key_size: int, plaintext: str):
    start_time = time.perf_counter()
    key = AESGCM.generate_key(bit_length=key_size)
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    encrypt_ms = (time.perf_counter() - start_time) * 1000
    
    return {
        "key_b64": base64.b64encode(key).decode('utf-8'),
        "nonce_b64": base64.b64encode(nonce).decode('utf-8'),
        "ciphertext_b64": base64.b64encode(ciphertext).decode('utf-8'),
        "encrypt_ms": encrypt_ms
    }

def aes_decrypt(key_b64: str, nonce_b64: str, ciphertext_b64: str):
    start_time = time.perf_counter()
    key = base64.b64decode(key_b64)
    nonce = base64.b64decode(nonce_b64)
    ciphertext = base64.b64decode(ciphertext_b64)
    
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(nonce, ciphertext, None)
    decrypt_ms = (time.perf_counter() - start_time) * 1000
    
    return {"plaintext": plaintext.decode('utf-8'), "decrypt_ms": decrypt_ms}
