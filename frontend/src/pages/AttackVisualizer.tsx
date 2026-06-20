import React, { useEffect, useState, useRef } from 'react';
import { Activity, ShieldAlert, Globe, Shield, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttackEvent {
  id: string;
  timestamp: string;
  type: string;
  target: string;
  severity: 'Critical' | 'High' | 'Medium';
  source: { city: string; lat: number; lng: number };
  destination: { city: string; lat: number; lng: number };
  threat_level: number;
}

const AttackVisualizer: React.FC = () => {
  const [events, setEvents] = useState<AttackEvent[]>([]);
  const [threatLevel, setThreatLevel] = useState(65);
  const [activeAttack, setActiveAttack] = useState<AttackEvent | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host === 'localhost:3000' ? 'localhost:8000' : window.location.host;
    ws.current = new WebSocket(`${protocol}//${host}/ws/visualizer`);

    ws.current.onmessage = (event) => {
      const data: AttackEvent = JSON.parse(event.data);
      setEvents((prev) => [data, ...prev].slice(0, 15));
      setActiveAttack(data);
      setThreatLevel(data.threat_level);
      
      // Auto-clear active attack after 3 seconds
      setTimeout(() => setActiveAttack(null), 3000);
    };

    return () => ws.current?.close();
  }, []);

  // Map coordinates to SVG position
  const getPos = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6 overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-accent to-gray-500 bg-clip-text text-transparent">
            Global Quantum Threat Map
          </h1>
          <p className="text-muted">Live simulation of cryptographic attacks on classical networks.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs uppercase font-bold text-muted mb-1">Global Threat Index</div>
            <div className={`text-4xl font-black ${threatLevel > 80 ? 'text-red-500' : 'text-accent'}`}>
              {threatLevel}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center animate-pulse">
            <ShieldAlert className="text-accent" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Map Section */}
        <div className="xl:col-span-3 card bg-bg-dark/80 border-accent/20 p-0 overflow-hidden relative group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05),transparent)] pointer-events-none"></div>
          
          <svg viewBox="0 0 800 400" className="w-full h-full opacity-40">
            {/* Simple World Outline */}
            <path
              d="M150,150 Q200,100 300,120 T500,150 T700,200"
              fill="none"
              stroke="currentColor"
              className="text-accent/10"
              strokeWidth="2"
            />
            {/* Grid Lines */}
            {[...Array(10)].map((_, i) => (
              <React.Fragment key={i}>
                <line x1={i * 80} y1="0" x2={i * 80} y2="400" stroke="currentColor" className="text-white/5" strokeWidth="0.5" />
                <line x1="0" y1={i * 40} x2="800" y2={i * 40} stroke="currentColor" className="text-white/5" strokeWidth="0.5" />
              </React.Fragment>
            ))}
            
            {/* Active Attack Lines */}
            <AnimatePresence>
              {activeAttack && (
                <>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    x1={getPos(activeAttack.source.lat, activeAttack.source.lng).x}
                    y1={getPos(activeAttack.source.lat, activeAttack.source.lng).y}
                    x2={getPos(activeAttack.destination.lat, activeAttack.destination.lng).x}
                    y2={getPos(activeAttack.destination.lat, activeAttack.destination.lng).y}
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 2, 1], opacity: 1 }}
                    cx={getPos(activeAttack.source.lat, activeAttack.source.lng).x}
                    cy={getPos(activeAttack.source.lat, activeAttack.source.lng).y}
                    r="5"
                    fill="var(--accent)"
                  />
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                    cx={getPos(activeAttack.destination.lat, activeAttack.destination.lng).x}
                    cy={getPos(activeAttack.destination.lat, activeAttack.destination.lng).y}
                    r="5"
                    fill="red"
                  />
                </>
              )}
            </AnimatePresence>
          </svg>

          {/* Floating UI Over Map */}
          <div className="absolute top-6 left-6 flex gap-2">
            <div className="px-3 py-1 bg-accent/20 border border-accent/40 rounded-full text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
              Live Tracking Enabled
            </div>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
              <Globe size={12} />
              7 Active Nodes
            </div>
          </div>

          {activeAttack && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-6 right-6 p-4 bg-bg-dark/90 border-l-4 border-l-accent backdrop-blur-md rounded-r-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Zap className="text-accent" />
                </div>
                <div>
                  <div className="text-xs font-bold text-accent uppercase tracking-widest">{activeAttack.type}</div>
                  <div className="text-lg font-bold">Targeting {activeAttack.target}</div>
                  <div className="text-xs text-muted">From: {activeAttack.source.city} ⮕ To: {activeAttack.destination.city}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${activeAttack.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {activeAttack.severity} SEVERITY
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Log */}
        <div className="flex flex-col space-y-4 min-h-0">
          <div className="card bg-accent/5 border-accent/20 p-4 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-4">
              <Terminal size={18} className="text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Attack Vector Log</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              <AnimatePresence initial={false}>
                {events.map((evt) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-muted">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      <span className={evt.severity === 'Critical' ? 'text-red-500 font-bold' : 'text-yellow-500 font-bold'}>
                        {evt.severity}
                      </span>
                    </div>
                    <div className="font-medium text-white mb-1">{evt.type}</div>
                    <div className="text-muted truncate">Target: {evt.target}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="card bg-bg-card p-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-4">Node Health</h3>
            <div className="space-y-4">
              {[
                { name: 'US-West-1', health: 85 },
                { name: 'EU-Central-1', health: 42 },
                { name: 'AP-South-1', health: 91 },
              ].map((node, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>{node.name}</span>
                    <span>{node.health}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${node.health}%` }}
                      className={`h-full ${node.health < 50 ? 'bg-red-500' : 'bg-accent'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackVisualizer;
