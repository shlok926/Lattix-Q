import React, { useState } from 'react';
import { 
  Globe, 
  TrendingUp, 
  AlertCircle, 
  HelpCircle,
  Cpu,
  Layers
} from 'lucide-react';

interface CountryData {
  name: string;
  code: string;
  tier: 1 | 2 | 3 | 4;
  strategy: string;
  funding: string;
  pqcMandate: string;
  activeQubits: string;
  qubitType: string;
  keyPlayers: string[];
  crqcPrediction: string;
  notes: string;
}

interface CorporateRoadmap {
  company: string;
  country: string;
  modality: string;
  currentQubits: string;
  currentLogicalQubits: string;
  targetYear: string;
  targetMilestone: string;
  predictionConfidence: string;
}

interface PQCDeadline {
  entity: string;
  deadline: string;
  approach: string;
  enforcement: 'Hard Law' | 'Recommendation' | 'Strategic Target';
}

const GLOBAL_COUNTRIES: CountryData[] = [
  {
    name: 'United States',
    code: 'US',
    tier: 1,
    strategy: 'National Security Memorandum (NSM-10) / CNSA 2.0 Directives',
    funding: '$1.8B (2025-2029 reauthorization) + $625M DOE centers',
    pqcMandate: 'CNSA 2.0 mandates full PQC for National Security Systems by 2035; May 2026 starts implementation',
    activeQubits: '1,121 physical (Condor superconducting)',
    qubitType: 'Superconducting & Trapped-Ion',
    keyPlayers: ['IBM Quantum', 'Google Quantum AI', 'Microsoft', 'IonQ', 'PsiQuantum'],
    crqcPrediction: '2029 - 2032',
    notes: 'Google Willow demonstrated logical qubits below error threshold in Dec 2024. IBM Condor (1,121 qubits) active.'
  },
  {
    name: 'China',
    code: 'CN',
    tier: 1,
    strategy: 'National Laboratory for Quantum Information Sciences & CAS Coordinate',
    funding: '$10B+ (Estimated total state commitment)',
    pqcMandate: 'Sovereign PQC standard development by ~2029 (independent of NIST); heavy focus on satellite QKD networks',
    activeQubits: '180 physical (Origin Wukong-180 superconducting, May 2026)',
    qubitType: 'Superconducting, Photonic & QKD communication grid',
    keyPlayers: ['USTC Academy', 'Origin Quantum', 'QuantumCTek', 'Tencent Quantum Lab'],
    crqcPrediction: '2030 - 2033',
    notes: 'Focus on full indigenously developed stack (Wukong has chip, control, OS) and Beijing-Shanghai communication backbone.'
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    tier: 2,
    strategy: 'National Quantum Strategy & ProQure Program',
    funding: '£2.5B over 2024-2034 + £2B ProQure fund',
    pqcMandate: 'NCSC advisory published; general begin migration now strategy with regulatory pressure in finance',
    activeQubits: '256 physical (IonQ Cambridge facility)',
    qubitType: 'Trapped-Ion & Neutral Atom',
    keyPlayers: ['Quantinuum', 'ORCA Computing', 'Oxford Quantum Circuits'],
    crqcPrediction: '2031 - 2034',
    notes: 'Quantinuum Helios demonstrated 48 verified logical qubits (Nov 2025) - highest fidelity logical encoding to date.'
  },
  {
    name: 'Germany',
    code: 'DE',
    tier: 2,
    strategy: 'Munich Quantum Valley & Federal Initiatives',
    funding: '€2.0B national program + €380M Munich cluster',
    pqcMandate: 'BSI recommendations; aligned to EU NIS Cooperation Group roadmaps',
    activeQubits: '100+ physical (Neutral-atom & superconducting)',
    keyPlayers: ['Max Planck Institute', 'TU Munich', 'IQM'],
    qubitType: 'Neutral Atoms & Superconducting',
    crqcPrediction: '2032 - 2035',
    notes: 'Government targeting universal quantum computer prototype. IQM is leading deployment supplier.'
  },
  {
    name: 'France',
    code: 'FR',
    tier: 2,
    strategy: 'National Quantum Strategy (Focus on Digital Sovereignty)',
    funding: '€1.8B (€1B public + €800M private)',
    pqcMandate: 'ANSSI sets 2030 as hard horizon for critical infrastructure PQC migration',
    activeQubits: '100+ qubits (Pasqal neutral-atom)',
    qubitType: 'Neutral Atoms & Superconducting',
    keyPlayers: ['Pasqal', 'Alice & Bob'],
    crqcPrediction: '2032 - 2035',
    notes: 'ANSSI timeline is one of the most aggressive G7 / EU national mandates.'
  },
  {
    name: 'Canada',
    code: 'CA',
    tier: 2,
    strategy: 'Defence Industrial Strategy & Canadian Quantum Champions Program',
    funding: 'C$334M + $92M Quantum Champions + $68M BOREALIS agency',
    pqcMandate: 'ITSM.40.001: Plans by April 2026, high-priority migrated by 2031, full transition by 2035',
    activeQubits: 'Photonic & Superconducting prototypes',
    qubitType: 'Photonic & Superconducting',
    keyPlayers: ['Xanadu', 'Anyon Systems', 'Nord Quantique', 'D-Wave'],
    crqcPrediction: '2031 - 2034',
    notes: 'Xanadu went public on Nasdaq/TSX (March 2026). First concrete G7 sovereign PQC deadline published.'
  },
  {
    name: 'India',
    code: 'IN',
    tier: 3,
    strategy: 'National Quantum Mission (NQM) & Amaravati Quantum Valley',
    funding: '₹6,003.65 Crore (~$735M allocated)',
    pqcMandate: 'DST/NQM Quantum-Safe roadmap (Feb 2026) prioritizing Aadhaar and UPI migration',
    activeQubits: '25 physical (QpiAI Indus, Apr 2025) / Kaveri 64-qubit (2026)',
    qubitType: 'Superconducting & Ion Trap systems',
    keyPlayers: ['QpiAI', 'QNu Labs', 'IISc Quantum Lab', 'TIFR'],
    crqcPrediction: '2033 - 2036',
    notes: 'QpiAI targeting 100 logical qubits by 2030. Amaravati Quantum Valley partnering with IBM for a System Two anchor.'
  },
  {
    name: 'Russia',
    code: 'RU',
    tier: 3,
    strategy: 'Rosatom Quantum Computing National Roadmap',
    funding: '24 Billion Rubles spent through 2024',
    pqcMandate: 'Independent transition framework; domestic cryptographic implementation',
    activeQubits: '72 physical (Neutral-atom MSU prototype, Dec 2025)',
    qubitType: 'Superconducting, Ion-Trap, Neutral-Atom, Photonic',
    keyPlayers: ['Moscow State University', 'Rosatom research groups'],
    crqcPrediction: '2031 - 2034',
    notes: 'One of only three nations to operate processors across all four major modalities.'
  },
  {
    name: 'Australia',
    code: 'AU',
    tier: 3,
    strategy: 'National Quantum Strategy & ASD Cybersecurity Directives',
    funding: 'AU$2.3B+ cumulative investment',
    pqcMandate: 'ASD mandates classical public-key cryptography must not be used beyond end of 2030',
    activeQubits: 'Silicon & Photonic research systems',
    qubitType: 'Silicon qubits & Photonics',
    keyPlayers: ['Silicon Quantum Computing', 'University of Sydney'],
    crqcPrediction: '2031 - 2034',
    notes: 'ASD mandates transition plans by end of 2026, critical systems migration by 2028.'
  }
];

