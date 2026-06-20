import React from "react";

interface SessionControlsProps {
  onReset: () => void;
  onCancel?: () => void;
  isStreaming?: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({ onReset, onCancel, isStreaming }) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-[#1A2540] transition-colors border border-transparent hover:border-[#1E2D45] cursor-pointer"
      >
        <span>↺</span>
        <span>New session</span>
      </button>
      {isStreaming && onCancel && (
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span>Stop streaming</span>
        </button>
      )}
    </div>
  );
};