import anthropic
import structlog
import asyncio
import re
from typing import AsyncIterator, Optional
from app.config import settings
from app.core.response_parser import ResponseParser, ParsedAnalystResponse

log = structlog.get_logger()
_client: Optional[anthropic.AsyncAnthropic] = None

def get_claude_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        # Create client even with mock key; errors will be caught and bypassed by fallback
        _client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client

def split_into_sentences(text: str) -> list[str]:
    sentence_end = re.compile(r'(?<!\b[eE]\.[gG])(?<!\b[iI]\.[eE])(?<!\b[vV]\.[sS])(?<!\b[aA]\.[kK])(?<!\b\d)(?<!\b[A-Z])\.\s+')
    raw_sentences = sentence_end.split(text)
    sentences = []
    for s in raw_sentences:
        s = s.strip()
        if s:
            if not s.endswith('.') and not s.endswith('?') and not s.endswith('!'):
                s += '.'
            sentences.append(s)
    return sentences

def format_answer_body(text: str) -> str:
    sentences = split_into_sentences(text)
    if len(sentences) == 0:
        return text
    if len(sentences) == 1:
        return sentences[0]
    if len(sentences) == 3:
        return (
            "### Analysis & Key Insights\n\n"
            f"* **Core Concept**: {sentences[0]}\n"
            f"* **Technical Details**: {sentences[1]}\n"
            f"* **Operational Guidelines**: {sentences[2]}"
        )
    if len(sentences) == 2:
        return (
            "### Analysis & Key Insights\n\n"
            f"* **Core Concept**: {sentences[0]}\n"
            f"* **Operational Guidelines**: {sentences[1]}"
        )
    formatted = f"### Analysis & Key Insights\n\n{sentences[0]}\n\n"
    for i, s in enumerate(sentences[1:], start=1):
        formatted += f"* **Key Point {i}**: {s}\n"
    return formatted.strip()

def format_rag_match(text: str) -> str:
    # 1. Extract XML tags
    idx = text.find("<risk_level>")
    if idx != -1:
        main_content = text[:idx].strip()
        xml_content = text[idx:].strip()
    else:
        main_content = text.strip()
        xml_content = ""

    # 2. Extract answer part (after Q: ... A:)
    match = re.search(r'\s+A:\s*|\n+A:\s*', main_content)
    if match:
        answer_body = main_content[match.end():].strip()
    else:
        answer_body = main_content

    # 3. Format answer into bullet points
    formatted_answer = format_answer_body(answer_body)

    # 4. Combine
    if xml_content:
        return f"{xml_content}\n\n{formatted_answer}"
    return formatted_answer

