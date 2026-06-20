# Post-Quantum Cryptographic Migration Playbook (NIST SP 800-219)

Transitioning complex enterprise IT infrastructure from classical asymmetric algorithms (RSA, ECDSA) to PQC requires a structured lifecycle approach.

## Phase 1: Cryptographic Discovery & Asset Inventory
* Automatically scan application code, certificates, key vaults, and active network connections.
* Build a Cryptographic Bill of Materials (CBOM) listing every key, cipher suite, and parameter size in use.
* Flag systems using algorithms vulnerable to Shor's algorithm (RSA-2048, ECC-256, DH).

## Phase 2: Hybrid Transition Mode
* During the transition, deploy **Hybrid Key Exchange** (e.g., X25519 combined with ML-KEM-768).
* This protects data against "Harvest Now, Decrypt Later" (HNDL) threats while preserving legacy regulatory compliance (FIPS 140-2).
* Ensure that if either algorithm is broken, the connection remains secure.

## Phase 3: Pure PQC Implementation
* As infrastructure upgrades complete, decommission hybrid modes in favor of pure post-quantum algorithms.
* Implement Cryptographic Agility (crypto-agility) using software abstractions so algorithms can be updated via configurations without rewriting source code.
