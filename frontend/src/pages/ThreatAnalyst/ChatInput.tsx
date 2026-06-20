import React, { useRef, useState, useEffect } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  isStreaming: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onCancel, disabled, isStreaming }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (text.trim() && !disabled && !isStreaming) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <div className="p-3 bg-[#080C14] border-t border-[#1E2D45]">
      <div className="relative flex items-end gap-2 max-w-4xl mx-auto bg-[#0D1421] border border-[#1E2D45] rounded-2xl p-1.5 focus-within:border-[#00C4E8]/50 focus-within:shadow-[0_0_15px_rgba(0,196,232,0.05)] transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? "Streaming response..." : "Ask Quantum Shield AI analyst..."}
          disabled={disabled || isStreaming}
          className="flex-1 resize-none bg-transparent py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none max-h-40 min-h-[38px] leading-relaxed"
        />

        <div className="flex items-center justify-center h-[38px] px-1">
          {isStreaming ? (
            <button
              onClick={onCancel}
              className="flex items-center justify-center p-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all cursor-pointer w-8 h-8"
              title="Stop generating"
            >
              <div className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className="flex items-center justify-center p-2 rounded-xl bg-[#00C4E8] text-[#080C14] hover:bg-[#00C4E8]/85 disabled:opacity-30 disabled:hover:bg-[#00C4E8] transition-all cursor-pointer w-8 h-8"
            >
              <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="text-center text-[10px] text-slate-500 mt-1.5">
        Press Enter to send, Shift+Enter for newline.
      </div>
    </div>
  );
};