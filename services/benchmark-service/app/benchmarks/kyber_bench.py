import time
import psutil
import oqs
from app.core.runner import AlgoBenchmark

def run_kyber_benchmark(variant: int = 768, iterations: int = 50) -> AlgoBenchmark:
    process = psutil.Process()
    mem_before = process.memory_info().rss
    
    keygen_times, encap_times, decap_times = [], [], []
    alg_name = f"Kyber{variant}"
    pk_size, sk_size, ct_size = 0, 0, 0
    nist_level = {512: 1, 768: 3, 1024: 5}.get(variant, 1)

    with oqs.KeyEncapsulation(alg_name) as kem:
        pk_size = kem.details['length_public_key']
        sk_size = kem.details['length_secret_key']
        ct_size = kem.details['length_ciphertext']
        
        for _ in range(iterations):
            t0 = time.perf_counter()
            pub_key = kem.generate_keypair()
            keygen_times.append((time.perf_counter() - t0) * 1000)
            
            t0 = time.perf_counter()
            ciphertext, shared_secret = kem.encap_secret(pub_key)
            encap_times.append((time.perf_counter() - t0) * 1000)
            
            t0 = time.perf_counter()
            kem.decap_secret(ciphertext)
            decap_times.append((time.perf_counter() - t0) * 1000)

    mem_after = process.memory_info().rss
    peak_memory_kb = max(0, (mem_after - mem_before) / 1024)

    return AlgoBenchmark(
        algorithm=f"Kyber-{variant}",
        category="Post-Quantum",
        keygen_ms=sum(keygen_times)/len(keygen_times),
        encrypt_ms=sum(encap_times)/len(encap_times),
        decrypt_ms=sum(decap_times)/len(decap_times),
        sign_ms=0.0,
        verify_ms=0.0,
        pk_size_bytes=pk_size,
        sk_size_bytes=sk_size,
        ct_size_bytes=ct_size,
        sig_size_bytes=0,
        peak_memory_kb=peak_memory_kb,
        nist_security_level=nist_level,
        classical_security_bits=0,
        post_quantum_security_bits=nist_level * 64,
        quantum_safe=True
    )
