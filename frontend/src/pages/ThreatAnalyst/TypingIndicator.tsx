import React from "react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 msg-assistant animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-[#00C4E8] to-[#121B2E] text-xs font-bold text-white shadow-[0_0_10px_rgba(0,196,232,0.2)]">
        QS
      </div>
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className="rounded-2xl rounded-tl-sm border border-[#1E2D45] bg-[#0D1421] px-4 py-3 shadow-md">
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1.2s" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1.2s" }} />
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1.2s" }} />
          </div>
        </div>
      </div>
    </div>
  );
};