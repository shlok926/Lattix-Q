import React, { useState } from 'react';
import { 
  FlaskConical, 
  Key, 
  Cpu, 
  Calculator, 
  FileCode, 
  RefreshCw, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  Binary 
} from 'lucide-react';
import { api } from '../services/api';

interface AlgorithmDetail {
  name: string;
  type: 'classical' | 'pqc' | 'symmetric';
  publicKeyBytes: number;
  privateKeyBytes: number;
  classicalSecurity: number;
  quantumSecurity: number;
  nistLevel: string;
  verdict: 'QUANTUM-VULNERABLE' | 'QUANTUM-SAFE' | 'PARTIALLY-AFFECTED';
  mathBasis: string;
  quantumAttack: string;
}

const ALGORITHMS: Record<string, AlgorithmDetail> = {
  'RSA-2048': {
    name: 'RSA-2048',
    type: 'classical',
    publicKeyBytes: 256,
    privateKeyBytes: 256,
    classicalSecurity: 112,
    quantumSecurity: 0,
    nistLevel: 'None',
    verdict: 'QUANTUM-VULNERABLE',
    mathBasis: 'Integer Factorization',
    quantumAttack: "Shor's algorithm factors integers in polynomial time ($O(n^3)$), completely breaking RSA."
  },
  'ECDSA-P256': {
    name: 'ECDSA-P256',
    type: 'classical',
    publicKeyBytes: 64,
    privateKeyBytes: 32,
    classicalSecurity: 128,
    quantumSecurity: 0,
    nistLevel: 'None',
    verdict: 'QUANTUM-VULNERABLE',
    mathBasis: 'Elliptic Curve Discrete Logarithm',
    quantumAttack: "Shor's algorithm solves discrete logarithms on elliptic curves, completely breaking ECDSA."
  },
  'ML-KEM-768': {
    name: 'ML-KEM-768 (Kyber)',
    type: 'pqc',
    publicKeyBytes: 1184,
    privateKeyBytes: 2400,
    classicalSecurity: 192,
    quantumSecurity: 128,
    nistLevel: 'Category 3',
    verdict: 'QUANTUM-SAFE',
    mathBasis: 'Module Learning With Errors (M-LWE)',
    quantumAttack: "Shor's algorithm does not apply. Best quantum attacks (lattice sieving) require $2^{128}$ quantum operations."
  },
  'ML-DSA-653': {
    name: 'ML-DSA-653 (Dilithium)',
    type: 'pqc',
    publicKeyBytes: 1952,
    privateKeyBytes: 4032,
    classicalSecurity: 128,
    quantumSecurity: 96,
    nistLevel: 'Category 2',
    verdict: 'QUANTUM-SAFE',
    mathBasis: 'Module Learning With Errors / Ring SIS',
    quantumAttack: "Resistant to Shor's algorithm. Lattice reduction attacks require extreme quantum circuit depth."
  },
  'AES-128': {
    name: 'AES-128',
    type: 'symmetric',
    publicKeyBytes: 0,
    privateKeyBytes: 16,
    classicalSecurity: 128,
    quantumSecurity: 64,
    nistLevel: 'Category 1',
    verdict: 'PARTIALLY-AFFECTED',
    mathBasis: 'Symmetric Block Substitution',
    quantumAttack: "Grover's algorithm speeds up search quadratically ($O(\\sqrt{N})$), reducing effective key strength to 64 bits."
  },
  'AES-256': {
    name: 'AES-256',
    type: 'symmetric',
    publicKeyBytes: 0,
    privateKeyBytes: 32,
    classicalSecurity: 256,
    quantumSecurity: 128,
    nistLevel: 'Category 5',
    verdict: 'QUANTUM-SAFE',
    mathBasis: 'Symmetric Block Substitution',
    quantumAttack: "Grover's algorithm reduces effective security from 256 to 128 bits, which remains computationally infeasible."
  }
};

