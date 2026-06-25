from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class ShorsRequest(BaseModel):
    key_size: int = Field(..., description="Key size in bits (e.g. 512, 1024, 2048)")
    include_noise: bool = Field(default=False)
    shots: int = Field(default=1024)
    ibm_token: Optional[str] = Field(default=None, description="Optional IBM Quantum API token")

class GroversRequest(BaseModel):
    key_size: int = Field(..., description="AES key size (128 or 256)")
    include_noise: bool = Field(default=False)
    ibm_token: Optional[str] = Field(default=None, description="Optional IBM Quantum API token")

class EstimatedTime(BaseModel):
    classical_years: float
    quantum_seconds: float

class SimulationResult(BaseModel):
    qubits_required_logical: int
    qubits_required_physical: int
    circuit_depth: int
    gate_count: int
    estimated_time: EstimatedTime
    success_probability: float
    circuit_qasm: Optional[str] = None
    circuit_nodes: Optional[List[Dict[str, Any]]] = None
    factors: Optional[List[int]] = None

class SimulationResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[SimulationResult] = None
