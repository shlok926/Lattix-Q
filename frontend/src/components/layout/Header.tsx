import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const getTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Dashboard';
      case '/quantum-attack':
        return 'Quantum Attack Lab';
      case '/workbench':
        return 'Crypto Workbench';
      case '/benchmark':
        return 'Benchmark Center';
      case '/migration':
        return 'Migration Simulator';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      default:
        return 'QuantumShield';
    }
  };

  return (
    <header className="h-[56px] bg-[#080C14] border-b border-[#1E2D45] flex items-center justify-between px-6 select-none shrink-0">
      {/* Left: Dynamic Title */}
      <h2 className="text-[18px] font-semibold text-[#E2E8F0] tracking-wide">
        {getTitle(location.pathname)}
      </h2>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 bg-[#0D1421] border border-[#1E2D45] rounded-md px-3 py-1.5 cursor-pointer hover:border-[#00C4E8]/30 transition-colors">
          <span className="text-[12px] text-[#475569]">Search...</span>
          <kbd className="bg-[#121B2E] border border-[#1E2D45] text-[10px] text-[#94A3B8] px-1.5 py-0.5 rounded font-mono font-bold leading-none select-none">
            ⌘K
          </kbd>
        </div>

        {/* Bell Alert */}
        <div className="relative p-1.5 rounded hover:bg-[#1A2540] text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer transition-colors">
          <Bell size={18} />
          {/* Notification Red dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
        </div>

        {/* Help Circle */}
        <div className="p-1.5 rounded hover:bg-[#1A2540] text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer transition-colors">
          <HelpCircle size={18} />
        </div>

        {/* User Badge */}
        <div className="w-8 h-8 rounded-full bg-[#1E2D45] flex items-center justify-center text-[#00C4E8] font-bold text-[13px] border border-[#1E2D45]">
          QS
        </div>
      </div>
    </header>
  );
};

export default Header;
