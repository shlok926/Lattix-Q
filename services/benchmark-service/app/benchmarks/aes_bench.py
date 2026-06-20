import os
import time
import psutil
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.runner import AlgoBenchmark

def run_aes_benchmark(key_size: int = 256, iterations: int = 100) -> AlgoBenchmark:
    process = psutil.Process()
    mem_before = process.memory_info().rss
    
    encrypt_times, decrypt_times = [], []
    message = os.urandom(1024)
    
    for _ in range(iterations):
        key = AESGCM.generate_key(bit_length=key_size)
        aesgcm = AESGCM(key)
        nonce = os.urandom(12)
        
        t0 = time.perf_counter()
        ciphertext = aesgcm.encrypt(nonce, message, None)
        encrypt_times.append((time.perf_counter() - t0) * 1000)
        
        t0 = time.perf_counter()
        aesgcm.decrypt(nonce, ciphertext, None)
        decrypt_times.append((time.perf_counter() - t0) * 1000)

    mem_after = process.memory_info().rss
    peak_memory_kb = max(0, (mem_after - mem_before) / 1024)

    return AlgoBenchmark(
        algorithm=f"AES-{key_size}",
        category="Classical",
        keygen_ms=0.0,
        encrypt_ms=sum(encrypt_times)/len(encrypt_times),
        decrypt_ms=sum(decrypt_times)/len(decrypt_times),
        sign_ms=0.0,
        verify_ms=0.0,
        pk_size_bytes=key_size // 8,
        sk_size_bytes=key_size // 8,
        ct_size_bytes=len(message) + 16,
        sig_size_bytes=0,
        peak_memory_kb=peak_memory_kb,
        nist_security_level=0,
        classical_security_bits=key_size,
        post_quantum_security_bits=key_size // 2,
        quantum_safe=key_size == 256
    )
