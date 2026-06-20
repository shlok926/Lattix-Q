import React from 'react';

interface StatusDotProps {
  status: 'online' | 'warning' | 'error' | 'inactive';
  animated?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, animated = false }) => {
  const bgColors = {
    online: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    error: 'bg-[#EF4444]',
    inactive: 'bg-[#475569]',
  };

  const colorClass = bgColors[status] || bgColors.inactive;
  const pulseClass = animated ? 'animate-pulse' : '';

  return (
    <span className="relative flex h-2 w-2 items-center justify-center">
      {animated && (
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75`}></span>
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colorClass} ${pulseClass}`}></span>
    </span>
  );
};

export default StatusDot;
