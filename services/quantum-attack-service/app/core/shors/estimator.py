class QubitEstimator:
    @staticmethod
    def estimate_logical_qubits(n_bits: int) -> int:
        return 2 * n_bits + n_bits + 3

    @staticmethod
    def estimate_circuit_depth(n_bits: int) -> int:
        return 72 * (n_bits ** 3)

    @staticmethod
    def surface_code_distance(error_rate: float = 1e-3) -> int:
        return 27

    @staticmethod
    def estimate_physical_qubits(logical_qubits: int) -> int:
        return logical_qubits * 1000
