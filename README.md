# LattixQ — Enterprise Post-Quantum Cryptography (PQC) Migration Platform

LattixQ is a comprehensive, production-grade cybersecurity and risk assessment platform designed to help enterprises inventory legacy cryptography systems, simulate post-quantum attacks, benchmark next-generation lattice-based algorithms, and plan migrations to PQC standards (ML-KEM, ML-DSA).

---

## 🚀 Key Features

* **Quantum Attack Laboratory**: Simulate factorization and attack complexity using Shor's and Grover's algorithms.
* **AI Code Scanner**: Detect vulnerable classical cryptography (RSA, ECC, MD5, SHA-1) in source code and recommend secure patches.
* **Crypto Workbench & Playbook**: Execute live performance comparisons of NIST-approved PQC schemes vs. classical standards.
* **Compliance Reports & Blueprints**: Score infrastructure vulnerabilities and check compliance against NIST SP 800-219, NSA CNSA 2.0, and GDPR post-quantum mandates.
* **AI Threat Analyst**: An interactive context-aware co-pilot to guide engineering teams through the cryptographic transition.

---

## 🛠️ Microservices Architecture

LattixQ is built as a Dockerized microservices mesh routed through an Nginx proxy.

| Service | Port | Description |
| :--- | :--- | :--- |
| **API Gateway** | `8000` | Gateway routing, JWT auth verification, and request rate-limiting. |
| **Quantum Attack Service** | `8001` | Mathematical Shor's & Grover's simulation engine built on Qiskit. |
| **Classical Crypto Service** | `8002` | Legacy cryptography modules (RSA, ECC, AES, DH). |
| **PQC Service** | `8003` | Post-quantum algorithms (Kyber, Dilithium, Falcon) powered by `liboqs`. |
| **Benchmark Service** | `8004` | Memory/CPU timing and encryption profiling suite. |
| **Report Service** | `8005` | Cryptographic maturity scoring and PDF/HTML report generators. |
| **AI Analyst Service** | `8006` | Context-aware AI Co-pilot assistant backend. |
| **Frontend Web Console** | `3000` | React (TypeScript + Vite) single-page dashboard console. |

---

## 📦 Quick Start

### Prerequisites
* Docker & Docker Compose
* Git

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/LattixQ.git
   cd LattixQ
   ```

2. Initialize configuration environment variables:
   ```bash
   cp .env.example .env
   ```

3. Build and launch all container services:
   ```bash
   docker-compose up -d --build
   ```

4. Access the interfaces:
   * **Web Console**: [http://localhost](http://localhost)
   * **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   * **AI Analyst API Docs**: [http://localhost:8006/docs](http://localhost:8006/docs)

---

## 💻 Tech Stack

* **Frontend**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Recharts, Lucide React
* **Backend**: Python 3.11, FastAPI, Qiskit 1.x, pyoqs (liboqs bindings), PyCryptodome, Celery
* **Infrastructure**: Docker Compose, Nginx, Redis 7, PostgreSQL 15, Prometheus, Grafana

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.
