import time
import psutil
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from app.core.runner import AlgoBenchmark

def run_ecc_benchmark(curve_bits: int = 256, iterations: int = 50) -> AlgoBenchmark:
    process = psutil.Process()
    mem_before = process.memory_info().rss
    
    keygen_times, sign_times, verify_times = [], [], []
    message = b"Test message for benchmark"
    
    pk_size, sk_size, sig_size = 0, 0, 0
    curve = ec.SECP256R1() if curve_bits == 256 else ec.SECP384R1()

    for _ in range(iterations):
        t0 = time.perf_counter()
        private_key = ec.generate_private_key(curve)
        public_key = private_key.public_key()
        keygen_times.append((time.perf_counter() - t0) * 1000)
        
        if pk_size == 0:
            pk_size = len(public_key.public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo))
            sk_size = len(private_key.private_bytes(serialization.Encoding.DER, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))

        t0 = time.perf_counter()
        signature = private_key.sign(message, ec.ECDSA(hashes.SHA256()))
        sign_times.append((time.perf_counter() - t0) * 1000)
        sig_size = len(signature)
        
        t0 = time.perf_counter()
        public_key.verify(signature, message, ec.ECDSA(hashes.SHA256()))
        verify_times.append((time.perf_counter() - t0) * 1000)

    mem_after = process.memory_info().rss
    peak_memory_kb = max(0, (mem_after - mem_before) / 1024)

    return AlgoBenchmark(
        algorithm=f"ECC-{curve_bits}",
        category="Classical",
        keygen_ms=sum(keygen_times)/len(keygen_times),
        encrypt_ms=0.0,
        decrypt_ms=0.0,
        sign_ms=sum(sign_times)/len(sign_times),
        verify_ms=sum(verify_times)/len(verify_times),
        pk_size_bytes=pk_size,
        sk_size_bytes=sk_size,
        ct_size_bytes=0,
        sig_size_bytes=sig_size,
        peak_memory_kb=peak_memory_kb,
        nist_security_level=0,
        classical_security_bits=curve_bits // 2,
        post_quantum_security_bits=0,
        quantum_safe=False
    )
