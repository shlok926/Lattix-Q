import { useRef, useCallback } from "react";
import { analystApi } from "../api/analystApi";
import { useAnalystStore } from "../store/analystStore";
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
        onDone: (e: SSEDoneEvent) => { finalizeStreamMessage(placeholderId, e, intentRef.current); abortRef.current = null; },
        onError: (error) => { markStreamError(placeholderId, error); abortRef.current = null; },
      }
    );
  }, [sessionId, isStreaming, contextEnabled, addUserMessage, addStreamingPlaceholder, appendStreamChunk, finalizeStreamMessage, markStreamError]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  return { sendMessage, cancelStream };
}