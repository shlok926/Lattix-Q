export type QuantumSafetyStatus = 
  'QUANTUM-SAFE' | 'QUANTUM-VULNERABLE' | 'PARTIALLY-AFFECTED' | 'UNKNOWN';

export type NISTLevel = 1 | 2 | 3 | 4 | 5;

export interface Algorithm {
  id: string;
  name: string;
  type: 'asymmetric' | 'symmetric' | 'kem' | 'signature' | 'hash';
  keySize: number;
  status: QuantumSafetyStatus;
  nistLevel: NISTLevel;
  isClassical: boolean;
  family: 'RSA' | 'ECC' | 'AES' | 'Kyber' | 'Dilithium' | 'FALCON' | 'SPHINCS';
}
