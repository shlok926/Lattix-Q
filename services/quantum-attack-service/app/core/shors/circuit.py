from qiskit import QuantumCircuit
from app.core.shors.qft import inverse_qft

def build_shors_circuit(N: int, a: int, n_count: int) -> QuantumCircuit:
    qc = QuantumCircuit(n_count + 4, n_count)
    for q in range(n_count):
        qc.h(q)
    qc.x(n_count)
    for q in range(n_count):
        qc.cx(q, n_count)
    iqft = inverse_qft(n_count)
    qc.append(iqft, range(n_count))
    qc.measure(range(n_count), range(n_count))
    return qc
