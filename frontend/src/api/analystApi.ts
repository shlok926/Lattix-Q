import { ChatRequest, SSEEvent, SSEStartEvent, SSEChunkEvent, SSEDoneEvent } from "../types/analyst.types";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/v1";

export const analystApi = {
  newSession: async (): Promise<string> => {
    const resp = await fetch(`${BASE}/analyst/new-session`, { method: "POST" });
    const data = await resp.json();
    return data.session_id;
  },

  clearSession: async (sessionId: string): Promise<void> => {
    await fetch(`${BASE}/analyst/session/${sessionId}`, { method: "DELETE" });
  },

  streamChat: (
    request: ChatRequest,
    callbacks: {
      onStart: (e: SSEStartEvent) => void;
      onChunk: (text: string) => void;
      onDone: (e: SSEDoneEvent) => void;
      onError: (error: string) => void;
    }
  ): AbortController => {
    const controller = new AbortController();
    fetch(`${BASE}/analyst/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: SSEEvent = JSON.parse(line.slice(6).trim());
              if (event.type === "start") callbacks.onStart(event as SSEStartEvent);
              else if (event.type === "chunk") callbacks.onChunk((event as SSEChunkEvent).text);
              else if (event.type === "done") callbacks.onDone(event as SSEDoneEvent);
            } catch { /* ignore malformed */ }
          }
        }
      })
      .catch((err) => { if (err.name !== "AbortError") callbacks.onError(err.message ?? "Stream failed"); });
    return controller;
  },
};
