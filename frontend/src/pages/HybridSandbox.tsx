import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, RotateCcw, ShieldCheck, Zap, Activity, BarChart3, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Metric {
  name: string;
  classical: number;
  pqc: number;
  unit: string;
}

const METRICS: Metric[] = [
  { name: 'Key Size', classical: 256, pqc: 1184, unit: 'bytes' },
  { name: 'Encapsulation Time', classical: 0.12, pqc: 0.45, unit: 'ms' },
  { name: 'Decapsulation Time', classical: 0.08, pqc: 0.32, unit: 'ms' },
  { name: 'Communication Overhead', classical: 320, pqc: 1560, unit: 'bytes' },
];

const HybridSandbox: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'KEM' | 'Signature'>('KEM');

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 8));
  };

  const runTest = () => {
    setIsRunning(true);
    setLogs([]);
    setProgress(0);
    
    const steps = [
      "Initializing Hybrid Crypto Engine...",
      "Generating Classical ECC-P256 Keypair...",
      "Generating PQC ML-KEM-768 Keypair...",
      "Constructing Dual-Layer Handshake Packet...",
      "Performing Classical Encapsulation...",
      "Performing PQC Encapsulation...",
      "Verifying Hybrid Shared Secret...",
      "Test Suite Completed Successfully."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        addLog(`[SYSTEM] ${steps[i]}`);
        setProgress((prev) => prev + (100 / steps.length));
        i++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 600);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div className="page-header mb-0">
          <h1 className="page-title">Hybrid Crypto Sandbox</h1>
          <p className="page-subtitle">Benchmark and test the overhead of dual-layer (Classical + PQC) cryptographic operations.</p>
        </div>
        <button 
          onClick={runTest} 
          disabled={isRunning}
          className="btn flex items-center gap-2 px-8 py-3 bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent-glow"
        >
          {isRunning ? <RotateCcw size={18} className="animate-spin" /> : <Play size={18} />}
          {isRunning ? 'Running Simulation...' : 'Start Benchmark'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Configuration</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Mode</label>
                <div className="flex gap-2">
                  {['KEM', 'Signature'].map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${
                        activeTab === tab ? 'bg-accent/10 border-accent text-accent' : 'border-white/10 text-muted'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Classical Algorithm</label>
                <select className="form-select">
                  <option>ECC P-256</option>
                  <option>RSA-2048</option>
                  <option>ECDSA P-384</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">PQC Algorithm</label>
                <select className="form-select">
                  <option>ML-KEM (Kyber-768)</option>
                  <option>ML-DSA (Dilithium-3)</option>
                  <option>SLH-DSA (Sphincs+)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-accent/5 border-accent/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Terminal size={64} />
            </div>
            <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-4">Live Execution Log</h3>
            <div className="space-y-2 h-40 overflow-hidden font-mono text-[10px]">
              <AnimatePresence initial={false}>
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log + i}
                    className="text-muted"
                  >
                    <span className="text-accent">{'>'}</span> {log}
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && <div className="text-muted/30">Awaiting execution...</div>}
            </div>
          </div>
        </div>

        {/* Visualization Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {METRICS.map((metric, i) => (
              <div key={metric.name} className="card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">{metric.name}</h4>
                  <BarChart3 size={18} className="text-muted" />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted mb-2">
                      <span>Classical</span>
                      <span>{metric.classical} {metric.unit}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isRunning ? '0%' : `${(metric.classical / (metric.classical + metric.pqc)) * 100}%` }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] uppercase font-bold text-accent mb-2">
                      <span>PQC Overhead</span>
                      <span>{metric.pqc} {metric.unit}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isRunning ? '0%' : `${(metric.pqc / (metric.classical + metric.pqc)) * 100}%` }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-8 bg-gradient-to-r from-bg-panel to-bg-panel/50 border-accent/10 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                  <ShieldCheck className="text-green-500" /> Hybrid Security Verified
                </h3>
                <p className="text-sm text-muted">
                  Dual-layer encryption provides protection even if one layer is compromised.
                  <br />
                  <span className="text-accent font-semibold">Total Entropy: 384-bits (Combined)</span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-white">4.2x</div>
                  <div className="text-[10px] text-muted uppercase font-bold">Latency Multiplier</div>
                </div>
                <div className="text-center px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-2xl font-black text-accent">5.5x</div>
                  <div className="text-[10px] text-muted uppercase font-bold">Payload Size Inc.</div>
                </div>
              </div>
            </div>
            
            {/* Handshake Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
              <motion.div 
                className="h-full bg-accent"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridSandbox;
