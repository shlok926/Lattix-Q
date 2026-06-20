import React from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  action,
  children,
}) => {
  return (
    <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-[#1E2D45] flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#E2E8F0] tracking-wide">{title}</h3>
          {subtitle && <p className="text-[13px] text-[#94A3B8] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;