const CORPORATE_ROADMAPS: CorporateRoadmap[] = [
  {
    company: 'IBM Quantum',
    country: 'US',
    modality: 'Superconducting',
    currentQubits: '1,121 physical (Condor)',
    currentLogicalQubits: '0 (Starling target: 200 by 2029)',
    targetYear: '2029 (Starling) / 2033 (Blue Jay)',
    targetMilestone: 'Fault-tolerant 200 logical qubits scaling to 2,000 logical qubits by 2033+',
    predictionConfidence: 'High (Consistent milestones execution)'
  },
  {
    company: 'Google Quantum AI',
    country: 'US',
    modality: 'Superconducting',
    currentQubits: '105 physical (Willow)',
    currentLogicalQubits: '1 logical qubit (below error threshold, Dec 2024)',
    targetYear: '2029 - 2030',
    targetMilestone: '1 Million physical qubits with fault-tolerant error correction',
    predictionConfidence: 'Medium (Requires massive physical error-correction steps)'
  },
  {
    company: 'Quantinuum',
    country: 'US/UK',
    modality: 'Trapped-Ion',
    currentQubits: '98 physical (Helios)',
    currentLogicalQubits: '48 verified logical qubits (Nov 2025)',
    targetYear: '2029 - 2030',
    targetMilestone: 'Hundreds of logical qubits operating at utility-scale',
    predictionConfidence: 'High (Currently holds the best logical qubit encoding ratio)'
  },
  {
    company: 'QuEra',
    country: 'US',
    modality: 'Neutral Atom',
    currentQubits: '448 atoms',
    currentLogicalQubits: '96 logical qubits (encoded, Jan 2026)',
    targetYear: '2028 - 2030',
    targetMilestone: 'Deploy large-scale fault tolerant logical gate operations',
    predictionConfidence: 'Medium-High (Nature-validated error-suppression results)'
  },
  {
    company: 'QpiAI',
    country: 'India',
    modality: 'Superconducting',
    currentQubits: '25 (Indus) / 64 (Kaveri roadmap)',
    currentLogicalQubits: '0',
    targetYear: '2030',
    targetMilestone: '100 logical qubits targeted on Kaveri architecture series',
    predictionConfidence: 'Medium'
  }
];

