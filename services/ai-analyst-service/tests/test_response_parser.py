import pytest
from app.core.response_parser import ResponseParser

SAMPLE_RESPONSE = """
<risk_level>HIGH</risk_level>
<confidence>MEDIUM</confidence>
<affects_algorithms>RSA-2048, ECC-256, DH-2048</affects_algorithms>
<next_steps>
  <step>Migrate RSA key exchange to ML-KEM-768 (Kyber-768)</step>
  <step>Replace ECDSA with ML-DSA-65 (Dilithium3) for signatures</step>
  <step>Enable hybrid TLS 1.3 + Kyber on public endpoints</step>
</next_steps>

## Your RSA-2048 Setup Has a Quantum Problem

RSA-2048 requires approximately **4,000 logical qubits** and **4 million
physical qubits** (with surface code error correction) to break using
Shor's Algorithm...
"""

RESPONSE_MISSING_TAGS = """
Your RSA implementation is at risk from quantum computing.
You should migrate to post-quantum algorithms.
"""


class TestResponseParser:
    def setup_method(self):
        self.parser = ResponseParser()

    def test_parses_risk_level(self):
        result = self.parser.parse(SAMPLE_RESPONSE)
        assert result.risk_level == "HIGH"

    def test_parses_confidence(self):
        result = self.parser.parse(SAMPLE_RESPONSE)
        assert result.confidence == "MEDIUM"

    def test_parses_affected_algorithms(self):
        result = self.parser.parse(SAMPLE_RESPONSE)
        assert "RSA-2048" in result.affects_algorithms
        assert "ECC-256" in result.affects_algorithms
        assert len(result.affects_algorithms) == 3

    def test_parses_next_steps(self):
        result = self.parser.parse(SAMPLE_RESPONSE)
        assert len(result.next_steps) == 3
        assert "ML-KEM-768" in result.next_steps[0].text

    def test_strips_xml_from_markdown(self):
        result = self.parser.parse(SAMPLE_RESPONSE)
        assert "<risk_level>" not in result.markdown_content
        assert "<next_steps>" not in result.markdown_content
        assert "RSA-2048 Setup Has a Quantum Problem" in result.markdown_content

    def test_handles_missing_tags_gracefully(self):
        result = self.parser.parse(RESPONSE_MISSING_TAGS)
        assert result.risk_level == "UNKNOWN"
        assert result.confidence == "MEDIUM"
        assert result.affects_algorithms == []
        assert result.next_steps == []
        assert "at risk" in result.markdown_content
