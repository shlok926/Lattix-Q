import React from 'react';
import { NISTLevel } from '../../types/crypto.types';

interface NistBadgeProps {
  level: NISTLevel;
  isClassical?: boolean;
}

export const NistBadge: React.FC<NistBadgeProps> = ({ level, isClassical = false }) => {
  if (isClassical) {
    return (
      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block">
        Level {level}* (Q-Vulnerable)
      </span>
    );
  }

  const bgColors: Record<number, string> = {
    1: 'bg-green-500/20 text-green-400 border-green-500/30',
    2: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    3: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    4: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    5: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  const colorClass = bgColors[level] || bgColors[3];

  return (
    <span className={`${colorClass} border text-[10px] font-bold px-2 py-0.5 rounded-full inline-block`}>
      Level {level}
    </span>
  );
};

export default NistBadge;
