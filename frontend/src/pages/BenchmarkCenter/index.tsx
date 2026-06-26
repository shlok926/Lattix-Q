import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  LabelList,
  ReferenceLine
} from 'recharts';
import { 
  Shield, CheckCircle2, XCircle, AlertTriangle, ChevronUp, ChevronDown, Check, Clock 
} from 'lucide-react';
import AlgorithmBadge from '../../components/ui/AlgorithmBadge';
import NistBadge from '../../components/ui/NistBadge';
import { api } from '../../services/api';

const ALGO_COLORS: Record<string, string> = {
  'RSA-2048': '#EF4444',
  'ECC-256': '#F87171',
  'AES-256': '#F59E0B',
  'Kyber-768': '#00C4E8',
  'Dilithium3': '#22C55E',
  'FALCON-512': '#4ADE80',
  'SPHINCS+': '#86EFAC',
};

const DEFAULT_BENCHMARK_DATA = [
  { algo: 'RSA-2048',      keygen: 823.4, sign: 2.1,   verify: 0.08, keySize: 256,   sigSize: 256,  level: 1,  safe: false, type: 'Asymmetric' },
  { algo: 'ECC-256',       keygen: 12.3,  sign: 0.9,   verify: 0.7,  keySize: 64,    sigSize: 64,   level: 1,  safe: false, type: 'Asymmetric' },
  { algo: 'AES-256',       keygen: 0.02,  sign: 0,     verify: 0,    keySize: 32,    sigSize: 0,    level: 3,  safe: true,  type: 'Symmetric' },
  { algo: 'Kyber-768',     keygen: 0.08,  sign: 0,     verify: 0,    keySize: 1184,  sigSize: 0,    level: 3,  safe: true,  type: 'KEM' },
  { algo: 'Dilithium3',    keygen: 0.1,   sign: 0.08,  verify: 0.04, keySize: 1952,  sigSize: 3293, level: 3,  safe: true,  type: 'Signature' },
  { algo: 'FALCON-512',    keygen: 8.1,   sign: 0.5,   verify: 0.03, keySize: 897,   sigSize: 666,  level: 1,  safe: true,  type: 'Signature' },
  { algo: 'SPHINCS+',      keygen: 0.9,   sign: 15.2,  verify: 1.1,  keySize: 32,    sigSize: 8080, level: 1,  safe: true,  type: 'Signature' },
];

const mapBackendResults = (backendData: any[]) => {
  return backendData.map(item => {
    let algoName = item.algorithm;
    let type = 'Signature';
    
    if (algoName.includes('RSA')) {
      algoName = 'RSA-2048';
      type = 'Asymmetric';
    } else if (algoName.includes('ECC')) {
      algoName = 'ECC-256';
      type = 'Asymmetric';
    } else if (algoName.includes('AES')) {
      algoName = 'AES-256';
      type = 'Symmetric';
    } else if (algoName.includes('Kyber')) {
      algoName = 'Kyber-768';
      type = 'KEM';
    } else if (algoName.includes('Dilithium')) {
      algoName = 'Dilithium3';
      type = 'Signature';
    } else if (algoName.includes('Falcon')) {
      algoName = 'FALCON-512';
      type = 'Signature';
    } else if (algoName.includes('SPHINCS')) {
      algoName = 'SPHINCS+';
      type = 'Signature';
    }

    return {
      algo: algoName,
      keygen: item.keygen_ms,
      sign: item.sign_ms,
      verify: item.verify_ms,
      keySize: item.pk_size_bytes,
      sigSize: item.sig_size_bytes,
      level: item.nist_security_level || (algoName.includes('RSA') || algoName.includes('ECC') ? 1 : 3),
      safe: item.quantum_safe,
      type: type
    };
  });
};

