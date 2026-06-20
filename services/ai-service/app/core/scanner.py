import re
from typing import List, Dict

class CodeScanner:
    PATTERNS = {
        "RSA": r"(RSA\.generate|RSA\.import_key|asymmetric\.rsa)",
        "ECC": r"(ECC\.generate|asymmetric\.ec|ECDSA)",
        "MD5": r"(hashlib\.md5|MD5\.new)",
        "SHA1": r"(hashlib\.sha1|SHA1\.new)",
        "DES": r"(DES\.new|DES3\.new)",
        "HardcodedKey": r"(api_key|secret_key|private_key)\s*=\s*['\"][a-zA-Z0-9]{32,}['\"]"
    }

    def scan_code(self, code: str) -> List[Dict]:
        findings = []
        lines = code.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            for tech, pattern in self.PATTERNS.items():
                if re.search(pattern, line):
                    findings.append({
                        "line": line_num,
                        "technology": tech,
                        "content": line.strip(),
                        "risk": "High" if tech in ["RSA", "ECC", "MD5", "SHA1", "DES"] else "Medium",
                        "suggestion": self._get_suggestion(tech)
                    })
        return findings

    def _get_suggestion(self, tech: str) -> str:
        suggestions = {
            "RSA": "Migrate to Kyber-768 or Dilithium-2 (ML-KEM/ML-DSA).",
            "ECC": "Migrate to Dilithium or SPHINCS+ for signatures.",
            "MD5": "Use SHA-256 or SHA-3 for non-quantum-resistant hashing; use TupleHash for QR hashing.",
            "SHA1": "Upgrade to SHA-3-256.",
            "DES": "Upgrade to AES-256 or a quantum-resistant symmetric cipher.",
            "HardcodedKey": "Use a secrets manager (Vault/AWS Secrets Manager) and avoid hardcoded keys."
        }
        return suggestions.get(tech, "Upgrade to post-quantum equivalent.")
