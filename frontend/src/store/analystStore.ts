import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, RiskLevel, Confidence, Intent, SSEDoneEvent } from "../types/analyst.types";

interface AnalystState {
  sessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  contextEnabled: { simulation: boolean; report: boolean };
  initSession: (sessionId: string) => void;
  clearSession: () => void;
  addUserMessage: (text: string) => string;
  addStreamingPlaceholder: () => string;
  appendStreamChunk: (messageId: string, chunk: string) => void;
  finalizeStreamMessage: (messageId: string, event: SSEDoneEvent, intent: Intent) => void;
  markStreamError: (messageId: string, error: string) => void;
  setContextEnabled: (key: "simulation" | "report", value: boolean) => void;
}

function stripXmlTags(text: string): string {
  // Remove next_steps block
  let cleaned = text.replace(/<next_steps>[\s\S]*?<\/next_steps>/gi, "");
  // Remove individual tags
  cleaned = cleaned.replace(/<(risk_level|confidence|affects_algorithms)>[\s\S]*?<\/\1>/gi, "");
  // Normalize extra newlines
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}

export const useAnalystStore = create<AnalystState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      messages: [],
      isStreaming: false,
      streamingMessageId: null,
      contextEnabled: { simulation: true, report: true },
      initSession: (sessionId) => set({ sessionId, messages: [], isStreaming: false, streamingMessageId: null }),
      clearSession: () => set({ messages: [], isStreaming: false, streamingMessageId: null }),
      addUserMessage: (text) => {
        const id = uuidv4();
        set((s) => ({ messages: [...s.messages, { id, role: "user", content: text, timestamp: new Date() }] }));
        return id;
      },
      addStreamingPlaceholder: () => {
        const id = uuidv4();
        set((s) => ({
          messages: [...s.messages, { id, role: "assistant", content: "", timestamp: new Date(), isStreaming: true }],
          isStreaming: true,
          streamingMessageId: id,
        }));
        return id;
      },
      appendStreamChunk: (messageId, chunk) =>
        set((s) => ({
          messages: s.messages.map((m) => m.id === messageId ? { ...m, content: m.content + chunk } : m),
        })),
      finalizeStreamMessage: (messageId, event, intent) =>
        set((s) => ({
          isStreaming: false,
          streamingMessageId: null,
          messages: s.messages.map((m) =>
            m.id === messageId ? {
              ...m, isStreaming: false,
              content: stripXmlTags(m.content),
              riskLevel: event.risk_level, confidence: event.confidence,
              affectsAlgorithms: event.affects_algorithms, nextSteps: event.next_steps, intent,
            } : m
          ),
        })),
      markStreamError: (messageId, error) =>
        set((s) => ({
          isStreaming: false, streamingMessageId: null,
          messages: s.messages.map((m) => m.id === messageId ? { ...m, isStreaming: false, streamError: error } : m),
        })),
      setContextEnabled: (key, value) =>
        set((s) => ({ contextEnabled: { ...s.contextEnabled, [key]: value } })),
    }),
    {
      name: "qs-analyst-store",
      partialize: (s) => ({ sessionId: s.sessionId, messages: s.messages.slice(-30) }),
    }
  )
);
