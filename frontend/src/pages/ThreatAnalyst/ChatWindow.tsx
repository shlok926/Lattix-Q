import React from "react";
import { useAnalystStore } from "../../store/analystStore";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

export const ChatWindow: React.FC = () => {
  const { messages, isStreaming } = useAnalystStore();
  const scrollRef = useAutoScroll();

  const showTypingIndicator = isStreaming && messages.length > 0 && messages[messages.length - 1].content === "";

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-[#1E2D45] scrollbar-track-transparent"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {showTypingIndicator && <TypingIndicator />}
      </div>
    </div>
  );
};