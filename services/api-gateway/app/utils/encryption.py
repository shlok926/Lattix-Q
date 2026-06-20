import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.config import settings

class EncryptionService:
    """
    Service for AES-256-GCM encryption at rest (Layer 4).
    """
    def __init__(self):
        # In prod, this key should be loaded from a Secrets Manager
        key = getattr(settings, 'DB_ENCRYPTION_KEY', None)
        if not key:
            # Fallback for dev only - DO NOT DO THIS IN PROD
            self.key = AESGCM.generate_key(bit_length=256)
        else:
            self.key = base64.b64decode(key)
        
        self.aesgcm = AESGCM(self.key)

    def encrypt(self, data: str) -> str:
        if not data:
            return data
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, data.encode(), None)
        return base64.b64encode(nonce + ciphertext).decode()

    def decrypt(self, encrypted_data: str) -> str:
        if not encrypted_data:
            return encrypted_data
        try:
            data = base64.b64decode(encrypted_data)
            nonce = data[:12]
            ciphertext = data[12:]
            decrypted_data = self.aesgcm.decrypt(nonce, ciphertext, None)
            return decrypted_data.decode()
        except Exception as e:
            # Log error internally, return empty or raise
            return ""

encryption_service = EncryptionService()
