import React from "react";
import { ChatMessage } from "../../types/analyst.types";
import { RiskBadge } from "./RiskBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { AffectedAlgorithmsTag } from "./AffectedAlgorithmsTag";
import { NextStepsPanel } from "./NextStepsPanel";
import { StreamingCursor } from "./StreamingCursor";

interface MessageBubbleProps {
  message: ChatMessage;
}

const renderInline = (str: string, keyPrefix: string): React.ReactNode[] => {
  const result: React.ReactNode[] = [];
  let temp = str;
  let keyIdx = 0;

  while (temp) {
    const codeMatch = temp.match(/^`([^`]+)`/);
    if (codeMatch) {
      result.push(
        <code
          key={`${keyPrefix}-code-${keyIdx++}`}
          className="px-1 py-0.5 bg-[#121B2E] border border-[#1E2D45] rounded text-[#00C4E8] font-mono text-[11px]"
        >
          {codeMatch[1]}
        </code>
      );
      temp = temp.slice(codeMatch[0].length);
      continue;
    }

    const boldMatch = temp.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      result.push(
        <strong key={`${keyPrefix}-bold-${keyIdx++}`} className="font-bold text-white">
          {boldMatch[1]}
        </strong>
      );
      temp = temp.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = temp.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      result.push(
        <em key={`${keyPrefix}-italic-${keyIdx++}`} className="italic text-slate-200">
          {italicMatch[1]}
        </em>
      );
      temp = temp.slice(italicMatch[0].length);
      continue;
    }

    const textMatch = temp.match(/^[^`*]+/);
    if (textMatch) {
      result.push(<span key={`${keyPrefix}-text-${keyIdx++}`}>{textMatch[0]}</span>);
      temp = temp.slice(textMatch[0].length);
    } else {
      result.push(<span key={`${keyPrefix}-text-${keyIdx++}`}>{temp[0]}</span>);
      temp = temp.slice(1);
    }
  }
  return result;
};

const renderMarkdown = (text: string): React.ReactNode => {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      if (listType === "ul") {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 my-2 space-y-1 text-slate-300 text-xs">
            {...currentList}
          </ul>
        );
      } else if (listType === "ol") {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 my-2 space-y-1 text-slate-300 text-xs">
            {...currentList}
          </ol>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${idx}`}
            className="p-3 bg-[#080C14] border border-[#1E2D45] rounded-lg font-mono text-xs text-slate-300 overflow-x-auto my-2"
          >
            <code>{codeBlockLines.join("\n")}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        flushList(String(idx));
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (line.startsWith("### ")) {
      flushList(String(idx));
      elements.push(
        <h3 key={`h3-${idx}`} className="text-sm font-bold text-white mt-4 mb-2">
          {renderInline(line.slice(4), String(idx))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList(String(idx));
      elements.push(
        <h2 key={`h2-${idx}`} className="text-base font-bold text-white mt-4 mb-2">
          {renderInline(line.slice(3), String(idx))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushList(String(idx));
      elements.push(
        <h1 key={`h1-${idx}`} className="text-lg font-bold text-white mt-4 mb-2">
          {renderInline(line.slice(2), String(idx))}
        </h1>
      );
      continue;
    }

    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      if (listType !== "ul") {
        flushList(String(idx));
        listType = "ul";
      }
      const text = line.trim().slice(2);
      currentList.push(
        <li key={`li-${idx}`} className="leading-relaxed">
          {renderInline(text, String(idx))}
        </li>
      );
      continue;
    }

    const orderedMatch = line.trim().match(/^\d+\.\s+(.*)/);
    if (orderedMatch) {
      if (listType !== "ol") {
        flushList(String(idx));
        listType = "ol";
      }
      currentList.push(
        <li key={`li-${idx}`} className="leading-relaxed">
          {renderInline(orderedMatch[1], String(idx))}
        </li>
      );
      continue;
    }

    if (line.trim().startsWith(">")) {
      flushList(String(idx));
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          className="pl-3 border-l-2 border-[#00C4E8]/50 text-slate-400 italic my-2"
        >
          {renderInline(line.trim().slice(1).trim(), String(idx))}
        </blockquote>
      );
      continue;
    }

    if (!line.trim()) {
      flushList(String(idx));
      continue;
    }

    flushList(String(idx));
    elements.push(
      <p key={`p-${idx}`} className="text-xs text-slate-300 leading-relaxed mb-2.5">
        {renderInline(line, String(idx))}
      </p>
    );
  }
  flushList("end");

  return <>{elements}</>;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const timestampStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3 msg-user animate-fade-in">
        <div className="flex flex-col items-end gap-1 max-w-[85%]">
          <div className="rounded-2xl rounded-tr-sm border border-[#00C4E8]/20 bg-[#00C4E8]/10 px-4 py-3 shadow-md">
            <p className="text-xs text-slate-200 leading-relaxed break-words white-space-pre-wrap">
              {message.content}
            </p>
          </div>
          <span className="text-[10px] text-slate-600 px-1">{timestampStr}</span>
        </div>
      </div>
    );
  }

  const showHeader = !message.isStreaming && (message.riskLevel || message.confidence || message.intent);

  return (
    <div className="flex items-start gap-3 msg-assistant animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-[#00C4E8] to-[#121B2E] text-xs font-bold text-white shadow-[0_0_10px_rgba(0,196,232,0.2)]">
        QS
      </div>
      <div className="flex flex-col gap-1.5 max-w-[85%] flex-1">
        {showHeader && (
          <div className="flex flex-wrap items-center gap-3 px-1 mb-1">
            {message.riskLevel && <RiskBadge level={message.riskLevel} />}
            {message.confidence && <ConfidenceMeter level={message.confidence} />}
            {message.intent && (
              <span className="text-[10px] font-mono text-slate-500 bg-[#121B2E] px-2 py-0.5 rounded border border-[#1E2D45]">
                {message.intent}
              </span>
            )}
          </div>
        )}

        <div className="rounded-2xl rounded-tl-sm border border-[#1E2D45] bg-[#0D1421] px-4 py-3.5 shadow-md flex flex-col">
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words flex-1">
            {renderMarkdown(message.content)}
            {message.isStreaming && <StreamingCursor />}
          </div>

          {message.streamError && (
            <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>Error: {message.streamError}</span>
            </div>
          )}

          {message.affectsAlgorithms && message.affectsAlgorithms.length > 0 && (
            <AffectedAlgorithmsTag algorithms={message.affectsAlgorithms} />
          )}

          {message.nextSteps && message.nextSteps.length > 0 && (
            <NextStepsPanel steps={message.nextSteps} />
          )}
        </div>

        <span className="text-[10px] text-slate-600 px-1">{timestampStr}</span>
      </div>
    </div>
  );
};