const SAMPLE_JWT = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpc3MiOiJxdWFudHVtc2hpZWxkLWF1dGgiLCJzdWIiOiJhZG1pbkBxdWFudHVtc2hpZWxkLmlvIiwiZXhwIjoxNzgzMTI2NDAwLCJyb2xlcyI6WyJTRUNVUklUWV9BTkFMWVNUIl19.
VulnerableSignatureDemoStringCheckOnlyNotRealCrypto`;

export const CryptoWorkbench: React.FC = () => {
  // State for Sandbox
  const [selectedAlg, setSelectedAlg] = useState<string>('ML-KEM-768');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [keys, setKeys] = useState<{ pub: string; priv: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'pub' | 'priv' | null>(null);

  // State for Calculator
  const [calcAlg, setCalcAlg] = useState<string>('RSA-2048');

  // State for JWT Auditor
  const [jwtInput, setJwtInput] = useState<string>(SAMPLE_JWT);
  const [jwtResult, setJwtResult] = useState<{
    header: Record<string, any>;
    payload: Record<string, any>;
    verdict: 'VULNERABLE' | 'SAFE';
    reason: string;
  } | null>(null);

  // Key Gen Trigger
  const handleGenerateKeys = async () => {
    setIsGenerating(true);
    setKeys(null);
    try {
      if (selectedAlg === 'RSA-2048') {
        const response = await api.post('/classical/rsa/keygen', { key_size: 2048 });
        setKeys({
          pub: response.data.pub_pem,
          priv: response.data.priv_pem
        });
      } else if (selectedAlg === 'ECDSA-P256') {
        const response = await api.post('/classical/ecc/keygen', { curve_bits: 256 });
        setKeys({
          pub: response.data.pub_pem,
          priv: response.data.priv_pem
        });
      } else if (selectedAlg === 'ML-KEM-768') {
        const response = await api.post('/pqc/kyber/keygen', { variant: 768 });
        setKeys({
          pub: `-----BEGIN KYBER PUBLIC KEY-----\n${response.data.pub_b64}\n-----END KYBER PUBLIC KEY-----`,
          priv: `-----BEGIN KYBER PRIVATE KEY-----\n${response.data.priv_b64}\n-----END KYBER PRIVATE KEY-----`
        });
      } else if (selectedAlg === 'ML-DSA-653') {
        const response = await api.post('/pqc/dilithium/keygen', { level: 3 });
        setKeys({
          pub: `-----BEGIN DILITHIUM PUBLIC KEY-----\n${response.data.pub_b64}\n-----END DILITHIUM PUBLIC KEY-----`,
          priv: `-----BEGIN DILITHIUM PRIVATE KEY-----\n${response.data.priv_b64}\n-----END DILITHIUM PRIVATE KEY-----`
        });
      } else if (selectedAlg.startsWith('AES-')) {
        const keySize = selectedAlg === 'AES-256' ? 32 : 16;
        const randomHex = Array.from({ length: keySize }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('').toUpperCase();
        setKeys({
          pub: 'Symmetric keys do not have public keys.',
          priv: randomHex
        });
      }
    } catch (error) {
      console.error("Failed to generate keys via backend, falling back to mock", error);
      const randomHex = (len: number) => {
        const chars = '0123456789ABCDEF';
        let res = '';
        for (let i = 0; i < len; i++) {
          res += chars[Math.floor(Math.random() * 16)];
          if (i > 0 && i % 40 === 0 && i < len - 1) res += '\n';
        }
        return res;
      };
      
      const byteSize = ALGORITHMS[selectedAlg].publicKeyBytes || ALGORITHMS[selectedAlg].privateKeyBytes;
      
      setKeys({
        pub: selectedAlg.startsWith('AES') 
          ? 'Symmetric keys do not have public keys.' 
          : `-----BEGIN PUBLIC KEY-----\n${randomHex(byteSize * 2)}\n-----END PUBLIC KEY-----`,
        priv: `-----BEGIN PRIVATE KEY-----\n${randomHex(byteSize * 3)}\n-----END PRIVATE KEY-----`
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, field: 'pub' | 'priv') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // JWT Auditor Trigger
  const handleAuditJwt = () => {
    try {
      const parts = jwtInput.trim().split('.');
      if (parts.length < 2) {
        alert('Invalid JWT format');
        return;
      }
      const headerDecoded = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payloadDecoded = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      const alg = headerDecoded.alg || 'unknown';
      const isVulnerable = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256', 'HS384'].includes(alg);

      setJwtResult({
        header: headerDecoded,
        payload: payloadDecoded,
        verdict: isVulnerable ? 'VULNERABLE' : 'SAFE',
        reason: isVulnerable 
          ? `Algorithm ${alg} relies on integer factorization or discrete logarithm, broken by Shor's algorithm.`
          : `Algorithm ${alg} is considered quantum-safe.`
      });
    } catch (err) {
      alert('Failed to parse JWT. Ensure it is base64 encoded.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00C4E8]/10 flex items-center justify-center text-[#00C4E8]">
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Cryptographic Sandbox Workbench</h1>
            <p className="text-sm text-[#94A3B8]">
              Analyze post-quantum compliance, generate key-pairs, and audit token parameters side-by-side.
            </p>
          </div>
        </div>
        <div className="text-xs text-[#00C4E8] bg-[#00C4E8]/10 border border-[#00C4E8]/20 px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00C4E8] animate-pulse"></span>
          Environment: Active & Sandboxed
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Key Generation & Size Sandbox */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="text-[#00C4E8]" size={18} />
              <h2 className="text-base font-bold text-white">PQC Key Sandbox</h2>
            </div>
            
            <div className="space-y-3">
              <label className="text-xs text-[#94A3B8] font-medium block">Select Cryptosystem</label>
              <div className="flex gap-2">
                <select 
                  value={selectedAlg} 
                  onChange={(e) => { setSelectedAlg(e.target.value); setKeys(null); }}
                  className="bg-[#080C14] border border-[#1E2D45] text-white text-sm rounded-lg p-2.5 flex-1 focus:border-[#00C4E8] focus:outline-none"
                >
                  {Object.keys(ALGORITHMS).map((key) => (
                    <option key={key} value={key}>{ALGORITHMS[key].name}</option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateKeys}
                  disabled={isGenerating}
                  className="bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] disabled:opacity-50 transition font-semibold text-sm rounded-lg px-4 py-2.5 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                  {isGenerating ? 'Generating...' : 'Generate Keys'}
                </button>
              </div>
            </div>

            {/* Size Comparison Chart */}
            <div className="bg-[#080C14] border border-[#1E2D45]/50 rounded-lg p-4 space-y-3">
              <span className="text-xs font-semibold text-[#94A3B8] block">Key Footprint (Public Key Bytes)</span>
              
              <div className="space-y-2.5">
                {/* Selected Algorithm Bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-[#E2E8F0] mb-1">
                    <span>{selectedAlg} (Selected)</span>
                    <span>{ALGORITHMS[selectedAlg].publicKeyBytes} bytes</span>
                  </div>
                  <div className="w-full bg-[#121B2E] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#00C4E8] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (ALGORITHMS[selectedAlg].publicKeyBytes / 1952) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* RSA-2048 Benchmark Bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-[#94A3B8] mb-1">
                    <span>RSA-2048 Benchmark</span>
                    <span>256 bytes</span>
                  </div>
                  <div className="w-full bg-[#121B2E] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#475569] h-full rounded-full"
                      style={{ width: `${(256 / 1952) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Keys Display */}
            {keys && (
              <div className="space-y-3">
                {selectedAlg.startsWith('AES') ? (
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[#94A3B8]">Symmetric Key</span>
                    <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 font-mono text-[11px] text-[#22C55E] break-all relative">
                      {keys.priv}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-[#94A3B8]">Public Key</span>
                        <button 
                          onClick={() => copyToClipboard(keys.pub, 'pub')}
                          className="text-[#00C4E8] hover:text-[#0096B4] flex items-center gap-1 text-[11px] font-medium"
                        >
                          {copiedField === 'pub' ? <Check size={12} /> : <Copy size={12} />}
                          {copiedField === 'pub' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 font-mono text-[10px] text-[#94A3B8] h-24 overflow-y-auto whitespace-pre-wrap break-all">
                        {keys.pub}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-[#94A3B8]">Private Key</span>
                        <button 
                          onClick={() => copyToClipboard(keys.priv, 'priv')}
                          className="text-[#00C4E8] hover:text-[#0096B4] flex items-center gap-1 text-[11px] font-medium"
                        >
                          {copiedField === 'priv' ? <Check size={12} /> : <Copy size={12} />}
                          {copiedField === 'priv' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 font-mono text-[10px] text-[#94A3B8] h-24 overflow-y-auto whitespace-pre-wrap break-all">
                        {keys.priv}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Quantum Security Bit-Strength Calculator */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Calculator className="text-[#00C4E8]" size={18} />
            <h2 className="text-base font-bold text-white">Quantum Strength Calculator</h2>
          </div>

          <div className="space-y-3">
            <label className="text-xs text-[#94A3B8] font-medium block">Select Target Cryptosystem</label>
            <select 
              value={calcAlg} 
              onChange={(e) => setCalcAlg(e.target.value)}
              className="bg-[#080C14] border border-[#1E2D45] text-white text-sm rounded-lg p-2.5 w-full focus:border-[#00C4E8] focus:outline-none"
            >
              {Object.keys(ALGORITHMS).map((key) => (
                <option key={key} value={key}>{ALGORITHMS[key].name}</option>
              ))}
            </select>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#080C14] border border-[#1E2D45]/50 rounded-lg p-4 text-center">
              <span className="text-xs text-[#94A3B8] font-medium block mb-1">Classical Strength</span>
              <span className="text-2xl font-bold text-white font-mono">{ALGORITHMS[calcAlg].classicalSecurity}</span>
              <span className="text-[10px] text-[#475569] block mt-1">Symmetric Equivalent Bits</span>
            </div>

            <div className="bg-[#080C14] border border-[#1E2D45]/50 rounded-lg p-4 text-center">
              <span className="text-xs text-[#94A3B8] font-medium block mb-1">Quantum Strength</span>
              <span className={`text-2xl font-bold font-mono ${ALGORITHMS[calcAlg].quantumSecurity === 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
                {ALGORITHMS[calcAlg].quantumSecurity}
              </span>
              <span className="text-[10px] text-[#475569] block mt-1">Shor's/Grover's Adjusted</span>
            </div>
          </div>

          {/* Status Verdict */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#94A3B8]">Security Verdict:</span>
              <span className={`text-xs px-2.5 py-1 rounded border font-semibold ${
                ALGORITHMS[calcAlg].verdict === 'QUANTUM-SAFE' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : ALGORITHMS[calcAlg].verdict === 'PARTIALLY-AFFECTED'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {ALGORITHMS[calcAlg].verdict}
              </span>
            </div>
            
            <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#1E2D45] pb-2 text-[11px] font-mono">
                <span className="text-[#94A3B8]">Mathematical Basis:</span>
                <span className="text-white">{ALGORITHMS[calcAlg].mathBasis}</span>
              </div>
              <div className="pt-1 text-[#94A3B8] leading-relaxed">
                <strong className="text-white">Threat Vector: </strong>
                {ALGORITHMS[calcAlg].quantumAttack}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: JWT Token Algorithm Auditor */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <FileCode className="text-[#00C4E8]" size={18} />
            <h2 className="text-base font-bold text-white">JSON Web Token (JWT) Cryptographic Auditor</h2>
          </div>

          <p className="text-xs text-[#94A3B8]">
            Paste a JWT below to parse its signature algorithm and evaluate its quantum security readiness.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <textarea
                value={jwtInput}
                onChange={(e) => setJwtInput(e.target.value)}
                className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 text-xs text-[#94A3B8] font-mono w-full h-32 focus:border-[#00C4E8] focus:outline-none focus:ring-1 focus:ring-[#00C4E8]"
                placeholder="Paste JWT here..."
              ></textarea>
              <button
                onClick={handleAuditJwt}
                className="bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] transition font-semibold text-xs rounded-lg px-4 py-2.5 w-full flex items-center justify-center gap-2"
              >
                <Binary size={14} />
                Audit Signature
              </button>
            </div>

            {/* Audit Output */}
            <div className="flex-1 bg-[#080C14] border border-[#1E2D45] rounded-lg p-4 space-y-3 min-h-[160px]">
              {jwtResult ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-[#1E2D45] pb-2">
                    <span className="font-bold text-white">Audited Algorithm:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      jwtResult.verdict === 'SAFE' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {jwtResult.header.alg || 'Unknown'} - {jwtResult.verdict}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#475569] block">TOKEN TYPE</span>
                        <span className="text-white font-mono">{jwtResult.header.typ || 'JWT'}</span>
                      </div>
                      <div>
                        <span className="text-[#475569] block">ISSUER</span>
                        <span className="text-white font-mono truncate block">{jwtResult.payload.iss || 'None'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1E2D45]/50">
                      <span className="text-[#475569] text-[10px] block">SECURITY ASSESSMENT</span>
                      <p className="text-[#94A3B8] leading-relaxed mt-1">{jwtResult.reason}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <FileCode size={28} className="text-[#475569] mb-2" />
                  <span className="text-[#475569] text-xs font-mono">Ready to Audit</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CryptoWorkbench;