const PQC_DEADLINES: PQCDeadline[] = [
  { entity: 'Canada (ITSM.40.001)', deadline: 'April 2026', approach: 'Departmental plans due; regular progress audits', enforcement: 'Hard Law' },
  { entity: 'United States (CNSA 2.0)', deadline: 'May 2026', approach: 'Enterprise migration start point for all national security domains', enforcement: 'Hard Law' },
  { entity: 'European Union (NIS Co-op)', deadline: 'Dec 2026', approach: 'Initial national roadmaps finalized across member states', enforcement: 'Strategic Target' },
  { entity: 'Australia (ASD)', deadline: 'Dec 2026', approach: 'Refined transition plans must be finalized for critical systems', enforcement: 'Hard Law' },
  { entity: 'France (ANSSI)', deadline: 'Dec 2030', approach: 'Critical infrastructure PQC migration hard horizon', enforcement: 'Hard Law' },
  { entity: 'Australia (ASD)', deadline: 'Dec 2030', approach: 'Classical public-key cryptography banned; complete transition', enforcement: 'Hard Law' },
  { entity: 'Canada (ITSM.40.001)', deadline: 'Dec 2031', approach: 'High-priority systems completely migrated', enforcement: 'Hard Law' },
  { entity: 'United States (CNSA 2.0)', deadline: 'Dec 2035', approach: 'Full transition to CNSA 2.0 algorithms completed', enforcement: 'Hard Law' },
  { entity: 'European Union (NIS Co-op)', deadline: 'Dec 2035', approach: 'Full transition across member states completed', enforcement: 'Strategic Target' }
];

