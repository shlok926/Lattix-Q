import React, { useState, useEffect } from 'react';
import { 
  Atom, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Cpu, 
  Info, 
  Sliders, 
  Download, 
  Check, 
  Activity, 
  Layers, 
  HelpCircle 
} from 'lucide-react';

interface ShorMetrics {
  qubits: number;
  circuitDepth: number;
  classicalTime: string;
  quantumTime: string;
  gateFidelity: string;
  coherenceTime: string;
  physicalQubits: number;
}

interface GroverMetrics {
  qubits: number;
  iterations: string;
  effectiveSecurity: string;
  status: 'VULNERABLE' | 'SECURE';
  depth: number;
}

export const QuantumAttackLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shors' | 'grovers' | 'comparison'>('shors');
  
  // Shor's Simulator States
  const [shorTarget, setShorTarget] = useState<'RSA-1024' | 'RSA-2048' | 'RSA-4096'>('RSA-2048');
  const [shorQubits, setShorQubits] = useState<number>(4096);
  const [shorDepth, setShorDepth] = useState<number>(196608);
  const [nisqEnabled, setNisqEnabled] = useState<boolean>(true);
  const [nisqErrorRate, setNisqErrorRate] = useState<number>(0.001); // 0.1%

  // Grover's Simulator States
  const [groverTarget, setGroverTarget] = useState<'AES-128' | 'AES-256'>('AES-128');
  const [groverQubits, setGroverQubits] = useState<number>(129);
  const [groverDepth, setGroverDepth] = useState<number>(1800000);

  // Simulation States
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simPhase, setSimPhase] = useState<number>(1);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [hasRunShor, setHasRunShor] = useState<boolean>(true);
  const [hasRunGrover, setHasRunGrover] = useState<boolean>(true);

  // Auto-recalculate Shor's parameters on changes
  useEffect(() => {
    if (shorTarget === 'RSA-1024') {
      setShorQubits(2048);
      setShorDepth(98304);
    } else if (shorTarget === 'RSA-2048') {
      setShorQubits(4096);
      setShorDepth(196608);
    } else {
      setShorQubits(8192);
      setShorDepth(393216);
    }
  }, [shorTarget]);

  // Auto-recalculate Grover's parameters on changes
  useEffect(() => {
    if (groverTarget === 'AES-128') {
      setGroverQubits(129);
      setGroverDepth(1800000);
    } else {
      setGroverQubits(257);
      setGroverDepth(3600000);
    }
  }, [groverTarget]);

  // Shor's Formulas
  const getShorMetrics = (): ShorMetrics => {
    const overheadMultiplier = nisqEnabled ? (1000 * (1 + nisqErrorRate * 25)) : 1;
    const physQubits = Math.round(shorQubits * overheadMultiplier);
    
    // Gate fidelity required calculation
    const fidelityVal = 1 - (1 / shorDepth);
    const fidelityPct = (fidelityVal * 100).toFixed(4) + '%';
    
    // Coherence time required (assuming 10ns gate time + error multipliers)
    const rawCoherenceMs = (shorDepth * 10) / 1000000; // ms
    const coherenceMs = (rawCoherenceMs * (1 + nisqErrorRate * 100)).toFixed(2) + ' ms';

    let classical = '13.7B years';
    let quantum = '~8 hours';

    if (shorTarget === 'RSA-1024') {
      classical = '3.4M years';
      quantum = '~1.5 hours';
    } else if (shorTarget === 'RSA-4096') {
      classical = '980T years';
      quantum = '~34 hours';
    }

    return {
      qubits: shorQubits,
      circuitDepth: shorDepth,
      classicalTime: classical,
      quantumTime: quantum,
      gateFidelity: fidelityPct,
      coherenceTime: coherenceMs,
      physicalQubits: physQubits
    };
  };

  // Grover's Formulas
  const getGroverMetrics = (): GroverMetrics => {
    if (groverTarget === 'AES-128') {
      return {
        qubits: groverQubits,
        iterations: '3.40 × 10¹⁹',
        effectiveSecurity: '128-bit → 64-bit',
        status: 'VULNERABLE',
        depth: groverDepth
      };
    } else {
      return {
        qubits: groverQubits,
        iterations: '3.67 × 10³⁸',
        effectiveSecurity: '256-bit → 128-bit',
        status: 'SECURE',
        depth: groverDepth
      };
    }
  };

  // Preset Scenario triggers
  const applyPreset = (preset: 'optimistic' | 'realistic' | 'pessimistic') => {
    if (preset === 'optimistic') {
      setNisqErrorRate(0.0001); // 0.01%
    } else if (preset === 'realistic') {
      setNisqErrorRate(0.001); // 0.1%
    } else {
      setNisqErrorRate(0.005); // 0.5%
    }
  };

  // Run Simulation progress loop
  const triggerSimulation = () => {
    setIsSimulating(true);
    setSimProgress(0);
    setSimPhase(1);
    setElapsedTime(0);
    
    if (activeTab === 'shors') {
      setHasRunShor(false);
    } else {
      setHasRunGrover(false);
    }

    const duration = 4000; // 4s total
    const intervalMs = 100;
    let currentMs = 0;

    const timer = setInterval(() => {
      currentMs += intervalMs;
      const progress = Math.min(100, Math.round((currentMs / duration) * 100));
      setSimProgress(progress);
      setElapsedTime(Number((currentMs / 1000).toFixed(1)));

      // Set current phase based on progress
      if (progress < 25) {
        setSimPhase(1);
      } else if (progress < 50) {
        setSimPhase(2);
      } else if (progress < 75) {
        setSimPhase(3);
      } else {
        setSimPhase(4);
      }

      if (currentMs >= duration) {
        clearInterval(timer);
        setIsSimulating(false);
        if (activeTab === 'shors') {
          setHasRunShor(true);
        } else {
          setHasRunGrover(true);
        }
      }
    }, intervalMs);
  };

  // Export Results
  const exportSimulationData = () => {
    const date = new Date().toLocaleString();
    let dataStr = '';
    
    if (activeTab === 'shors') {
      const shMetrics = getShorMetrics();
      const payload = {
        title: "Quantum Attack Lab - Shor's Algorithm Simulation Report",
        timestamp: date,
        target: shorTarget,
        logical_qubits_estimated: shMetrics.qubits,
        physical_qubits_required: shMetrics.physicalQubits,
        circuit_depth: shMetrics.circuitDepth,
        gate_fidelity_required: shMetrics.gateFidelity,
        coherence_time_needed: shMetrics.coherenceTime,
        classical_factoring_time: shMetrics.classicalTime,
        quantum_factoring_time: shMetrics.quantumTime,
        nisq_noise_model_applied: nisqEnabled,
        modeled_error_rate: nisqEnabled ? `${(nisqErrorRate * 100).toFixed(2)}%` : "0.00%",
        security_status: "CRITICAL COMPROMISE RISK"
      };
      dataStr = JSON.stringify(payload, null, 2);
    } else {
      const grMetrics = getGroverMetrics();
      const payload = {
        title: "Quantum Attack Lab - Grover's Search Simulation Report",
        timestamp: date,
        target: groverTarget,
        logical_qubits_estimated: grMetrics.qubits,
        quantum_iterations_required: grMetrics.iterations,
        effective_key_security: grMetrics.effectiveSecurity,
        status: grMetrics.status,
        circuit_depth: grMetrics.depth,
        security_status: grMetrics.status === 'SECURE' ? "COMPLIANT: Post-Quantum Equivalent" : "VULNERABLE: Key Entropy Halved"
      };
      dataStr = JSON.stringify(payload, null, 2);
    }

    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum_attack_lab_${activeTab}_report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shorMetrics = getShorMetrics();
  const groverMetrics = getGroverMetrics();

  return (
    <div className="space-y-6 text-[#E2E8F0] select-none pb-12">
      {/* Educational Disclaimer Banner */}
      <div className="bg-[#3D2A1F] border-l-4 border-[#FF9500] px-4 py-3 rounded-lg flex items-start gap-3">
        <AlertTriangle size={18} className="text-[#FF9500] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#E8B17A] leading-relaxed">
          <strong>Educational Simulation Only</strong> — These visualizations demonstrate quantum cryptanalysis complexity theoretically. No actual exploit code is executed. Results assume fully error-corrected quantum computers; current hardware cannot perform these attacks.
        </p>
      </div>

      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-[24px] font-semibold text-[#E2E8F0] tracking-wide">Quantum Attack Lab</h1>
          <p className="text-[13px] text-[#94A3B8] mt-0.5">Evaluate and simulate quantum factorization and amplitude amplification attacks on cryptosystems</p>
        </div>
        <div className="text-[10px] bg-[#00C4E8]/10 text-[#00C4E8] border border-[#00C4E8]/20 px-2.5 py-1 rounded font-mono uppercase tracking-wider">
          NIST PQC Assessment Active
        </div>
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
          🔐 Shor's Algorithm (RSA)
        </button>
        <button
          onClick={() => setActiveTab('grovers')}
          className={`px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'grovers'
              ? 'border-[#00C4E8] text-[#00C4E8]'
              : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
        >
          📊 Grover's Algorithm (Symmetric)
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'comparison'
              ? 'border-[#00C4E8] text-[#00C4E8]'
              : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
          }`}
        >
          ⚖️ Algorithm Comparison
        </button>
      </div>

      {activeTab === 'shors' && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Controls Panel (4 Columns) */}
          <div className="lg:col-span-4 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-semibold text-white">Shor's Algorithm Simulator</h3>
                <p className="text-[12px] text-[#94A3B8] mt-0.5">Configure Shor's factorization register and error metrics</p>
              </div>

              {/* Target RSA Key Size */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Target RSA Key Size</span>
                <div className="grid grid-cols-3 gap-2 bg-[#080C14] border border-[#1E2D45] rounded-lg p-1">
                  {(['RSA-1024', 'RSA-2048', 'RSA-4096'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setShorTarget(sz)}
                      className={`py-1.5 text-[12px] font-semibold font-mono rounded-md transition-all ${
                        shorTarget === sz
                          ? 'bg-[#1E2D45] text-[#00C4E8] border border-[#1E2D45]'
                          : 'text-[#94A3B8] hover:text-[#E2E8F0] border border-transparent'
                      }`}
                    >
                      {sz.replace('RSA-', '')} bits
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider for Logical Qubits */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                  <span>Logical Qubits (Estimated)</span>
                  <span className="text-[#00C4E8] font-mono normal-case">{shorQubits.toLocaleString()} qubits</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={20000}
                  step={100}
                  value={shorQubits}
                  onChange={(e) => setShorQubits(Number(e.target.value))}
                  className="w-full h-1 bg-[#1E2D45] rounded-lg appearance-none cursor-pointer accent-[#00C4E8]"
                />
                <span className="text-[10px] text-[#475569] block">Logical registers needed to calculate prime factors.</span>
              </div>

              {/* Slider for Circuit Depth */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                  <span>Circuit Depth (Estimated)</span>
                  <span className="text-white font-mono normal-case">{shorDepth.toLocaleString()} gates</span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={1000000}
                  step={10000}
                  value={shorDepth}
                  onChange={(e) => setShorDepth(Number(e.target.value))}
                  className="w-full h-1 bg-[#1E2D45] rounded-lg appearance-none cursor-pointer accent-[#00C4E8]"
                />
              </div>

              {/* Noise Model Toggle */}
              <div className="flex items-center justify-between bg-[#080C14]/50 border border-[#1E2D45]/40 rounded-lg p-3">
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-white">Include NISQ Error Model</span>
                  <span className="text-[10px] text-[#475569]">Simulate decoherence and gate errors</span>
                </div>
                <button
                  onClick={() => setNisqEnabled(!nisqEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                    nisqEnabled ? 'bg-[#00C4E8]' : 'bg-[#1E2D45]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white transition-transform transform ${
                    nisqEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* NISQ Error Rate Slider */}
              {nisqEnabled && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex justify-between items-center text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                    <span>NISQ Error Rate per Gate</span>
                    <span className="text-[#00C4E8] font-mono normal-case">{(nisqErrorRate * 100).toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.0001}
                    max={0.01}
                    step={0.0001}
                    value={nisqErrorRate}
                    onChange={(e) => setNisqErrorRate(Number(e.target.value))}
                    className="w-full h-1 bg-[#1E2D45] rounded-lg appearance-none cursor-pointer accent-[#00C4E8]"
                  />
                </div>
              )}
            </div>

            {/* Actions & Presets */}
            <div className="space-y-4 pt-6 border-t border-[#1E2D45]/40">
              <div className="flex justify-between text-[11px] text-[#475569] font-mono">
                <span>Presets:</span>
                <div className="flex gap-2">
                  <button onClick={() => applyPreset('optimistic')} className="hover:text-[#00C4E8] transition">Optimistic</button>
                  <span>•</span>
                  <button onClick={() => applyPreset('realistic')} className="hover:text-[#00C4E8] transition">Realistic</button>
                  <span>•</span>
                  <button onClick={() => applyPreset('pessimistic')} className="hover:text-[#00C4E8] transition">Pessimistic</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={triggerSimulation}
                  disabled={isSimulating}
                  className="flex-1 bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-bold text-[13px] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play size={14} fill="currentColor" />
                  Run Simulation
                </button>
                <button
                  onClick={exportSimulationData}
                  disabled={isSimulating || !hasRunShor}
                  className="px-4 bg-[#080C14] hover:bg-[#1E2D45] border border-[#1E2D45] text-slate-300 font-semibold rounded-md text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel (6 Columns) */}
          <div className="lg:col-span-6 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[460px]">
            {isSimulating ? (
              <div className="flex-1 flex flex-col justify-center space-y-6 py-8">
                <div className="text-center flex flex-col items-center gap-2">
                  <Atom size={44} className="text-[#00C4E8] animate-spin" />
                  <span className="text-[14px] font-bold text-white tracking-wider">Shor's Factorization In Progress</span>
                  <span className="text-[11px] text-[#94A3B8]">Elapsed: {elapsedTime}s / Estimated: {(4.0 - elapsedTime).toFixed(1)}s remaining</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-[#94A3B8]">
                    <span>Register Compiling...</span>
                    <span>{simProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#080C14] border border-[#1E2D45] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00C4E8] to-[#9333EA] transition-all duration-100" style={{ width: `${simProgress}%` }} />
                  </div>
                </div>

                {/* Phase specific updates */}
                <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-4 flex gap-3 animate-pulse">
                  <span className="text-lg">⚙️</span>
                  <div className="text-xs">
                    {simPhase === 1 && (
                      <>
                        <strong>Phase 1/4: Initializing Register Setup</strong>
                        <p className="text-[#94A3B8] mt-1">Configuring {shorQubits} logical qubits into superposition states...</p>
                      </>
                    )}
                    {simPhase === 2 && (
                      <>
                        <strong>Phase 2/4: Modular Exponentiation Circuit</strong>
                        <p className="text-[#94A3B8] mt-1">Executing modular multiplication cascade ({shorDepth} base gates)...</p>
                      </>
                    )}
                    {simPhase === 3 && (
                      <>
                        <strong>Phase 3/4: Quantum Fourier Transform (QFT)</strong>
                        <p className="text-[#94A3B8] mt-1">Transforming periodicity measurements from registers...</p>
                      </>
                    )}
                    {simPhase === 4 && (
                      <>
                        <strong>Phase 4/4: Measurement & Readout</strong>
                        <p className="text-[#94A3B8] mt-1">Extracting classical factors from collapse probability distributions...</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#22C55E]">
                    <CheckCircle2 size={16} />
                    <span className="text-[13px] font-bold uppercase tracking-wider">Simulation Output</span>
                  </div>
                  <span className="text-[10px] text-[#475569] font-mono">Last Run: {new Date().toLocaleTimeString()}</span>
                </div>

                {/* 4 KPIs with Tooltips */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4 relative group">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider flex items-center gap-1">
                      Logical Qubits Required
                      <HelpCircle size={10} className="text-slate-500 cursor-pointer" />
                    </span>
                    <h4 className="text-2xl font-black text-white font-mono mt-1">{shorMetrics.qubits.toLocaleString()}</h4>
                    {/* Tooltip */}
                    <div className="absolute hidden group-hover:block bg-[#121B2E] text-[#94A3B8] border border-[#1E2D45] text-[10px] p-2.5 rounded-lg w-52 z-30 bottom-12 left-4 shadow-xl font-mono leading-relaxed">
                      Assuming a 1000:1 physical-to-logical error correction code (ECC) overhead ratio.
                    </div>
                  </div>

                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4 relative group">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider flex items-center gap-1">
                      Physical Qubits
                      <HelpCircle size={10} className="text-slate-500 cursor-pointer" />
                    </span>
                    <h4 className="text-2xl font-black text-[#FF9500] font-mono mt-1">{shorMetrics.physicalQubits.toLocaleString()}</h4>
                    <div className="absolute hidden group-hover:block bg-[#121B2E] text-[#94A3B8] border border-[#1E2D45] text-[10px] p-2.5 rounded-lg w-52 z-30 bottom-12 right-4 shadow-xl font-mono leading-relaxed">
                      Total physical qubits required considering NISQ noise level of {(nisqErrorRate * 100).toFixed(2)}%.
                    </div>
                  </div>

                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Classical GNFS Time</span>
                    <h4 className="text-xl font-black text-white font-mono mt-1.5">{shorMetrics.classicalTime}</h4>
                  </div>

                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4 relative group">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider flex items-center gap-1">
                      Quantum factoring time
                      <HelpCircle size={10} className="text-slate-500 cursor-pointer" />
                    </span>
                    <h4 className="text-xl font-black text-[#EF4444] font-mono mt-1.5">{shorMetrics.quantumTime}</h4>
                    <div className="absolute hidden group-hover:block bg-[#121B2E] text-[#94A3B8] border border-[#1E2D45] text-[10px] p-2.5 rounded-lg w-52 z-30 bottom-12 right-4 shadow-xl font-mono leading-relaxed">
                      Assuming T-gate distillation rate of 10k/sec and continuous coherence preservation.
                    </div>
                  </div>
                </div>

                {/* NISQ Coherence Stats */}
                <div className="bg-[#080C14] border border-[#1E2D45]/60 rounded-xl p-4 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[#475569] text-[9px] block">Gate Fidelity Required</span>
                    <span className="text-white font-bold block mt-0.5">{shorMetrics.gateFidelity}</span>
                  </div>
                  <div>
                    <span className="text-[#475569] text-[9px] block">Coherence Time Required</span>
                    <span className="text-[#00C4E8] font-bold block mt-0.5">{shorMetrics.coherenceTime}</span>
                  </div>
                </div>

                {/* Shor's Circuit Preview */}
                <div className="space-y-2 bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider block">Shor Factorization Circuit Preview</span>
                    <span className="text-[9px] text-[#00C4E8] font-mono">Quantum Fourier Transform Phase</span>
                  </div>
                  <div className="h-[150px] w-full border border-white/[0.02] bg-black/20 rounded p-1.5 overflow-hidden">
                    <svg width="100%" height="100%" viewBox="0 0 450 140" className="select-none">
                      {/* Grid Lines (Qubits) */}
                      {[18, 36, 54, 72, 90, 108].map((y, idx) => (
                        <g key={idx}>
                          {/* Qubit label */}
                          <text x="12" y={y + 3} fill="#94A3B8" className="text-[9px] font-mono text-right" textAnchor="end">|q{idx}⟩</text>
                          {/* Qubit wire */}
                          <line x1="18" y1={y} x2="430" y2={y} stroke="#1E2D45" strokeWidth="1" strokeDasharray={idx > 3 ? "2 2" : "0"} />
                        </g>
                      ))}
                      
                      {/* Classical double-wire */}
                      <text x="12" y="128" fill="#475569" className="text-[9px] font-mono text-right" textAnchor="end">c</text>
                      <line x1="18" y1="125" x2="430" y2="125" stroke="#475569" strokeWidth="0.75" />
                      <line x1="18" y1="127" x2="430" y2="127" stroke="#475569" strokeWidth="0.75" />
                      
                      {/* Column 1: Hadamard State Prep */}
                      <g>
                        <rect x="36" y="11" width="14" height="14" rx="2" fill="#00C4E8" stroke="#0096B4" strokeWidth="1" />
                        <text x="43" y="21" textAnchor="middle" fill="#080C14" className="text-[9px] font-bold font-mono">H</text>
                        
                        <rect x="36" y="29" width="14" height="14" rx="2" fill="#00C4E8" stroke="#0096B4" strokeWidth="1" />
                        <text x="43" y="39" textAnchor="middle" fill="#080C14" className="text-[9px] font-bold font-mono">H</text>
                      </g>

                      {/* Column 2: Controlled Rotation */}
                      <g>
                        <line x1="75" y1="36" x2="75" y2="90" stroke="#F59E0B" strokeWidth="1.2" />
                        <circle cx="75" cy="36" r="3.5" fill="#F59E0B" />
                        {/* Target Cross */}
                        <circle cx="75" cy="90" r="6" fill="#0D1421" stroke="#F59E0B" strokeWidth="1.2" />
                        <line x1="71" y1="90" x2="79" y2="90" stroke="#F59E0B" strokeWidth="1" />
                        <line x1="75" y1="86" x2="75" y2="94" stroke="#F59E0B" strokeWidth="1" />
                      </g>

                      {/* Column 3: Modular Exponentiation Box */}
                      <g>
                        <rect x="110" y="10" width="100" height="70" rx="4" fill="rgba(239, 68, 68, 0.08)" stroke="#EF4444" strokeWidth="1.2" />
                        <rect x="110" y="10" width="100" height="18" rx="4" fill="#EF4444" fillOpacity="0.1" />
                        <text x="160" y="22" textAnchor="middle" fill="#EF4444" className="text-[8px] font-bold font-mono">ModExp (U^a mod N)</text>
                        <text x="160" y="48" textAnchor="middle" fill="#94A3B8" className="text-[8px] font-mono">Logical Cascade</text>
                        <text x="160" y="60" textAnchor="middle" fill="#475569" className="text-[7.5px] font-mono">O(L³) Complexity</text>
                      </g>

                      {/* Column 4: Inverse QFT block */}
                      <g>
                        <rect x="235" y="10" width="70" height="106" rx="4" fill="rgba(147, 51, 234, 0.08)" stroke="#9333EA" strokeWidth="1.2" />
                        <rect x="235" y="10" width="70" height="18" rx="4" fill="#9333EA" fillOpacity="0.1" />
                        <text x="270" y="22" textAnchor="middle" fill="#A855F7" className="text-[9px] font-bold font-mono">QFT†</text>
                        <text x="270" y="62" textAnchor="middle" fill="#94A3B8" className="text-[8px] font-mono">Inv Fourier</text>
                        <text x="270" y="74" textAnchor="middle" fill="#94A3B8" className="text-[8px] font-mono">Transform</text>
                        <text x="270" y="94" textAnchor="middle" fill="#475569" className="text-[7.5px] font-mono">y₀...y₅ readout</text>
                      </g>

                      {/* Column 5: Measurement Gates */}
                      {[18, 36, 54, 72, 90, 108].map((y, idx) => (
                        <g key={idx}>
                          <rect x="330" y={y - 7} width="16" height="14" rx="2" fill="#1E2D45" stroke="#94A3B8" strokeWidth="1" />
                          <path d={`M${332} ${y + 4} A5 5 0 0 1 ${344} ${y + 4}`} fill="none" stroke="#94A3B8" strokeWidth="0.8" />
                          <line x1="338" y1={y + 4} x2="342" y2={y - 3} stroke="#00C4E8" strokeWidth="1" />
                          {/* Classical output lines */}
                          <line x1="346" y1={y} x2="390" y2={y} stroke="#475569" strokeWidth="0.75" />
                          <line x1="390" y1={y} x2="390" y2="125" stroke="#475569" strokeWidth="0.75" />
                          <circle cx="390" cy="125" r="1.5" fill="#475569" />
                        </g>
                      ))}
                    </svg>
                  </div>
                  <span className="text-[9px] text-[#475569] block font-mono">
                    Representative Shor circuit trace. Active qubits: {shorTarget === 'RSA-1024' ? '2,048' : shorTarget === 'RSA-2048' ? '4,096' : '8,192'} logical registers.
                  </span>
                </div>

                {/* Cryptographic Break Alert */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-black text-red-400 uppercase tracking-widest">⚠ Cryptographic Vulnerability Alert</h5>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                      {shorTarget} is vulnerable to Shor's Factorization. A fault-tolerant processor of {shorMetrics.qubits} logical qubits can resolve keys in {shorMetrics.quantumTime}. Traditional security parameters are compromised.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'grovers' && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Grover's Controls (4 Columns) */}
          <div className="lg:col-span-4 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-semibold text-white">Grover's Algorithm Simulator</h3>
                <p className="text-[12px] text-[#94A3B8] mt-0.5">Simulate search amplitude amplification for symmetric ciphers</p>
              </div>

              {/* Symmetric Cipher Target Selector */}
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

              {/* Grover's Qubits Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                  <span>Qubits Required</span>
                  <span className="text-[#00C4E8] font-mono normal-case">{groverQubits} qubits</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  value={groverQubits}
                  onChange={(e) => setGroverQubits(Number(e.target.value))}
                  className="w-full h-1 bg-[#1E2D45] rounded-lg appearance-none cursor-pointer accent-[#00C4E8]"
                />
              </div>

              {/* Grover's Circuit Depth Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                  <span>Oracle Circuit Depth</span>
                  <span className="text-white font-mono normal-case">{groverDepth.toLocaleString()} gates</span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={10000000}
                  step={50000}
                  value={groverDepth}
                  onChange={(e) => setGroverDepth(Number(e.target.value))}
                  className="w-full h-1 bg-[#1E2D45] rounded-lg appearance-none cursor-pointer accent-[#00C4E8]"
                />
              </div>

              <div className="bg-[#080C14]/30 border border-[#1E2D45]/40 rounded-lg p-3 text-[11px] text-[#94A3B8] leading-relaxed">
                ℹ️ Grover's search operates by quadratically speeding up database searches. For symmetric ciphers, it reduces the effective key security parameter to exactly half (2^(N/2)).
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-[#1E2D45]/40">
              <button
                onClick={triggerSimulation}
                disabled={isSimulating}
                className="flex-1 bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-bold text-[13px] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play size={14} fill="currentColor" />
                Run Simulation
              </button>
              <button
                onClick={exportSimulationData}
                disabled={isSimulating || !hasRunGrover}
                className="px-4 bg-[#080C14] hover:bg-[#1E2D45] border border-[#1E2D45] text-slate-300 font-semibold rounded-md text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download size={14} />
                Export
              </button>
            </div>
          </div>

          {/* Grover's Results (6 Columns) */}
          <div className="lg:col-span-6 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[460px]">
            {isSimulating ? (
              <div className="flex-1 flex flex-col justify-center space-y-6 py-8">
                <div className="text-center flex flex-col items-center gap-2">
                  <Atom size={44} className="text-[#00C4E8] animate-spin" />
                  <span className="text-[14px] font-bold text-white tracking-wider">Grover search iteration in progress</span>
                  <span className="text-[11px] text-[#94A3B8]">Elapsed: {elapsedTime}s / Estimated: {(4.0 - elapsedTime).toFixed(1)}s remaining</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-[#94A3B8]">
                    <span>Iterating Oracle States...</span>
                    <span>{simProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#080C14] border border-[#1E2D45] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00C4E8] to-[#A855F7] transition-all duration-100" style={{ width: `${simProgress}%` }} />
                  </div>
                </div>

                {/* Phase specific updates */}
                <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-4 flex gap-3 animate-pulse">
                  <span className="text-lg">⚙️</span>
                  <div className="text-xs">
                    {simPhase === 1 && (
                      <>
                        <strong>Phase 1/4: Oracle Register Synthesis</strong>
                        <p className="text-[#94A3B8] mt-1">Initializing quantum registers for N={groverQubits} states...</p>
                      </>
                    )}
                    {simPhase === 2 && (
                      <>
                        <strong>Phase 2/4: Oracle Query Iterations</strong>
                        <p className="text-[#94A3B8] mt-1">Running state inversion over evaluation oracle inputs...</p>
                      </>
                    )}
                    {simPhase === 3 && (
                      <>
                        <strong>Phase 3/4: Amplitude Amplification (Diffusion)</strong>
                        <p className="text-[#94A3B8] mt-1">Applying diffusion transforms around state average values...</p>
                      </>
                    )}
                    {simPhase === 4 && (
                      <>
                        <strong>Phase 4/4: Measurement Collapse</strong>
                        <p className="text-[#94A3B8] mt-1">Recording target search vector coordinates...</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[#22C55E]">
                    <CheckCircle2 size={16} />
                    <span className="text-[13px] font-bold uppercase tracking-wider">Simulation Output</span>
                  </div>
                  <span className="text-[10px] text-[#475569] font-mono">Last Run: {new Date().toLocaleTimeString()}</span>
                </div>

                {/* Grover's KPI Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Required Qubits</span>
                    <h4 className="text-2xl font-black text-white font-mono mt-1">{groverMetrics.qubits}</h4>
                    <span className="text-[9.5px] text-[#475569] font-mono block mt-1">Logical register capacity</span>
                  </div>

                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4 relative group">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider flex items-center gap-1">
                      Quantum Iterations
                      <HelpCircle size={10} className="text-slate-500 cursor-pointer" />
                    </span>
                    <h4 className="text-lg font-black text-white font-mono mt-2 break-all">{groverMetrics.iterations}</h4>
                    <div className="absolute hidden group-hover:block bg-[#121B2E] text-[#94A3B8] border border-[#1E2D45] text-[10px] p-2.5 rounded-lg w-52 z-30 bottom-12 right-4 shadow-xl font-mono leading-relaxed">
                      Total oracle query cycles needed to amplify success probability to ~99.9%.
                    </div>
                  </div>

                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Effective Key Security</span>
                    <h4 className="text-xl font-black text-[#EF4444] font-mono mt-1.5">{groverMetrics.effectiveSecurity}</h4>
                  </div>

                  <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider">Evaluation Status</span>
                    <h4 className={`text-md font-black uppercase tracking-wider mt-2.5 ${
                      groverMetrics.status === 'SECURE' ? 'text-[#22C55E]' : 'text-[#EF4444]'
                    }`}>{groverMetrics.status === 'SECURE' ? 'PQC COMPLIANT (SAFE)' : 'SECURITY HALVED'}</h4>
                  </div>
                </div>

                {/* Grover's Verdict Alert */}
                <div className={`border rounded-xl p-4 flex gap-3 ${
                  groverMetrics.status === 'SECURE' 
                    ? 'bg-[#1F3A1F]/30 border-green-500/30 text-green-400' 
                    : 'bg-[#3D2A1F]/30 border-[#FF9500]/30 text-[#E8B17A]'
                }`}>
                  <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <h5 className="text-[11px] font-black uppercase tracking-widest">
                      {groverMetrics.status === 'SECURE' ? '✓ Standard Compliant' : '⚠️ CRYPTOGRAPHIC RECOMMENDATION'}
                    </h5>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                      {groverTarget === 'AES-128' 
                        ? "AES-128 is downgraded to 64-bit effective security. This is within range of massive parallel pre-computation. Upgrade to AES-256 immediately."
                        : "AES-256's effective security remains 128-bit under Grover's attack. 128-bits of quantum entropy is secure against any theoretical physical quantum processor."
                      }
                    </p>
                  </div>
                </div>

                {/* Grover Circuit Preview */}
                <div className="space-y-2 bg-[#080C14] border border-[#1E2D45]/40 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#475569] uppercase font-bold tracking-wider block">Grover Amplitude Amplification Circuit Preview</span>
                    <span className="text-[9px] text-[#00C4E8] font-mono">Symmetric Oracle Phase</span>
                  </div>
                  <div className="h-[150px] w-full border border-white/[0.02] bg-black/20 rounded p-1.5 overflow-hidden">
                    <svg width="100%" height="100%" viewBox="0 0 450 140" className="select-none">
                      {/* Grid Lines (Qubits) */}
                      {[18, 36, 54, 72, 90, 108].map((y, idx) => (
                        <g key={idx}>
                          {/* Qubit label */}
                          <text x="12" y={y + 3} fill="#94A3B8" className="text-[9px] font-mono text-right" textAnchor="end">|q{idx}⟩</text>
                          {/* Qubit wire */}
                          <line x1="18" y1={y} x2="430" y2={y} stroke="#1E2D45" strokeWidth="1" />
                        </g>
                      ))}
                      
                      {/* Classical double-wire */}
                      <text x="12" y="128" fill="#475569" className="text-[9px] font-mono text-right" textAnchor="end">c</text>
                      <line x1="18" y1="125" x2="430" y2="125" stroke="#475569" strokeWidth="0.75" />
                      <line x1="18" y1="127" x2="430" y2="127" stroke="#475569" strokeWidth="0.75" />
                      
                      {/* Column 1: Hadamard prep on all wires */}
                      {[18, 36, 54, 72, 90, 108].map((y, idx) => (
                        <g key={idx}>
                          <rect x="30" y={y - 7} width="14" height="14" rx="2" fill="#00C4E8" stroke="#0096B4" strokeWidth="1" />
                          <text x="37" y={y + 3} textAnchor="middle" fill="#080C14" className="text-[9px] font-bold font-mono">H</text>
                        </g>
                      ))}

                      {/* Column 2: Oracle Box */}
                      <g>
                        <rect x="75" y="10" width="85" height="106" rx="4" fill="rgba(239, 68, 68, 0.08)" stroke="#EF4444" strokeWidth="1.2" />
                        <rect x="75" y="10" width="85" height="18" rx="4" fill="#EF4444" fillOpacity="0.1" />
                        <text x="117.5" y="22" textAnchor="middle" fill="#EF4444" className="text-[9px] font-bold font-mono">Oracle (U_w)</text>
                        <text x="117.5" y="62" textAnchor="middle" fill="#94A3B8" className="text-[8px] font-mono">Phase Inversion</text>
                        <text x="117.5" y="74" textAnchor="middle" fill="#475569" className="text-[7.5px] font-mono">f(x) = 1 target</text>
                      </g>

                      {/* Column 3: Hadamard diffusion prep */}
                      {[18, 36, 54, 72, 90, 108].map((y, idx) => (
                        <g key={idx}>
                          <rect x="190" y={y - 7} width="14" height="14" rx="2" fill="#00C4E8" stroke="#0096B4" strokeWidth="1" />
                          <text x="197" y={y + 3} textAnchor="middle" fill="#080C14" className="text-[9px] font-bold font-mono">H</text>
                        </g>
                      ))}

                      {/* Column 4: Diffusion Operator Box */}
                      <g>
                        <rect x="235" y="10" width="95" height="106" rx="4" fill="rgba(147, 51, 234, 0.08)" stroke="#9333EA" strokeWidth="1.2" />
                        <rect x="235" y="10" width="95" height="18" rx="4" fill="#9333EA" fillOpacity="0.1" />
                        <text x="282.5" y="22" textAnchor="middle" fill="#A855F7" className="text-[9px] font-bold font-mono">Diffusion (U_s)</text>
                        <text x="282.5" y="62" textAnchor="middle" fill="#94A3B8" className="text-[8px] font-mono">Mean Inversion</text>
                        <text x="282.5" y="74" textAnchor="middle" fill="#475569" className="text-[7.5px] font-mono">2|s⟩⟨s| - I</text>
                      </g>

                      {/* Column 5: Hadamard post diffusion */}
                      {[18, 36, 54, 72, 90, 108].map((y, idx) => (
                        <g key={idx}>
                          <rect x="360" y={y - 7} width="14" height="14" rx="2" fill="#00C4E8" stroke="#0096B4" strokeWidth="1" />
                          <text x="367" y={y + 3} textAnchor="middle" fill="#080C14" className="text-[9px] font-bold font-mono">H</text>
                        </g>
                      ))}

                      {/* Column 6: Measurement Gates */}
                      {[18, 36, 54, 72, 90, 108].map((y, idx) => (
                        <g key={idx}>
                          <rect x="400" y={y - 7} width="16" height="14" rx="2" fill="#1E2D45" stroke="#94A3B8" strokeWidth="1" />
                          <path d={`M${402} ${y + 4} A5 5 0 0 1 ${414} ${y + 4}`} fill="none" stroke="#94A3B8" strokeWidth="0.8" />
                          <line x1="408" y1={y + 4} x2="412" y2={y - 3} stroke="#00C4E8" strokeWidth="1" />
                          {/* Classical output lines */}
                          <line x1="416" y1={y} x2="430" y2={y} stroke="#475569" strokeWidth="0.75" />
                        </g>
                      ))}
                    </svg>
                  </div>
                  <span className="text-[9px] text-[#475569] block font-mono">
                    Simplified amplitude amplification circuit representation ({groverTarget} simulation).
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Comparison table */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6">
            <h3 className="text-[15px] font-semibold text-white mb-4">Post-Quantum Cryptography vs Legacy Classical Standard</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#1E2D45] text-[10px] text-[#475569] uppercase font-bold tracking-wider">
                    <th className="pb-3">Algorithm</th>
                    <th className="pb-3">Mathematical Type</th>
                    <th className="pb-3">Classical Security</th>
                    <th className="pb-3">Quantum Security (Shor/Grover)</th>
                    <th className="pb-3">PQC Migration Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D45]/60">
                  <tr className="hover:bg-[#1A2540]/30 transition">
                    <td className="py-3.5 font-bold text-white">RSA-2048</td>
                    <td className="py-3.5 text-[#94A3B8]">Prime Integer Factorization</td>
                    <td className="py-3.5 text-green-400">~13.7 Billion Years</td>
                    <td className="py-3.5 text-red-500 font-bold">~8 Hours (Broken by Shor's)</td>
                    <td className="py-3.5">
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px]">Vulnerable</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#1A2540]/30 transition">
                    <td className="py-3.5 font-bold text-white">ECDSA (P-256)</td>
                    <td className="py-3.5 text-[#94A3B8]">Elliptic Curve Discrete Log</td>
                    <td className="py-3.5 text-green-400">Stable (Standard)</td>
                    <td className="py-3.5 text-red-500 font-bold">~1 Hour (Broken by Shor's)</td>
                    <td className="py-3.5">
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px]">Vulnerable</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#1A2540]/30 transition">
                    <td className="py-3.5 font-bold text-white">AES-256</td>
                    <td className="py-3.5 text-[#94A3B8]">Symmetric Key Substitution</td>
                    <td className="py-3.5 text-green-400">256-bit entropy</td>
                    <td className="py-3.5 text-green-400">128-bit quantum entropy (Safe)</td>
                    <td className="py-3.5">
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px]">Compliant</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#1A2540]/30 transition">
                    <td className="py-3.5 font-bold text-white">ML-KEM-768 (Kyber)</td>
                    <td className="py-3.5 text-[#94A3B8]">Module Lattice-Based Cryptography</td>
                    <td className="py-3.5 text-green-400">~128-bit classical security</td>
                    <td className="py-3.5 text-green-400">~128-bit quantum security (Immune)</td>
                    <td className="py-3.5">
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px]">Compliant (NIST Std)</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#1A2540]/30 transition">
                    <td className="py-3.5 font-bold text-white">ML-DSA-65 (Dilithium)</td>
                    <td className="py-3.5 text-[#94A3B8]">Lattice Digital Signatures</td>
                    <td className="py-3.5 text-green-400">~128-bit security</td>
                    <td className="py-3.5 text-green-400">~128-bit security (Immune)</td>
                    <td className="py-3.5">
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-[10px]">Compliant (NIST Std)</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick FAQ / Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Info size={16} className="text-[#00C4E8]" />
                Why are asymmetric algorithms broken?
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Asymmetric algorithms (RSA, ECC) rely on the mathematical difficulty of factoring numbers or finding discrete logarithms. Shor's algorithm utilizes quantum superposition and period finding via the Quantum Fourier Transform to solve these equations in polynomial time (O(n^3)), rendering them completely insecure.
              </p>
            </div>
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 space-y-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Info size={16} className="text-[#00C4E8]" />
                Why are symmetric ciphers and PQC immune?
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Symmetric ciphers (AES) do not have this underlying algebraic structure; they rely on confusion and diffusion. Grover's algorithm only offers a quadratic speedup (O(√2^N)). Doubling key sizes (using AES-256) maintains full quantum security. Post-Quantum Cryptography (PQC) standards use lattice structures that do not possess the factoring periodicities Shor's algorithm exploits.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quantum Circuit Architecture Summary */}
      {activeTab !== 'comparison' && (
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1E2D45] pb-3">
            <Layers size={18} className="text-[#00C4E8]" />
            <h3 className="text-sm font-bold text-white">Quantum Attack Circuit Architecture</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Estimated Circuit Complexity</span>
              <table className="w-full text-left border-collapse font-mono text-xs">
                <tbody>
                  <tr className="border-b border-[#1E2D45]/40">
                    <td className="py-2.5 text-slate-300">Initialization & Register Superposition</td>
                    <td className="py-2.5 text-right text-[#00C4E8]">2,100 gates</td>
                  </tr>
                  <tr className="border-b border-[#1E2D45]/40">
                    <td className="py-2.5 text-slate-300">Modular Exponentiation (Oracles)</td>
                    <td className="py-2.5 text-right text-[#FF9500]">{activeTab === 'shors' ? '298,500' : '2,400,000'} gates</td>
                  </tr>
                  <tr className="border-b border-[#1E2D45]/40">
                    <td className="py-2.5 text-slate-300">QFT / Diffusion Operators</td>
                    <td className="py-2.5 text-right text-[#EF4444]">{activeTab === 'shors' ? '156,000' : '1,200,000'} gates</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-300">Measurement & Output Decollapse</td>
                    <td className="py-2.5 text-right text-slate-400">46,214 gates</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Simplified Algebraic Trace</span>
              <div className="bg-[#080C14] border border-[#1E2D45]/60 rounded-xl p-4 font-mono text-[11px] text-slate-400 leading-relaxed">
                {activeTab === 'shors' ? (
                  <>
                    <span className="text-[#00C4E8]">|ψ⟩ ──[H]──[ModExp]────[QFT†]──[M]──ϕ</span>
                    <p className="mt-3">
                      Where:<br />
                      • H = Hadamard initialization matrix<br />
                      • ModExp = Modular multiplication gate sequence<br />
                      • QFT† = Inverse Quantum Fourier Transform<br />
                      • M = Measurement detector
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-[#A855F7]">|s⟩ ──[H]──[Oracle]────[Diffusion]──[M]──ω</span>
                    <p className="mt-3">
                      Where:<br />
                      • Oracle = Inverts target state phase sign<br />
                      • Diffusion = Inverts state amplitudes around mean value<br />
                      • M = Detector reading state coordinates
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumAttackLab;
