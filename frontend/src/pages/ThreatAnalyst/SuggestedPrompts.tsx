import React from "react";

interface SuggestedPromptsProps {
  onSelect: (text: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    emoji: "⚛",
    category: "Attack",
    text: "Explain how Shor's Algorithm breaks RSA",
  },
  {
    emoji: "📊",
    category: "Report",
    text: "Interpret my vulnerability report",
  },
  {
    emoji: "⏱",
    category: "Timeline",
    text: "When will RSA-2048 be broken by quantum computers?",
  },
  {
    emoji: "🔄",
    category: "Migration",
    text: "How do I migrate from RSA to Kyber?",
  },
  {
    emoji: "⚖",
    category: "Compare",
    text: "Compare FALCON vs Dilithium signatures",
  },
  {
    emoji: "🛡",
    category: "Assess",
    text: "Is AES-256 safe against quantum attacks?",
  },
];

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mx-auto mt-6">
      {SUGGESTED_PROMPTS.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(prompt.text)}
          className="bg-[#0D1421] border border-[#1E2D45] hover:border-[#00C4E8]/40 hover:bg-[#121B2E] rounded-xl p-3.5 text-left transition-all group flex flex-col gap-1 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#00C4E8]">
            <span>{prompt.emoji}</span>
            <span>{prompt.category}</span>
          </div>
          <p className="text-slate-300 text-xs leading-normal group-hover:text-white transition-colors">
            {prompt.text}
          </p>
        </button>
      ))}
    </div>
  );
};