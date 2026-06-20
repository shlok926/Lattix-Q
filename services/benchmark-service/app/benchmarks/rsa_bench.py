import time
import psutil
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from app.core.runner import AlgoBenchmark

def run_rsa_benchmark(key_size: int = 2048, iterations: int = 50) -> AlgoBenchmark:
    process = psutil.Process()
    mem_before = process.memory_info().rss
    
    keygen_times, encrypt_times, decrypt_times = [], [], []
    sign_times, verify_times = [], []
    
    message = b"Test message for benchmark"
    
    pk_size, sk_size, ct_size, sig_size = 0, 0, 0, 0

    for _ in range(iterations):
        t0 = time.perf_counter()
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=key_size)
        public_key = private_key.public_key()
        keygen_times.append((time.perf_counter() - t0) * 1000)
        
        if pk_size == 0:
            pk_size = len(public_key.public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo))
            sk_size = len(private_key.private_bytes(serialization.Encoding.DER, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))

        t0 = time.perf_counter()
        ciphertext = public_key.encrypt(message, padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
        encrypt_times.append((time.perf_counter() - t0) * 1000)
        ct_size = len(ciphertext)
        
        t0 = time.perf_counter()
        private_key.decrypt(ciphertext, padding.OAEP(padding.MGF1(hashes.SHA256()), hashes.SHA256(), None))
        decrypt_times.append((time.perf_counter() - t0) * 1000)
        
        t0 = time.perf_counter()
        signature = private_key.sign(message, padding.PSS(padding.MGF1(hashes.SHA256()), padding.PSS.MAX_LENGTH), hashes.SHA256())
        sign_times.append((time.perf_counter() - t0) * 1000)
        sig_size = len(signature)
        
        t0 = time.perf_counter()
        public_key.verify(signature, message, padding.PSS(padding.MGF1(hashes.SHA256()), padding.PSS.MAX_LENGTH), hashes.SHA256())
        verify_times.append((time.perf_counter() - t0) * 1000)

    mem_after = process.memory_info().rss
    peak_memory_kb = max(0, (mem_after - mem_before) / 1024)

    return AlgoBenchmark(
        algorithm=f"RSA-{key_size}",
        category="Classical",
        keygen_ms=sum(keygen_times)/len(keygen_times),
        encrypt_ms=sum(encrypt_times)/len(encrypt_times),
        decrypt_ms=sum(decrypt_times)/len(decrypt_times),
        sign_ms=sum(sign_times)/len(sign_times),
        verify_ms=sum(verify_times)/len(verify_times),
        pk_size_bytes=pk_size,
        sk_size_bytes=sk_size,
        ct_size_bytes=ct_size,
        sig_size_bytes=sig_size,
        peak_memory_kb=peak_memory_kb,
        nist_security_level=0,
        classical_security_bits=112 if key_size == 2048 else 128,
        post_quantum_security_bits=0,
        quantum_safe=False
    )
