from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SimulationContext(BaseModel):
    algorithm: str
    key_size: Optional[int] = None
    qubits_logical: Optional[int] = None
    qubits_physical: Optional[int] = None
    circuit_depth: Optional[int] = None
    classical_years: Optional[float] = None
    quantum_seconds: Optional[float] = None
    success_probability: Optional[float] = None

class VulnerabilityContext(BaseModel):
    overall_risk_score: Optional[int] = None
    risk_label: Optional[str] = None
    vulnerable_algorithms: List[str] = []
    safe_algorithms: List[str] = []
    recommendations: List[str] = []
    timeline_years: Optional[float] = None
    algorithm_details: Dict[str, Any] = {}

class BenchmarkContext(BaseModel):
    rsa_keygen_ms: Optional[float] = None
    kyber_keygen_ms: Optional[float] = None
    all_results: List[Dict] = []

class QuantumShieldContext(BaseModel):
    session_id: str
    simulation: Optional[SimulationContext] = None
    vulnerability: Optional[VulnerabilityContext] = None
    benchmark: Optional[BenchmarkContext] = None
