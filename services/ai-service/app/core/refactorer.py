import re

class CodeRefactorer:
    def __init__(self):
        # Define the refactoring templates
        self.replacements = {
            "RSA": {
                "pattern": r"cryptography\.hazmat\.primitives\.asymmetric\.rsa",
                "replacement": "pqcrypto.kem.kyber768",
                "code_pattern": r"rsa\.generate_private_key\(public_exponent=65537,\s*key_size=(\d+)\)",
                "code_replacement": "kyber768.generate_keypair()  # Quantum-Safe Replacement (NIST Standard)"
            },
            "ECC": {
                "pattern": r"cryptography\.hazmat\.primitives\.asymmetric\.ec",
                "replacement": "pqcrypto.sign.dilithium3",
                "code_pattern": r"ec\.generate_private_key\(ec\.SECP(\d+)R1\(\)\)",
                "code_replacement": "dilithium3.generate_keypair()  # NIST PQC Level 3 Signature"
            },
            "MD5": {
                "pattern": r"hashlib\.md5",
                "replacement": "hashlib.sha256",
                "code_pattern": r"hashlib\.md5\((.*?)\)",
                "code_replacement": r"hashlib.sha256(\1)  # Upgraded to Collision-Resistant SHA-256"
            },
            "SHA1": {
                "pattern": r"hashlib\.sha1",
                "replacement": "hashlib.sha3_256",
                "code_pattern": r"hashlib\.sha1\((.*?)\)",
                "code_replacement": r"hashlib.sha3_256(\1)  # Upgraded to Quantum-Resistant SHA-3"
            },
            "HardcodedKey": {
                "pattern": r"=(.*)",
                "replacement": "= os.getenv('CRYPTO_KEY')  # Avoid Hardcoded Secrets",
                "code_pattern": r"(api_key|secret_key|private_key)\s*=\s*['\"][a-zA-Z0-9]{32,}['\"]",
                "code_replacement": r"\1 = os.getenv('SECRET_KEY')  # Use Environment Variables"
            }
        }

    def refactor_code(self, code: str, findings: list) -> dict:
        """
        Takes vulnerable code and findings, applies smart regex replacements
        to convert classical crypto to PQC equivalents.
        """
        refactored_code = code
        applied_fixes = []

        for finding in findings:
            tech = finding.get("technology")
            if tech in self.replacements:
                rules = self.replacements[tech]
                
                # Replace actual function calls first (more specific)
                old_code = refactored_code
                refactored_code = re.sub(rules["code_pattern"], rules["code_replacement"], refactored_code)
                
                # Replace imports (more general)
                refactored_code = re.sub(rules["pattern"], rules["replacement"], refactored_code)
                
                if old_code != refactored_code:
                    applied_fixes.append(f"Auto-Migrated {tech} to Post-Quantum.")

        return {
            "original_code": code,
            "refactored_code": refactored_code,
            "fixes_applied": list(set(applied_fixes)),
            "message": "Successfully generated Quantum-Safe code." if applied_fixes else "No auto-fix patterns matched."
        }
