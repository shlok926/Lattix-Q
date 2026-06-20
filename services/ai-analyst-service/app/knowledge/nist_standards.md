# NIST Post-Quantum Cryptography Standardization Guidelines (FIPS 203, FIPS 204, FIPS 205)

The National Institute of Standards and Technology (NIST) has officially released the first finalized standards for post-quantum cryptography (PQC) designed to withstand attacks from cryptanalytically relevant quantum computers.

## ML-KEM (FIPS 203)
Module-Lattice-Based Key-Encapsulation Mechanism (derived from CRYSTALS-Kyber).
* **Usage**: Primary standard for general encryption, including TLS key exchange.
* **Security Strengths**: Based on the hardness of the Module Learning With Errors (M-LWE) problem.
* **Key Sizes**: ML-KEM-512 (Category 1, AES-128 equivalent), ML-KEM-768 (Category 3, AES-192 equivalent), ML-KEM-1024 (Category 5, AES-256 equivalent).

## ML-DSA (FIPS 204)
Module-Lattice-Based Digital Signature Algorithm (derived from CRYSTALS-Dilithium).
* **Usage**: Primary standard for general-purpose digital signatures (code signing, certificates).
* **Security Strengths**: Based on M-LWE and Module Short Integer Solution (M-SIS) problems.
* **Parameters**: ML-DSA-44, ML-DSA-65, ML-DSA-87.

## SLH-DSA (FIPS 205)
Stateless Hash-Based Digital Signature Algorithm (derived from SPHINCS+).
* **Usage**: Alternative signature standard, recommended if lattice-based assumptions fail.
* **Security Strengths**: Relies entirely on the security of cryptographic hash functions (SHA-256, SHAKE256).
* **Cons**: Larger signature sizes and slower signing times compared to ML-DSA.
