import React, { useState } from 'react';
import { Atom, Play, CheckCircle2, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export const QuantumAttackLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shors' | 'grovers'>('shors');
  const [shorTarget, setShorTarget] = useState<'RSA-512' | 'RSA-1024' | 'RSA-2048'>('RSA-2048');
  const [groverTarget, setGroverTarget] = useState<'AES-128' | 'AES-256'>('AES-128');
  const [noiseModel, setNoiseModel] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRunShor, setHasRunShor] = useState(true);
  const [hasRunGrover, setHasRunGrover] = useState(true);

  const triggerShorSim = () => {
    setIsSimulating(true);
    setHasRunShor(false);
    setTimeout(() => {
      setIsSimulating(false);
      setHasRunShor(true);
    }, 1500);
  };

  const triggerGroverSim = () => {
    setIsSimulating(true);
    setHasRunGrover(false);
    setTimeout(() => {
      setIsSimulating(false);
      setHasRunGrover(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-[#E2E8F0] select-none pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-[24px] font-semibold text-[#E2E8F0] tracking-wide">Quantum Attack Lab</h1>
        <p className="text-[13px] text-[#94A3B8] mt-0.5">Evaluate and simulate quantum factorization and amplitude amplification attacks on cryptosystems</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1E2D45] pb-px">
        <button
          onClick={() => setActiveTab('shors')}
          className={`px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'shors'
              ? 'border-[#00C4E8] text-[#00C4E8]'
              : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
        >
          Shor's Algorithm
        </button>
        <button
          onClick={() => setActiveTab('grovers')}
          className={`px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'grovers'
              ? 'border-[#00C4E8] text-[#00C4E8]'
              : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
        >
          Grover's Algorithm
        </button>
      </div>

      {/* Main Container */}
      {activeTab === 'shors' ? (
        /* SHOR'S TAB */
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left panel (40%) */}
          <div className="lg:col-span-4 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[420px]">
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-semibold text-white">Shor's Algorithm Simulator</h3>
                <p className="text-[12px] text-[#94A3B8] mt-0.5">Simulates quantum factoring attack on RSA cryptosystems</p>
              </div>

              {/* RSA Target Selector */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Target RSA Key Size</span>
                <div className="grid grid-cols-3 gap-2 bg-[#080C14] border border-[#1E2D45] rounded-lg p-1">
                  {(['RSA-512', 'RSA-1024', 'RSA-2048'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setShorTarget(sz)}
                      className={`py-1.5 text-[12px] font-semibold font-mono rounded-md transition-all ${
                        shorTarget === sz
                          ? 'bg-[#1E2D45] text-[#00C4E8] border border-[#1E2D45]'
                          : 'text-[#94A3B8] hover:text-[#E2E8F0] border border-transparent'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Noise Model Toggle */}
              <div className="flex items-center justify-between bg-[#080C14]/50 border border-[#1E2D45]/40 rounded-lg p-3">
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-white">Include NISQ Noise Model</span>
                  <span className="text-[10px] text-[#475569]">Simulate decoherence and gate errors</span>
                </div>
                <button
                  onClick={() => setNoiseModel(!noiseModel)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                    noiseModel ? 'bg-[#00C4E8]' : 'bg-[#1E2D45]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                    noiseModel ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <button
              onClick={triggerShorSim}
              disabled={isSimulating}
              className="w-full bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-bold text-[13px] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isSimulating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
                  Compiling Circuit...
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  Launch Simulation
                </>
              )}
            </button>
          </div>

          {/* Right panel (60%) */}
          <div className="lg:col-span-6 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-center min-h-[420px]">
            {!hasRunShor ? (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <Atom size={48} className="text-[#1E2D45] animate-spin" />
                <span className="text-[14px] text-[#94A3B8]">Configuring Shor's Factorization registers...</span>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-[#22C55E]">
                  <CheckCircle2 size={18} />
                  <span className="text-[14px] font-bold uppercase tracking-wider">Simulation Complete</span>
                </div>

                {/* 4 KPI cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Qubits Required</span>
                    <h4 className="text-2xl font-black text-[#EF4444] font-mono mt-1">4,099</h4>
                  </div>
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Circuit Depth</span>
                    <h4 className="text-2xl font-black text-white font-mono mt-1">196,608</h4>
                  </div>
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Classical Factoring Time</span>
                    <h4 className="text-2xl font-black text-white font-mono mt-1">13.7B years</h4>
                  </div>
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Quantum Factoring Time</span>
                    <h4 className="text-2xl font-black text-[#EF4444] font-mono mt-1">~8 hours</h4>
                  </div>
                </div>

                {/* Verdict Box */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <h5 className="text-[12px] font-black text-red-400 uppercase tracking-widest">⚠ CRYPTOGRAPHIC BREAK CONFIRMED</h5>
                    <p className="text-[12px] text-[#94A3B8] leading-relaxed">
                      RSA-2048 can be broken by a fault-tolerant quantum computer with 4,099 logical qubits. Current NISQ devices cannot perform this attack, but this represents a future existential threat.
                    </p>
                  </div>
                </div>

                {/* SVG Circuit wires */}
                <div className="space-y-2 bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                  <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider block">Quantum Circuit Preview</span>
                  <div className="h-[90px] w-full border border-white/[0.02] bg-black/20 rounded p-1">
                    <svg width="100%" height="100%" viewBox="0 0 450 75">
                      {/* Wires */}
                      {[10, 20, 30, 40, 50, 60, 70].map((y, idx) => (
                        <line key={idx} x1="10" y1={y} x2="440" y2={y} stroke="#1E2D45" strokeWidth="1" />
                      ))}
                      {/* Gates */}
                      {/* Hadamard Gates */}
                      <rect x="50" y="5" width="15" height="10" fill="#00C4E8" rx="2" />
                      <text x="57" y="13" textAnchor="middle" fill="#080C14" className="text-[8px] font-bold">H</text>
                      <rect x="50" y="15" width="15" height="10" fill="#00C4E8" rx="2" />
                      <text x="57" y="23" textAnchor="middle" fill="#080C14" className="text-[8px] font-bold">H</text>

                      {/* CNOT Gates */}
                      <circle cx="120" cy="20" r="3" fill="#F59E0B" />
                      <line x1="120" y1="20" x2="120" y2="50" stroke="#F59E0B" strokeWidth="1" />
                      <circle cx="120" cy="50" r="4" fill="none" stroke="#F59E0B" strokeWidth="1" />
                      <line x1="117" y1="50" x2="123" y2="50" stroke="#F59E0B" strokeWidth="1" />
                      <line x1="120" y1="47" x2="120" y2="53" stroke="#F59E0B" strokeWidth="1" />

                      {/* QFT Module */}
                      <rect x="220" y="5" width="40" height="40" fill="#A855F7" rx="3" />
                      <text x="240" y="28" textAnchor="middle" fill="white" className="text-[9px] font-bold">QFT</text>

                      {/* More gates */}
                      <rect x="330" y="25" width="15" height="10" fill="#00C4E8" rx="2" />
                      <text x="337" y="33" textAnchor="middle" fill="#080C14" className="text-[8px] font-bold">H</text>
                    </svg>
                  </div>
                  <span className="text-[10px] text-[#475569] block font-mono">
                    Simplified circuit representation (4,099 qubits → 8 shown)
                  </span>
                </div>

              </div>
            )}
          </div>
        </div>
      ) : (
        /* GROVER'S TAB */
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left panel (40%) */}
          <div className="lg:col-span-4 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[420px]">
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-semibold text-white">Grover's Algorithm Simulator</h3>
                <p className="text-[12px] text-[#94A3B8] mt-0.5">Simulates quantum database search on symmetric cryptosystems</p>
              </div>

              {/* AES Target Selector */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Target Symmetric Cipher</span>
                <div className="grid grid-cols-2 gap-2 bg-[#080C14] border border-[#1E2D45] rounded-lg p-1">
                  {(['AES-128', 'AES-256'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setGroverTarget(sz)}
                      className={`py-1.5 text-[12px] font-semibold font-mono rounded-md transition-all ${
                        groverTarget === sz
                          ? 'bg-[#1E2D45] text-[#00C4E8] border border-[#1E2D45]'
                          : 'text-[#94A3B8] hover:text-[#E2E8F0] border border-transparent'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Noise Model Toggle */}
              <div className="flex items-center justify-between bg-[#080C14]/50 border border-[#1E2D45]/40 rounded-lg p-3">
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-white">Include NISQ Noise Model</span>
                  <span className="text-[10px] text-[#475569]">Simulate decoherence and gate errors</span>
                </div>
                <button
                  onClick={() => setNoiseModel(!noiseModel)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                    noiseModel ? 'bg-[#00C4E8]' : 'bg-[#1E2D45]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                    noiseModel ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <button
              onClick={triggerGroverSim}
              disabled={isSimulating}
              className="w-full bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-bold text-[13px] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 mt-6"
            >
              {isSimulating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
                  Running Search...
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  Launch Simulation
                </>
              )}
            </button>
          </div>

          {/* Right panel (60%) */}
          <div className="lg:col-span-6 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-center min-h-[420px]">
            {!hasRunGrover ? (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <Atom size={48} className="text-[#1E2D45] animate-spin" />
                <span className="text-[14px] text-[#94A3B8]">Configuring Grover's Amplitude Amplification registers...</span>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-[#22C55E]">
                  <CheckCircle2 size={18} />
                  <span className="text-[14px] font-bold uppercase tracking-wider">Simulation Complete</span>
                </div>

                {/* 4 KPI cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Required Qubits</span>
                    <h4 className="text-2xl font-black text-white font-mono mt-1">129 logical qubits</h4>
                  </div>
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Quantum Iterations</span>
                    <h4 className="text-xl font-black text-white font-mono mt-1.5 break-all">340,282,366,920,938</h4>
                  </div>
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Effective Key Security</span>
                    <h4 className="text-2xl font-black text-[#EF4444] font-mono mt-1">128-bit → 64-bit</h4>
                  </div>
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Evaluation Verdict</span>
                    <h4 className="text-[13px] font-black text-[#EF4444] uppercase tracking-wider mt-2.5">SECURITY HALVED</h4>
                  </div>
                </div>

                {/* Verdict Box */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <h5 className="text-[12px] font-black text-red-400 uppercase tracking-widest">⚠ MITIGATION RECOMMENDATION</h5>
                    <p className="text-[12px] text-[#94A3B8] leading-relaxed">
                      Grover's search reduces the effective key length of AES symmetric algorithms to half of their bit length. Upgrading key length (e.g. from AES-128 to AES-256) protects symmetric architectures.
                    </p>
                  </div>
                </div>

                {/* SVG Circuit wires */}
                <div className="space-y-2 bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                  <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider block">Grover Diffusion Circuit Preview</span>
                  <div className="h-[90px] w-full border border-white/[0.02] bg-black/20 rounded p-1">
                    <svg width="100%" height="100%" viewBox="0 0 450 75">
                      {/* Wires */}
                      {[10, 20, 30, 40, 50, 60, 70].map((y, idx) => (
                        <line key={idx} x1="10" y1={y} x2="440" y2={y} stroke="#1E2D45" strokeWidth="1" />
                      ))}
                      {/* Oracle */}
                      <rect x="70" y="5" width="40" height="50" fill="#EF4444" rx="3" />
                      <text x="90" y="33" textAnchor="middle" fill="white" className="text-[8px] font-bold">Oracle</text>

                      {/* Hadamard */}
                      <rect x="150" y="5" width="15" height="10" fill="#00C4E8" rx="2" />
                      <text x="157" y="13" textAnchor="middle" fill="#080C14" className="text-[8px] font-bold">H</text>

                      {/* Phase Shift */}
                      <rect x="210" y="5" width="50" height="50" fill="#A855F7" rx="3" />
                      <text x="235" y="33" textAnchor="middle" fill="white" className="text-[8px] font-bold">Diffusion</text>

                      {/* Hadamard */}
                      <rect x="310" y="5" width="15" height="10" fill="#00C4E8" rx="2" />
                      <text x="317" y="13" textAnchor="middle" fill="#080C14" className="text-[8px] font-bold">H</text>
                    </svg>
                  </div>
                  <span className="text-[10px] text-[#475569] block font-mono">
                    Simplified amplitude amplification circuit representation
                  </span>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumAttackLab;
