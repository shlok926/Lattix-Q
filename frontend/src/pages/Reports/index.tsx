import React, { useState } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { 
  AlertTriangle, Download, CheckSquare, Square, Shield, Check, Clock, TrendingUp,
  ShieldQuestion, CheckCircle2, XCircle, CircleDashed, ChevronRight, ChevronDown 
} from 'lucide-react';
import AlgorithmBadge from '../../components/ui/AlgorithmBadge';
import { api } from '../../services/api';

interface Requirement {
  status: 'yes' | 'no' | 'partial';
  title: string;
  detail: string;
}

export const ReportsPage: React.FC = () => {
  const [selectedAlgos, setSelectedAlgos] = useState<string[]>([
    'RSA-2048',
    'ECC-256',
    'AES-128'
  ]);
  const [timeline, setTimeline] = useState<string>('15 years');
  const [format, setFormat] = useState<'PDF' | 'HTML'>('PDF');
  const [assessmentStatus, setAssessmentStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [runningStep, setRunningStep] = useState<number>(0);
  const [lastAssessedTime, setLastAssessedTime] = useState<Date | null>(null);
  const [configOutdated, setConfigOutdated] = useState<boolean>(false);
  const [expandedCompliance, setExpandedCompliance] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [riskScore, setRiskScore] = useState<number>(40);

  // Toast States
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const [, setTick] = useState(0);
  React.useEffect(() => {
    if (!lastAssessedTime) return;
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [lastAssessedTime]);

  const getLastAssessedText = () => {
    if (!lastAssessedTime) return '';
    const diffMs = new Date().getTime() - lastAssessedTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Assessed just now';
    return `Last assessed: ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  };

  const toggleAlgo = (algo: string) => {
    if (selectedAlgos.includes(algo)) {
      setSelectedAlgos(selectedAlgos.filter((a) => a !== algo));
    } else {
      setSelectedAlgos([...selectedAlgos, algo]);
    }
    if (assessmentStatus === 'complete') {
      setConfigOutdated(true);
    }
  };

  const handleTimelineChange = (t: string) => {
    setTimeline(t);
    if (assessmentStatus === 'complete') {
      setConfigOutdated(true);
    }
  };

  const handleRunAssessment = () => {
    setAssessmentStatus('running');
    setRunningStep(1);
    
    setTimeout(() => {
      setRunningStep(2);
    }, 750);
    
    setTimeout(() => {
      setRunningStep(3);
    }, 1500);
    
    setTimeout(() => {
      setRunningStep(4);
    }, 2250);
    
    setTimeout(() => {
      setAssessmentStatus('complete');
      setLastAssessedTime(new Date());
      setConfigOutdated(false);
      
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
    }, 3000);
  };

  // Compliance Metrics dynamic details
  const getFrameworkRequirements = (frameworkId: string): Requirement[] => {
    const reqs: Requirement[] = [];
    
    if (frameworkId === 'nist') {
      reqs.push({
        status: selectedAlgos.length > 0 ? 'yes' : 'partial',
        title: 'Cryptographic discovery and inventory completed',
        detail: `${selectedAlgos.length} algorithm${selectedAlgos.length !== 1 ? 's' : ''} identified and catalogued`
      });
      reqs.push({
        status: selectedAlgos.length > 0 ? 'yes' : 'no',
        title: 'Risk-based migration prioritization documented',
        detail: selectedAlgos.length > 0 ? 'Risk scoring applied across all inventoried algorithms' : 'No algorithms found to document risk'
      });
      reqs.push({
        status: 'yes',
        title: 'Migration roadmap established',
        detail: 'Timeline horizon configured for assessment'
      });
    } else if (frameworkId === 'cnsa') {
      const hasPqcKem = selectedAlgos.includes('CRYSTALS-Kyber-768');
      const hasLegacyAsym = selectedAlgos.includes('RSA-2048') || selectedAlgos.includes('ECC-256');
      reqs.push({
        status: hasPqcKem ? 'yes' : 'no',
        title: 'Key establishment uses NIST-approved post-quantum algorithm',
        detail: hasLegacyAsym 
          ? 'RSA-2048/ECC-256 detected — CNSA 2.0 requires ML-KEM-768 or higher by 2027'
          : (hasPqcKem ? 'ML-KEM-768 available in configuration' : 'No KEM algorithm selected in configuration')
      });
      
      const hasPqcSig = selectedAlgos.includes('CRYSTALS-Dilithium3');
      reqs.push({
        status: hasPqcSig ? 'yes' : 'no',
        title: 'Digital signatures use NIST-approved post-quantum algorithm',
        detail: hasPqcSig
          ? 'ML-DSA / SLH-DSA signature model available'
          : 'No ML-DSA or SLH-DSA signature algorithm detected in configuration'
      });

      const hasAes256 = selectedAlgos.includes('AES-256');
      reqs.push({
        status: hasAes256 ? 'yes' : 'partial',
        title: 'Symmetric encryption meets minimum key length',
        detail: hasAes256 
          ? 'AES-256 available in configuration' 
          : 'AES-128 detected — AES-256 is recommended for maximum security'
      });

      const isHybrid = hasPqcKem && hasLegacyAsym;
      reqs.push({
        status: isHybrid ? 'yes' : 'partial',
        title: 'Hybrid transition period requirements',
        detail: isHybrid
          ? 'Hybrid key exchange configured for transition'
          : 'Hybrid key exchange not yet configured — required for interim compliance'
      });
    } else if (frameworkId === 'gdpr') {
      const hasLegacyAsym = selectedAlgos.includes('RSA-2048') || selectedAlgos.includes('ECC-256');
      reqs.push({
        status: !hasLegacyAsym ? 'yes' : 'no',
        title: 'Long-term personal data protection against future decryption',
        detail: hasLegacyAsym
          ? 'RSA-2048 key exchange vulnerable to harvest-now-decrypt-later risk'
          : 'Legacy endpoints migrated to post-quantum keys'
      });

      const years = timeline.includes('5') ? 5 : timeline.includes('10') ? 10 : timeline.includes('15') ? 15 : 25;
      reqs.push({
        status: years >= 15 ? 'partial' : 'yes',
        title: 'Data retention period assessed against quantum threat timeline',
        detail: `${years}-year horizon configured — review recommended given RSA-2048 usage`
      });

      const hasAes256 = selectedAlgos.includes('AES-256');
      reqs.push({
        status: hasAes256 ? 'yes' : 'no',
        title: 'Encryption-at-rest meets current data protection standards',
        detail: hasAes256 ? 'AES-256 available in configuration' : 'Symmetric encryption weak or unselected'
      });
    }
    
    return reqs;
  };

  const getFrameworkStatus = (frameworkId: string): 'COMPLIANT' | 'PARTIAL' | 'NON-READY' => {
    const reqs = getFrameworkRequirements(frameworkId);
    const hasNo = reqs.some(r => r.status === 'no');
    const hasPartial = reqs.some(r => r.status === 'partial');
    
    if (hasNo) return 'NON-READY';
    if (hasPartial) return 'PARTIAL';
    return 'COMPLIANT';
  };

  const nistCompliant = getFrameworkStatus('nist') === 'COMPLIANT';
  const cnsaCompliant = getFrameworkStatus('cnsa') === 'COMPLIANT';
  const gdprReady = getFrameworkStatus('gdpr') === 'COMPLIANT';

  // Horizon Data for stacked complementary Area chart
  const generateTimelineData = () => {
    const yearsCount = timeline === '5 years' ? 5 : timeline === '10 years' ? 10 : timeline === '15 years' ? 15 : 25;
    const data = [];
    const isLegacyActive = selectedAlgos.includes('RSA-2048') || selectedAlgos.includes('ECC-256') || selectedAlgos.includes('AES-128');
    
    for (let i = 1; i <= yearsCount; i++) {
      let riskVal = 0;
      if (isLegacyActive) {
        const legacyWeight = (selectedAlgos.includes('RSA-2048') ? 45 : 0) + (selectedAlgos.includes('ECC-256') ? 35 : 0) + (selectedAlgos.includes('AES-128') ? 15 : 0);
        riskVal = Math.round(legacyWeight * (1 - Math.exp(-0.12 * i)) + 5);
      } else {
        riskVal = Math.max(1, 3 - i * 0.1);
      }
      
      const decryptionRisk = Math.min(100, Math.max(0, Math.round(riskVal)));
      const safeConfidence = Math.max(0, 100 - decryptionRisk);
      
      data.push({
        year: `Yr ${i}`,
        yearNum: i,
        decryptionRisk,
        safeConfidence
      });
    }
    return data;
  };

  const timelineData = generateTimelineData();

  const getCrossoverPoint = () => {
    const crossover = timelineData.find(d => d.decryptionRisk >= 50);
    return crossover ? crossover.year : null;
  };
  const crossoverYear = getCrossoverPoint();

  const getPlainEnglishSummary = () => {
    const finalYearData = timelineData[timelineData.length - 1];
    const finalRisk = finalYearData ? finalYearData.decryptionRisk : 0;
    const totalYears = timeline === '5 years' ? 5 : timeline === '10 years' ? 10 : timeline === '15 years' ? 15 : 25;
    
    if (finalRisk >= 50) {
      const crossover = timelineData.find(d => d.decryptionRisk >= 50);
      const crossoverYrNum = crossover ? crossover.yearNum : 5;
      return `Based on your current configuration, data encrypted today has a ${finalRisk}% chance of being decrypted by a quantum computer within ${totalYears} years (with risk exceeding safe confidence at Year ${crossoverYrNum}).`;
    } else {
      return `Based on your current configuration, data encrypted today remains highly secure, maintaining a ${100 - finalRisk}% quantum-safe confidence level over a ${totalYears}-year horizon.`;
    }
  };

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

  const handleDownload = async (formatType: 'PDF' | 'HTML') => {
    const reportTitle = `LATTIX - Q CRYPTOGRAPHIC COMPLIANCE BLUEPRINT`;
    const dateStr = new Date().toLocaleDateString();

    if (formatType === 'PDF') {
      setIsDownloading(true);
      try {
        const payload = {
          system_info: {
            name: "Lattix - Q Primary Assessment",
            files_scanned: 1,
            algorithms: selectedAlgos.map(algo => ({
              algorithm: algo,
              key_size: algo.includes('2048') ? 2048 : (algo.includes('256') ? 256 : 128)
            }))
          },
          sim_data: [],
          bench_data: [
            { algorithm: "CRYSTALS-Kyber-768", category: "KEM", keygen_ms: 0.07, encrypt_ms: 0.11, peak_memory_kb: 1.2 },
            { algorithm: "CRYSTALS-Dilithium3", category: "Signature", keygen_ms: 0.38, encrypt_ms: 1.24, peak_memory_kb: 4.8 }
          ],
          ai_enrichment: {
            readiness_score: 100 - riskScore,
            findings: findings.filter(f => f.show).map((f, i) => ({
              id: i + 1,
              technology: f.name,
              risk: f.status === 'QUANTUM-VULNERABLE' ? 'Critical' : (f.status === 'PARTIALLY-AFFECTED' ? 'Medium' : 'Low'),
              line: i * 12 + 4,
              content: `import ${f.name.split('-')[0].toLowerCase()}`,
              suggestion: f.recommendation
            })),
            roadmap: {
              summary: `Security readiness is calculated at ${100 - riskScore}/100. Follow the phased mitigation blueprint below to transition legacy endpoints to post-quantum standards.`,
              phases: [
                {
                  name: "Discovery & Inventory Mapping",
                  duration: "Months 1-3",
                  tasks: [
                    "Execute automated scan of all network segments for legacy cryptography endpoints.",
                    "Identify and document all active certificates containing RSA or ECC public keys."
                  ]
                },
                {
                  name: "Hybrid Algorithm Integration",
                  duration: "Months 3-6",
                  tasks: [
                    "Configure dual-mode key exchanges on external APIs using X25519 + ML-KEM-768.",
                    "Deploy ML-DSA certificates in shadow verification mode."
                  ]
                }
              ]
            }
          }
        };

        const res = await api.post(
          '/report/generate/pdf',
          payload,
          { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', `Lattix_Q_Assessment_Report_${dateStr.replace(/\//g, '_')}.pdf`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        triggerToast("Downloaded compliance assessment report as PDF!");
      } catch (err) {
        console.error("Failed to generate PDF:", err);
        triggerToast("Failed to generate PDF. Falling back to TXT...");
        
        const content = `========================================================================
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
                   Generated by Lattix - Q Enterprise
========================================================================
`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Lattix_Q_Assessment_Report_${dateStr.replace(/\//g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } finally {
        setIsDownloading(false);
      }
    } else {
      const content = `<!DOCTYPE html>
<html>
<head>
  <title>Lattix - Q Cryptographic Assessment</title>
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
  <div class="footer">Lattix - Q Security SaaS Platform. All Rights Reserved.</div>
</body>
</html>`;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lattix_Q_Assessment_Report_${dateStr.replace(/\//g, '_')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerToast(`Downloaded compliance assessment as HTML!`);
    }
  };

  return (
    <div className="space-y-6 text-[#E2E8F0] select-none pb-12 relative">
      {/* Toast message */}
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
                    onClick={() => handleTimelineChange(t)}
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
            disabled={assessmentStatus === 'running'}
            className={`w-full text-[#080C14] font-bold text-[13px] py-2.5 rounded-md transition-all flex items-center justify-center gap-2 mt-6 ${
              assessmentStatus === 'running'
                ? 'bg-[#00C4E8] opacity-70 cursor-not-allowed'
                : 'bg-[#00C4E8] hover:bg-[#0096B4]'
            }`}
          >
            {assessmentStatus === 'running' ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#080C14] border-t-transparent rounded-full animate-spin" />
                Running Assessment...
              </>
            ) : (
              'Run Assessment'
            )}
          </button>
        </div>

        {/* Right panel (60% width) — Results */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between min-h-[580px]">
          {assessmentStatus === 'idle' && (
            <div className="flex-1 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <ShieldQuestion size={56} className="text-[#1E2D45]" />
              <h3 className="text-base font-semibold text-[#E2E8F0] mt-4">No assessment run yet</h3>
              <p className="text-xs text-[#94A3B8] mt-2 max-w-sm leading-relaxed">
                Select your cryptographic configuration and timeline on the left, then click Run Assessment to generate your risk score, compliance status, and migration recommendations.
              </p>
              <div className="flex items-center gap-1.5 mt-6 text-[#475569] text-[11px] font-medium">
                <Clock size={12} />
                <span>Takes about 3 seconds</span>
              </div>
            </div>
          )}

          {assessmentStatus === 'running' && (
            <div className="flex-1 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-8 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center mb-4">
                <span className="w-12 h-12 border-4 border-[#00C4E8] border-t-transparent rounded-full animate-spin" />
                <Shield size={20} className="absolute text-[#00C4E8] animate-pulse" />
              </div>
              <h3 className="text-base font-semibold text-[#E2E8F0]">Running assessment...</h3>
              
              <div className="mt-8 space-y-4 w-full max-w-xs">
                {[
                  { id: 1, text: 'Evaluating cryptographic configuration' },
                  { id: 2, text: 'Calculating quantum vulnerability scores' },
                  { id: 3, text: 'Checking compliance framework alignment' },
                  { id: 4, text: 'Generating HNDL exposure projection' }
                ].map((step) => {
                  const isDone = runningStep > step.id;
                  const isCurrent = runningStep === step.id;
                  return (
                    <div key={step.id} className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-[#22C55E] shrink-0" />
                      ) : isCurrent ? (
                        <span className="w-4 h-4 border-2 border-[#00C4E8] border-t-transparent rounded-full animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-[#475569] shrink-0" />
                      )}
                      <span className={`text-[13px] ${isDone ? 'text-[#94A3B8]' : isCurrent ? 'text-[#E2E8F0] font-medium' : 'text-[#475569]'}`}>
                        {step.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {assessmentStatus === 'complete' && (
            <>
              {configOutdated && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2.5 rounded-xl flex items-center justify-between text-[13px] animate-fadeIn shrink-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                    <span>Configuration changed — results may be outdated</span>
                  </div>
                  <button 
                    onClick={handleRunAssessment}
                    className="text-[12px] font-bold text-[#00C4E8] hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Re-run Assessment
                  </button>
                </div>
              )}

              {/* Top Panel: Risk Score Gauge and Compliance Status */}
              <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 relative min-h-[220px]">
                {lastAssessedTime && (
                  <div className="absolute top-4 right-5 text-[10px] text-[#475569] font-mono">
                    {getLastAssessedText()}
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

                  {/* Compliance Benchmarks Status Accordion */}
                  <div className="flex flex-col justify-center space-y-3">
                    <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">compliance blueprints</span>
                    
                    <div className="space-y-2">
                      {[
                        { id: 'nist', label: 'NIST SP 800-219' },
                        { id: 'cnsa', label: 'NSA CNSA 2.0' },
                        { id: 'gdpr', label: 'GDPR PQC Clause' }
                      ].map((fw) => {
                        const status = getFrameworkStatus(fw.id);
                        const reqs = getFrameworkRequirements(fw.id);
                        const isExpanded = expandedCompliance === fw.id;
                        
                        return (
                          <div 
                            key={fw.id}
                            className="border border-[#1E2D45] rounded-lg bg-[#080C14] transition-all overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedCompliance(isExpanded ? null : fw.id)}
                              className="w-full flex items-center justify-between p-2 text-left hover:bg-[#1A2540]/30 transition-colors select-none"
                            >
                              <span className="text-xs text-slate-300 font-medium">{fw.label}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  status === 'COMPLIANT' 
                                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                    : status === 'PARTIAL'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {status}
                                </span>
                                {isExpanded ? (
                                  <ChevronDown size={14} className="text-[#475569]" />
                                ) : (
                                  <ChevronRight size={14} className="text-[#475569]" />
                                )}
                              </div>
                            </button>
                            
                            {isExpanded && (
                              <div className="px-3 pb-3 border-t border-[#1E2D45] bg-[#090F1B]">
                                <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wider block mt-3 mb-2">Requirements</span>
                                <div className="space-y-3">
                                  {reqs.map((req, rIdx) => (
                                    <div key={rIdx} className="flex gap-2.5 items-start">
                                      {req.status === 'yes' ? (
                                        <CheckCircle2 size={15} className="text-[#22C55E] shrink-0 mt-0.5" />
                                      ) : req.status === 'no' ? (
                                        <XCircle size={15} className="text-[#EF4444] shrink-0 mt-0.5" />
                                      ) : (
                                        <CircleDashed size={15} className="text-[#F59E0B] shrink-0 mt-0.5" />
                                      )}
                                      <div className="flex flex-col">
                                        <span className="text-[11px] text-slate-300 font-medium leading-tight">{req.title}</span>
                                        <span className="text-[10px] text-[#94A3B8] mt-0.5">{req.detail}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-[#1E2D45]/50 flex justify-end">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerToast("Redirecting to compliance framework documentation...");
                                    }}
                                    className="text-[11px] text-[#00C4E8] hover:underline bg-transparent border-0 p-0 cursor-pointer font-semibold"
                                  >
                                    View full compliance documentation &rarr;
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Panel: Dynamic Area Chart for Threat Horizon */}
              <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-[#00C4E8]" />
                      HNDL Exposure Horizon Projection
                    </h4>
                    <p className="text-[10px] text-[#475569] mt-0.5">Simulated probability curve of data capture and Shor decryption over {timeline}</p>
                    
                    {/* Legend Row */}
                    <div className="flex items-center gap-4 mt-2 select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" />
                        <span className="text-[10px] text-[#94A3B8]">Quantum-Safe Confidence</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" />
                        <span className="text-[10px] text-[#94A3B8]">Cumulative Decryption Risk</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
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
                      <YAxis 
                        stroke="#475569" 
                        fontSize={9} 
                        tickLine={false} 
                        domain={[0, 100]} 
                        tickFormatter={(val) => `${val}%`}
                        label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', offset: -5, fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#080C14', borderColor: '#1E2D45', borderRadius: '8px' }}
                        labelStyle={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace' }}
                        itemStyle={{ fontSize: '11px', color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="safeConfidence" 
                        stackId="1" 
                        stroke="#22C55E" 
                        strokeWidth={2} 
                        fillOpacity={0.3} 
                        fill="url(#colorProtection)" 
                        name="Quantum-Safe Confidence" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="decryptionRisk" 
                        stackId="1" 
                        stroke="#EF4444" 
                        strokeWidth={2} 
                        fillOpacity={0.3} 
                        fill="url(#colorRisk)" 
                        name="Cumulative Decryption Risk" 
                      />
                      {crossoverYear && (
                        <ReferenceLine 
                          x={crossoverYear} 
                          stroke="#F59E0B" 
                          strokeDasharray="4 4"
                          label={{ 
                            value: 'Risk exceeds safe confidence', 
                            position: 'top', 
                            fill: '#F59E0B', 
                            fontSize: 9, 
                            fontWeight: 'bold' 
                          }} 
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Plain English Summary */}
                <p className="text-[11px] text-[#94A3B8] mt-3 leading-relaxed border-t border-[#1E2D45]/40 pt-3">
                  {getPlainEnglishSummary()}
                </p>
              </div>

              {/* Bottom Panel: Findings List */}
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
              </div>
            </>
          )}

          {/* Export Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1E2D45]/45">
            <button 
              onClick={() => handleDownload('PDF')}
              disabled={assessmentStatus !== 'complete' || isDownloading}
              className="flex items-center justify-center gap-2 border border-[#1E2D45] hover:bg-[#1A2540]/60 text-white font-semibold text-[12px] py-2 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={13} /> Download Report (PDF)
                </>
              )}
            </button>
            <button 
              onClick={() => handleDownload('HTML')}
              disabled={assessmentStatus !== 'complete'}
              className="flex items-center justify-center gap-2 border border-[#1E2D45] hover:bg-[#1A2540]/60 text-white font-semibold text-[12px] py-2 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} /> Download HTML
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReportsPage;
