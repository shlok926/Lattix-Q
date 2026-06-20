import React from "react";
import { Confidence } from "../../types/analyst.types";

interface ConfidenceMeterProps {
  level: Confidence;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ level }) => {
  const getBars = () => {
    switch (level) {
      case "HIGH":
        return [
          { color: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" },
          { color: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" },
          { color: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" },
        ];
      case "MEDIUM":
        return [
          { color: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" },
          { color: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" },
          { color: "bg-[#1A2540]" },
        ];
      case "LOW":
      default:
        return [
          { color: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" },
          { color: "bg-[#1A2540]" },
          { color: "bg-[#1A2540]" },
        ];
    }
  };

  const bars = getBars();

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {bars.map((bar, i) => (
          <div key={i} className={`w-1 h-3 rounded-full ${bar.color}`} />
        ))}
      </div>
      <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        {level} CONFIDENCE
      </span>
    </div>
  );
};