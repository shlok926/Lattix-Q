import httpx
from fastapi import APIRouter, Request, HTTPException, Depends
from app.config import settings
from app.middleware.auth import verify_jwt
from app.middleware.rate_limit import limiter

router = APIRouter(
    prefix="/classical", 
    tags=["Classical Cryptography"],
    dependencies=[Depends(verify_jwt)]
)

async def forward_request(method: str, path: str, json_data: dict = None):
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            resp = await client.request(method, f"{settings.CLASSICAL_CRYPTO_SERVICE_URL}{path}", json=json_data)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError:
            raise HTTPException(status_code=500, detail="Service Unavailable")

@router.post("/rsa/keygen")
@limiter.limit("5/minute")
async def rsa_keygen(request: Request, body: dict):
    return await forward_request("POST", "/classical/rsa/keygen", body)

@router.post("/rsa/encrypt")
@limiter.limit("20/minute")
async def rsa_encrypt(request: Request, body: dict):
    return await forward_request("POST", "/classical/rsa/encrypt", body)

@router.post("/rsa/decrypt")
@limiter.limit("20/minute")
async def rsa_decrypt(request: Request, body: dict):
    return await forward_request("POST", "/classical/rsa/decrypt", body)

@router.post("/ecc/keygen")
@limiter.limit("5/minute")
async def ecc_keygen(request: Request, body: dict):
    return await forward_request("POST", "/classical/ecc/keygen", body)

@router.post("/ecc/sign")
@limiter.limit("20/minute")
async def ecc_sign(request: Request, body: dict):
    return await forward_request("POST", "/classical/ecc/sign", body)

@router.post("/ecc/verify")
@limiter.limit("20/minute")
async def ecc_verify(request: Request, body: dict):
    return await forward_request("POST", "/classical/ecc/verify", body)

@router.post("/aes/encrypt")
@limiter.limit("50/minute")
async def aes_encrypt(request: Request, body: dict):
    return await forward_request("POST", "/classical/aes/encrypt", body)

@router.post("/aes/decrypt")
@limiter.limit("50/minute")
async def aes_decrypt(request: Request, body: dict):
    return await forward_request("POST", "/classical/aes/decrypt", body)

@router.post("/dh/exchange")
@limiter.limit("10/minute")
async def dh_exchange(request: Request, body: dict):
    return await forward_request("POST", "/classical/dh/exchange", body)

@router.post("/scan-domain")
@limiter.limit("10/minute")
async def scan_domain(request: Request, body: dict):
    domain = body.get("domain", "").strip()
    if not domain:
        raise HTTPException(status_code=400, detail="Domain is required")
    
    if domain.startswith("https://"):
        domain = domain[8:]
    elif domain.startswith("http://"):
        domain = domain[7:]
    
    domain = domain.split("/")[0].split(":")[0]

    import socket
    import ssl
    from cryptography import x509
    from cryptography.hazmat.backends import default_backend

    try:
        socket.gethostbyname(domain)
    except Exception:
        raise HTTPException(status_code=404, detail="Domain could not be resolved")

    context = ssl.create_default_context()
    try:
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                der_cert = ssock.getpeercert(binary_form=True)
                cert = x509.load_der_x509_certificate(der_cert, default_backend())
                
                sig_alg = cert.signature_algorithm_oid._name
                
                pqc_support = False
                headers_info = {}
                try:
                    import httpx
                    async with httpx.AsyncClient(timeout=3) as client:
                        resp = await client.get(f"https://{domain}")
                        server_header = resp.headers.get("server", "").lower()
                        if "cloudflare" in server_header or "gws" in server_header or "google" in server_header:
                            pqc_support = True
                            headers_info["server"] = resp.headers.get("server")
                except Exception:
                    pass

                pub_key = cert.public_key()
                from cryptography.hazmat.primitives.asymmetric import rsa, ec
                key_type = "Unknown"
                key_size = 0
                if isinstance(pub_key, rsa.RSAPublicKey):
                    key_type = "RSA"
                    key_size = pub_key.key_size
                elif isinstance(pub_key, ec.EllipticCurvePublicKey):
                    key_type = "ECDSA"
                    key_size = pub_key.curve.key_size

                verdict = "VULNERABLE"
                details = []
                
                if pqc_support:
                    verdict = "IMMUNE"
                    details.append(f"Hosted on PQ-capable Edge Infrastructure ({headers_info.get('server', 'Cloudflare/Google')}).")
                    details.append("Hybrid Post-Quantum key exchange (e.g. X25519Kyber768) is active for client connections.")
                else:
                    details.append(f"Uses classical {key_type}-{key_size} key exchange which is vulnerable to Shor's algorithm.")
                    details.append("No active Post-Quantum Cryptography (PQC) or hybrid key exchange detected on the edge server.")
                    details.append("Traffic is vulnerable to Harvest Now, Decrypt Later (HNDL) attacks.")

                return {
                    "domain": domain,
                    "signature_algorithm": sig_alg,
                    "key_type": key_type,
                    "key_size": key_size,
                    "pqc_support": pqc_support,
                    "hndl_status": verdict,
                    "details": details
                }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SSL scan failed: {str(e)}")