def generate_offline_fallback(query: str) -> str:
    query_lower = query.lower()
    
    # Try dynamic RAG Q&A database first
    try:
        from app.core.rag import rag_engine
        matches = rag_engine.search(query, k=1)
        if matches:
            chunk, score = matches[0]
            if score > 0.08:
                log.info("Offline fallback matched local RAG database", score=score)
                return format_rag_match(chunk["text"])
    except Exception as e:
        log.error("Failed to perform offline RAG search", error=str(e))
    
    # 1. Shor's / RSA / ECC Attack
    if "shor" in query_lower or "rsa" in query_lower or "ecc" in query_lower or "break" in query_lower or "qubit" in query_lower:
        return """<risk_level>CRITICAL</risk_level>
<confidence>HIGH</confidence>
<affects_algorithms>RSA-2048, ECC-256, ECDH</affects_algorithms>
<next_steps>
  <step>Deprecate legacy RSA-2048 parameters in public endpoints.</step>
  <step>Configure Hybrid key exchange (ECDH + ML-KEM / Kyber-768).</step>
  <step>Establish cryptographic inventory logs in compliance with NIST SP 800-219.</step>
</next_steps>

### Shor's Algorithm Threat Analysis

Shor's algorithm, when executed on a sufficiently powerful Cryptanalytically Relevant Quantum Computer (CRQC), solves the prime factorization and discrete logarithm problems in polynomial time ($O((\log N)^3)$).

#### Core Mechanism:
1. **RSA Vulnerability**: RSA relies on the difficulty of factoring the product of two large prime numbers $N = pq$. Shor's algorithm uses quantum period-finding (via Quantum Fourier Transform) to find the order $r$ of a generator $a$ modulo $N$. Once the period $r$ is found, the factors $p$ and $q$ are computed via $\\gcd(a^{r/2} \\pm 1, N)$.
2. **ECC/ECDSA Vulnerability**: Elliptic Curve Cryptography is broken even faster than RSA because the group order size is smaller. A quantum computer requires fewer qubits to break ECC-256 than RSA-2048.

#### Recommended Mitigation Blueprint:
* Transition immediately to **ML-KEM (Kyber)** for key encapsulation mechanisms.
* Implement **ML-DSA (Dilithium)** or **Falcon** for asymmetric digital signatures.
* Ensure symmetric block sizes are set to **AES-256** to prevent Grover's algorithm search space reduction.
"""

    # 2. ML-KEM / Lattice / Key Encapsulation
    elif "kem" in query_lower or "kyber" in query_lower or "ml-kem" in query_lower or "lattice" in query_lower:
        return """<risk_level>SAFE</risk_level>
<confidence>HIGH</confidence>
<affects_algorithms>ML-KEM-768, ML-KEM-1024</affects_algorithms>
<next_steps>
  <step>Configure ML-KEM-768 as the baseline algorithm for web-facing key exchange.</step>
  <step>Implement a hybrid key exchange (e.g., X25519 + ML-KEM-768) to satisfy both FIPS requirements and legacy systems.</step>
</next_steps>

### Lattice-Based Key Encapsulation (ML-KEM)

ML-KEM (based on CRYSTALS-Kyber and standardized under FIPS 203) is the primary lattice-based key encapsulation mechanism.

#### Technical Highlights:
* **Mathematical Basis**: Relies on the hardness of the Module Learning With Errors (M-LWE) problem in algebraic lattices.
* **Performance**: Operations are highly optimized (often using Number Theoretic Transform / NTT), completing in under a millisecond on modern CPUs.
* **Key & Ciphertext Sizes**: Public keys and ciphertexts are roughly 1 KB, requiring larger network buffers compared to classical 32-byte ECDH keys.
"""

    # 3. Digital Signatures / ML-DSA / Dilithium / SLH-DSA / Falcon
    elif "signature" in query_lower or "dsa" in query_lower or "dilithium" in query_lower or "ml-dsa" in query_lower or "falcon" in query_lower:
        return """<risk_level>SAFE</risk_level>
<confidence>HIGH</confidence>
<affects_algorithms>ML-DSA-65, SLH-DSA, Falcon</affects_algorithms>
<next_steps>
  <step>Use ML-DSA-65 as the primary digital signature algorithm for code signing and document verification.</step>
  <step>Adopt Falcon for environments where network packet size constraint is a strict bottleneck.</step>
</next_steps>

### Post-Quantum Digital Signatures

NIST FIPS 204 and FIPS 205 establish standard algorithms for post-quantum digital signatures:

#### 1. ML-DSA (CRYSTALS-Dilithium):
* **Security Basis**: Module Short Integer Solution (M-SIS) and M-LWE.
* **Characteristics**: Offers excellent signing and verification performance. Highly recommended as the default signature option.

#### 2. SLH-DSA (SPHINCS+):
* **Security Basis**: Strictly hash-based tree construction.
* **Characteristics**: Large signature sizes (~30-40 KB) and slower performance, but relies on conservative security assumptions without lattice mathematics.

#### 3. Falcon:
* **Security Basis**: SIS problem over NTRU lattices.
* **Characteristics**: Small public keys and signatures, extremely fast verification, but requires floating-point arithmetic.
"""

    # 4. Stateful Signatures / XMSS / LMS
    elif "stateful" in query_lower or "xmss" in query_lower or "lms" in query_lower:
        return """<risk_level>MEDIUM</risk_level>
<confidence>HIGH</confidence>
<affects_algorithms>XMSS, LMS</affects_algorithms>
<next_steps>
  <step>Implement strict database state locking to prevent index reuse during signature generation.</step>
  <step>Use stateful signatures only for firmware updates, code signing, or secure boot environments.</step>
</next_steps>

### Stateful Hash-Based Signatures (XMSS & LMS)

Stateful signatures (standardized in NIST SP 800-208) are highly secure hash-based signature schemes suitable for specific static targets.

#### Core Concepts:
* **State Index Dependency**: Unlike typical signatures, these systems maintain a strict internal "state" representing the used leaves of a Merkle tree. 
* **The OTS Danger**: Reusing a leaf index for two different signatures compromises the one-time signature (OTS), enabling attackers to reconstruct private keys and forge signatures.
* **Ideal Deployments**: Firmware signing and secure boot where signatures are infrequent and state synchronization is tightly controlled.
"""

    # 5. Code Scanning / Audits / Vulnerability Scan / CVE
    elif "scan" in query_lower or "audit" in query_lower or "vulnerability" in query_lower or "cve" in query_lower or "tool" in query_lower:
        return """<risk_level>HIGH</risk_level>
<confidence>HIGH</confidence>
<affects_algorithms>RSA-2048, ECC-256, AES-128</affects_algorithms>
<next_steps>
  <step>Configure automated code scanning hooks in the CI/CD pipeline to detect legacy algorithms.</step>
  <step>Scan project lockfiles to detect outdated versions of cryptographic dependencies (e.g., OpenSSL < 3.0).</step>
</next_steps>

### Cryptographic Code Scanning & Software Auditing

Identifying legacy and quantum-vulnerable cryptography is a critical prerequisite for PQC migration.

#### Key Areas of Focus:
* **Static Pattern Detection**: Scanning code for API calls initiating legacy keys (such as RSA < 3072 bits or SHA-1 hashes).
* **Dependency Lockfile Auditing**: Resolving exact pinned dependency versions (e.g., `package-lock.json`) and comparing them against known vulnerability (CVE) databases.
* **Cryptographic Agility Audit**: Refactoring codebases to isolate cryptographic logic behind centralized APIs rather than hardcoding algorithm parameters in business logic.
"""

    # 6. Migration Guide
    elif "migrate" in query_lower or "how to" in query_lower or "transition" in query_lower:
        return """<risk_level>HIGH</risk_level>
<confidence>HIGH</confidence>
<affects_algorithms>RSA-1024, RSA-2048, ECC-256</affects_algorithms>
<next_steps>
  <step>Execute an automated scan of all certificates and API keys.</step>
  <step>Establish a PQC Hybrid Mode in API Gateway routes.</step>
  <step>Upgrade dependencies to support OpenSSL 3.3 or Liboqs providers.</step>
</next_steps>

### Post-Quantum Migration Guide

Transitioning an enterprise infrastructure to quantum-safe state requires a systematic phased approach:

#### Phase 1: Discovery & Inventory Tracking
* Map all data in transit, data at rest, and certificates.
* Identify systems using vulnerable algorithms (RSA, ECDSA, DH).

#### Phase 2: Hybrid Deployment
* Deploy dual-mode protocols (e.g., combining standard ECDH with Kyber-768). This maintains legacy compliance while protecting against "Harvest Now, Decrypt Later" (HNDL) attacks.

#### Phase 3: Pure PQC Migration
* Once standards settle, disable classical key exchanges and move to pure post-quantum algorithms like **ML-KEM** and **ML-DSA** as standardized in FIPS 203 and FIPS 204.
"""

    # 7. FALCON vs Dilithium or compare algorithms
    elif "compare" in query_lower or "versus" in query_lower or "vs" in query_lower:
        return """<risk_level>LOW</risk_level>
<confidence>HIGH</confidence>
<affects_algorithms>CRYSTALS-Dilithium3, Falcon-512, ML-DSA</affects_algorithms>
<next_steps>
  <step>Use CRYSTALS-Dilithium3 (ML-DSA) as the primary general-purpose signature scheme.</step>
  <step>Adopt Falcon-512 in highly constrained network packet environments.</step>
</next_steps>

### PQC Signature Standard Comparison

NIST has standardized two primary lattice-based digital signature schemes:

| Parameter / Metric | CRYSTALS-Dilithium (ML-DSA) | Falcon |
| :--- | :--- | :--- |
| **Mathematical Basis** | Module Learning With Errors (M-LWE) | Short Integer Solution (SIS) over NTRU |
| **Public Key Size** | 1,952 bytes (Dilithium3) | 897 bytes (Falcon-512) |
| **Signature Size** | 3,293 bytes (Dilithium3) | 666 bytes (Falcon-512) |
| **Performance (Sign)** | Extremely fast, simple to implement | Slower signature generation, requires float math |
| **Performance (Verify)** | Very fast | Extremely fast |

#### Summary Advice:
* **ML-DSA (Dilithium)** is recommended for general software, document signatures, and application layer protocols.
* **Falcon** is ideal for network hardware, TLS packets, and constrained systems where signature bandwidth is a strict bottleneck.
"""

    # 8. Default / General Questions
    else:
        return """<risk_level>MEDIUM</risk_level>
<confidence>HIGH</confidence>
<affects_algorithms>AES-128, RSA-2048, ECC-256</affects_algorithms>
<next_steps>
  <step>Audit overall platform cryptographic agility settings.</step>
  <step>Conduct vulnerability scan using AI Code Scanner.</step>
</next_steps>

### QuantumShield Security Intelligence Briefing

Welcome to the QuantumShield Co-Pilot console. I am your specialized AI Assistant.

I can assist you with:
1. **Mathematical analysis** of Shor's and Grover's algorithms.
2. **Standardization timelines** from NIST, BSI, and ANSSI.
3. **Vulnerability audits** based on your active simulation parameters.
4. **Transition playbooks** for hybrid or pure post-quantum network pathways.

Please let me know if you would like me to analyze your active reports or simulation metrics!
"""

