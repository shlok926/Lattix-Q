import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, HelpCircle, Search, X, CornerDownLeft, Sparkles, Zap, Terminal, FlaskConical, Layers, BarChart3, ArrowLeftRight, Globe, Database, FileText, Settings, LogOut, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationStore } from '../../store/notificationStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Popover States
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Refs for closing popovers on click-outside
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotificationStore();

  const getTitle = (path: string) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/quantum-attack': return 'Quantum Attack Lab';
      case '/workbench': return 'Crypto Workbench';
      case '/benchmark': return 'Benchmark Center';
      case '/migration': return 'Migration Simulator';
      case '/reports': return 'Reports';
      case '/settings': return 'Settings';
      case '/analyst': return 'AI Analyst';
      case '/batch-scan': return 'AI Code Scanner';
      case '/playbook': return 'PQC Playbook';
      case '/global-race': return 'Global Race Tracker';
      case '/inventory': return 'Asset & Vendor Inventory';
      default: return 'QuantumShield';
    }
  };

  const menuItems = [
    { title: 'Dashboard', path: '/', description: 'Overview of system risks and migration status', icon: Search },
    { title: 'Quantum Attack Lab', path: '/quantum-attack', description: 'Simulate Shor\'s and Grover\'s attacks', icon: Zap },
    { title: 'AI Code Scanner', path: '/batch-scan', description: 'Scan code repository for crypto leaks', icon: Terminal },
    { title: 'Crypto Workbench', path: '/workbench', description: 'Run post-quantum key encapsulations', icon: FlaskConical },
    { title: 'PQC Playbook', path: '/playbook', description: 'Post-Quantum migration guidelines and rules', icon: Layers },
    { title: 'Benchmark Center', path: '/benchmark', description: 'Compare algorithm benchmarks and metrics', icon: BarChart3 },
    { title: 'Migration Roadmap', path: '/migration', description: 'Project migration timeline simulator', icon: ArrowLeftRight },
    { title: 'Global Race Tracker', path: '/global-race', description: 'Global quantum race milestones', icon: Globe },
    { title: 'Asset & Vendor Inventory', path: '/inventory', description: 'Log of organizational keys and endpoints', icon: Database },
    { title: 'Reports', path: '/reports', description: 'View and download security compliance audits', icon: FileText },
    { title: 'AI Analyst', path: '/analyst', description: 'Chat with post-quantum AI assistant', icon: Sparkles },
    { title: 'Settings', path: '/settings', description: 'Manage profiles and API keys configuration', icon: Settings },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Click outside listener for popovers
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredItems = menuItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearchQuery('');
  };



  return (
    <header className="h-[56px] bg-[#080C14] border-b border-[#1E2D45] flex items-center justify-between px-6 select-none shrink-0 relative z-40">
      {/* Left: Dynamic Title */}
      <h2 className="text-[18px] font-semibold text-[#E2E8F0] tracking-wide">
        {getTitle(location.pathname)}
      </h2>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search Input Bar */}
        <div 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#0D1421] border border-[#1E2D45] rounded-md px-3 py-1.5 cursor-pointer hover:border-[#00C4E8]/30 transition-colors"
        >
          <Search size={14} className="text-[#475569]" />
          <span className="text-[12px] text-[#475569] pr-4">Search modules...</span>
          <kbd className="bg-[#121B2E] border border-[#1E2D45] text-[10px] text-[#94A3B8] px-1.5 py-0.5 rounded font-mono font-bold leading-none select-none">
            Ctrl+K
          </kbd>
        </div>

        {/* Bell Alert & Popover */}
        <div className="relative" ref={notifRef}>
          <div 
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="p-1.5 rounded hover:bg-[#1A2540] text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] border-2 border-[#080C14]" />
            )}
          </div>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[320px] bg-[#0B121F] border border-[#1E2D45] rounded-lg shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-2.5 bg-[#0D1421] border-b border-[#1E2D45] flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#E2E8F0]">Security Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] text-[#00C4E8] hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#1E2D45]/50 max-h-[250px] overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.route) {
                        handleNavigate(n.route);
                      }
                    }}
                    className={`p-3 flex items-start gap-3 hover:bg-[#121B2E]/60 cursor-pointer transition-colors ${!n.read ? 'bg-[#0D1421]/30' : ''}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'alert' && <ShieldAlert size={14} className="text-[#EF4444]" />}
                      {n.type === 'warning' && <ShieldAlert size={14} className="text-[#F59E0B]" />}
                      {n.type === 'success' && <CheckCircle size={14} className="text-[#10B981]" />}
                      {n.type === 'info' && <Info size={14} className="text-[#00C4E8]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[#E2E8F0] leading-normal">{n.title}</p>
                      <p className="text-[10px] text-[#94A3B8] leading-normal mt-0.5">{n.desc}</p>
                      <span className="text-[9px] text-[#475569] mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Help Circle */}
        <div 
          onClick={() => handleNavigate('/playbook')}
          className="p-1.5 rounded hover:bg-[#1A2540] text-[#94A3B8] hover:text-[#E2E8F0] cursor-pointer transition-colors"
        >
          <HelpCircle size={18} />
        </div>

        {/* User Badge & Profile Popover */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="w-8 h-8 rounded-full bg-[#1E2D45] hover:bg-[#2A3B5C] flex items-center justify-center text-[#00C4E8] font-bold text-[13px] border border-[#1E2D45] cursor-pointer transition-colors select-none"
          >
            QS
          </div>

          {/* Profile Dropdown Panel */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-[220px] bg-[#0B121F] border border-[#1E2D45] rounded-lg shadow-2xl overflow-hidden z-50 p-2 flex flex-col gap-1">
              <div className="px-3 py-2 flex flex-col">
                <span className="text-[12px] font-semibold text-[#E2E8F0]">Admin User</span>
                <span className="text-[10px] text-[#475569] font-mono mt-0.5 truncate">admin@quantumshield.io</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00C4E8]/10 text-[#00C4E8] font-medium self-start mt-2 border border-[#00C4E8]/20">
                  Role: {user?.role || 'Admin'}
                </span>
              </div>
              <div className="h-[1px] bg-[#1E2D45] my-1" />
              <button 
                onClick={() => handleNavigate('/settings')}
                className="w-full text-left px-3 py-2 text-[12px] text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#121B2E] rounded-md transition-colors flex items-center gap-2"
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>
              <button 
                onClick={logout}
                className="w-full text-left px-3 py-2 text-[12px] text-[#EF4444] hover:bg-[#EF4444]/10 rounded-md transition-colors flex items-center gap-2"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Command Palette Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]">
          <div className="bg-[#0B121F] border border-[#1E2D45] w-full max-w-[600px] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2D45]">
              <Search className="text-[#00C4E8] shrink-0" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules, attacks, workbench, scanners..."
                className="bg-transparent border-none outline-none text-[#E2E8F0] placeholder-[#475569] text-[14px] flex-1"
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-[#1A2540] text-[#94A3B8] hover:text-[#E2E8F0] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 max-h-[350px]">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-[#121B2E] cursor-pointer group transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded bg-[#0D1421] border border-[#1E2D45] text-[#94A3B8] group-hover:text-[#00C4E8] group-hover:border-[#00C4E8]/20 transition-colors shrink-0">
                          <Icon size={16} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-medium text-[#E2E8F0]">{item.title}</span>
                          <span className="text-[11px] text-[#475569] truncate mt-0.5">{item.description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 text-[#00C4E8] text-[11px] font-mono transition-opacity">
                        <span>Go to</span>
                        <CornerDownLeft size={10} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[#475569] text-[13px]">
                  No modules match "{searchQuery}"
                </div>
              )}
            </div>
            
            {/* Footer controls */}
            <div className="px-4 py-2 bg-[#0D1421]/60 border-t border-[#1E2D45] flex items-center justify-between text-[11px] text-[#475569]">
              <div className="flex items-center gap-2">
                <span>Select with click</span>
                <span>•</span>
                <span><kbd className="bg-[#121B2E] border border-[#1E2D45] px-1 rounded text-[10px]">esc</kbd> to close</span>
              </div>
              <div>
                <span>LattixQ Command Hub</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
