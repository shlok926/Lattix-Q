import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Atom, 
  LayoutDashboard, 
  Zap, 
  FlaskConical, 
  BarChart3, 
  ArrowLeftRight, 
  FileText, 
  Settings,
  Sparkles,
  Terminal,
  Database,
  Globe,
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItemClass = ({ isActive }: { isActive: boolean }) => {
    const base = "flex items-center gap-3 h-10 px-4 transition-all duration-200 border-l-[3px]";
    if (isActive) {
      return `${base} border-[#00C4E8] bg-[rgba(0,196,232,0.08)] text-[#00C4E8]`;
    }
    return `${base} border-transparent text-[#94A3B8] hover:bg-[#1A2540] hover:text-[#E2E8F0]`;
  };

  const iconClass = (isActive: boolean) => {
    return isActive ? "text-[#00C4E8] w-4 h-4" : "text-[#475569] w-4 h-4";
  };

  return (
    <div className="w-[240px] h-screen bg-[#121B2E] border-r border-[#1E2D45] flex flex-col justify-between shrink-0 select-none">
      {/* Top Logo */}
      <div className="h-[60px] border-b border-[#1E2D45] flex items-center px-4 gap-2.5">
        <Atom className="text-[#00C4E8]" size={20} />
        <span className="font-semibold text-[16px] text-[#E2E8F0] tracking-wide">QuantumShield</span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {/* Group 1 — Main */}
        <NavLink to="/" className={navItemClass}>
          {({ isActive }) => (
            <>
              <LayoutDashboard className={iconClass(isActive)} />
              <span className="text-[13px] font-medium">Dashboard</span>
            </>
          )}
        </NavLink>

        {/* Group 2 — Simulation */}
        <div>
          <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider px-4 mt-4 mb-1">
            Simulation
          </div>
          <NavLink to="/quantum-attack" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Zap className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">Quantum Attack Lab</span>
              </>
            )}
          </NavLink>
          <NavLink to="/batch-scan" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Terminal className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">AI Code Scanner</span>
              </>
            )}
          </NavLink>
          <NavLink to="/workbench" className={navItemClass}>
            {({ isActive }) => (
              <>
                <FlaskConical className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">Crypto Workbench</span>
              </>
            )}
          </NavLink>
          <NavLink to="/playbook" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Layers className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">PQC Playbook</span>
              </>
            )}
          </NavLink>
        </div>

        {/* Group 3 — Analysis */}
        <div>
          <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider px-4 mt-4 mb-1">
            Analysis
          </div>
          <NavLink to="/benchmark" className={navItemClass}>
            {({ isActive }) => (
              <>
                <BarChart3 className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">Benchmark Center</span>
              </>
            )}
          </NavLink>
          <NavLink to="/migration" className={navItemClass}>
            {({ isActive }) => (
              <>
                <ArrowLeftRight className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">Migration Roadmap</span>
              </>
            )}
          </NavLink>
          <NavLink to="/global-race" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Globe className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">Global Race Tracker</span>
              </>
            )}
          </NavLink>
          <NavLink to="/inventory" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Database className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">Asset & Vendor Inventory</span>
              </>
            )}
          </NavLink>
        </div>

        {/* Group 4 — Intelligence */}
        <div>
          <div className="text-[10px] font-bold text-[#475569] uppercase tracking-wider px-4 mt-4 mb-1">
            Intelligence
          </div>
          <NavLink to="/reports" className={navItemClass}>
            {({ isActive }) => (
              <>
                <FileText className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">Reports</span>
              </>
            )}
          </NavLink>
          <NavLink to="/analyst" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Sparkles className={iconClass(isActive)} />
                <span className="text-[13px] font-medium">AI Analyst</span>
              </>
            )}
          </NavLink>
        </div>
      </div>

      {/* Bottom Profile & Settings */}
      <div className="mt-auto border-t border-[#1E2D45]">
        <NavLink to="/settings" className={navItemClass}>
          {({ isActive }) => (
            <>
              <Settings className={iconClass(isActive)} />
              <span className="text-[13px] font-medium">Settings</span>
            </>
          )}
        </NavLink>

        <div className="p-4 flex items-center gap-3 bg-[#0D1421]/30 border-t border-[#1E2D45]/40">
          <div className="w-8 h-8 rounded-full bg-[#1E2D45] flex items-center justify-center text-[#00C4E8] font-bold text-[13px] shrink-0">
            QS
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[12px] font-semibold text-[#E2E8F0] leading-none">Admin User</span>
            <span className="text-[10px] text-[#475569] font-mono truncate mt-1">admin@quantumshield.io</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
