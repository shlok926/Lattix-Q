def calculate_risk_score(algorithm: str, key_size: int) -> dict:
    algo_upper = algorithm.upper()
    
    if "RSA" in algo_upper:
        if key_size <= 2048:
            return {"score": 9.5, "level": "CRITICAL", "timeline": "Vulnerable < 2030"}
        return {"score": 8.0, "level": "HIGH", "timeline": "Vulnerable < 2035"}
        
    if "ECC" in algo_upper or "ECDSA" in algo_upper:
        if key_size <= 256:
            return {"score": 9.0, "level": "CRITICAL", "timeline": "Vulnerable < 2030"}
        return {"score": 8.0, "level": "HIGH", "timeline": "Vulnerable < 2035"}
        
    if "AES" in algo_upper:
        if key_size == 128:
            return {"score": 6.0, "level": "MEDIUM", "timeline": "Vulnerable < 2040 (Grover's)"}
        return {"score": 2.0, "level": "LOW", "timeline": "Quantum Safe"}
        
    if "KYBER" in algo_upper or "DILITHIUM" in algo_upper or "FALCON" in algo_upper or "SPHINCS" in algo_upper:
        return {"score": 1.0, "level": "SAFE", "timeline": "Post-Quantum Safe"}
        
    return {"score": 5.0, "level": "UNKNOWN", "timeline": "Unknown"}
