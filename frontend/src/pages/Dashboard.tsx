import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  Activity, 
  Database, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Dashboard() {
  // Sparkline data generators
  const sparklineData = (values: number[]) => values.map((v, i) => ({ id: i, value: v }));

  // Row 2 KPI card definitions
  const kpis = [
    { 
      label: 'Quantum Risk Score', 
      value: '82%', 
      trend: '+1.5% this week', 
      isDanger: true, 
      icon: ShieldAlert, 
      sparkline: sparklineData([78, 79, 81, 80, 81, 82, 82]), 
      color: '#ef4444' 
    },
    { 
      label: 'PQC Readiness', 
      value: '85%', 
      trend: '+3.2% last month', 
      isDanger: false, 
      icon: ShieldCheck, 
      sparkline: sparklineData([80, 81, 82, 83, 83, 84, 85]), 
      color: '#22c55e' 
    },
    { 
      label: 'Assets Protected', 
      value: '542', 
      trend: '+18 new vault assets', 
      isDanger: false, 
      icon: Database, 
      sparkline: sparklineData([520, 525, 528, 532, 535, 540, 542]), 
      color: '#a855f7' 
    },
    { 
      label: 'Active Simulations', 
      value: '1', 
      trend: "Shor's Algorithm running", 
      isDanger: false, 
      icon: Cpu, 
      sparkline: sparklineData([1, 2, 1, 1, 3, 2, 1]), 
      color: '#22c55e' 
    }
  ];

  // Row 3 Line Chart: threats detected over 30 days
  const trendData = [
    { date: 'May 20', threats: 24, baseline: 18 },
    { date: 'May 25', threats: 28, baseline: 18 },
    { date: 'May 30', threats: 45, baseline: 19 },
    { date: 'Jun 04', threats: 60, baseline: 20 },
    { date: 'Jun 09', threats: 98, baseline: 21 },
    { date: 'Jun 14', threats: 127, baseline: 22 },
  ];

  // Row 3 Donut Chart: Risk Severity Breakdown
  const severityDistribution = [
    { name: 'Critical', value: 14, color: '#ef4444' },
    { name: 'High', value: 35, color: '#f59e0b' },
    { name: 'Medium', value: 48, color: '#a855f7' },
    { name: 'Low', value: 30, color: '#3b82f6' },
  ];

  // Row 4: Progress datasets
  const migrations = [
    { name: 'Kyber-768 (ML-KEM)', progress: 85, color: 'bg-purple-500' },
    { name: 'Dilithium3 (ML-DSA)', progress: 79, color: 'bg-indigo-500' },
    { name: 'Falcon-512', progress: 62, color: 'bg-pink-500' },
    { name: 'SPHINCS+', progress: 54, color: 'bg-blue-500' },
  ];

  const exposures = [
    { name: 'RSA-2048', pct: 42, recommendation: 'Kyber-768', color: 'bg-red-500' },
    { name: 'ECC-256', pct: 35, recommendation: 'Dilithium', color: 'bg-orange-500' },
    { name: 'AES-256', pct: 23, recommendation: 'TupleHash', color: 'bg-yellow-500' },
  ];

  // Row 5: Recent simulations table
  const simulations = [
    { algo: 'Shor vs RSA-2048', status: 'Completed', duration: '1.8s', impact: 'Critical Risk Mitigated', isSuccess: true },
    { algo: 'Grover vs AES-256', status: 'Running', duration: '4.2m', impact: 'High Risk Simulating', isSuccess: false },
    { algo: 'Kyber-768 Benchmark', status: 'Completed', duration: '3.4ms', impact: 'Secure Handshake Validated', isSuccess: true },
    { algo: 'Dilithium3 Keygen', status: 'Completed', duration: '12.1ms', impact: 'Secure Signature Validated', isSuccess: true },
    { algo: 'Falcon-512 Verification', status: 'Completed', duration: '1.2ms', impact: 'Signature Verified', isSuccess: true },
  ];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto p-2">
      
      {/* ROW 1 — Single Compact Hero Banner (120px max) */}
      <div className="h-[95px] flex items-center justify-between border border-purple-500/20 bg-[#0f172a] rounded-xl px-6 py-3 shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(168,85,247,0.05),transparent_40%)] pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-2 bg-purple-500/10 border border-purple-500/25 rounded-lg">
            <Activity className="text-[#a855f7]" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wider text-white">QUANTUMSHIELD</h1>
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Enterprise Cryptographic Ops Command</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-8 bg-white/[0.01] border border-white/5 rounded-lg px-6 py-2.5 backdrop-blur-md">
          <div className="text-center border-r border-white/5 pr-6">
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold block">Quantum Risk</span>
            <span className="text-xs font-black text-red-500 block mt-0.5">82% (Critical)</span>
          </div>
          <div className="text-center border-r border-white/5 pr-6">
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold block">PQC Readiness</span>
            <span className="text-xs font-black text-green-400 block mt-0.5">85% Ready</span>
          </div>
          <div className="text-center border-r border-white/5 pr-6">
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold block">Assets Guarded</span>
            <span className="text-xs font-black text-purple-400 block mt-0.5">542 Vaulted</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold block">Active Sims</span>
            <span className="text-xs font-black text-green-400 flex items-center justify-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> 1 Running
            </span>
          </div>
        </div>
      </div>

      {/* ROW 2 — 4 KPI Cards in a Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <div
            key={i}
            className="card border border-purple-500/15 bg-[#0f172a] rounded-xl flex flex-col justify-between p-4 h-[120px] transition-all hover:border-purple-500/35"
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              <div className="p-1 rounded-lg bg-white/5 text-white/70 border border-white/10">
                <stat.icon size={14} />
              </div>
            </div>
            
            <div className="flex items-end justify-between mt-1">
              <div>
                <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                <div className={`text-[8px] font-bold mt-0.5 ${stat.isDanger ? 'text-red-400' : 'text-green-400'}`}>
                  {stat.trend}
                </div>
              </div>

              {/* Sparkline Graph */}
              <div className="h-6 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.sparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`kpi-spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={stat.color} stopOpacity={0.25}/>
                        <stop offset="95%" stopColor={stat.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={stat.color} 
                      strokeWidth={1} 
                      fillOpacity={1} 
                      fill={`url(#kpi-spark-${i})`} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ROW 3 — 2 Column Grid (Threat Trends & Risk Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left: Line chart (60% equivalent) */}
        <div className="card lg:col-span-2 p-4 border border-purple-500/15 bg-[#0f172a] rounded-xl flex flex-col justify-between h-[280px]">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity size={14} className="text-purple-500" /> Threat Trend Analysis
              </h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">Quantum vulnerability detection trends (Last 30 Days)</p>
            </div>
            <div className="text-[8px] font-bold text-muted-foreground bg-white/5 border border-white/5 rounded-md px-2 py-0.5">
              Live Real-Time
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(168,85,247,0.15)' }} 
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '10px' }}
                />
                <Legend verticalAlign="top" height={24} iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                <Line type="monotone" dataKey="threats" name="Active Threats" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="baseline" name="Secure Baseline" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Donut chart (40% equivalent) */}
        <div className="card p-4 border border-purple-500/15 bg-[#0f172a] rounded-xl flex flex-col justify-between h-[280px]">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-purple-500" /> Risk Breakdown
            </h3>
            <p className="text-[9px] text-muted-foreground mt-0.5">Threat severity allocation analysis</p>
          </div>

          <div className="h-[140px] relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(168,85,247,0.15)' }}
                  itemStyle={{ fontSize: '10px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-lg font-black text-white">127</span>
              <p className="text-[7px] text-muted-foreground uppercase tracking-widest font-bold">Alerts</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {severityDistribution.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-1 rounded bg-white/[0.01] border border-white/5">
                <span className="text-[7px] text-muted-foreground uppercase tracking-wider">{item.name}</span>
                <span className="text-xs font-black mt-0.5" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 4 — 2 Column Grid (PQC Migration & Crypto Exposure) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left: PQC Migration progress */}
        <div className="card p-4 border border-purple-500/15 bg-[#0f172a] rounded-xl flex flex-col justify-between h-[220px]">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-purple-500" /> PQC Migration Progress
            </h3>
            <p className="text-[9px] text-muted-foreground mt-0.5">Algorithmic migration completion to post-quantum standards</p>
          </div>

          <div className="space-y-2.5 my-2">
            {migrations.map((alg, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="font-semibold text-white/80">{alg.name}</span>
                  <span className="font-black text-purple-400">{alg.progress}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div className={`h-full ${alg.color}`} style={{ width: `${alg.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Crypto Exposure with replacement recommendations */}
        <div className="card p-4 border border-purple-500/15 bg-[#0f172a] rounded-xl flex flex-col justify-between h-[220px]">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-purple-500" /> Cryptography Exposure Audit
            </h3>
            <p className="text-[9px] text-muted-foreground mt-0.5">Detected legacy cryptography and recommended replacements</p>
          </div>

          <div className="space-y-2.5 my-2">
            {exposures.map((exp, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-center text-[9px]">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white/80">{exp.name}</span>
                    <span className="text-muted-foreground text-[8px]">→</span>
                    <span className="font-bold text-purple-400 font-mono bg-purple-500/10 px-1 py-0.5 rounded text-[8px]">
                      {exp.recommendation}
                    </span>
                  </div>
                  <span className="font-black text-red-400">{exp.pct}% exposure</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div className={`h-full ${exp.color}`} style={{ width: `${exp.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 5 — Recent Simulations Table */}
      <div className="card p-4 border border-purple-500/15 bg-[#0f172a] rounded-xl flex flex-col justify-between min-h-[220px] shrink-0">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Cpu size={14} className="text-purple-500" /> Recent Simulations & Run History
          </h3>
          <p className="text-[9px] text-muted-foreground mt-0.5">Latest cryptanalysis execution and benchmark evaluation logs</p>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="border-b border-white/5 text-muted-foreground text-[8px] uppercase tracking-wider">
                <th className="pb-2 font-bold">Algorithm / Simulation Run</th>
                <th className="pb-2 font-bold">Status</th>
                <th className="pb-2 font-bold">Execution Duration</th>
                <th className="pb-2 font-bold">Risk Impact / Assessment Result</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map((sim, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-all">
                  <td className="py-2.5 font-bold text-white/90">{sim.algo}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                      sim.status === 'Running' 
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                        : 'bg-green-500/10 text-green-500 border border-green-500/20'
                    }`}>
                      {sim.status === 'Running' ? (
                        <span className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />
                      ) : (
                        <CheckCircle2 size={9} />
                      )}
                      {sim.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-white/70">{sim.duration}</td>
                  <td className={`py-2.5 font-medium ${sim.isSuccess ? 'text-green-400' : 'text-yellow-400'}`}>
                    {sim.impact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
