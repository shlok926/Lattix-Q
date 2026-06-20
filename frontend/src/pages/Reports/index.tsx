import React, { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { AlertTriangle, Download, CheckSquare, Square, Shield, Check, Clock, TrendingUp } from 'lucide-react';
import AlgorithmBadge from '../../components/ui/AlgorithmBadge';

export const ReportsPage: React.FC = () => {
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([
    'RSA-2048',
    'ECC-256',
    'AES-128'
  ]);
  const [timeline, setTimeline] = useState<string>('10 years');
  const [format, setFormat] = useState<'PDF' | 'HTML'>('PDF');
  const [isAssessing, setIsAssessing] = useState(false);
  const [riskScore, setRiskScore] = useState<number>(74);

  // Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleAlgo = (algo: string) => {
    if (selectedAlgos.includes(algo)) {
      setSelectedAlgos(selectedAlgos.filter((a) => a !== algo));
    } else {
      setSelectedAlgos([...selectedAlgos, algo]);
    }
  };

  const handleRunAssessment = () => {
    setIsAssessing(true);
    setTimeout(() => {
      setIsAssessing(false);
      // Simulate dynamic risk calculation based on selection
      let score = 0;
      if (selectedAlgos.includes('RSA-2048')) score += 40;
      if (selectedAlgos.includes('ECC-256')) score += 35;
      if (selectedAlgos.includes('AES-128')) score += 15;
      if (selectedAlgos.includes('AES-256')) score += 5;
      if (selectedAlgos.includes('CRYSTALS-Kyber-768')) score -= 10;
      if (selectedAlgos.includes('CRYSTALS-Dilithium3')) score -= 10;
      setRiskScore(Math.max(0, Math.min(100, score + 10)));
      triggerToast("Risk assessment models recalculated!");
    }, 1000);
  };

  // Compliance Metrics
  const nistCompliant = selectedAlgos.includes('CRYSTALS-Kyber-768') || selectedAlgos.includes('CRYSTALS-Dilithium3');
  const cnsaCompliant = !selectedAlgos.includes('RSA-2048') && !selectedAlgos.includes('ECC-256') && (selectedAlgos.includes('CRYSTALS-Kyber-768') || selectedAlgos.includes('CRYSTALS-Dilithium3'));
  const gdprReady = selectedAlgos.includes('AES-256') && (selectedAlgos.includes('CRYSTALS-Kyber-768') || selectedAlgos.includes('CRYSTALS-Dilithium3'));

  // Horizon Data for Line/Area chart
  const generateTimelineData = () => {
    const yearsCount = timeline === '5 years' ? 5 : timeline === '10 years' ? 10 : timeline === '15 years' ? 15 : 25;
    const data = [];
    const isLegacyActive = selectedAlgos.includes('RSA-2048') || selectedAlgos.includes('ECC-256') || selectedAlgos.includes('AES-128');
    
    for (let i = 1; i <= yearsCount; i++) {
      let riskVal = 0;
      if (isLegacyActive) {
        const legacyWeight = (selectedAlgos.includes('RSA-2048') ? 45 : 0) + (selectedAlgos.includes('ECC-256') ? 35 : 0) + (selectedAlgos.includes('AES-128') ? 15 : 0);
        riskVal = Math.round(legacyWeight * (1 - Math.exp(-0.15 * i)) + 5);
      } else {
        riskVal = Math.max(2, 5 - i * 0.1);
      }
      data.push({
        year: `Yr ${i}`,
        Risk: Math.min(100, Math.max(0, Math.round(riskVal))),
        Protection: Math.min(100, Math.max(0, Math.round(100 - riskVal)))
      });
    }
    return data;
  };

  const timelineData = generateTimelineData();

  const riskColor = riskScore > 60 ? '#EF4444' : riskScore > 30 ? '#F59E0B' : '#22C55E';
  const riskData = [{ name: 'Risk', value: riskScore, fill: riskColor }];

  const findings = [
    {
      name: 'RSA-2048',
      type: 'Asymmetric Key Exchange',
      risk: 95,
      status: 'QUANTUM-VULNERABLE' as const,
      recommendation: 'Migrate to CRYSTALS-Kyber-768 immediately',
      colorBorder: 'border-l-4 border-l-[#EF4444]',
      show: selectedAlgos.includes('RSA-2048')
    },
    {
      name: 'ECC-256',
      type: 'Asymmetric Signature',
      risk: 87,
      status: 'QUANTUM-VULNERABLE' as const,
      recommendation: 'Replace with CRYSTALS-Dilithium3 for signatures',
      colorBorder: 'border-l-4 border-l-[#EF4444]',
      show: selectedAlgos.includes('ECC-256')
    },
    {
      name: 'AES-128',
      type: 'Symmetric Block Cipher',
      risk: 40,
      status: 'PARTIALLY-AFFECTED' as const,
      recommendation: 'Upgrade to AES-256; Grover reduces to 64-bit',
      colorBorder: 'border-l-4 border-l-[#F59E0B]',
      show: selectedAlgos.includes('AES-128')
    },
    {
      name: 'AES-256',
      type: 'Symmetric Block Cipher',
      risk: 10,
      status: 'PARTIALLY-AFFECTED' as const,
      recommendation: 'Maintains 128-bit effective security (Quantum-Safe)',
      colorBorder: 'border-l-4 border-l-[#22C55E]',
      show: selectedAlgos.includes('AES-256')
    },
    {
      name: 'CRYSTALS-Kyber-768',
      type: 'Post-Quantum KEM',
      risk: 2,
      status: 'QUANTUM-SAFE' as const,
      recommendation: 'Fully compliant post-quantum key exchange',
      colorBorder: 'border-l-4 border-l-[#22C55E]',
      show: selectedAlgos.includes('CRYSTALS-Kyber-768')
    },
    {
      name: 'CRYSTALS-Dilithium3',
      type: 'Post-Quantum Signature',
      risk: 2,
      status: 'QUANTUM-SAFE' as const,
      recommendation: 'Fully compliant post-quantum signature model',
      colorBorder: 'border-l-4 border-l-[#22C55E]',
      show: selectedAlgos.includes('CRYSTALS-Dilithium3')
    }
  ];

  // Real browser-side download of generated reports
  const handleDownload = (formatType: 'PDF' | 'HTML') => {
    const reportTitle = `QUANTUMSHIELD CRYPTOGRAPHIC COMPLIANCE BLUEPRINT`;
    const dateStr = new Date().toLocaleDateString();
    
    let content = "";
    if (formatType === 'HTML') {
      content = `<!DOCTYPE html>
<html>
<head>
  <title>QuantumShield Cryptographic Assessment</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #080c14; color: #e2e8f0; padding: 40px; }
    h1 { color: #00c4e8; border-bottom: 2px solid #1e2d45; padding-bottom: 10px; }
    .score { font-size: 36px; font-weight: bold; color: ${riskColor}; margin: 20px 0; }
    .item { background: #0d1421; border: 1px solid #1e2d45; padding: 15px; margin: 15px 0; border-radius: 8px; }
    .recommendation { color: #00c4e8; font-weight: 600; }
    .footer { font-size: 11px; color: #475569; margin-top: 40px; text-align: center; }
  </style>
</head>
<body>
  <h1>${reportTitle}</h1>
  <p><strong>Generated On:</strong> ${dateStr}</p>
  <p><strong>Timeline Horizon Projection:</strong> ${timeline}</p>
  <div class="score">Calculated Security Risk: ${riskScore} / 100</div>
  
  <h2>Cryptographic Configuration Audit:</h2>
  ${findings.filter(f => f.show).map(f => `
    <div class="item">
      <h3>${f.name} (${f.status})</h3>
      <p><strong>Domain Parameter Type:</strong> ${f.type}</p>
      <p><strong>Risk Coefficient:</strong> ${f.risk}/100</p>
      <p class="recommendation">Mitigation Blueprint: ${f.recommendation}</p>
    </div>
  `).join('')}

  <h2>Compliance Benchmarks:</h2>
  <ul>
    <li><strong>NIST SP 800-219 PQC Readiness:</strong> ${nistCompliant ? "COMPLIANT" : "NON-COMPLIANT"}</li>
    <li><strong>CNSA 2.0 (NSA Quantum Suite):</strong> ${cnsaCompliant ? "COMPLIANT" : "NON-COMPLIANT"}</li>
    <li><strong>GDPR Quantum Encryption Clauses:</strong> ${gdprReady ? "COMPLIANT" : "NON-COMPLIANT"}</li>
  </ul>
  <div class="footer">QuantumShield Security SaaS Platform. All Rights Reserved.</div>
</body>
</html>`;
    } else {
      // Styled text layout (PDF simulation)
      content = `========================================================================
${reportTitle}
========================================================================
Generated On: ${dateStr}
Timeline Horizon Projection: ${timeline}
Calculated Risk Index: ${riskScore} / 100
Security Status: ${riskScore > 60 ? 'HIGH QUANTUM EXPOSURE' : riskScore > 30 ? 'MODERATE WARNING' : 'SECURE & QUANTUM-IMMUNE'}

------------------------------------------------------------------------
CRYPTOGRAPHIC ASSET INVENTORY & AUDIT:
------------------------------------------------------------------------
${findings.filter(f => f.show).map(f => `
* Algorithm: ${f.name}
  Type: ${f.type}
  Security Status: ${f.status}
  Risk Index: ${f.risk}/100
  Mitigation Action: ${f.recommendation}
`).join('\n')}

------------------------------------------------------------------------
COMPLIANCE STANDARD MATURITY:
------------------------------------------------------------------------
* NIST SP 800-219 PQC Migration Plan: ${nistCompliant ? 'COMPLIANT (Active Transition)' : 'NON-COMPLIANT (Vulnerable)'}
* NSA CNSA 2.0 Standard: ${cnsaCompliant ? 'COMPLIANT (Clean PQC Parameters)' : 'NON-COMPLIANT (Legacy RSA/ECC active)'}
* GDPR Post-Quantum Readiness: ${gdprReady ? 'COMPLIANT (AES-256 + Kyber)' : 'NON-COMPLIANT (Entropy below 192 bits)'}

========================================================================
                   Generated by QuantumShield Enterprise
========================================================================
`;
    }

    const blob = new Blob([content], { type: formatType === 'HTML' ? 'text/html' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QuantumShield_Assessment_Report_${dateStr.replace(/\//g, '_')}.${formatType === 'HTML' ? 'html' : 'txt'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded compliance assessment as ${formatType}!`);
  };

  return (
    <div className="space-y-6 text-[#E2E8F0] select-none pb-12 relative">
      {/* Toast message */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00C4E8]/10 border border-[#00C4E8]/30 text-[#00C4E8] text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-fadeIn">
          <Check size={14} className="text-[#00C4E8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div>
        <h1 className="text-[24px] font-semibold text-[#E2E8F0] tracking-wide">Reports & Compliance</h1>
        <p className="text-[13px] text-[#94A3B8] mt-0.5">Generate post-quantum risk reports, audit standards compliance, and export blueprints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left panel (40% width) — Input Config */}
        <div className="lg:col-span-4 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[580px]">
          <div className="space-y-6">
            <div>
              <h3 className="text-[15px] font-semibold text-white">Vulnerability Assessment</h3>
              <p className="text-[12px] text-[#94A3B8] mt-0.5">Configure target cryptosystems and evaluation horizon</p>
            </div>

            {/* Cryptographic Configuration Checklist */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Cryptographic Configuration</span>
              <div className="space-y-2 bg-[#080C14] border border-[#1E2D45] rounded-lg p-3">
                {[
                  'RSA-2048',
                  'ECC-256',
                  'AES-128',
                  'AES-256',
                  'CRYSTALS-Kyber-768',
                  'CRYSTALS-Dilithium3'
                ].map((algo) => {
                  const isChecked = selectedAlgos.includes(algo);
                  return (
                    <div 
                      key={algo} 
                      onClick={() => toggleAlgo(algo)}
                      className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded hover:bg-[#1A2540]/40 transition-colors"
                    >
                      {isChecked ? (
                        <CheckSquare size={16} className="text-[#00C4E8]" />
                      ) : (
                        <Square size={16} className="text-[#475569]" />
                      )}
                      <span className={`text-[12px] font-mono ${isChecked ? 'text-white' : 'text-[#94A3B8]'}`}>{algo}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Timeline Horizon Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Timeline Horizon</span>
              <div className="grid grid-cols-4 gap-2 bg-[#080C14] border border-[#1E2D45] rounded-lg p-1">
                {['5 years', '10 years', '15 years', '25 years'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeline(t)}
                    className={`py-1.5 text-[10px] font-bold rounded transition-all whitespace-nowrap ${
                      timeline === t
                        ? 'bg-[#1E2D45] text-[#00C4E8]'
                        : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Report Format Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">Report Format</span>
              <div className="grid grid-cols-2 gap-2 bg-[#080C14] border border-[#1E2D45] rounded-lg p-1">
                {(['PDF', 'HTML'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    className={`py-1.5 text-[11px] font-bold rounded transition-all ${
                      format === fmt
                        ? 'bg-[#1E2D45] text-[#00C4E8]'
                        : 'text-[#94A3B8] hover:text-[#E2E8F0]'
                    }`}
                  >
                    {fmt} Report
                  </button>
                ))}
              </div>
            </div>

          </div>

          <button
            onClick={handleRunAssessment}
            disabled={isAssessing}
            className="w-full bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-bold text-[13px] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 mt-6"
          >
            {isAssessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
                Assessing Risk...
              </>
            ) : (
              'Run Assessment'
            )}
          </button>
        </div>

        {/* Right panel (60% width) — Results */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Top Panel: Risk Score Gauge and Compliance Status */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 relative min-h-[220px]">
            {isAssessing && (
              <div className="absolute inset-0 bg-[#0D1421]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-2 rounded-xl">
                <span className="w-8 h-8 border-4 border-[#00C4E8] border-t-transparent rounded-full animate-spin" />
                <span className="text-[13px] text-[#94A3B8] font-mono">Running compliance assessment rules...</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Circular Gauge */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest self-start mb-2">calculated risk score</span>
                <div className="relative w-full h-[130px] flex items-center justify-center">
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
                    <span className="text-4xl font-black font-mono" style={{ color: riskColor }}>
                      {riskScore}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      out of 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Compliance Benchmarks Status */}
              <div className="flex flex-col justify-center space-y-3">
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">compliance blueprints</span>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-[#080C14] border border-[#1E2D45] rounded-lg">
                    <span className="text-xs text-slate-300 font-medium">NIST SP 800-219</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      nistCompliant 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {nistCompliant ? 'COMPLIANT' : 'NON-READY'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#080C14] border border-[#1E2D45] rounded-lg">
                    <span className="text-xs text-slate-300 font-medium">NSA CNSA 2.0</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      cnsaCompliant 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {cnsaCompliant ? 'COMPLIANT' : 'NON-READY'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#080C14] border border-[#1E2D45] rounded-lg">
                    <span className="text-xs text-slate-300 font-medium">GDPR PQC Clause</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      gdprReady 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {gdprReady ? 'COMPLIANT' : 'NON-READY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Panel: Dynamic Area Chart for Threat Horizon */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#00C4E8]" />
                  HNDL Exposure Horizon Projection
                </h4>
                <p className="text-[10px] text-[#475569] mt-0.5">Simulated probability curve of data capture and Shor decryption over {timeline}</p>
              </div>
            </div>
            
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorProtection" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#475569" fontSize={9} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={9} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#080C14', borderColor: '#1E2D45', borderRadius: '8px' }}
                    labelStyle={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}
                    itemStyle={{ fontSize: '11px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="Risk" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" name="Threat Risk %" />
                  <Area type="monotone" dataKey="Protection" stroke="#22C55E" strokeWidth={2} fillOpacity={1} fill="url(#colorProtection)" name="Immunity %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Panel: Findings List & Download triggers */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[200px]">
            <div>
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest block mb-3">vulnerability indicators</span>
              
              <div className="overflow-y-auto max-h-[140px] pr-1 space-y-2 scrollbar-thin">
                {findings.filter(f => f.show).map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`${item.colorBorder} bg-[#080C14]/65 border border-[#1E2D45]/40 rounded-r-lg p-2.5 flex flex-col gap-1 transition-all hover:bg-[#1A2540]/30`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-white font-mono">{item.name}</span>
                        <span className="text-[9px] text-[#475569] uppercase font-mono mt-0.5">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">Risk Index: {item.risk}</span>
                        <AlgorithmBadge status={item.status} />
                      </div>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] font-medium italic">
                      Recom: {item.recommendation}
                    </p>
                  </div>
                ))}
                {selectedAlgos.length === 0 && (
                  <div className="flex items-center justify-center text-[12px] text-[#475569] font-mono py-8">
                    No algorithms selected for evaluation.
                  </div>
                )}
              </div>
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1E2D45]/45">
              <button 
                onClick={() => handleDownload('PDF')}
                className="flex items-center justify-center gap-2 border border-[#1E2D45] hover:bg-[#1A2540]/60 text-white font-semibold text-[12px] py-2 rounded-md transition-all cursor-pointer"
              >
                <Download size={13} /> Download Report (PDF)
              </button>
              <button 
                onClick={() => handleDownload('HTML')}
                className="flex items-center justify-center gap-2 border border-[#1E2D45] hover:bg-[#1A2540]/60 text-white font-semibold text-[12px] py-2 rounded-md transition-all cursor-pointer"
              >
                <Download size={13} /> Download HTML
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
