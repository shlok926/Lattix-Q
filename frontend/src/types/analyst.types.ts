export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE" | "UNKNOWN";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type MessageRole = "user" | "assistant";
export type Intent =
  | "explain_attack" | "assess_vulnerability" | "compare_algorithms"
  | "migration_advice" | "interpret_report" | "timeline_question" | "general";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  riskLevel?: RiskLevel;
  confidence?: Confidence;
  affectsAlgorithms?: string[];
  nextSteps?: string[];
  intent?: Intent;
  isStreaming?: boolean;
  streamError?: string;
}

export interface SSEStartEvent { type: "start"; session_id: string; intent: Intent; }
export interface SSEChunkEvent { type: "chunk"; text: string; }
export interface SSEDoneEvent {
  type: "done";
  risk_level: RiskLevel;
  confidence: Confidence;
  affects_algorithms: string[];
  next_steps: string[];
}
export type SSEEvent = SSEStartEvent | SSEChunkEvent | SSEDoneEvent;

export interface ChatRequest {
  session_id: string;
  message: string;
  include_simulation_context?: boolean;
  include_report_context?: boolean;
}
