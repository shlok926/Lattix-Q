import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Shield, Zap, Terminal, Search, Layers, AlertTriangle, 
  CheckCircle2, Sparkles, Cpu, Globe, Rocket, ChevronRight, 
  FileCode2, Database, Network, Loader2, ScanLine, Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIHub() {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('');
  const [findings, setFindings] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [refactoredCode, setRefactoredCode] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-8), `> ${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleScan = async () => {
    try {
      setLoading(true);
      setFindings([]);
      setRoadmap(null);
      setScore(null);
      setLogs([]);
      
      addLog("Initializing Neural Engine v4.2...");
      setTimeout(() => addLog("Loading Cryptographic Signatures database..."), 500);
      setTimeout(() => addLog(`Scanning ${filename || 'input_buffer'} for PQC vulnerabilities...`), 1200);
      
      const res = await api.post('/ai/scan', { filename: filename || 'buffer.py', content: code });
      
      setTimeout(() => {
        setFindings(res.data.findings);
        setScore(res.data.score);
        addLog(`Scan complete. Security Score: ${res.data.score}/100`);
        if (res.data.findings.length > 0) {
          addLog(`${res.data.findings.length} vulnerabilities detected. Generating strategy...`);
          fetchRoadmap(res.data.findings);
        }
      }, 2000);

    } catch (e) {
      addLog("ERROR: Engine failure during analysis.");
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const fetchRoadmap = async (f: any[]) => {
    const res = await api.post('/ai/roadmap', { findings: f });
    setRoadmap(res.data);
    addLog("Migration roadmap generated.");
  };

  const handleAutoFix = async () => {
    setFixing(true);
    addLog("Applying Neural Refactor (ML-KEM/DSA)...");
    try {
      const res = await api.post('/ai/refactor', { code, findings });
      setRefactoredCode(res.data.refactored_code);
      addLog("Codebase patched successfully.");
    } catch (e) {
      addLog("ERROR: Refactor engine interrupted.");
    } finally {
      setFixing(false);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target?.result as string);
      setFilename(file.name);
      addLog(`File loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden font-['Inter']">
      {/* Dynamic Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#16161a_1px,transparent_1px),linear-gradient(to_bottom,#16161a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto p-8 space-y-12">
        
        {/* Top Branding Section */}
        <div className="flex justify-between items-start">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
              AI Intelligence <span className="text-accent not-italic">Hub</span>
            </h1>
            <p className="text-muted/60 font-bold tracking-widest text-xs mt-2 flex items-center gap-2">
              <ScanLine size={14} className="text-accent" /> QUANTUM_SHIELD_SECURE_SCAN // NODE: BRAIN_04
            </p>
          </motion.div>

          <div className="flex gap-4">
            <div className="card p-4 bg-white/5 border-white/10 flex items-center gap-4">
              <div className="text-right">
                <div className="text-[9px] font-black text-muted uppercase tracking-widest">Global Status</div>
                <div className="text-xs font-bold text-green-500">OPERATIONAL</div>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Left Column: The Neural Scanner (8 columns) */}
          <div className="xl:col-span-8 space-y-10">
            <motion.div 
              className={`relative rounded-3xl border transition-all duration-700 min-h-[600px] flex flex-col overflow-hidden bg-white/[0.02] ${
                isDragging ? 'border-accent bg-accent/[0.05] shadow-[0_0_50px_rgba(109,40,217,0.2)]' : 'border-white/5 shadow-2xl'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if(file) readFile(file); }}
            >
              {/* Internal Scanner Header */}
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent rounded-2xl shadow-[0_0_15px_rgba(109,40,217,0.4)]">
                    <Database size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">Neural Scanner Core</h2>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">{filename || 'Awaiting Input Buffer'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white/5 hover:bg-accent border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                  <Upload size={16} className="inline mr-2" /> Load Local Assets
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                   const file = e.target.files?.[0];
                   if(file) readFile(file);
                }} />
              </div>

              {/* Code Area */}
              <div className="flex-1 relative">
                <textarea 
                  className="w-full h-full min-h-[500px] p-8 bg-transparent border-none focus:ring-0 font-['JetBrains_Mono',monospace] text-sm leading-relaxed text-white/60 selection:bg-accent/40 scrollbar-hide resize-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="DROP SOURCE ASSETS HERE OR PASTE IMPLEMENTATION..."
                />
                
                {!code && !isDragging && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
                      transition={{ duration: 10, repeat: Infinity }}
                      className="w-32 h-32 border-2 border-accent/20 rounded-full flex items-center justify-center mb-6"
                    >
                      <div className="w-24 h-24 border border-accent/40 rounded-full flex items-center justify-center">
                        <FileCode2 size={40} className="text-accent opacity-30" />
                      </div>
                    </motion.div>
                    <p className="text-xs font-black text-muted uppercase tracking-[0.4em] opacity-40">Drop Cryptographic Assets</p>
                  </div>
                )}

                <AnimatePresence>
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
                    >
                      <div className="relative">
                        <Loader2 size={80} className="text-accent animate-spin" />
                        <motion.div 
                          animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-accent rounded-full"
                        />
                      </div>
                      <h3 className="mt-8 text-xl font-black italic tracking-widest text-white uppercase">Analyzing Neural Patterns</h3>
                      <div className="w-48 h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                          animate={{ x: [-200, 200] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-full h-full bg-accent"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Bar */}
              <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                <button 
                  className={`w-full py-5 rounded-2xl text-sm font-black uppercase tracking-[0.4em] transition-all relative overflow-hidden group shadow-2xl ${
                    !code ? 'bg-white/5 text-muted cursor-not-allowed' : 'bg-accent text-white shadow-accent/20 hover:scale-[1.01]'
                  }`}
                  onClick={handleScan}
                  disabled={loading || !code}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Zap size={20} className={loading ? 'animate-pulse' : ''} />
                    Execute Intelligence Scan
                  </span>
                </button>
              </div>
            </motion.div>

            {/* Live Intelligence Feed (Logs) */}
            <div className="card p-6 bg-black border-white/5 font-['JetBrains_Mono',monospace]">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3 text-xs font-black text-muted uppercase tracking-widest">
                  <Terminal size={14} className="text-accent" /> Live Intelligence Feed
                </div>
                <div className="text-[10px] text-muted">STREAME_ID: QS-992</div>
              </div>
              <div className="h-40 overflow-y-auto space-y-2 text-[11px] scrollbar-hide">
                {logs.length === 0 ? (
                  <p className="text-muted/20 italic">Awaiting connection to neural engine...</p>
                ) : (
                  logs.map((log, i) => (
                    <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={i} className={log.includes('ERROR') ? 'text-red-500' : 'text-accent/80'}>
                      {log}
                    </motion.div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Intelligence Insights (4 columns) */}
          <div className="xl:col-span-4 space-y-10">
            
            {/* Score Card */}
            <AnimatePresence mode="wait">
              {score !== null ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 bg-gradient-to-br from-accent/10 to-transparent border-accent/20 text-center space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Shield size={100} />
                   </div>
                   <h3 className="text-xs font-black text-muted uppercase tracking-[0.4em]">Readiness Score</h3>
                   <div className="relative inline-block">
                     <svg className="w-48 h-48 -rotate-90">
                        <circle cx="96" cy="96" r="80" className="stroke-white/5 fill-none" strokeWidth="8" />
                        <motion.circle 
                          cx="96" cy="96" r="80" 
                          className={`fill-none ${score > 80 ? 'stroke-green-500' : 'stroke-red-500'}`} 
                          strokeWidth="12" 
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "0 1000" }}
                          animate={{ strokeDasharray: `${(score * 5.02)} 1000` }}
                          transition={{ duration: 2, ease: "easeOut" }}
                        />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl font-black text-white tabular-nums">{score}</div>
                        <div className="text-[10px] font-bold text-muted uppercase mt-1">NIST_READY</div>
                     </div>
                   </div>
                   <div className="flex justify-center gap-4">
                     <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${score > 80 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {score > 80 ? 'POST_QUANTUM_SAFE' : 'CLASSICAL_VULNERABILITY'}
                     </div>
                   </div>
                </motion.div>
              ) : (
                <div className="card p-10 border-white/5 flex flex-col items-center justify-center text-center space-y-6 min-h-[350px] opacity-40">
                  <Cpu size={48} className="text-muted/20" />
                  <p className="text-xs font-black text-muted uppercase tracking-[0.2em]">Neural Engine <br/>IDLE_MODE</p>
                </div>
              )}
            </AnimatePresence>

            {/* Quick Intelligence Summary */}
            <div className="space-y-4">
               {[
                 { icon: Search, title: 'Deep Pattern Scan', desc: 'Identifies legacy ECC, RSA, and SHA-1 implementations.', color: 'text-accent' },
                 { icon: Network, title: 'NIST Compliance', desc: 'Cross-checks against FIPS 203, 204, and 205 standards.', color: 'text-blue-500' },
                 { icon: Sparkles, title: 'AI Refactoring', desc: 'Generates drop-in ML-KEM and SLH-DSA replacements.', color: 'text-green-500' }
               ].map((item, i) => (
                 <div key={i} className="card p-6 bg-white/[0.01] border-white/5 hover:bg-white/[0.03] transition-all flex gap-5 group">
                    <div className={`p-3 bg-white/5 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{item.title}</h4>
                      <p className="text-[11px] text-muted leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Dynamic Results & Tech-Tree Roadmap (Bottom Section) */}
        <AnimatePresence>
          {findings.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12 pt-12 border-t border-white/5"
            >
              <div className="flex justify-between items-center px-4">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Analysis <span className="text-accent not-italic">Summary</span></h2>
                <button 
                  onClick={handleAutoFix}
                  disabled={fixing}
                  className="px-10 py-4 bg-green-500 hover:bg-green-400 text-[#050508] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-green-500/20 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  {fixing ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
                  {fixing ? 'Patching Environment...' : 'Initialize Auto-Refactor'}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Findings Matrix */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-muted uppercase tracking-[0.4em] ml-4">Vulnerability Matrix</h3>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                    {findings.map((f, i) => (
                      <div key={i} className="card p-6 bg-white/[0.02] border-white/5 hover:border-accent/30 transition-all relative overflow-hidden group">
                         <div className={`absolute top-0 right-0 w-1 h-full ${f.risk === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-xl bg-white/5 ${f.risk === 'Critical' ? 'text-red-500' : 'text-yellow-500'}`}>
                                 <AlertTriangle size={16} />
                               </div>
                               <span className="text-xs font-black text-white uppercase">{f.technology}</span>
                            </div>
                            <span className="text-[9px] font-black text-muted/60 uppercase">LINE: {f.line}</span>
                         </div>
                         <code className="block p-4 bg-black rounded-xl text-[11px] font-['JetBrains_Mono'] text-muted mb-4 border border-white/5 group-hover:text-white/80 transition-colors">
                           {f.content}
                         </code>
                         <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-center gap-3">
                           <Sparkles size={14} className="text-accent" />
                           <p className="text-[11px] text-white/90 font-medium italic">"{f.suggestion}"</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech-Tree Migration Roadmap */}
                {roadmap && (
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-muted uppercase tracking-[0.4em] ml-4">Migration Tech-Tree</h3>
                    <div className="card p-10 bg-black/40 border-white/5 relative h-full">
                       <div className="space-y-12 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-accent/10">
                         {roadmap.phases.map((p: any, i: number) => (
                           <motion.div 
                             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                             key={i} className="relative pl-12"
                           >
                              <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-bg-dark border border-accent/40 flex items-center justify-center font-black text-accent shadow-2xl z-10 group-hover:scale-110 transition-transform">
                                {i + 1}
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                  {p.name} <ChevronRight size={14} className="text-muted/40" />
                                </h4>
                                <p className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">{p.duration}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                  {p.tasks.map((t: string, j: number) => (
                                    <div key={j} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-muted font-medium hover:text-white transition-colors">
                                      {t}
                                    </div>
                                  ))}
                                </div>
                              </div>
                           </motion.div>
                         ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Side-by-Side Refactored Comparison */}
              {refactoredCode && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="card p-12 border-white/10 bg-black relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-accent to-green-500" />
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">Quantum <span className="text-green-500 not-italic">Patch</span></h3>
                      <p className="text-[10px] text-muted font-black uppercase tracking-[0.3em] mt-1">Refactored to ML-KEM-1024 standard</p>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setRefactoredCode('')} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-muted hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">Discard</button>
                      <button className="px-10 py-4 bg-accent text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all">Deploy to Production</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-[600px]">
                    <div className="flex flex-col space-y-4">
                      <div className="text-[9px] font-black text-red-500 uppercase tracking-[0.3em] ml-4">Vulnerable (Classic)</div>
                      <div className="flex-1 bg-white/[0.01] rounded-3xl border border-red-500/10 p-8 overflow-hidden group">
                        <textarea className="w-full h-full bg-transparent font-['JetBrains_Mono'] text-[11px] text-muted/60 resize-none scrollbar-hide border-none focus:ring-0 group-hover:text-muted transition-colors" value={code} readOnly />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <div className="text-[9px] font-black text-green-500 uppercase tracking-[0.3em] ml-4">Optimized (Post-Quantum)</div>
                      <div className="flex-1 bg-white/[0.02] rounded-3xl border border-green-500/20 p-8 overflow-hidden shadow-inner group">
                        <textarea className="w-full h-full bg-transparent font-['JetBrains_Mono'] text-[11px] text-white/90 resize-none scrollbar-hide border-none focus:ring-0" value={refactoredCode} readOnly />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
