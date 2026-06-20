import React, { useState } from 'react';
import { 
  ShieldOff, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Clock, 
  Info, 
  Play, 
  AlertTriangle 
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import AlgorithmBadge from '../../components/ui/AlgorithmBadge';
import NistBadge from '../../components/ui/NistBadge';
import StatusDot from '../../components/ui/StatusDot';

export const Dashboard: React.FC = () => {
  const [activeSimState, setActiveSimState] = useState<'RUNNING' | 'RESULT'>('RUNNING');

  // Overall Risk Score radial data
  const riskData = [
    { name: 'Risk', value: 74, fill: '#EF4444' }
  ];

  return (
    <div className="space-y-6 select-none pb-12 text-[#E2E8F0]">
      
      {/* ZONE 1: Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#E2E8F0] tracking-wide">Security Overview</h1>
          <p className="text-[13px] text-[#94A3B8] mt-0.5">Last updated: 2 minutes ago — All services operational</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-semibold text-[13px] px-4 py-2 rounded-md transition-colors">
            Run Assessment
          </button>
          <button className="border border-[#1E2D45] text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1A2540] text-[13px] px-4 py-2 rounded-md transition-all">
            Export Report
          </button>
        </div>
      </div>

      {/* ZONE 2: Top Row — Risk Gauge + Threat Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Left card (35% width) — Overall Risk Score */}
        <div className="lg:col-span-3 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col items-center justify-between min-h-[300px]">
          <div className="w-full text-left">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">OVERALL RISK SCORE</span>
          </div>

          <div className="relative w-full h-[140px] flex items-center justify-center">
            {/* Radial Bar Chart Arc */}
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="80%" 
                outerRadius="100%" 
                barSize={10} 
                data={riskData}
                startAngle={225}
                endAngle={-45}
              >
                <RadialBar
                  background={{ fill: 'rgba(255,255,255,0.03)' }}
                  dataKey="value"
                  cornerRadius={5}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[64px] font-extrabold text-[#EF4444] leading-none font-mono">74</span>
              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-0.5 mt-2">
                HIGH RISK
              </span>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-[13px] text-[#94A3B8]">3 of 5 algorithms are quantum-vulnerable</p>
          </div>
        </div>

        {/* Right card (65% width) — Quantum Threat Timeline */}
        <div className="lg:col-span-7 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest block">QUANTUM THREAT TIMELINE</span>
            <span className="text-[13px] text-[#94A3B8] mt-0.5 block">Estimated years until current cryptographic systems become breakable</span>
          </div>

          {/* Custom Horizontal SVG Timeline */}
          <div className="w-full h-[150px] mt-4 relative bg-black/10 border border-white/[0.02] rounded-lg p-2 overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 600 130" preserveAspectRatio="none">
              {/* Timeline Axis Line */}
              <line x1="40" y1="90" x2="560" y2="90" stroke="#1E2D45" strokeWidth="2" />

              {/* Red Threat Zone Overlay */}
              <rect x="200" y="30" width="360" height="60" fill="url(#threat-stripes)" opacity="0.1" />

              {/* YOU ARE HERE Marker at 2026 */}
              <line x1="200" y1="20" x2="200" y2="105" stroke="#00C4E8" strokeWidth="2" strokeDasharray="3,3" />
              <circle cx="200" cy="90" r="5" fill="#00C4E8" />
              <text x="200" y="15" textAnchor="middle" fill="#00C4E8" className="text-[9px] font-black tracking-widest font-mono">YOU ARE HERE</text>

              {/* Year Labels */}
              {[
                { year: '2024', x: 70 },
                { year: '2026', x: 200 },
                { year: '2028', x: 290 },
                { year: '2030', x: 370 },
                { year: '2032', x: 440 },
                { year: '2034', x: 500 },
                { year: '2036', x: 550 }
              ].map((label, idx) => (
                <text key={idx} x={label.x} y="112" textAnchor="middle" fill="#94A3B8" className="text-[10px] font-mono">{label.year}</text>
              ))}

              {/* Event Markers & Connections */}
              {/* Event 1: 2028 ECC-256 */}
              <path d="M 290 90 L 290 60" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
              <polygon points="290,85 286,92 294,92" fill="#F59E0B" />
              <text x="290" y="52" textAnchor="middle" fill="#F59E0B" className="text-[9px] font-bold">ECC-256 at risk</text>

              {/* Event 2: 2030 RSA-2048 */}
              <path d="M 370 90 L 370 35" stroke="#EF4444" strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="370" cy="90" r="4" fill="#EF4444" />
              <text x="370" y="27" textAnchor="middle" fill="#EF4444" className="text-[9px] font-bold">RSA-2048 broken</text>

              {/* Event 3: 2032 RSA-4096 */}
              <path d="M 440 90 L 440 60" stroke="#EF4444" strokeWidth="1" strokeDasharray="2,2" />
              <circle cx="440" cy="90" r="4" fill="#EF4444" />
              <text x="440" y="52" textAnchor="middle" fill="#EF4444" className="text-[9px] font-bold">RSA-4096 broken</text>

              {/* Event 4: 2035 AES-128 */}
              <path d="M 525 90 L 525 35" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2,2" />
              <polygon points="525,85 521,92 529,92" fill="#F59E0B" />
              <text x="525" y="27" textAnchor="middle" fill="#F59E0B" className="text-[9px] font-bold">AES-128 weakened</text>

              {/* Zones Labels */}
              <text x="100" y="75" textAnchor="middle" fill="#22C55E" className="text-[9px] font-black tracking-wider uppercase font-mono">QUANTUM SAFE ZONE</text>
              <text x="390" y="75" textAnchor="middle" fill="#EF4444" className="text-[9px] font-black tracking-wider uppercase font-mono" opacity="0.8">QUANTUM THREAT ZONE</text>

              <defs>
                <pattern id="threat-stripes" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="10" stroke="#EF4444" strokeWidth="2" />
                </pattern>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* ZONE 3: KPI Strip (4 cards in a row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-4 relative overflow-hidden flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] text-[#94A3B8] font-medium">Vulnerable Algorithms</span>
            <ShieldOff className="text-[#EF4444]" size={20} />
          </div>
          <div>
            <div className="text-3.5xl font-bold tracking-tight text-[#EF4444] font-mono">3</div>
            <div className="text-[12px] font-medium mt-0.5 text-[#EF4444]">↑ 1 since last scan</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-4 relative overflow-hidden flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] text-[#94A3B8] font-medium">Quantum-Safe Algorithms</span>
            <ShieldCheck className="text-[#22C55E]" size={20} />
          </div>
          <div>
            <div className="text-3.5xl font-bold tracking-tight text-[#22C55E] font-mono">2</div>
            <div className="text-[12px] font-medium mt-0.5 text-[#22C55E]">↑ 2 from last month</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-4 relative overflow-hidden flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] text-[#94A3B8] font-medium">Simulations Run Today</span>
            <Zap className="text-[#00C4E8]" size={20} />
          </div>
          <div>
            <div className="text-3.5xl font-bold tracking-tight text-[#00C4E8] font-mono">47</div>
            <div className="text-[12px] font-medium mt-0.5 text-[#22C55E]">↑ 12% vs yesterday</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-4 relative overflow-hidden flex flex-col justify-between h-[115px]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] text-[#94A3B8] font-medium">Since Last Benchmark</span>
            <BarChart3 className="text-[#94A3B8]" size={20} />
          </div>
          <div>
            <div className="text-3.5xl font-bold tracking-tight text-[#E2E8F0] font-mono">14m</div>
            <div className="text-[12px] font-medium mt-0.5 text-[#94A3B8]">All 7 algorithms tested</div>
          </div>
        </div>

      </div>

      {/* ZONE 4: Algorithm Status + Active Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Column (65% width) — Algorithm Status Table */}
        <div className="lg:col-span-6 bg-[#0D1421] border border-[#1E2D45] rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#1E2D45] flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-[#E2E8F0]">Algorithm Status</h3>
            <span className="text-[13px] text-[#94A3B8] font-mono">5 algorithms monitored</span>
          </div>

          <div className="flex-1 flex flex-col">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[#080C14] text-[11px] font-bold text-[#475569] uppercase tracking-wider">
              <div className="col-span-3">Algorithm</div>
              <div className="col-span-3">Type</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2">NIST Level</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Rows */}
            <div className="flex-grow divide-y divide-[#1E2D45]/30">
              
              {/* Row 1: RSA-2048 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[#1A2540] transition-colors">
                <div className="col-span-3 flex flex-col">
                  <span className="text-[13px] font-semibold text-[#E2E8F0]">RSA-2048</span>
                  <span className="text-[10px] text-[#475569] font-mono uppercase mt-0.5">Asymmetric</span>
                </div>
                <div className="col-span-3 text-[12px] text-[#94A3B8]">Key Exchange / Signatures</div>
                <div className="col-span-3">
                  <AlgorithmBadge status="QUANTUM-VULNERABLE" />
                </div>
                <div className="col-span-2 flex items-center gap-1 group relative">
                  <NistBadge level={1} isClassical={true} />
                  <Info size={11} className="text-[#F59E0B] cursor-pointer" />
                  <div className="absolute bottom-6 left-0 hidden group-hover:block bg-[#121B2E] border border-[#1E2D45] text-[10px] text-white p-2 rounded shadow-xl whitespace-nowrap z-20">
                    Broken by Shor's Algorithm
                  </div>
                </div>
                <div className="col-span-1 text-right text-[12px] font-semibold text-[#00C4E8] hover:underline cursor-pointer">
                  Run Shor's →
                </div>
              </div>

              {/* Row 2: ECC-256 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[#1A2540] transition-colors">
                <div className="col-span-3 flex flex-col">
                  <span className="text-[13px] font-semibold text-[#E2E8F0]">ECC-256</span>
                  <span className="text-[10px] text-[#475569] font-mono uppercase mt-0.5">Asymmetric</span>
                </div>
                <div className="col-span-3 text-[12px] text-[#94A3B8]">Key Exchange / Signatures</div>
                <div className="col-span-3">
                  <AlgorithmBadge status="QUANTUM-VULNERABLE" />
                </div>
                <div className="col-span-2">
                  <NistBadge level={1} isClassical={true} />
                </div>
                <div className="col-span-1 text-right text-[12px] font-semibold text-[#00C4E8] hover:underline cursor-pointer">
                  Run Shor's →
                </div>
              </div>

              {/* Row 3: AES-256 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[#1A2540] transition-colors">
                <div className="col-span-3 flex flex-col">
                  <span className="text-[13px] font-semibold text-[#E2E8F0]">AES-256</span>
                  <span className="text-[10px] text-[#475569] font-mono uppercase mt-0.5">Symmetric</span>
                </div>
                <div className="col-span-3 text-[12px] text-[#94A3B8]">Encryption</div>
                <div className="col-span-3 flex flex-col">
                  <AlgorithmBadge status="PARTIALLY-AFFECTED" />
                  <span className="text-[10px] text-[#94A3B8] mt-1 font-mono">Grover reduces to 128-bit</span>
                </div>
                <div className="col-span-2">
                  <NistBadge level={3} />
                </div>
                <div className="col-span-1 text-right text-[12px] font-semibold text-[#00C4E8] hover:underline cursor-pointer">
                  Run Grover's →
                </div>
              </div>

              {/* Row 4: CRYSTALS-Kyber-768 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[#1A2540] transition-colors">
                <div className="col-span-3 flex flex-col">
                  <span className="text-[13px] font-semibold text-[#E2E8F0]">CRYSTALS-Kyber-768</span>
                  <span className="text-[10px] text-[#475569] font-mono uppercase mt-0.5">KEM</span>
                </div>
                <div className="col-span-3 text-[12px] text-[#94A3B8]">Key Exchange</div>
                <div className="col-span-3">
                  <AlgorithmBadge status="QUANTUM-SAFE" />
                </div>
                <div className="col-span-2">
                  <NistBadge level={3} />
                </div>
                <div className="col-span-1 text-right text-[12px] font-semibold text-[#00C4E8] hover:underline cursor-pointer">
                  Test KEM →
                </div>
              </div>

              {/* Row 5: CRYSTALS-Dilithium3 */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[#1A2540] transition-colors">
                <div className="col-span-3 flex flex-col">
                  <span className="text-[13px] font-semibold text-[#E2E8F0]">CRYSTALS-Dilithium3</span>
                  <span className="text-[10px] text-[#475569] font-mono uppercase mt-0.5">Signature</span>
                </div>
                <div className="col-span-3 text-[12px] text-[#94A3B8]">Digital Signatures</div>
                <div className="col-span-3">
                  <AlgorithmBadge status="QUANTUM-SAFE" />
                </div>
                <div className="col-span-2">
                  <NistBadge level={3} />
                </div>
                <div className="col-span-1 text-right text-[12px] font-semibold text-[#00C4E8] hover:underline cursor-pointer">
                  Test Sig →
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column (35% width) — Live Simulation Panel */}
        <div className="lg:col-span-4 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[340px]">
          {activeSimState === 'RUNNING' ? (
            /* STATE A - RUNNING */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">ACTIVE SIMULATION</span>
                <div className="flex items-center gap-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-md px-2 py-0.5">
                  <StatusDot status="online" animated={true} />
                  <span className="text-[10px] font-bold text-[#22C55E]">LIVE</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-[16px] font-semibold text-[#E2E8F0]">Shor's Algorithm</h4>
                <div className="inline-block bg-[#1E2D45] text-[#00C4E8] text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                  RSA-1024
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[12px] text-[#94A3B8]">
                  <span>Building QFT Circuit...</span>
                  <span className="text-[#00C4E8] font-bold font-mono">78%</span>
                </div>
                <div className="w-full bg-[#1E2D45] rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-[#00C4E8] rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 bg-[#080C14] border border-[#1E2D45]/40 rounded-lg p-3 text-center">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#E2E8F0] font-mono">2,051</span>
                  <span className="text-[10px] text-[#475569] mt-0.5">logical qubits</span>
                </div>
                <div className="flex flex-col border-x border-[#1E2D45]/40">
                  <span className="text-[14px] font-bold text-[#E2E8F0] font-mono">18,432</span>
                  <span className="text-[10px] text-[#475569] mt-0.5">circuit depth</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#F59E0B] font-mono">~22s</span>
                  <span className="text-[10px] text-[#475569] mt-0.5">remaining</span>
                </div>
              </div>

              <button 
                onClick={() => setActiveSimState('RESULT')}
                className="w-full border border-[#1E2D45] hover:bg-red-500/10 hover:text-red-400 text-[#94A3B8] text-[13px] font-semibold py-2 rounded-md transition-all"
              >
                Cancel Simulation
              </button>
            </div>
          ) : (
            /* STATE B - LAST RESULT */
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest">LAST SIMULATION RESULT</span>
                <span onClick={() => setActiveSimState('RUNNING')} className="text-[10px] text-[#00C4E8] font-bold hover:underline cursor-pointer">
                  Restart Sim
                </span>
              </div>

              <div className="p-4 bg-red-500/[0.02] border-l-4 border-red-500 border border-[#1E2D45] rounded-r-xl space-y-1">
                <h4 className="text-[14px] font-semibold text-[#E2E8F0]">Shor's vs RSA-2048</h4>
                <div className="text-[10px] text-[#94A3B8] font-mono uppercase">COMPLETED — 4m 12s ago</div>
              </div>

              {/* Key Results Stats list */}
              <div className="space-y-2 text-[12px] text-[#94A3B8] font-mono bg-[#080C14] border border-[#1E2D45]/40 rounded-lg p-3">
                <div className="flex justify-between">
                  <span>Qubits Required:</span>
                  <strong className="text-white">4,099 logical</strong>
                </div>
                <div className="flex justify-between">
                  <span>Circuit Depth:</span>
                  <strong className="text-white">196,608 gates</strong>
                </div>
                <div className="flex justify-between">
                  <span>Classical Time:</span>
                  <strong className="text-white">13.7B years</strong>
                </div>
                <div className="flex justify-between">
                  <span>Quantum Time:</span>
                  <strong className="text-red-400">~8 hours (FTQC)</strong>
                </div>
              </div>

              <div className="bg-red-500/10 text-red-400 border border-red-500/20 text-center rounded-md py-2 text-[11px] font-bold uppercase tracking-wider">
                CRYPTOGRAPHIC BREAK CONFIRMED
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ZONE 5: Quick Actions */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-4 flex flex-col sm:flex-row gap-4">
        <button className="flex-1 bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-semibold px-4 py-2.5 rounded-md flex items-center justify-center gap-2 text-[13px] transition-colors">
          <Zap size={16} /> Run Shor's Attack
        </button>
        <button className="flex-1 border border-[#1E2D45] text-[#E2E8F0] hover:bg-[#1A2540] font-semibold px-4 py-2.5 rounded-md text-[13px] transition-all">
          ⚡ Full Benchmark Suite
        </button>
        <button className="flex-1 border border-[#1E2D45] text-[#E2E8F0] hover:bg-[#1A2540] font-semibold px-4 py-2.5 rounded-md text-[13px] transition-all">
          🔍 Vulnerability Assessment
        </button>
        <button className="flex-1 border border-[#1E2D45] text-[#E2E8F0] hover:bg-[#1A2540] font-semibold px-4 py-2.5 rounded-md text-[13px] transition-all">
          📄 Export Last Report
        </button>
      </div>

      {/* ZONE 6: Recent Activity Feed */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[16px] font-semibold text-[#E2E8F0]">Recent Activity</h3>
          <span className="text-[13px] text-[#00C4E8] font-semibold hover:underline cursor-pointer">View All</span>
        </div>

        {/* Activity Items list */}
        <div className="flex flex-col divide-y divide-[#1E2D45]/30">
          
          {/* Item 1 */}
          <div className="py-3 flex justify-between items-start gap-4 text-[13px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5"><StatusDot status="online" /></span>
              <div className="flex flex-col">
                <span className="text-[#E2E8F0] font-medium">Shor's Algorithm simulation completed — RSA-2048</span>
                <span className="text-[11px] text-[#EF4444] font-mono mt-0.5">4,099 qubits • BREAK CONFIRMED</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">2m ago</span>
          </div>

          {/* Item 2 */}
          <div className="py-3 flex justify-between items-start gap-4 text-[13px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5"><StatusDot status="inactive" /></span>
              <div className="flex flex-col">
                <span className="text-[#E2E8F0] font-medium">Full benchmark suite executed — 7 algorithms</span>
                <span className="text-[11px] text-[#94A3B8] font-mono mt-0.5">Kyber-768 fastest keygen at 0.08ms</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">14m ago</span>
          </div>

          {/* Item 3 */}
          <div className="py-3 flex justify-between items-start gap-4 text-[13px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5"><StatusDot status="warning" /></span>
              <div className="flex flex-col">
                <span className="text-[#E2E8F0] font-medium">Vulnerability assessment completed</span>
                <span className="text-[11px] text-[#EF4444] font-mono mt-0.5">Risk Score: 74/100 — HIGH</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">1h ago</span>
          </div>

          {/* Item 4 */}
          <div className="py-3 flex justify-between items-start gap-4 text-[13px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5"><StatusDot status="online" /></span>
              <div className="flex flex-col">
                <span className="text-[#E2E8F0] font-medium">Grover's simulation on AES-128 completed</span>
                <span className="text-[11px] text-[#F59E0B] font-mono mt-0.5">Effective security halved to 64-bit</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">2h ago</span>
          </div>

          {/* Item 5 */}
          <div className="py-3 flex justify-between items-start gap-4 text-[13px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5"><StatusDot status="inactive" /></span>
              <div className="flex flex-col">
                <span className="text-[#E2E8F0] font-medium">CRYSTALS-Kyber-768 KEM operations verified</span>
                <span className="text-[11px] text-[#94A3B8] font-mono mt-0.5">KeyGen: 0.08ms • Encap: 0.09ms</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">3h ago</span>
          </div>

          {/* Item 6 */}
          <div className="py-3 flex justify-between items-start gap-4 text-[13px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5"><StatusDot status="inactive" /></span>
              <div className="flex flex-col">
                <span className="text-[#E2E8F0] font-medium">PDF Report generated and exported</span>
                <span className="text-[11px] text-[#94A3B8] font-mono mt-0.5 font-mono">QuantumShield_Report_2026-06-14.pdf</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">4h ago</span>
          </div>

          {/* Item 7 */}
          <div className="py-3 flex justify-between items-start gap-4 text-[13px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-1.5"><StatusDot status="online" /></span>
              <div className="flex flex-col">
                <span className="text-[#E2E8F0] font-medium">FALCON-512 benchmark completed</span>
                <span className="text-[11px] text-[#94A3B8] font-mono mt-0.5 font-mono">Sign: 0.5ms • Sig size: 666 bytes</span>
              </div>
            </div>
            <span className="text-[11px] text-[#94A3B8] font-mono whitespace-nowrap">5h ago</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
