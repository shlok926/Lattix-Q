export type SimulationAlgorithm = 'SHORS' | 'GROVERS';
export type SimulationStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface SimulationResult {
  algorithm: SimulationAlgorithm;
  target: string;
  qubitsRequired: number;
  circuitDepth: number;
  gateCount: number;
  classicalTimeYears: number;
  quantumTimeSeconds: number;
  successProbability: number;
  isCryptographicBreak: boolean;
}
