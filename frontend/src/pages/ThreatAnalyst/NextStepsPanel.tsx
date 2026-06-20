import React, { useState } from "react";

interface NextStepsPanelProps {
  steps: string[];
}

export const NextStepsPanel: React.FC<NextStepsPanelProps> = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const handleToggle = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const allChecked = steps.every((_, index) => checkedSteps[index]);

  return (
    <div className="mt-3 p-3.5 rounded-xl border border-[#00C4E8]/20 bg-[#00C4E8]/5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#00C4E8]">
          Recommended Actions
        </span>
        {allChecked && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 animate-pulse">
            ✓ ALL COMPLETE
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {steps.map((step, idx) => {
          const isChecked = !!checkedSteps[idx];
          return (
            <button
              key={idx}
              onClick={() => handleToggle(idx)}
              className="w-full flex items-start text-left gap-2.5 py-1 px-1.5 rounded hover:bg-[#00C4E8]/5 transition-colors group cursor-pointer"
            >
              <div
                className={`w-3.5 h-3.5 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-all ${
                  isChecked
                    ? "bg-[#00C4E8] border-[#00C4E8] text-[#080C14]"
                    : "border-slate-500 group-hover:border-[#00C4E8]"
                }`}
              >
                {isChecked && (
                  <svg className="w-2.5 h-2.5 stroke-2 stroke-current fill-none" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                className={`text-xs transition-all leading-relaxed ${
                  isChecked
                    ? "line-through text-slate-500"
                    : "text-slate-300 group-hover:text-white"
                }`}
              >
                {step}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};