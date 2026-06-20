import { useEffect, useCallback } from "react";
import { analystApi } from "../api/analystApi";
import { useAnalystStore } from "../store/analystStore";

export function useSession() {
  const { sessionId, initSession, clearSession } = useAnalystStore();
  useEffect(() => {
    if (!sessionId) {
      analystApi.newSession().then(initSession).catch(console.error);
    }
  }, [sessionId, initSession]);

  const resetSession = useCallback(async () => {
    if (sessionId) await analystApi.clearSession(sessionId).catch(() => {});
    const newId = await analystApi.newSession();
    clearSession();
    initSession(newId);
  }, [sessionId, clearSession, initSession]);

  return { sessionId, resetSession };
}