export const BenchmarkCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'time' | 'size' | 'security' | 'table'>('time');
  const [isRunning, setIsRunning] = useState(false);
  const [dataList, setDataList] = useState<any[]>(DEFAULT_BENCHMARK_DATA);

  // Radar selection limit state (Section 3B)
  const [selectedRadarAlgos, setSelectedRadarAlgos] = useState<string[]>([
    'RSA-2048',
    'Kyber-768',
    'Dilithium3',
    'FALCON-512'
  ]);

  // Sort States for Comparison Table (Section 4C)
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const loadLatestResults = async () => {
    try {
      const response = await api.get('/benchmark/results');
      if (response.data) {
        const mapped = mapBackendResults(response.data);
        setDataList(mapped);
      }
    } catch (e) {
      console.warn("Could not fetch latest benchmark results, using default values.");
    }
  };

  useEffect(() => {
    loadLatestResults();
  }, []);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    triggerToast("Benchmark suite started on backend server...");
    try {
      await api.post('/benchmark/run', {});
      
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const response = await api.get('/benchmark/results');
          if (response.data) {
            const mapped = mapBackendResults(response.data);
            setDataList(mapped);
            clearInterval(interval);
            setIsRunning(false);
            triggerToast("Benchmark suite run complete. All charts updated!");
          }
        } catch (e) {
          if (attempts >= 15) {
            clearInterval(interval);
            setIsRunning(false);
            triggerToast("Benchmark run timed out.");
          }
        }
      }, 2000);
    } catch (err) {
      setIsRunning(false);
      triggerToast("Failed to trigger benchmark.");
    }
  };

  // --- TIME METRICS CALCULATIONS ---
  const timeChartData = dataList
    .filter(d => d.algo !== 'AES-256')
    .map(d => ({
      algo: d.algo,
      keygen: d.keygen || null,
      sign: d.sign || null,
      verify: d.verify || null,
    }));

  const rsaKeyGen = dataList.find(d => d.algo === 'RSA-2048')?.keygen || 823.4;
  const kyberKeyGen = dataList.find(d => d.algo === 'Kyber-768')?.keygen || 0.08;
  const timeMultiplier = Math.round(rsaKeyGen / kyberKeyGen);
  const timeNoteText = `RSA-2048 key generation (${rsaKeyGen}ms) is over ${timeMultiplier.toLocaleString()}× slower than Kyber-768 (${kyberKeyGen}ms) — the fastest post-quantum alternative in this comparison.`;

  const formatTimeLabel = (value: any) => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (num < 1) return `${num.toFixed(2)}ms`;
    return `${num.toFixed(1)}ms`;
  };

  // --- SIZE METRICS CALCULATIONS ---
  const sizeChartData = dataList.map(d => ({
    algo: d.algo,
    keySize: d.keySize || null,
    sigSize: d.sigSize || null,
  }));

  const falconSig = dataList.find(d => d.algo === 'FALCON-512')?.sigSize || 666;
  const dilithiumSig = dataList.find(d => d.algo === 'Dilithium3')?.sigSize || 3293;
  const eccSig = dataList.find(d => d.algo === 'ECC-256')?.sigSize || 64;
  const sizeNoteText = `FALCON-512 produces the most compact post-quantum signature at ${falconSig.toLocaleString()} bytes — smaller than Dilithium3's ${dilithiumSig.toLocaleString()} bytes but still larger than ECC-256's ${eccSig} bytes.`;

  const formatSizeLabel = (value: any) => {
    if (value === null || value === undefined || value === 0) return '';
    return `${Number(value).toLocaleString()}B`;
  };

  // --- RADAR CHART NORMALIZATION (Section 3A) ---
  const maxKeyGen = Math.max(...dataList.map(d => d.keygen));
  const maxSign = Math.max(...dataList.map(d => d.sign || 0));
  const maxVerify = Math.max(...dataList.map(d => d.verify || 0));
  const maxKeySize = Math.max(...dataList.map(d => d.keySize));
  const maxSigSize = Math.max(...dataList.map(d => d.sigSize || 0));

  const normalizeSpeed = (val: number, max: number) => {
    if (!val) return 0;
    return Math.max(5, Math.round(100 - (val / max) * 100));
  };

  const normalizeSize = (val: number, max: number) => {
    if (!val) return 0;
    return Math.max(5, Math.round(100 - (val / max) * 100));
  };

  const normalizeSecurity = (level: number) => {
    return Math.round((level / 5) * 100);
  };

  const subjects = [
    { key: 'keygen', label: 'KeyGen Speed' },
    { key: 'sign', label: 'Sign Speed' },
    { key: 'verify', label: 'Verify Speed' },
    { key: 'keySize', label: 'Key Efficiency' },
    { key: 'sigSize', label: 'Sig Efficiency' },
    { key: 'level', label: 'Security Level' }
  ];

  const dynamicRadarData = subjects.map(subj => {
    const item: Record<string, any> = { subject: subj.label };
    dataList.forEach(algoData => {
      let val = 0;
      if (subj.key === 'keygen') val = normalizeSpeed(algoData.keygen, maxKeyGen);
      else if (subj.key === 'sign') val = normalizeSpeed(algoData.sign || 0, maxSign);
      else if (subj.key === 'verify') val = normalizeSpeed(algoData.verify || 0, maxVerify);
      else if (subj.key === 'keySize') val = normalizeSize(algoData.keySize, maxKeySize);
      else if (subj.key === 'sigSize') val = normalizeSize(algoData.sigSize || 0, maxSigSize);
      else if (subj.key === 'level') val = normalizeSecurity(algoData.level);
      
      item[algoData.algo] = val;
    });
    return item;
  });

  // --- COMPARISON TABLE SORTING (Section 4A) ---
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTableData = () => {
    const data = [...dataList];
    if (sortField) {
      data.sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (valA === null || valA === undefined) valA = sortDirection === 'asc' ? Infinity : -Infinity;
        if (valB === null || valB === undefined) valB = sortDirection === 'asc' ? Infinity : -Infinity;
        
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default Sort: quantum-vulnerable first, then safe ordered by NIST level descending
      data.sort((a, b) => {
        if (!a.safe && b.safe) return -1;
        if (a.safe && !b.safe) return 1;
        if (!a.safe && !b.safe) return a.algo.localeCompare(b.algo);
        if (a.level !== b.level) return b.level - a.level;
        return a.algo.localeCompare(b.algo);
      });
    }
    return data;
  };

  const renderTableHeader = (label: string, field: string | null, alignRight = false) => {
    if (!field) {
      return <th className={`p-3 text-[10px] tracking-wider uppercase font-bold text-[#475569] select-none ${alignRight ? 'text-right' : 'text-left'}`}>{label}</th>;
    }
    const isSorted = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)}
        className={`p-3 cursor-pointer hover:text-white select-none transition-colors text-[10px] tracking-wider uppercase font-bold text-[#475569] ${alignRight ? 'text-right' : 'text-left'}`}
      >
        <div className={`flex items-center gap-1 ${alignRight ? 'justify-end' : 'justify-start'}`}>
          <span>{label}</span>
          {isSorted ? (
            sortDirection === 'asc' ? <ChevronUp size={11} className="text-[#00C4E8] shrink-0" /> : <ChevronDown size={11} className="text-[#00C4E8] shrink-0" />
          ) : (
            <ChevronDown size={11} className="opacity-20 shrink-0" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6 text-[#E2E8F0] select-none pb-12 relative">
      {/* Toast notifications */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D1421]/95 backdrop-blur-md border border-white/[0.08] text-[#E2E8F0] px-4 py-3 rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex items-center gap-3 max-w-sm hover:scale-[1.02] transition-transform">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C4E8] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00C4E8]"></span>
          </div>
          <Check size={14} className="text-[#00C4E8]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#E2E8F0] tracking-wide">Benchmark Center</h1>
          <p className="text-[13px] text-[#94A3B8] mt-0.5">Analyze performance differences between classical and post-quantum cryptosystems</p>
        </div>
        <button 
          onClick={handleRunBenchmark}
          disabled={isRunning}
          className="bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-semibold text-[13px] px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isRunning ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
              Running Suite...
            </>
          ) : (
            'Run Benchmark'
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#1E2D45] pb-px">
        {[
          { id: 'time', label: 'Time Metrics' },
          { id: 'size', label: 'Size Metrics' },
          { id: 'security', label: 'Security Levels' },
          { id: 'table', label: 'Comparison Table' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 border-b-2 ${
              activeTab === tab.id 
                ? 'border-[#00C4E8] text-[#00C4E8]' 
                : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents Card */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Consistent Loading Overlay (Section 5B) */}
        {isRunning && (
          <div className="absolute inset-0 bg-[#0D1421]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
              <span className="w-12 h-12 border-4 border-[#00C4E8] border-t-transparent rounded-full animate-spin" />
              <Shield size={20} className="absolute text-[#00C4E8] animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-semibold text-white font-mono">Running cryptographic benchmark suite...</span>
              <span className="text-xs text-[#94A3B8] font-mono animate-pulse">Measuring execution latency & memory over 10,000 iterations</span>
            </div>
          </div>
        )}

        {/* TAB 1: Time Metrics */}
        {activeTab === 'time' && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="text-[15px] font-semibold text-white">Execution Latency (ms)</h3>
                <p className="text-[11px] text-amber-500 font-mono">
                  {timeNoteText}
                </p>
              </div>
              
              {/* Standalone AES-256 Symmetric Card (Section 1D) */}
              <div className="bg-[#080C14] border border-[#1E2D45]/80 rounded-lg p-2.5 max-w-[220px] shrink-0 text-right">
                <div className="text-[9px] font-bold text-[#475569] uppercase tracking-wider">AES-256 (Symmetric)</div>
                <div className="text-lg font-bold font-mono text-[#22C55E] mt-0.5">0.02ms</div>
                <div className="text-[8.5px] text-[#94A3B8] leading-tight mt-1 text-slate-400">
                  Encryption speed only — not directly comparable to asymmetric handshake times.
                </div>
              </div>
            </div>

            {/* Custom Horizontal Legend Placement (Section 1F) */}
            <div className="flex gap-6 text-[10px] text-[#94A3B8] select-none py-1.5 border-b border-[#1E2D45]/30">
              <div className="flex items-center gap-1.5 cursor-help" title="Time taken to generate a new public/private key pair">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00C4E8]" />
                <span className="font-semibold text-slate-300">KeyGen</span>
                <span className="text-[9.5px] text-[#475569]">— generate key pair</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-help" title="Time taken to generate a digital signature (not applicable to KEMs)">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#A855F7]" />
                <span className="font-semibold text-slate-300">Sign</span>
                <span className="text-[9.5px] text-[#475569]">— generate signature</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-help" title="Time taken to verify a digital signature (not applicable to KEMs)">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" />
                <span className="font-semibold text-slate-300">Verify</span>
                <span className="text-[9.5px] text-[#475569]">— verify signature</span>
              </div>
            </div>

            {/* Classical vs Post-Quantum X-Axis Cluster Headers (Section 1C) */}
            <div className="flex justify-between items-center px-12 pt-2 select-none">
              <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-widest bg-[#EF4444]/5 px-2 py-0.5 rounded border border-[#EF4444]/20">← CLASSICAL (VULNERABLE)</span>
              <span className="text-[10px] font-bold text-[#22C55E] uppercase tracking-widest bg-[#22C55E]/5 px-2 py-0.5 rounded border border-[#22C55E]/20">POST-QUANTUM (QUANTUM-SAFE) →</span>
            </div>

            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeChartData} margin={{ top: 25, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D45" />
                  <XAxis dataKey="algo" stroke="#475569" fontSize={11} tickLine={false} />
                  
                  {/* Logarithmic scale axis (Section 1A) */}
                  <YAxis 
                    scale="log" 
                    domain={[0.01, 1000]} 
                    allowDataOverflow
                    ticks={[0.01, 0.1, 1, 10, 100, 1000]}
                    tickFormatter={(v) => `${v}ms`}
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                  />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D1421', borderColor: '#1E2D45' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />

                  {/* Vertical separator line between ECC and Kyber (Section 1C) */}
                  <ReferenceLine x="Kyber-768" stroke="#1E2D45" strokeWidth={2} strokeDasharray="3 3" />

                  {/* Grouped Bars with data labels (Section 1B & 1F) */}
                  <Bar dataKey="keygen" name="KeyGen" fill="#00C4E8" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="keygen" position="top" formatter={formatTimeLabel} style={{ fill: '#00C4E8', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} />
                  </Bar>
                  <Bar dataKey="sign" name="Sign" fill="#A855F7" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="sign" position="top" formatter={formatTimeLabel} style={{ fill: '#A855F7', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} />
                  </Bar>
                  <Bar dataKey="verify" name="Verify" fill="#22C55E" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="verify" position="top" formatter={formatTimeLabel} style={{ fill: '#22C55E', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: Size Metrics */}
        {activeTab === 'size' && (
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Public Key and Signature Sizes (Bytes)</h3>
              <p className="text-[11px] text-amber-500 font-mono mt-0.5">
                {sizeNoteText}
              </p>
            </div>

            {/* Custom Legend */}
            <div className="flex gap-6 text-[10px] text-[#94A3B8] select-none py-1.5 border-b border-[#1E2D45]/30">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00C4E8]" />
                <span className="font-semibold text-slate-300">Public Key size</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#A855F7]" />
                <span className="font-semibold text-slate-300">Signature size</span>
              </div>
            </div>

            <div className="h-[280px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={sizeChartData} 
                  margin={{ top: 10, right: 40, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1E2D45" />
                  
                  {/* Logarithmic X-Axis (Section 2A) */}
                  <XAxis 
                    type="number" 
                    scale="log" 
                    domain={[10, 10000]}
                    ticks={[10, 100, 1000, 10000]} 
                    tickFormatter={(v) => `${v}B`}
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                  />
                  <YAxis dataKey="algo" type="category" stroke="#475569" fontSize={11} tickLine={false} />
                  
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D1421', borderColor: '#1E2D45' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />

                  {/* Horizontal clustering divider (Section 2C) */}
                  <ReferenceLine y="Kyber-768" stroke="#1E2D45" strokeWidth={2} strokeDasharray="3 3" />

                  {/* Bar data labels showing exact byte count formatted with thousands separator (Section 2B) */}
                  <Bar dataKey="keySize" name="Key Size (Bytes)" fill="#00C4E8" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="keySize" position="right" formatter={formatSizeLabel} style={{ fill: '#00C4E8', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} />
                  </Bar>
                  <Bar dataKey="sigSize" name="Signature Size (Bytes)" fill="#A855F7" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="sigSize" position="right" formatter={formatSizeLabel} style={{ fill: '#A855F7', fontSize: 9, fontFamily: 'monospace', fontWeight: 'bold' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 3: Security Levels (Radar Chart) */}
        {activeTab === 'security' && (
          <div className="space-y-4 flex flex-col items-center flex-1 justify-between">
            <div className="w-full">
              <h3 className="text-[15px] font-semibold text-white">Multidimensional Cryptographic Evaluation</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">Comparison of security capabilities, key efficiency, and execution speeds (normalized axes: 0-100 where larger polygon = better overall).</p>
            </div>

            {/* Algorithm Selector with 4-limit warning (Section 3B) */}
            <div className="w-full space-y-2">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">Compare Algorithms (Select up to 4)</span>
              <div className="flex flex-wrap gap-2 bg-[#080C14] border border-[#1E2D45] rounded-lg p-2">
                {dataList.map((d: any) => {
                  const isChecked = selectedRadarAlgos.includes(d.algo);
                  return (
                    <button
                      key={d.algo}
                      onClick={() => {
                        if (isChecked) {
                          if (selectedRadarAlgos.length > 1) {
                            setSelectedRadarAlgos(selectedRadarAlgos.filter(a => a !== d.algo));
                          }
                        } else {
                          if (selectedRadarAlgos.length >= 4) {
                            triggerToast("Comparing more than 4 algorithms reduces chart readability — select up to 4.");
                          } else {
                            setSelectedRadarAlgos([...selectedRadarAlgos, d.algo]);
                          }
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs font-semibold font-mono flex items-center gap-1.5 transition-all border ${
                        isChecked 
                          ? 'bg-[#1A2540] border-[#00C4E8] text-[#00C4E8]' 
                          : 'bg-transparent border-[#1E2D45] text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ALGO_COLORS[d.algo] }} />
                      {d.algo}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-[260px] w-full flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dynamicRadarData}>
                  <PolarGrid stroke="#1E2D45" />
                  <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />

                  {/* Render only selected algorithms (Section 3C) */}
                  {selectedRadarAlgos.map(algo => (
                    <Radar 
                      key={algo}
                      name={algo} 
                      dataKey={algo} 
                      stroke={ALGO_COLORS[algo]} 
                      fill={ALGO_COLORS[algo]} 
                      fillOpacity={0.05} 
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Structured Legend below the chart (Section 3C) */}
            <div className="flex gap-4 justify-center flex-wrap pt-2 border-t border-[#1E2D45]/40 w-full select-none">
              {selectedRadarAlgos.map(algo => (
                <div key={algo} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: ALGO_COLORS[algo] }} />
                  <span className="font-semibold text-slate-300">{algo}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Comparison Table */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto w-full flex-1 flex flex-col justify-between">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-[#1E2D45] text-[#475569] uppercase font-bold text-[10px] tracking-wider bg-[#080C14]">
                  {renderTableHeader('Algorithm', null)}
                  {renderTableHeader('Type', null)}
                  {renderTableHeader('KeyGen', 'keygen', true)}
                  {renderTableHeader('Sign', 'sign', true)}
                  {renderTableHeader('Verify', 'verify', true)}
                  {renderTableHeader('Key Size', 'keySize', true)}
                  {renderTableHeader('Sig Size', 'sigSize', true)}
                  {renderTableHeader('NIST Level', 'level')}
                  {renderTableHeader('Quantum-Safe', 'safe')}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D45]/20">
                {getSortedTableData().map((row, index) => {
                  // Colored left border tag based on algorithm safety (Section 4B)
                  let borderClass = 'border-l-4 border-l-[#22C55E]'; // default green
                  if (!row.safe) {
                    borderClass = 'border-l-4 border-l-[#EF4444]'; // red
                  } else if (row.algo === 'AES-256') {
                    borderClass = 'border-l-4 border-l-[#F59E0B]'; // amber
                  }
                  
                  return (
                    <tr key={index} className={`hover:bg-[#1A2540]/50 transition-colors ${borderClass}`}>
                      {/* Consistent Algorithm color swatch dot next to name (Section 5A) */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ALGO_COLORS[row.algo] }} />
                          <span className="font-semibold text-white font-mono">{row.algo}</span>
                        </div>
                      </td>
                      <td className="p-3 text-[#94A3B8] font-medium">{row.type}</td>
                      <td className="p-3 text-right font-mono text-slate-300">{row.keygen.toFixed(2)}ms</td>
                      <td className="p-3 text-right font-mono text-slate-300">
                        {row.sign !== null && row.sign !== 0 ? `${row.sign.toFixed(2)}ms` : 'N/A'}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">
                        {row.verify !== null && row.verify !== 0 ? `${row.verify.toFixed(2)}ms` : 'N/A'}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300">{row.keySize.toLocaleString()} B</td>
                      <td className="p-3 text-right font-mono text-slate-300">
                        {row.sigSize !== null && row.sigSize !== 0 ? `${row.sigSize.toLocaleString()} B` : 'N/A'}
                      </td>
                      <td className="p-3">
                        <NistBadge level={row.level as any} isClassical={!row.safe && row.level === 1} />
                      </td>
                      
                      {/* Dedicated Q-Safe status column with explicit icons & labels (Section 4D) */}
                      <td className="p-3">
                        {row.algo === 'AES-256' ? (
                          <div className="flex items-center gap-1.5 text-[#F59E0B] font-semibold text-[11px]">
                            <AlertTriangle size={13} className="text-[#F59E0B] shrink-0" />
                            <span>Partial (Grover)</span>
                          </div>
                        ) : row.safe ? (
                          <div className="flex items-center gap-1.5 text-[#22C55E] font-semibold text-[11px]">
                            <CheckCircle2 size={13} className="text-[#22C55E] shrink-0" />
                            <span>Safe</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[#EF4444] font-semibold text-[11px]">
                            <XCircle size={13} className="text-[#EF4444] shrink-0" />
                            <span>Vulnerable</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkCenter;
