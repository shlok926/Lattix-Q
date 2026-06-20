# Quantum Threat Intelligence & Algorithm Analysis

Classical public-key cryptosystems are built on mathematical problems that are easy to compute in one direction but difficult to invert (e.g., factoring large integers or finding discrete logarithms). Quantum computers fundamentally alter this security balance.

## Shor's Algorithm Threat Model
Shor's algorithm solves prime factorization and discrete logarithms in polynomial time.
* **RSA-2048**: Vulnerable to Shor's algorithm. Requires approximately 4,096 logical, error-corrected qubits to break.
* **ECC (ECDSA, ECDH)**: Broken faster than RSA. ECC-256 requires only around 2,330 logical qubits to factor/compromise.
* **Impact**: Total compromise of all classical asymmetric encryption, digital signatures, and key exchange handshakes.

## Grover's Algorithm Threat Model
Grover's algorithm speeds up unstructured searches quadratically, reducing the effective security of symmetric keys.
* **AES-128**: Security is reduced to 64 bits (vulnerable to brute force).
* **AES-256**: Security is reduced to 128 bits, which remains secure against brute-force attacks.
* **SHA-256 / SHA-3**: Collision resistance is slightly affected; doubling digest sizes mitigates the threat.
* **Mitigation**: Standardize on AES-256 and SHA-384/SHA-512 to preserve a safe security margin.
