from dataclasses import dataclass

@dataclass
class AlgoBenchmark:
    algorithm: str
    category: str
    keygen_ms: float
    encrypt_ms: float
    decrypt_ms: float
    sign_ms: float
    verify_ms: float
    pk_size_bytes: int
    sk_size_bytes: int
    ct_size_bytes: int
    sig_size_bytes: int
    peak_memory_kb: float
    nist_security_level: int
    classical_security_bits: int
    post_quantum_security_bits: int
    quantum_safe: bool
