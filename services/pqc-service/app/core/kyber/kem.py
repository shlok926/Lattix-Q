import base64
import time
import oqs

def _get_kyber_name(variant: int):
    if variant == 512:
        return "Kyber512"
    elif variant == 768:
        return "Kyber768"
    elif variant == 1024:
        return "Kyber1024"
    raise ValueError("Invalid Kyber variant")

def _get_nist_level(variant: int):
    return {512: 1, 768: 3, 1024: 5}.get(variant, 1)

def kyber_keygen(variant: int = 768):
    alg_name = _get_kyber_name(variant)
    start_time = time.perf_counter()
    with oqs.KeyEncapsulation(alg_name) as kem:
        pub_key = kem.generate_keypair()
        priv_key = kem.export_secret_key()
        keygen_ms = (time.perf_counter() - start_time) * 1000
        
        return {
            "pub_b64": base64.b64encode(pub_key).decode('utf-8'),
            "priv_b64": base64.b64encode(priv_key).decode('utf-8'),
            "pk_size": kem.details['length_public_key'],
            "sk_size": kem.details['length_secret_key'],
            "keygen_ms": keygen_ms,
            "nist_level": _get_nist_level(variant)
        }

def kyber_encapsulate(pub_b64: str, variant: int = 768):
    alg_name = _get_kyber_name(variant)
    pub_key = base64.b64decode(pub_b64)
    start_time = time.perf_counter()
    
    with oqs.KeyEncapsulation(alg_name) as kem:
        ciphertext, shared_secret = kem.encap_secret(pub_key)
        encap_ms = (time.perf_counter() - start_time) * 1000
        
        return {
            "ciphertext_b64": base64.b64encode(ciphertext).decode('utf-8'),
            "shared_secret_b64": base64.b64encode(shared_secret).decode('utf-8'),
            "ct_size": kem.details['length_ciphertext'],
            "encap_ms": encap_ms
        }

def kyber_decapsulate(priv_b64: str, ct_b64: str, variant: int = 768):
    alg_name = _get_kyber_name(variant)
    priv_key = base64.b64decode(priv_b64)
    ciphertext = base64.b64decode(ct_b64)
    start_time = time.perf_counter()
    
    with oqs.KeyEncapsulation(alg_name) as kem:
        kem.secret_key = priv_key
        shared_secret = kem.decap_secret(ciphertext)
        decap_ms = (time.perf_counter() - start_time) * 1000
        
        return {
            "shared_secret_b64": base64.b64encode(shared_secret).decode('utf-8'),
            "decap_ms": decap_ms
        }
