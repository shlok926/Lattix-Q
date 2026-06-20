import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  value: string | number;
  unit?: string;
  label: string;
  icon: LucideIcon;
  delta?: string;
  deltaPositive?: boolean;
  valueColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  value,
  unit = '',
  label,
  icon: Icon,
  delta,
  deltaPositive = true,
  valueColor = 'text-[#E2E8F0]',
}) => {
  return (
    <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-4 relative overflow-hidden flex flex-col justify-between h-[115px] transition-all hover:border-[#00C4E8]/40">
      <div className="flex justify-between items-start">
        <span className="text-[12px] text-[#94A3B8] font-medium">{label}</span>
        <Icon className="stroke-[1.5]" size={20} />
      </div>
      <div>
        <div className="text-3.5xl font-bold tracking-tight">
          <span className={valueColor}>{value}</span>
          {unit && <span className="text-sm font-normal text-[#94A3B8] ml-0.5">{unit}</span>}
        </div>
        {delta && (
          <div className={`text-[12px] font-medium mt-0.5 ${deltaPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {delta}
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
