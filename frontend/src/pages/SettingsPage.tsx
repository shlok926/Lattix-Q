import React, { useState, useEffect } from 'react';
import { encryptToken, decryptToken } from '../utils/crypto';
import { 
  Settings, 
  Shield, 
  Sliders, 
  Bell, 
  Key, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  Lock 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  // Cryptography States
  const [enforcementMode, setEnforcementMode] = useState('hybrid');
  const [sigAlgo, setSigAlgo] = useState('dilithium3');
  const [kemAlgo, setKemAlgo] = useState('kyber768');
  
  // AI States
  const [aiModel, setAiModel] = useState('analyst-v2');
  const [scanDepth, setScanDepth] = useState('deep');
  const [autoPatch, setAutoPatch] = useState(true);

  // Notifications States
  const [hndlAlert, setHndlAlert] = useState(true);
  const [retentionDays, setRetentionDays] = useState('90');

  // API Token state
  const [apiKey, setApiKey] = useState('qs_live_pq_9f2a7b8e1c6d5e0a3f4b8c9d1e');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [ibmToken, setIbmToken] = useState('');

  useEffect(() => {
    const loadToken = async () => {
      const stored = localStorage.getItem('ibm_quantum_token');
      if (stored) {
        const decrypted = await decryptToken(stored);
        setIbmToken(decrypted);
      }
    };
    loadToken();
  }, []);

  // Save success notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveSettings = async () => {
    const encrypted = await encryptToken(ibmToken);
    localStorage.setItem('ibm_quantum_token', encrypted);
    triggerToast("Security configuration saved successfully!");
  };

  const handleGenerateKey = () => {
    setGeneratingKey(true);
    setTimeout(() => {
      const chars = 'abcdef0123456789';
      let randomPart = '';
      for (let i = 0; i < 26; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setApiKey(`qs_live_pq_${randomPart}`);
      setGeneratingKey(false);
      triggerToast("New Post-Quantum API key generated!");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D1421]/95 backdrop-blur-md border border-white/[0.08] text-[#E2E8F0] px-4 py-3 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex items-center gap-3 max-w-sm hover:scale-[1.02] transition-transform">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C4E8] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C4E8]"></span>
          </div>
          <Check size={14} className="text-green-500" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00C4E8]/10 flex items-center justify-center text-[#00C4E8]">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Security Settings</h1>
            <p className="text-sm text-[#94A3B8]">
              Configure Lattix - Q core algorithms, AI models, compliance guardrails, and API keys.
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] font-semibold text-xs rounded-lg transition shrink-0"
        >
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Crypto & Compliance */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Panel 1: Cryptographic Standards */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2D45]/60 pb-3">
              <Shield size={18} className="text-[#00C4E8]" />
              <h2 className="text-sm font-bold text-white">Cryptographic Standards</h2>
            </div>

            <div className="space-y-4 pt-1">
              {/* Enforcement Mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Enforcement Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setEnforcementMode('hybrid')}
                    className={`p-3 rounded-lg border text-left transition ${
                      enforcementMode === 'hybrid'
                        ? 'bg-[#00C4E8]/5 border-[#00C4E8] text-white'
                        : 'bg-[#080C14] border-[#1E2D45] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Hybrid Mode</div>
                    <div className="text-[10px] text-slate-500 mt-1">Classic + PQC keys (Highly Recommended)</div>
                  </button>
                  <button
                    onClick={() => setEnforcementMode('pure')}
                    className={`p-3 rounded-lg border text-left transition ${
                      enforcementMode === 'pure'
                        ? 'bg-[#00C4E8]/5 border-[#00C4E8] text-white'
                        : 'bg-[#080C14] border-[#1E2D45] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1">
                      Pure PQC
                      <Lock size={10} className="text-amber-500" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Strict Post-Quantum algorithms only</div>
                  </button>
                  <button
                    onClick={() => setEnforcementMode('classic')}
                    className={`p-3 rounded-lg border text-left transition ${
                      enforcementMode === 'classic'
                        ? 'bg-[#00C4E8]/5 border-[#00C4E8] text-white'
                        : 'bg-[#080C14] border-[#1E2D45] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Fallback Classic</div>
                    <div className="text-[10px] text-slate-500 mt-1">Allow fallback to RSA/ECC parameters</div>
                  </button>
                </div>
              </div>

              {/* Algorithms Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Signature Algorithm</label>
                  <select
                    value={sigAlgo}
                    onChange={(e) => setSigAlgo(e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1E2D45] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00C4E8]"
                  >
                    <option value="dilithium3">Dilithium3 (Default - NIST Level 3)</option>
                    <option value="dilithium5">Dilithium5 (High - NIST Level 5)</option>
                    <option value="falcon512">Falcon-512 (Fast verification)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Key Encapsulation (KEM)</label>
                  <select
                    value={kemAlgo}
                    onChange={(e) => setKemAlgo(e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1E2D45] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00C4E8]"
                  >
                    <option value="kyber768">Kyber-768 (Default - NIST Level 3)</option>
                    <option value="kyber1024">Kyber-1024 (High - NIST Level 5)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: AI Co-Pilot Configuration */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2D45]/60 pb-3">
              <Sliders size={18} className="text-[#00C4E8]" />
              <h2 className="text-sm font-bold text-white">AI Scanner & Co-Pilot</h2>
            </div>

            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Analysis Engine Model</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1E2D45] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00C4E8]"
                  >
                    <option value="analyst-v2">Lattix-Q-Analyst-V2 (Optimized)</option>
                    <option value="defense-pro">Lattix-Q-Defense-Pro (Deep)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Scan Depth Intensity</label>
                  <select
                    value={scanDepth}
                    onChange={(e) => setScanDepth(e.target.value)}
                    className="w-full bg-[#080C14] border border-[#1E2D45] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#00C4E8]"
                  >
                    <option value="fast">Standard (Fast AST scan)</option>
                    <option value="deep">Deep Audit (Full contextual LLM check)</option>
                  </select>
                </div>
              </div>

              {/* Toggle Auto-patch */}
              <div className="flex items-center justify-between p-3 bg-[#080C14] rounded-lg border border-[#1E2D45]/40">
                <div>
                  <div className="text-xs font-bold text-white">Auto-repair Code Vulnerabilities</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Let AI automatically suggest and patch classic crypto calls to Kyber.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={autoPatch} 
                    onChange={(e) => setAutoPatch(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00C4E8]"></div>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: API Keys & Alerts */}
        <div className="space-y-6">
          
          {/* Panel 3: Post-Quantum Developer Access */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2D45]/60 pb-3">
              <Key size={18} className="text-[#00C4E8]" />
              <h2 className="text-sm font-bold text-white">Developer API Tokens</h2>
            </div>

            <div className="space-y-3 pt-1">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use this key to authorize remote CLI scanners, local sandbox containers, and CI/CD actions.
              </p>
              
              <div className="space-y-2 pb-2 border-b border-[#1E2D45]/40">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="w-full bg-[#080C14] border border-[#1E2D45] rounded-lg p-2.5 text-[10px] font-mono text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleGenerateKey}
                  disabled={generatingKey}
                  className="w-full bg-[#00C4E8]/10 text-[#00C4E8] hover:bg-[#00C4E8]/20 transition font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 border border-[#00C4E8]/20"
                >
                  <RefreshCw size={12} className={generatingKey ? 'animate-spin' : ''} />
                  {generatingKey ? 'Re-keying...' : 'Generate New Token'}
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">IBM Quantum QPU Token</span>
                  <a 
                    href="https://quantum.ibm.com/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[9px] text-[#00C4E8] hover:underline"
                  >
                    Get Free Token
                  </a>
                </div>
                <input
                  type="password"
                  value={ibmToken}
                  onChange={(e) => setIbmToken(e.target.value)}
                  placeholder="Paste your IBM Quantum API key (100% Free)"
                  className="w-full bg-[#080C14] border border-[#1E2D45] rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-[#00C4E8]"
                />
                <p className="text-[9px] text-slate-500 leading-normal">
                  If set, attack simulations will run on IBM Quantum Cloud simulators via qiskit-ibm-runtime. Leaves empty to use local Qiskit Aer emulation.
                </p>
              </div>
            </div>
          </div>

          {/* Panel 4: Security Alerts */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E2D45]/60 pb-3">
              <Bell size={18} className="text-[#00C4E8]" />
              <h2 className="text-sm font-bold text-white">Compliance & Logs</h2>
            </div>

            <div className="space-y-4 pt-1 text-xs">
              {/* Alert Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">HNDL Risk Notifications</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Send alerts for newly discovered legacy SSL assets.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    checked={hndlAlert} 
                    onChange={(e) => setHndlAlert(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#00C4E8]"></div>
                </label>
              </div>

              {/* Log Retention */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Log Retention Period</label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1E2D45] rounded-lg p-2 text-xs text-white focus:outline-none"
                >
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">365 Days</option>
                  <option value="infinite">Indefinite (Enforce Compliance Audit)</option>
                </select>
              </div>

              {/* Status Banner */}
              <div className="flex items-start gap-2 bg-[#00C4E8]/5 border border-[#00C4E8]/20 rounded p-3 text-[10px] leading-relaxed text-slate-300">
                <AlertTriangle size={14} className="text-[#00C4E8] shrink-0 mt-0.5" />
                <span>All cryptography settings are applied cluster-wide inside the Lattix - Q API Gateway.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
