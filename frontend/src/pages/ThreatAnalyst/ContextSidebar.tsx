import React from "react";
import { useAnalystStore } from "../../store/analystStore";

export const ContextSidebar: React.FC = () => {
  const { contextEnabled, setContextEnabled } = useAnalystStore();

  return (
    <aside className="w-[272px] shrink-0 bg-[#080C14] border-l border-[#1E2D45] flex flex-col h-full overflow-y-auto select-none">
      <div className="p-4 border-b border-[#1E2D45]">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C4E8] animate-pulse" />
          Live Session Context
        </h3>
        <p className="text-[10px] text-slate-500 mt-1 leading-normal">
          Control what telemetry data is automatically appended to prompt system context.
        </p>
      </div>

      <div className="p-4 border-b border-[#1E2D45] space-y-4">
        {/* Toggle 1: Simulation Data */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">Quantum Simulation</span>
            <span className="text-[10px] text-slate-500">Latest factorization results</span>
          </div>
          <button
            onClick={() => setContextEnabled("simulation", !contextEnabled.simulation)}
            className={`relative w-8 h-4.5 rounded-full transition-colors cursor-pointer ${
              contextEnabled.simulation ? "bg-[#00C4E8]" : "bg-[#1E2D45]"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-[#080C14] transition-all ${
                contextEnabled.simulation ? "transform translate-x-3.5 bg-white" : ""
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Vulnerability Report */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white">Vulnerability Report</span>
            <span className="text-[10px] text-slate-500">Overall platform risk score</span>
          </div>
          <button
            onClick={() => setContextEnabled("report", !contextEnabled.report)}
            className={`relative w-8 h-4.5 rounded-full transition-colors cursor-pointer ${
              contextEnabled.report ? "bg-[#00C4E8]" : "bg-[#1E2D45]"
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-[#080C14] transition-all ${
                contextEnabled.report ? "transform translate-x-3.5 bg-white" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Always Included */}
      <div className="p-4 border-b border-[#1E2D45] space-y-3">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Always Included Core Knowledge
        </h4>
        <ul className="space-y-2 text-[11px] text-slate-400">
          <li className="flex items-start gap-1.5 leading-relaxed">
            <span className="text-[#00C4E8] mt-0.5">▪</span>
            <span>NIST PQC Standards (ML-KEM, ML-DSA, SLH-DSA)</span>
          </li>
          <li className="flex items-start gap-1.5 leading-relaxed">
            <span className="text-[#00C4E8] mt-0.5">▪</span>
            <span>Quantum Timelines (Shor&apos;s/Grover&apos;s scaling thresholds)</span>
          </li>
          <li className="flex items-start gap-1.5 leading-relaxed">
            <span className="text-[#00C4E8] mt-0.5">▪</span>
            <span>Cryptographic comparisons & key sizes</span>
          </li>
        </ul>
      </div>

      {/* Intent Legend */}
      <div className="p-4 flex-1 flex flex-col justify-end space-y-3 mt-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Intent Classifier Keys
        </h4>
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-mono font-semibold text-[#00C4E8]">explain_attack</span>
            <span className="text-[10px] text-slate-500 leading-normal">Explain algorithm breaking mechanisms.</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-mono font-semibold text-[#00C4E8]">assess_vulnerability</span>
            <span className="text-[10px] text-slate-500 leading-normal">Verdicts on security vulnerability & qubit math.</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-mono font-semibold text-[#00C4E8]">compare_algorithms</span>
            <span className="text-[10px] text-slate-500 leading-normal">Compare performance and footprint sizes.</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-mono font-semibold text-[#00C4E8]">migration_advice</span>
            <span className="text-[10px] text-slate-500 leading-normal">Transition roadmaps to post-quantum standards.</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-mono font-semibold text-[#00C4E8]">interpret_report</span>
            <span className="text-[10px] text-slate-500 leading-normal">Interpret session reports and risk weights.</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-mono font-semibold text-[#00C4E8]">timeline_question</span>
            <span className="text-[10px] text-slate-500 leading-normal">Hardware timelines (Q-Day predictions).</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
