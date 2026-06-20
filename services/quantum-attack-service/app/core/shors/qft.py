from qiskit import QuantumCircuit
import math

def qft_circuit(n_qubits: int) -> QuantumCircuit:
    qc = QuantumCircuit(n_qubits)
    for i in range(n_qubits - 1, -1, -1):
        qc.h(i)
        for j in range(i - 1, -1, -1):
            qc.cp(math.pi / (2 ** (i - j)), j, i)
    return qc

def inverse_qft(n_qubits: int) -> QuantumCircuit:
    qc = qft_circuit(n_qubits).inverse()
    return qc
