const ENCRYPTION_KEY_NAME = 'qs_crypto_salt';
const APP_PEPPER = 'QuantumShield_Pepper_2026_Secure';

async function getEncryptionKey(): Promise<CryptoKey> {
  let salt = localStorage.getItem(ENCRYPTION_KEY_NAME);
  if (!salt) {
    salt = btoa(String.fromCharCode(...window.crypto.getRandomValues(new Uint8Array(16))));
    localStorage.setItem(ENCRYPTION_KEY_NAME, salt);
  }

  // Derive a 256-bit key from the salt and pepper using PBKDF2
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(APP_PEPPER),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const saltBuffer = new Uint8Array(
    atob(salt).split('').map(char => char.charCodeAt(0))
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 10000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plain text string using AES-GCM 256-bit encryption.
 */
export async function encryptToken(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  } catch (err) {
    console.error('Encryption failed:', err);
    return '';
  }
}

/**
 * Decrypts an AES-GCM 256-bit encrypted string back to plain text.
 */
export async function decryptToken(cipherText: string): Promise<string> {
  if (!cipherText) return '';
  try {
    const key = await getEncryptionKey();
    const combined = new Uint8Array(
      atob(cipherText).split('').map(char => char.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error('Decryption failed:', err);
    return '';
  }
}
