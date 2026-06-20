import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import AlgorithmBadge from '../../components/ui/AlgorithmBadge';
import NistBadge from '../../components/ui/NistBadge';

const benchmarkData = [
  { algo: 'RSA-2048',      keygen: 823.4, sign: 2.1,   verify: 0.08, keySize: 256,   sigSize: 256,  level: 1,  safe: false, type: 'Asymmetric' },
  { algo: 'ECC-256',       keygen: 12.3,  sign: 0.9,   verify: 0.7,  keySize: 64,    sigSize: 64,   level: 1,  safe: false, type: 'Asymmetric' },
  { algo: 'AES-256',       keygen: 0.02,  sign: 0,     verify: 0,    keySize: 32,    sigSize: 0,    level: 3,  safe: true,  type: 'Symmetric' },
  { algo: 'Kyber-768',     keygen: 0.08,  sign: 0,     verify: 0,    keySize: 1184,  sigSize: 0,    level: 3,  safe: true,  type: 'KEM' },
  { algo: 'Dilithium3',    keygen: 0.1,   sign: 0.08,  verify: 0.04, keySize: 1952,  sigSize: 3293, level: 3,  safe: true,  type: 'Signature' },
  { algo: 'FALCON-512',    keygen: 8.1,   sign: 0.5,   verify: 0.03, keySize: 897,   sigSize: 666,  level: 1,  safe: true,  type: 'Signature' },
  { algo: 'SPHINCS+',      keygen: 0.9,   sign: 15.2,  verify: 1.1,  keySize: 32,    sigSize: 8080, level: 1,  safe: true,  type: 'Signature' },
];

const radarData = [
  { subject: 'Speed', 'Dilithium3': 85, 'FALCON-512': 90, 'RSA-2048': 20, 'Kyber-768': 95 },
  { subject: 'Security', 'Dilithium3': 90, 'FALCON-512': 70, 'RSA-2048': 10, 'Kyber-768': 90 },
  { subject: 'Key Efficiency', 'Dilithium3': 50, 'FALCON-512': 65, 'RSA-2048': 85, 'Kyber-768': 60 },
  { subject: 'Sig Efficiency', 'Dilithium3': 40, 'FALCON-512': 75, 'RSA-2048': 85, 'Kyber-768': 95 },
  { subject: 'Quantum Resistance', 'Dilithium3': 100, 'FALCON-512': 100, 'RSA-2048': 0, 'Kyber-768': 100 },
];

export const BenchmarkCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'time' | 'size' | 'security' | 'table'>('time');
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBenchmark = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 text-[#E2E8F0] select-none pb-12">
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

      {/* Tab Contents */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 min-h-[380px] flex flex-col justify-center relative overflow-hidden">
        {isRunning && (
          <div className="absolute inset-0 bg-[#0D1421]/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-4 border-[#00C4E8] border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] text-[#94A3B8] font-mono">Simulating test vectors...</span>
          </div>
        )}

        {/* TAB 1: Time Metrics */}
        {activeTab === 'time' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Execution Latency (ms)</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">Note: RSA-2048 key generation time (823.4ms) dramatically exceeds PQC standards.</p>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarkData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2D45" />
                  <XAxis dataKey="algo" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D1421', borderColor: '#1E2D45' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="keygen" name="KeyGen (ms)" fill="#00C4E8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sign" name="Sign (ms)" fill="#A855F7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="verify" name="Verify (ms)" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 2: Size Metrics */}
        {activeTab === 'size' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Public Key and Signature Sizes (Bytes)</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">PQC algorithms require larger public keys and signatures compared to legacy systems.</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={benchmarkData.filter(d => d.keySize > 32 || d.sigSize)} 
                  margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1E2D45" />
                  <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis dataKey="algo" type="category" stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0D1421', borderColor: '#1E2D45' }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold', fontSize: '12px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="keySize" name="Key Size (Bytes)" fill="#00C4E8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="sigSize" name="Signature Size (Bytes)" fill="#A855F7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 3: Security Levels */}
        {activeTab === 'security' && (
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-full">
              <h3 className="text-[15px] font-semibold text-white">Multidimensional Cryptographic Evaluation</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">Comparison of security capabilities, key efficiency, and execution speeds.</p>
            </div>
            <div className="h-[320px] w-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#1E2D45" />
                  <PolarAngleAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar name="Dilithium3" dataKey="Dilithium3" stroke="#A855F7" fill="#A855F7" fillOpacity={0.1} />
                  <Radar name="FALCON-512" dataKey="FALCON-512" stroke="#22C55E" fill="#22C55E" fillOpacity={0.1} />
                  <Radar name="RSA-2048" dataKey="RSA-2048" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} />
                  <Radar name="Kyber-768" dataKey="Kyber-768" stroke="#00C4E8" fill="#00C4E8" fillOpacity={0.1} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 4: Comparison Table */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="border-b border-[#1E2D45] text-[#475569] uppercase font-bold text-[10px] tracking-wider bg-[#080C14]">
                  <th className="p-3">Algorithm</th>
                  <th className="p-3">Type</th>
                  <th className="p-3 text-right">KeyGen (ms)</th>
                  <th className="p-3 text-right">Sign (ms)</th>
                  <th className="p-3 text-right">Verify (ms)</th>
                  <th className="p-3 text-right">Key Size (B)</th>
                  <th className="p-3 text-right">Sig Size (B)</th>
                  <th className="p-3">NIST Level</th>
                  <th className="p-3">Q-Safe Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D45]/30">
                {benchmarkData.map((row, index) => {
                  const borderClass = !row.safe ? 'border-l-2 border-l-[#EF4444]' : '';
                  return (
                    <tr key={index} className={`hover:bg-[#1A2540] transition-colors ${borderClass}`}>
                      <td className="p-3 font-semibold text-white">{row.algo}</td>
                      <td className="p-3 text-[#94A3B8]">{row.type}</td>
                      <td className="p-3 text-right font-mono">{row.keygen}</td>
                      <td className="p-3 text-right font-mono">{row.sign !== null ? row.sign : 'N/A'}</td>
                      <td className="p-3 text-right font-mono">{row.verify !== null ? row.verify : 'N/A'}</td>
                      <td className="p-3 text-right font-mono">{row.keySize}</td>
                      <td className="p-3 text-right font-mono">{row.sigSize !== null ? row.sigSize : 'N/A'}</td>
                      <td className="p-3">
                        <NistBadge level={row.level as any} isClassical={!row.safe && row.level === 1} />
                      </td>
                      <td className="p-3">
                        <AlgorithmBadge status={row.safe ? 'QUANTUM-SAFE' : 'QUANTUM-VULNERABLE'} />
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