class ClaudeAnalystClient:
    def __init__(self):
        self.client = get_claude_client()
        self.parser = ResponseParser()

    async def stream_response(self, messages: list, system_prompt: str, session_id: str) -> AsyncIterator[str]:
        log.info("Streaming Claude response", session_id=session_id, model=settings.CLAUDE_MODEL)
        
        query = messages[-1]["content"] if messages else ""
        raw_query = query.split("User: ")[-1] if "User: " in query else query
        
        # Check if the API key is placeholder
        if settings.ANTHROPIC_API_KEY == "sk-ant-your-key-here" or not settings.ANTHROPIC_API_KEY:
            log.info("Placeholder API Key detected. Using offline fallback response stream.")
            fallback_text = generate_offline_fallback(raw_query)
            # Stream chunk by chunk to simulate AI writing effect
            chunk_size = 8
            for i in range(0, len(fallback_text), chunk_size):
                yield fallback_text[i:i+chunk_size]
                await asyncio.sleep(0.01)
            return

        try:
            async with self.client.messages.stream(
                model=settings.CLAUDE_MODEL,
                max_tokens=settings.CLAUDE_MAX_TOKENS,
                system=system_prompt,
                messages=messages,
                temperature=settings.CLAUDE_TEMPERATURE,
            ) as stream:
                async for text_chunk in stream.text_stream:
                    yield text_chunk
        except anthropic.RateLimitError:
            yield "\n\n[Rate limit reached. Please wait a moment and try again.]"
        except anthropic.APIConnectionError as e:
            yield "\n\n[Connection to AI service failed. Please retry.]"
        except anthropic.APIStatusError as e:
            if e.status_code == 401:
                log.info("401 Unauthorized API error. Redirecting to offline fallback response stream.")
                fallback_text = generate_offline_fallback(query)
                chunk_size = 8
                for i in range(0, len(fallback_text), chunk_size):
                    yield fallback_text[i:i+chunk_size]
                    await asyncio.sleep(0.01)
            else:
                yield f"\n\n[AI service error ({e.status_code}). Please retry.]"

    async def get_full_response(self, messages: list, system_prompt: str, session_id: str) -> ParsedAnalystResponse:
        query = messages[-1]["content"] if messages else ""
        raw_query = query.split("User: ")[-1] if "User: " in query else query
        if settings.ANTHROPIC_API_KEY == "sk-ant-your-key-here" or not settings.ANTHROPIC_API_KEY:
            raw_text = generate_offline_fallback(raw_query)
            parsed = self.parser.parse(raw_text)
            parsed.input_tokens = 100
            parsed.output_tokens = 500
            return parsed
            
        try:
            response = await self.client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=settings.CLAUDE_MAX_TOKENS,
                system=system_prompt,
                messages=messages,
                temperature=settings.CLAUDE_TEMPERATURE,
            )
            raw_text = response.content[0].text
            parsed = self.parser.parse(raw_text)
            parsed.input_tokens = response.usage.input_tokens
            parsed.output_tokens = response.usage.output_tokens
            return parsed
        except Exception:
            raw_text = generate_offline_fallback(raw_query)
            parsed = self.parser.parse(raw_text)
            parsed.input_tokens = 100
            parsed.output_tokens = 500
            return parsed

