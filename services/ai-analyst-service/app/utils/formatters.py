from app.models.context import QuantumShieldContext

def format_context_for_prompt(ctx: QuantumShieldContext) -> str:
    sections = []
    if ctx.simulation:
        s = ctx.simulation
        lines = [f"LATEST SIMULATION: {s.algorithm}"]
        if s.key_size: lines.append(f"  Key size: {s.key_size} bits")
        if s.qubits_logical: lines.append(f"  Logical qubits needed: {s.qubits_logical:,}")
        if s.classical_years: lines.append(f"  Classical factoring time: {s.classical_years:.2e} years")
        if s.quantum_seconds is not None:
            t = f"{s.quantum_seconds:.1f}s" if s.quantum_seconds < 3600 else f"{s.quantum_seconds/3600:.1f}h"
            lines.append(f"  Quantum factoring time: {t}")
        if s.success_probability: lines.append(f"  Success probability: {s.success_probability*100:.1f}%")
        sections.append("\n".join(lines))
    if ctx.vulnerability:
        v = ctx.vulnerability
        lines = ["VULNERABILITY REPORT:"]
        if v.overall_risk_score is not None: lines.append(f"  Risk score: {v.overall_risk_score}/100 ({v.risk_label})")
        if v.vulnerable_algorithms: lines.append(f"  Vulnerable: {', '.join(v.vulnerable_algorithms)}")
        if v.safe_algorithms: lines.append(f"  Safe: {', '.join(v.safe_algorithms)}")
        if v.algorithm_details:
            lines.append("  Per-algorithm risk:")
            for algo, detail in list(v.algorithm_details.items())[:5]:
                score = detail.get("risk_score", "?")
                vuln = "VULNERABLE" if detail.get("quantum_vulnerable") else "SAFE"
                lines.append(f"    - {algo}: score={score}/100, {vuln}")
        sections.append("\n".join(lines))
    if ctx.benchmark:
        b = ctx.benchmark
        lines = ["BENCHMARK DATA:"]
        if b.rsa_keygen_ms: lines.append(f"  RSA-2048 keygen: {b.rsa_keygen_ms:.1f} ms")
        if b.kyber_keygen_ms: lines.append(f"  Kyber-768 keygen: {b.kyber_keygen_ms:.1f} ms")
        sections.append("\n".join(lines))
    return "\n\n".join(sections)
