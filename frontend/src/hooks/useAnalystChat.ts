import { useRef, useCallback } from "react";
import { analystApi } from "../api/analystApi";
import { useAnalystStore } from "../store/analystStore";
import { useNotificationStore } from "../store/notificationStore";
import { Intent, SSEDoneEvent } from "../types/analyst.types";

export function useAnalystChat() {
  const abortRef = useRef<AbortController | null>(null);
  const intentRef = useRef<Intent>("general");
  const { sessionId, isStreaming, contextEnabled,
          addUserMessage, addStreamingPlaceholder,
          appendStreamChunk, finalizeStreamMessage, markStreamError } = useAnalystStore();

  const sendMessage = useCallback(async (text: string) => {
    if (!sessionId || isStreaming || !text.trim()) return;
    addUserMessage(text.trim());
    const placeholderId = addStreamingPlaceholder();
    abortRef.current = analystApi.streamChat(
      { session_id: sessionId, message: text.trim(),
        include_simulation_context: contextEnabled.simulation,
        include_report_context: contextEnabled.report },
      {
        onStart: (e) => { intentRef.current = e.intent; },
        onChunk: (chunk) => { appendStreamChunk(placeholderId, chunk); },
        onDone: (e: SSEDoneEvent) => { 
          finalizeStreamMessage(placeholderId, e, intentRef.current); 
          abortRef.current = null; 
          
          // Trigger security notification if risk level is CRITICAL or HIGH
          if (e.risk_level === "CRITICAL" || e.risk_level === "HIGH") {
            useNotificationStore.getState().addNotification({
              type: 'alert',
              title: `Security Threat: ${e.risk_level} Risk`,
              desc: `AI Analyst flagged a potential post-quantum vulnerability during query analysis.`,
              route: '/analyst'
            });
          }
        },
        onError: (error) => { 
          markStreamError(placeholderId, error); 
          abortRef.current = null; 
          
          // Trigger notification on prompt injection / security violation
          if (error.includes("Security violation") || error.includes("Restricted input")) {
            useNotificationStore.getState().addNotification({
              type: 'alert',
              title: 'Prompt Injection Blocked',
              desc: 'Adversarial system override attempt intercepted by AI shield.',
              route: '/analyst'
            });
          }
        },
      }
    );
  }, [sessionId, isStreaming, contextEnabled, addUserMessage, addStreamingPlaceholder, appendStreamChunk, finalizeStreamMessage, markStreamError]);

  const cancelStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    const { streamingMessageId, finalizeStreamMessage, messages } = useAnalystStore.getState();
    if (streamingMessageId) {
      const msg = messages.find(m => m.id === streamingMessageId);
      finalizeStreamMessage(
        streamingMessageId,
        {
          type: "done",
          risk_level: msg?.riskLevel || "MEDIUM",
          confidence: msg?.confidence || "HIGH",
          affects_algorithms: msg?.affectsAlgorithms || [],
          next_steps: [],
        },
        intentRef.current
      );
    }
  }, []);

  return { sendMessage, cancelStream };
}