import React from "react";
import { RiskLevel } from "../../types/analyst.types";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
}

const RISK_CONFIG = {
  CRITICAL: { emoji: "🔴", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/40" },
  HIGH: { emoji: "🟠", bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/40" },
  MEDIUM: { emoji: "🟡", bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/40" },
  LOW: { emoji: "🟢", bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/40" },
  SAFE: { emoji: "✅", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/40" },
  UNKNOWN: { emoji: "⬡", bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/40" },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = "md" }) => {
  const config = RISK_CONFIG[level] || RISK_CONFIG.UNKNOWN;
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
      <span>{config.emoji}</span>
      <span>{level}</span>
    </span>
  );
};