export const GlobalRaceTracker: React.FC = () => {
  const [selectedCountryName, setSelectedCountryName] = useState<string>('India');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 1 | 2 | 3>('all');

  const selectedCountry = GLOBAL_COUNTRIES.find(c => c.name === selectedCountryName);

  const filteredCountries = GLOBAL_COUNTRIES.filter(c => 
    selectedTierFilter === 'all' || c.tier === selectedTierFilter
  );

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00C4E8]/10 flex items-center justify-center text-[#00C4E8]">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-sans flex items-center gap-2">
              Global Quantum Race Tracker
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00C4E8]/10 text-[#00C4E8] border border-[#00C4E8]/20">
                June 2026 Intelligence
              </span>
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Track the real-world international quantum computing race, Q-Day predictions, and physical/logical qubit progress.
            </p>
          </div>
        </div>
      </div>

      {/* Top band: Q-Day Probability Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 shrink-0 rounded-full border-4 border-dashed border-[#EF4444] flex flex-col items-center justify-center text-center animate-spin" style={{ animationDuration: '20s' }}>
            <span className="text-[#EF4444] text-xs font-bold font-mono uppercase tracking-wider">CRQC</span>
            <span className="text-white text-lg font-extrabold font-mono">2030+</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertCircle className="text-[#EF4444]" size={16} />
              Global Q-Day Consensus Estimate: 2030 - 2035
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              A <strong>Cryptographically Relevant Quantum Computer (CRQC)</strong> capable of decrypting classic RSA/ECC keys is estimated by the Global Risk Institute (GRI) 2026 expert survey to have a <strong className="text-white">28–49% probability</strong> within 10 years, rising to <strong className="text-white">51–70%</strong> within 15 years.
            </p>
          </div>
        </div>

        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col justify-between">
          <span className="text-[9px] font-mono text-[#475569] uppercase block font-bold">Best Logical Qubit Count Achieved</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-white font-mono">48</span>
            <span className="text-xs text-slate-400">Verified Qubits (Quantinuum Helios, Nov 2025)</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal mt-2">
            QuEra achieved 96 logical qubits in Jan 2026 with looser error-mitigation parameters.
          </p>
        </div>
      </div>

      {/* Interactive World Map / Country Cards and details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Country strategy scorecards */}
        <div className="xl:col-span-2 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe size={16} className="text-[#00C4E8]" />
              International Strategy Scorecards
            </h2>
            {/* Tier Filter tabs */}
            <div className="flex bg-[#080C14] border border-[#1E2D45] p-0.5 rounded-lg text-[10px]">
              {(['all', 1, 2, 3] as const).map(tier => (
                <button
                  key={tier}
                  onClick={() => setSelectedTierFilter(tier)}
                  className={`px-2.5 py-1 rounded transition ${
                    selectedTierFilter === tier ? 'bg-[#00C4E8] text-[#080C14] font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tier === 'all' ? 'All Tiers' : `Tier ${tier}`}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of filtered countries */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredCountries.map(country => {
              const isSelected = selectedCountryName === country.name;
              return (
                <div
                  key={country.name}
                  onClick={() => setSelectedCountryName(country.name)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                    isSelected 
                      ? 'bg-[#00C4E8]/5 border-[#00C4E8] text-white' 
                      : 'bg-[#080C14] border-[#1E2D45] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xl font-bold font-mono text-slate-500">{country.code}</span>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      country.tier === 1 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : country.tier === 2 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      T{country.tier}
                    </span>
                  </div>
                  <div className="text-xs font-bold leading-tight">{country.name}</div>
                </div>
              );
            })}
          </div>

          {/* Selected Country Details Profile */}
          {selectedCountry && (
            <div className="bg-[#080C14] border border-[#1E2D45] rounded-xl p-5 space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-[#1E2D45]/60 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#00C4E8]">{selectedCountry.name} Profile</h3>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                    Tier {selectedCountry.tier}
                  </span>
                </div>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-[#EF4444]/20 text-[#EF4444] bg-[#EF4444]/5">
                  CRQC TARGET: {selectedCountry.crqcPrediction}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
                <div className="space-y-3">
                  <div>
                    <span className="text-[#475569] font-mono text-[9px] uppercase block">National Strategy</span>
                    <p className="text-white font-medium mt-0.5">{selectedCountry.strategy}</p>
                  </div>
                  <div>
                    <span className="text-[#475569] font-mono text-[9px] uppercase block">Allocated Funding</span>
                    <p className="text-[#22C55E] font-bold font-mono mt-0.5">{selectedCountry.funding}</p>
                  </div>
                  <div>
                    <span className="text-[#475569] font-mono text-[9px] uppercase block">Active Hardware Power</span>
                    <p className="text-white font-medium mt-0.5">{selectedCountry.activeQubits}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[#475569] font-mono text-[9px] uppercase block">PQC Transition Mandate</span>
                    <p className="text-slate-300 mt-0.5">{selectedCountry.pqcMandate}</p>
                  </div>
                  <div>
                    <span className="text-[#475569] font-mono text-[9px] uppercase block">Preferred Hardware Modality</span>
                    <p className="text-slate-300 mt-0.5">{selectedCountry.qubitType}</p>
                  </div>
                  <div>
                    <span className="text-[#475569] font-mono text-[9px] uppercase block">Key Ecosystem Players</span>
                    <p className="text-[#00C4E8] font-bold mt-0.5">{selectedCountry.keyPlayers.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1E2D45]/60 pt-3 text-[10px] text-slate-500 leading-normal">
                <strong>Intelligence Note:</strong> {selectedCountry.notes}
              </div>
            </div>
          )}
        </div>

        {/* PQC Deadlines Radar */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertCircle size={16} className="text-[#EF4444]" />
            Regulatory Deadlines Radar
          </h2>
          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-2">
            {PQC_DEADLINES.map((dl, idx) => (
              <div key={idx} className="bg-[#080C14] border border-[#1E2D45]/60 p-3 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white leading-none">{dl.entity}</span>
                  <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded font-bold leading-none ${
                    dl.enforcement === 'Hard Law' 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : dl.enforcement === 'Recommendation' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {dl.enforcement}
                  </span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#94A3B8]">Target Horizon:</span>
                  <span className="text-white font-bold font-mono">{dl.deadline}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal italic">
                  "{dl.approach}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Roadmap & Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers size={16} className="text-[#00C4E8]" />
            Commercial Hardware Roadmaps
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1E2D45] text-[#475569] uppercase font-mono text-[9px] tracking-wider">
                  <th className="py-2.5 px-3">Ecosystem Provider</th>
                  <th className="py-2.5 px-3">Modality</th>
                  <th className="py-2.5 px-3">Active Scale</th>
                  <th className="py-2.5 px-3">Logical Qubits</th>
                  <th className="py-2.5 px-3">Target Date</th>
                  <th className="py-2.5 px-3">Next Milestone Goal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D45]/60 text-slate-300">
                {CORPORATE_ROADMAPS.map(corp => (
                  <tr key={corp.company} className="hover:bg-[#080C14]/60 transition">
                    <td className="py-3 px-3 font-bold text-white">{corp.company} <span className="text-[9px] text-slate-500 font-mono">({corp.country})</span></td>
                    <td className="py-3 px-3">{corp.modality}</td>
                    <td className="py-3 px-3 font-mono text-[#00C4E8]">{corp.currentQubits}</td>
                    <td className="py-3 px-3 font-mono">{corp.currentLogicalQubits}</td>
                    <td className="py-3 px-3 text-[#EF4444] font-bold font-mono">{corp.targetYear}</td>
                    <td className="py-3 px-3 max-w-xs text-[11px] leading-relaxed">{corp.targetMilestone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Qubit Race timeline projection */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-[#00C4E8]" />
            Observed Qubit Milestones
          </h2>
          <div className="relative border-l border-[#1E2D45] ml-2 pl-4 space-y-5 text-xs text-slate-400">
            <div className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="font-bold text-white">2023 - 2024: Era of 1,000 Qubits</span>
              <p className="mt-1">IBM launches 1,121 physical qubit Eagle processor. NIST finalizes draft FIPS guidelines.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-bold text-white">2026 - 2027: Staging Error Correction</span>
              <p className="mt-1">Google & PsiQuantum test first scalable logical qubit arrays with physical cooling rigs.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span className="font-bold text-white">2029 - 2030: The Logical Qubit Threshold</span>
              <p className="mt-1">Initial logical processors reach commercial staging. RSA-2048 keys targets for breaking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalRaceTracker;
