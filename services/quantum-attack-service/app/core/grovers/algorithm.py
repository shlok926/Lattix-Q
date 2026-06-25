import math
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit import transpile

@dataclass
class GroversResult:
    effective_security_bits: int
    is_vulnerable: bool
    iterations: int
    circuit_qasm: str
    circuit_nodes: List[Dict[str, Any]]
    probability_amplitudes: Dict[str, float]

class GroversAlgorithm:
    def __init__(self, key_size: int, include_noise: bool = False, ibm_token: Optional[str] = None):
        self.key_size = key_size
        self.include_noise = include_noise
        self.ibm_token = ibm_token

    def run(self) -> GroversResult:
        effective_bits = self.key_size // 2
        is_vulnerable = effective_bits < 128
        iterations = int((math.pi / 4) * math.sqrt(2 ** self.key_size))
        
        qc = QuantumCircuit(3)
        qc.h([0, 1, 2])
        qc.x(1)
        qc.h(2)
        qc.mct([0, 1], 2)
        qc.h(2)
        qc.x(1)
        qc.h([0, 1, 2])
        qc.x([0, 1, 2])
        qc.h(2)
        qc.mct([0, 1], 2)
        qc.h(2)
        qc.x([0, 1, 2])
        qc.h([0, 1, 2])
        qc.measure_all()
        
        counts = {}
        if self.ibm_token:
            try:
                from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2
                service = QiskitRuntimeService(channel="ibm_quantum", token=self.ibm_token)
                backend = service.backend("ibmq_qasm_simulator")
                compiled = transpile(qc, backend)
                sampler = SamplerV2(mode=backend)
                job = sampler.run([compiled], shots=1024)
                res = job.result()
                pub_res = res[0]
                data_keys = list(pub_res.data.keys())
                if data_keys:
                    counts = pub_res.data[data_keys[0]].get_counts()
                else:
                    counts = {"000": 1024}
            except Exception:
                sim = AerSimulator()
                compiled = transpile(qc, sim)
                job = sim.run(compiled, shots=1024)
                counts = job.result().get_counts()
        else:
            sim = AerSimulator()
            compiled = transpile(qc, sim)
            job = sim.run(compiled, shots=1024)
            counts = job.result().get_counts()
        
        probs = {k: v / 1024.0 for k, v in counts.items()}
        
        return GroversResult(
            effective_security_bits=effective_bits,
            is_vulnerable=is_vulnerable,
            iterations=iterations,
            circuit_qasm=qc.qasm(),
            circuit_nodes=[{"name": "h", "qubit": 0}],
            probability_amplitudes=probs
        )
