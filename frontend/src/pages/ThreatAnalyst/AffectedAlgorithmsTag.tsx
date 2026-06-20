import React from "react";

interface AffectedAlgorithmsTagProps {
  algorithms: string[];
}

export const AffectedAlgorithmsTag: React.FC<AffectedAlgorithmsTagProps> = ({ algorithms }) => {
  if (!algorithms || algorithms.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-red-400/80">
        Affects:
      </span>
      <div className="flex flex-wrap gap-1.5">
        {algorithms.map((algo) => (
          <span
            key={algo}
            className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full font-mono text-[11px] leading-relaxed shadow-[0_0_6px_rgba(239,68,68,0.05)]"
          >
            {algo}
          </span>
        ))}
      </div>
    </div>
  );
};