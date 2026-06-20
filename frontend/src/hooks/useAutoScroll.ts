import { useEffect, useRef } from "react";
import { useAnalystStore } from "../store/analystStore";

export function useAutoScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const messages = useAnalystStore((s) => s.messages);
  const isStreaming = useAnalystStore((s) => s.isStreaming);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 150) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);
  return containerRef;
}
