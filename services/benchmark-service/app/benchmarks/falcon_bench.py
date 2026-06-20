import time
import psutil
import oqs
from app.core.runner import AlgoBenchmark

def run_falcon_benchmark(variant: int = 512, iterations: int = 50) -> AlgoBenchmark:
    process = psutil.Process()
    mem_before = process.memory_info().rss
    
    keygen_times, sign_times, verify_times = [], [], []
    alg_name = f"Falcon-{variant}"
    pk_size, sk_size, sig_size = 0, 0, 0
    message = b"Test message for benchmark"
    nist_level = 1 if variant == 512 else 5

    with oqs.Signature(alg_name) as sig:
        pk_size = sig.details['length_public_key']
        sk_size = sig.details['length_secret_key']
        sig_size_expected = sig.details['length_signature']
        
        for _ in range(iterations):
            t0 = time.perf_counter()
            pub_key = sig.generate_keypair()
            keygen_times.append((time.perf_counter() - t0) * 1000)
            
            t0 = time.perf_counter()
            signature = sig.sign(message)
            sign_times.append((time.perf_counter() - t0) * 1000)
            
            t0 = time.perf_counter()
            sig.verify(message, signature, pub_key)
            verify_times.append((time.perf_counter() - t0) * 1000)

    mem_after = process.memory_info().rss
    peak_memory_kb = max(0, (mem_after - mem_before) / 1024)

    return AlgoBenchmark(
        algorithm=f"FALCON-{variant}",
        category="Post-Quantum",
        keygen_ms=sum(keygen_times)/len(keygen_times),
        encrypt_ms=0.0,
        decrypt_ms=0.0,
        sign_ms=sum(sign_times)/len(sign_times),
        verify_ms=sum(verify_times)/len(verify_times),
        pk_size_bytes=pk_size,
        sk_size_bytes=sk_size,
        ct_size_bytes=0,
        sig_size_bytes=sig_size_expected,
        peak_memory_kb=peak_memory_kb,
        nist_security_level=nist_level,
        classical_security_bits=0,
        post_quantum_security_bits=nist_level * 64,
        quantum_safe=True
    )
