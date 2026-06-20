import React, { useState, useMemo } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, TrendingUp, Cpu, ShieldAlert, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Milestone {
  year: number;
  event: string;
  qubits: number;
  impact: string;
}

const MILESTONES: Milestone[] = [
  { year: 2025, event: "NISQ Era Peak", qubits: 1121, impact: "Experimental advantage in chemistry simulations." },
  { year: 2028, event: "Logical Qubit Breakthrough", qubits: 4000, impact: "Early error correction. RSA-1024 security starts to degrade." },
  { year: 2030, event: "NIST Deadline", qubits: 10000, impact: "All federal systems must be PQC-compliant." },
  { year: 2035, event: "Cryptographic Doom", qubits: 100000, impact: "Shor's Algorithm effectively breaks RSA-2048." },
  { year: 2040, event: "The Quantum Supremacy", qubits: 1000000, impact: "Classical asymmetric crypto is obsolete globally." },
];

const ALGO_STATUS = [
  { name: 'RSA-1024', breakYear: 2027 },
  { name: 'RSA-2048', breakYear: 2033 },
  { name: 'ECC P-256', breakYear: 2031 },
  { name: 'ECC P-384', breakYear: 2036 },
  { name: 'ML-KEM (Kyber)', breakYear: 2060 },
  { name: 'ML-DSA (Dilithium)', breakYear: 2060 },
];

const TimelineSimulator: React.FC = () => {
  const [year, setYear] = useState(2025);

  const activeMilestone = useMemo(() => {
    return [...MILESTONES].reverse().find(m => m.year <= year) || MILESTONES[0];
  }, [year]);

  const getStatus = (breakYear: number) => {
    if (year >= breakYear) return { label: 'BROKEN', color: 'text-red-500', bg: 'bg-red-500/10', icon: ShieldAlert };
    if (year >= breakYear - 3) return { label: 'CRITICAL', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: AlertTriangle };
    return { label: 'SAFE', color: 'text-green-500', bg: 'bg-green-500/10', icon: CheckCircle2 };
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div className="page-header mb-0">
          <h1 className="page-title">Quantum Timeline Simulator</h1>
          <p className="page-subtitle">Projecting the collapse of classical cryptography and the rise of PQC.</p>
        </div>
        <div className="card px-6 py-2 flex items-center gap-3 bg-accent/10 border-accent/20">
          <Calendar className="text-accent" size={20} />
          <span className="text-2xl font-black text-accent">{year}</span>
        </div>
      </div>

      {/* Main Slider Section */}
      <div className="card p-10 bg-gradient-to-br from-bg-panel to-bg-main border-accent/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
        
        <div className="relative z-10 space-y-12">
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-muted uppercase tracking-widest">
              <span>2025 (Present)</span>
              <span>2045 (Future Projection)</span>
            </div>
            <input 
              type="range" 
              min="2025" 
              max="2045" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full h-3 bg-white/5 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Milestone Card */}
            <div className="card bg-white/5 border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-3 text-accent">
                <TrendingUp size={20} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Key Milestone</h3>
              </div>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeMilestone.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="text-xl font-bold mb-1">{activeMilestone.event}</div>
                  <p className="text-sm text-muted leading-relaxed">{activeMilestone.impact}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Qubit Projection */}
            <div className="card bg-white/5 border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-3 text-blue-400">
                <Cpu size={20} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Logical Qubits</h3>
              </div>
              <div className="text-4xl font-black text-white">
                {activeMilestone.qubits.toLocaleString()}
              </div>
              <div className="text-[10px] text-muted uppercase tracking-widest">Hardware Power Projection</div>
            </div>

            {/* Security Alert */}
            <div className="card bg-white/5 border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-3 text-purple-400">
                <Zap size={20} />
                <h3 className="font-bold uppercase tracking-wider text-sm">Threat Level</h3>
              </div>
              <div className={`text-4xl font-black ${year > 2035 ? 'text-red-500' : 'text-orange-500'}`}>
                {year < 2030 ? 'MODERATE' : (year < 2035 ? 'HIGH' : 'EXTREME')}
              </div>
              <div className="text-[10px] text-muted uppercase tracking-widest">Global Cryptographic Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALGO_STATUS.map((algo, i) => {
          const status = getStatus(algo.breakYear);
          const Icon = status.icon;
          return (
            <motion.div 
              key={algo.name}
              layout
              className={`card p-6 flex items-center justify-between transition-all ${status.bg} ${year >= algo.breakYear ? 'border-red-500/30' : 'border-white/5'}`}
            >
              <div>
                <div className="text-sm font-bold text-white mb-1">{algo.name}</div>
                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${status.color}`}>
                  <Icon size={12} /> {status.label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted uppercase mb-1">Projected End</div>
                <div className="text-xs font-bold text-white">{algo.breakYear}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="card border-l-4 border-l-accent p-6 bg-accent/5">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <ShieldAlert className="text-accent" size={18} /> AI Strategic Insight
        </h3>
        <p className="text-sm text-muted leading-relaxed">
          Based on the current year projection ({year}), organizations should have {year < 2028 ? "started their inventory phase" : "transitioned 60% of their legacy tunnels to ML-KEM"}. 
          {year >= 2030 && " WARNING: NIST compliance window has closed. Critical systems are at risk of harvest-now-decrypt-later attacks."}
        </p>
      </div>
    </div>
  );
};

export default TimelineSimulator;
