from datetime import datetime
from typing import Dict, Any, List
from app.core.risk_assessment import calculate_risk_score

class ReportGenerator:
    def generate_comprehensive_report(
        self,
        system_info: Dict[str, Any],
        sim_data: List[dict],
        bench_data: List[dict],
        ai_enrichment: Dict[str, Any] = None
    ) -> dict:
        report = {
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "system_name": system_info.get("name", "Unknown System"),
                "files_scanned": system_info.get("files_scanned", 1),
                "version": "2.0",
                "classification": "CONFIDENTIAL",
            },
            "risk_assessment": [],
            "quantum_attack_simulation_summary": [],
            "performance_benchmarks": [],
            "ai_enrichment": ai_enrichment or {}
        }

        for item in system_info.get("algorithms", []):
            risk = calculate_risk_score(item.get("algorithm", ""), item.get("key_size", 0))
            report["risk_assessment"].append({
                "algorithm": item.get("algorithm"),
                "key_size": item.get("key_size"),
                "risk": risk
            })

        for sim in sim_data:
            report["quantum_attack_simulation_summary"].append({
                "algorithm": sim.get("algorithm"),
                "qubits_required": sim.get("result", {}).get("qubits_required_logical", "N/A"),
                "quantum_time_hours": sim.get("result", {}).get("quantum_hours", "N/A"),
                "classical_time_years": sim.get("result", {}).get("classical_years", "N/A")
            })

        for bench in bench_data:
            report["performance_benchmarks"].append({
                "algorithm": bench.get("algorithm"),
                "category": bench.get("category"),
                "keygen_ms": bench.get("keygen_ms"),
                "encrypt_ms": bench.get("encrypt_ms"),
                "peak_memory_kb": bench.get("peak_memory_kb")
            })

        return report
