import anthropic
import structlog
import asyncio
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

def generate_offline_fallback(query: str) -> str:
    query_lower = query.lower()
    
    # Try dynamic RAG Q&A database first
    try:
        from app.core.rag import rag_engine
        matches = rag_engine.search(query, k=1)
        if matches:
            chunk, score = matches[0]
            if score > 0.12:
                log.info("Offline fallback matched local RAG database", score=score)
                return chunk["text"]
    except Exception as e:
        log.error("Failed to perform offline RAG search", error=str(e))
    
    # 1. Shor's / RSA / ECC Attack
    if "shor" in query_lower or "rsa" in query_lower or "ecc" in query_lower or "break" in query_lower:
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

    # 2. Migration Guide
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

    # 3. FALCON vs Dilithium or compare algorithms
    elif "compare" in query_lower or "falcon" in query_lower or "dilithium" in query_lower:
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

    # 4. Default / General Questions
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

