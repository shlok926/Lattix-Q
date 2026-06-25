import React from 'react';
import { QuantumSafetyStatus } from '../../types/crypto.types';

const colors: Record<string, string> = {
  'QUANTUM-SAFE': 'bg-green-500/20 text-green-400 border border-green-500/30',
  'QUANTUM-VULNERABLE': 'bg-red-500/20 text-red-400 border border-red-500/30',
  'PARTIALLY-AFFECTED': 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  'COMPROMISED': 'bg-rose-950/60 text-rose-400 border border-rose-500/50 animate-pulse font-bold',
  'UNKNOWN': 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
};

interface AlgorithmBadgeProps {
  status: QuantumSafetyStatus;
}

export const AlgorithmBadge: React.FC<AlgorithmBadgeProps> = ({ status }) => {
  const badgeClass = colors[status] || colors['UNKNOWN'];
  return (
    <span className={`${badgeClass} text-[11px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide inline-block border`}>
      {status}
    </span>
  );
};

export default AlgorithmBadge;
