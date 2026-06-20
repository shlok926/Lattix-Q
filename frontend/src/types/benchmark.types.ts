export interface BenchmarkResult {
  algo: string;
  keygen: number;
  sign: number | null;
  verify: number | null;
  keySize: number;
  sigSize: number | null;
  level: number;
  safe: boolean;
}
