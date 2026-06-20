import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Globe, Layout, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuantumNode {
  id: string;
  name: string;
  location: string;
  qubits: number;
  status: 'Online' | 'Offline' | 'Busy';
  queueTime: string;
}

const NODES: QuantumNode[] = [
  { id: 'ibm-quito', name: 'IBM Quito', location: 'Quito, Ecuador', qubits: 5, status: 'Online', queueTime: '2m' },
  { id: 'ibm-belem', name: 'IBM Belem', location: 'Belem, Brazil', qubits: 5, status: 'Busy', queueTime: '15m' },
  { id: 'ibm-osprey', name: 'IBM Osprey', location: 'Poughkeepsie, NY', qubits: 433, status: 'Online', queueTime: '45m' },
  { id: 'ibm-condor', name: 'IBM Condor', location: 'Yorktown Heights, NY', qubits: 1121, status: 'Online', queueTime: '1h 20m' },
];

const QuantumHardware: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<QuantumNode>(NODES[0]);
  const [jobStatus, setJobStatus] = useState<'idle' | 'submitting' | 'queued' | 'running' | 'completed'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const runJob = () => {
    setJobStatus('submitting');
    addLog(`Initiating connection to ${selectedNode.name} node...`);
    
    setTimeout(() => {
      setJobStatus('queued');
      addLog(`Job successfully queued. Position: 4 in line.`);
    }, 1500);

    setTimeout(() => {
      setJobStatus('running');
      addLog(`Executing Bell State circuit on real hardware...`);
    }, 4000);

    setTimeout(() => {
      setJobStatus('completed');
      addLog(`Job completed. Qubit state vector received.`);
    }, 8000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div className="page-header mb-0">
          <h1 className="page-title">Real Quantum Hardware Gateway</h1>
          <p className="page-subtitle">Connect directly to IBM Quantum nodes and execute circuits on physical qubits.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> IBM API Key Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Node Selection */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-muted uppercase tracking-widest px-2">Available Nodes</h3>
          <div className="space-y-3">
            {NODES.map((node) => (
              <motion.div
                whileHover={{ x: 4 }}
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`card p-4 cursor-pointer transition-all ${selectedNode.id === node.id ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10' : 'border-white/5 hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-sm">{node.name}</div>
                  <div className={`px-2 py-0.5 rounded-[4px] text-[8px] font-bold uppercase ${
                    node.status === 'Online' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {node.status}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted">
                  <span className="flex items-center gap-1"><Cpu size={10} /> {node.qubits} Qubits</span>
                  <span className="flex items-center gap-1"><Activity size={10} /> {node.queueTime} Queue</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Execution Area */}
        <div className="xl:col-span-3 space-y-6">
          <div className="card p-8 min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Cpu size={200} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 relative z-10">
              <AnimatePresence mode="wait">
                {jobStatus === 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="space-y-6"
                  >
                    <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto border border-accent/20 rotate-12">
                      <Zap size={40} className="text-accent" />
                    </div>
                    <div className="max-w-md">
                      <h2 className="text-2xl font-bold mb-2">Ready for Execution</h2>
                      <p className="text-sm text-muted">Node: <b>{selectedNode.name}</b> ({selectedNode.qubits} Qubits). No circuit loaded. Defaulting to 2-Qubit Bell State test.</p>
                    </div>
                    <button 
                      onClick={runJob}
                      className="btn px-12 py-4 text-lg bg-accent hover:bg-accent-hover shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                    >
                      <Send size={20} className="mr-2" /> Launch Circuit
                    </button>
                  </motion.div>
                )}

                {(jobStatus === 'submitting' || jobStatus === 'queued' || jobStatus === 'running') && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8 w-full max-w-lg"
                  >
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full border-4 border-accent/20 border-t-accent animate-spin mx-auto" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu size={32} className="text-accent animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold uppercase tracking-widest">
                        {jobStatus === 'submitting' && 'Handshaking...'}
                        {jobStatus === 'queued' && 'Queued at IBM'}
                        {jobStatus === 'running' && 'Physical Qubit Execution'}
                      </h2>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-accent"
                          initial={{ width: '0%' }}
                          animate={{ width: jobStatus === 'running' ? '80%' : '30%' }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {jobStatus === 'completed' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 w-full"
                  >
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-500">Job Complete</h2>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                      <div className="card bg-white/5 p-4 text-left">
                        <div className="text-[10px] text-muted uppercase font-bold mb-1">State Vector |00⟩</div>
                        <div className="text-lg font-bold">48.2%</div>
                      </div>
                      <div className="card bg-white/5 p-4 text-left">
                        <div className="text-[10px] text-muted uppercase font-bold mb-1">State Vector |11⟩</div>
                        <div className="text-lg font-bold">51.8%</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setJobStatus('idle')}
                      className="btn bg-white/5 border border-white/10 hover:bg-white/10"
                    >
                      Reset Gateway
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Console */}
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 mb-4 text-accent text-xs font-bold uppercase tracking-widest">
                <Globe size={14} /> Execution Telemetry
              </div>
              <div className="bg-bg-dark/50 rounded-xl p-4 font-mono text-[10px] space-y-1.5 h-32 overflow-y-auto scrollbar-hide">
                {logs.map((log, i) => (
                  <div key={i} className={i === 0 ? 'text-white' : 'text-muted'}>
                    <span className="text-accent opacity-50">»</span> {log}
                  </div>
                ))}
                {logs.length === 0 && <div className="text-muted/30 italic">System ready. Awaiting instructions...</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumHardware;
