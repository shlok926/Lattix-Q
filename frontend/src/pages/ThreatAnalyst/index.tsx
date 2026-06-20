import React from "react";
import { useAnalystStore } from "../../store/analystStore";
import { useSession } from "../../hooks/useSession";
import { useAnalystChat } from "../../hooks/useAnalystChat";
import { ChatWindow } from "./ChatWindow";
import { ChatInput } from "./ChatInput";
import { ContextSidebar } from "./ContextSidebar";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { SessionControls } from "./SessionControls";

const ThreatAnalyst: React.FC = () => {
  const { messages, isStreaming } = useAnalystStore();
  const { resetSession } = useSession();
  const { sendMessage, cancelStream } = useAnalystChat();

  return (
    <div className="flex h-[calc(100vh-56px)] bg-[#080C14] overflow-hidden text-white">
      {/* Left Chat Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Page Header bar */}
        <header className="h-[56px] px-6 border-b border-[#1E2D45] flex items-center justify-between shrink-0 bg-[#080C14] select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C4E8] to-[#121B2E] flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(0,196,232,0.15)]">
              AI
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white">AI Threat Analyst</h1>
              <p className="text-[10px] text-slate-500">Claude-powered cryptographic security intelligence</p>
            </div>
          </div>
          <SessionControls onReset={resetSession} onCancel={cancelStream} isStreaming={isStreaming} />
        </header>

        {/* Messaging Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#080C14]">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none overflow-y-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#00C4E8]/10 border border-[#00C4E8]/20 flex items-center justify-center text-[#00C4E8] text-3xl shadow-[0_0_15px_rgba(0,196,232,0.05)] mb-4">
                🛡️
              </div>
              <h2 className="text-lg font-semibold text-white tracking-wide">
                Ask me anything about quantum security
              </h2>
              <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
                Consult QuantumShield AI for real-time analysis of Shor&apos;s and Grover&apos;s algorithm bounds,
                post-quantum migration guidance, NIST standards, or to interpret your live simulation results.
              </p>
              <SuggestedPrompts onSelect={sendMessage} />
            </div>
          ) : (
            <ChatWindow />
          )}

          {/* User Input Frame */}
          <ChatInput onSend={sendMessage} onCancel={cancelStream} isStreaming={isStreaming} />
        </div>
      </div>

      {/* Right Telemetry Context panel */}
      <ContextSidebar />
    </div>
  );
};

export default ThreatAnalyst;