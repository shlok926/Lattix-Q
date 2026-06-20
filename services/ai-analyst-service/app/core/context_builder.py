import httpx
import structlog
from typing import Optional
from app.config import settings
from app.models.context import (
    QuantumShieldContext, SimulationContext, VulnerabilityContext, BenchmarkContext,
)

log = structlog.get_logger()

class ContextBuilder:
    def __init__(self):
        self.base_url = settings.QUANTUMSHIELD_INTERNAL_API

    async def build_context(
        self,
        session_id: str,
        include_simulation: bool = True,
        include_report: bool = True,
        include_benchmarks: bool = True,
    ) -> QuantumShieldContext:
        ctx = QuantumShieldContext(session_id=session_id)
        async with httpx.AsyncClient(timeout=5.0) as client:
            if include_simulation:
                ctx.simulation = await self._fetch_latest_simulation(client, session_id)
            if include_report:
                ctx.vulnerability = await self._fetch_latest_report(client, session_id)
            if include_benchmarks:
                ctx.benchmark = await self._fetch_benchmark_summary(client)
        return ctx

    async def _fetch_latest_simulation(self, client, session_id) -> Optional[SimulationContext]:
        try:
            resp = await client.get(
                f"{self.base_url}/simulate/latest",
                headers={"X-Session-ID": session_id},
            )
            if resp.status_code == 200:
                data = resp.json()
                return SimulationContext(
                    algorithm=data.get("algorithm", "Unknown"),
                    key_size=data.get("key_size"),
                    qubits_logical=data.get("result", {}).get("qubits_required_logical"),
                    circuit_depth=data.get("result", {}).get("circuit_depth"),
                    classical_years=data.get("result", {}).get("estimated_time", {}).get("classical_years"),
                    quantum_seconds=data.get("result", {}).get("estimated_time", {}).get("quantum_seconds"),
                    success_probability=data.get("result", {}).get("success_probability"),
                )
        except Exception as e:
            log.warning("Failed to fetch simulation context", error=str(e))
        return None

    async def _fetch_latest_report(self, client, session_id) -> Optional[VulnerabilityContext]:
        try:
            resp = await client.get(
                f"{self.base_url}/report/latest",
                headers={"X-Session-ID": session_id},
            )
            if resp.status_code == 200:
                data = resp.json()
                return VulnerabilityContext(
                    overall_risk_score=data.get("overall_risk_score"),
                    risk_label=data.get("risk_label"),
                    vulnerable_algorithms=data.get("vulnerable_algorithms", []),
                    safe_algorithms=data.get("safe_algorithms", []),
                    recommendations=data.get("recommendations", []),
                    timeline_years=data.get("timeline_years"),
                    algorithm_details=data.get("algorithm_details", {}),
                )
        except Exception as e:
            log.warning("Failed to fetch vulnerability context", error=str(e))
        return None

    async def _fetch_benchmark_summary(self, client) -> Optional[BenchmarkContext]:
        try:
            resp = await client.get(f"{self.base_url}/benchmark/results")
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                rsa = next((r for r in results if "RSA" in r.get("algorithm", "")), None)
                kyber = next((r for r in results if "Kyber" in r.get("algorithm", "")), None)
                return BenchmarkContext(
                    rsa_keygen_ms=rsa.get("keygen_ms") if rsa else None,
                    kyber_keygen_ms=kyber.get("keygen_ms") if kyber else None,
                    all_results=results[:7],
                )
        except Exception as e:
            log.warning("Failed to fetch benchmark context", error=str(e))
        return None
