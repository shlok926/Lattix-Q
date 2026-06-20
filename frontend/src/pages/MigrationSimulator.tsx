import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  Play, 
  Lock, 
  GitFork, 
  Settings, 
  Layers, 
  AlertTriangle,
  Briefcase,
  Users,
  Compass,
  Globe,
  Cpu,
  TrendingUp,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface TechTreeNode {
  id: string;
  label: string;
  simpleLabel: string;
  description: string;
  simpleDescription: string;
  businessImpact: string;
  track: 'governance' | 'discovery' | 'agility' | 'supplier';
  stage: number;
  status: 'completed' | 'wip' | 'locked';
  prereqs: string[];
  unlocks: string[];
}

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

const INITIAL_NODES: TechTreeNode[] = [
  // Governance Track
  {
    id: 'G1',
    label: 'Establish PQC Taskforce',
    simpleLabel: 'Create Security Team',
    description: 'Appoint quantum-readiness officers and define corporate migration ownership.',
    simpleDescription: 'Appoint a dedicated team of leaders to oversee our transition to quantum-safe systems.',
    businessImpact: 'Ensures clear accountability and ownership, preventing project delays.',
    track: 'governance',
    stage: 1,
    status: 'completed',
    prereqs: [],
    unlocks: ['G2']
  },
  {
    id: 'G2',
    label: 'Formulate Migration Budget',
    simpleLabel: 'Plan Migration Budget',
    description: 'Estimate migration costs across software licenses, infrastructure, and developer training.',
    simpleDescription: 'Calculate the financial cost of updating our systems (developer hours, software licenses).',
    businessImpact: 'Prevents budget overruns and ensures project funding is secured.',
    track: 'governance',
    stage: 2,
    status: 'wip',
    prereqs: ['G1'],
    unlocks: ['G3']
  },
  {
    id: 'G3',
    label: 'NIST Standards Alignment',
    simpleLabel: 'Align with Standards',
    description: 'Review and adopt NIST FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), and FIPS 205 (Falcon) standards into policy.',
    simpleDescription: 'Review and adopt new security standards published by national agencies (NIST).',
    businessImpact: 'Ensures legal compliance and protects against liability issues.',
    track: 'governance',
    stage: 3,
    status: 'locked',
    prereqs: ['G2', 'D2'],
    unlocks: ['G4', 'A3']
  },
  {
    id: 'G4',
    label: 'PQC Policy Rollout',
    simpleLabel: 'Enforce Quantum Policy',
    description: 'Enforce corporate policy requiring all new vendor products to support post-quantum cryptosystems.',
    simpleDescription: 'Make it a corporate rule that all future software must use quantum-safe encryption.',
    businessImpact: 'Stops team from introducing new security vulnerabilities.',
    track: 'governance',
    stage: 4,
    status: 'locked',
    prereqs: ['G3'],
    unlocks: []
  },
  // Discovery Track
  {
    id: 'D1',
    label: 'Discover HTTPS & SSH Keys',
    simpleLabel: 'Scan Website Encryption',
    description: 'Scan internal networks and public endpoints to catalog active RSA and ECC certificates.',
    simpleDescription: 'Scan all our public websites to find current encryption keys and certificates.',
    businessImpact: 'Identifies which external links can be wiretapped by quantum computers.',
    track: 'discovery',
    stage: 1,
    status: 'completed',
    prereqs: [],
    unlocks: ['D2']
  },
  {
    id: 'D2',
    label: 'Build CBOM',
    simpleLabel: 'Inventory Cryptography',
    description: 'Construct a detailed Cryptographic Bill of Materials (CBOM) documenting algorithms in use.',
    simpleDescription: 'Create a master inventory list of all encryption algorithms used in our company.',
    businessImpact: 'Crucial first step; you cannot secure assets you don\'t know you have.',
    track: 'discovery',
    stage: 2,
    status: 'completed',
    prereqs: ['D1'],
    unlocks: ['D3', 'G3', 'A2']
  },
  {
    id: 'D3',
    label: 'Scan Workstation & Databases',
    simpleLabel: 'Scan Internal Systems',
    description: 'Scan local databases, backup servers, and archives for obsolete cryptographic algorithms.',
    simpleDescription: 'Audit internal databases and workstations for legacy encryption.',
    businessImpact: 'Secures private customer records and internal files.',
    track: 'discovery',
    stage: 3,
    status: 'wip',
    prereqs: ['D2'],
    unlocks: ['D4']
  },
  {
    id: 'D4',
    label: 'Identify Hardcoded Ciphers',
    simpleLabel: 'Audit Codebase Locks',
    description: 'Audit production source code files to locate hardcoded private keys and hash configurations.',
    simpleDescription: 'Audit our codebase line-by-line to find weak, hardcoded passwords and encryption keys.',
    businessImpact: 'Fixes structural weaknesses in code before they are exploited.',
    track: 'discovery',
    stage: 4,
    status: 'locked',
    prereqs: ['D3'],
    unlocks: []
  },
  // Agility Track
  {
    id: 'A1',
    label: 'Audit Code Dependencies',
    simpleLabel: 'Audit Third-Party Code',
    description: 'Audit external code libraries and third-party dependencies requiring security updates.',
    simpleDescription: 'Inspect the code we borrow from other companies to see if they need updates.',
    businessImpact: 'Prevents third-party software from breaking our security.',
    track: 'agility',
    stage: 1,
    status: 'completed',
    prereqs: [],
    unlocks: ['A2']
  },
  {
    id: 'A2',
    label: 'Deploy Hybrid SSL/TLS',
    simpleLabel: 'Test Hybrid Security',
    description: 'Integrate hybrid key-exchanges (ECDH + Kyber) in dev/staging load balancers.',
    simpleDescription: 'Deploy a double-locked security system (combining classic and quantum-safe keys) in a test environment.',
    businessImpact: 'Ensures new security works with our systems without causing crashes.',
    track: 'agility',
    stage: 2,
    status: 'wip',
    prereqs: ['A1', 'D2'],
    unlocks: ['A3']
  },
  {
    id: 'A3',
    label: 'NIST Algorithm Fallbacks',
    simpleLabel: 'Configure Backup Keys',
    description: 'Implement secure fallback mechanism allowing seamless negotiation of post-quantum cryptography.',
    simpleDescription: 'Set up automated backup keys in case the new post-quantum algorithms fail.',
    businessImpact: 'Maintains system reliability and uptime during the migration.',
    track: 'agility',
    stage: 3,
    status: 'locked',
    prereqs: ['A2', 'G3'],
    unlocks: ['A4']
  },
  {
    id: 'A4',
    label: 'Full PQC Live Cutover',
    simpleLabel: 'Final Quantum Upgrade',
    description: 'Disable legacy classical cryptosystems entirely and operate solely on post-quantum algorithms.',
    simpleDescription: 'Permanently switch off all old encryption methods and run solely on quantum-safe locks.',
    businessImpact: 'Achieves complete immunity to quantum decryption threats.',
    track: 'agility',
    stage: 4,
    status: 'locked',
    prereqs: ['A3', 'S3'],
    unlocks: []
  },
  // Supplier Track
  {
    id: 'S1',
    label: 'Identify External APIs',
    simpleLabel: 'Map External Vendors',
    description: 'Inventory third-party payment APIs, storage partners, and identity providers.',
    simpleDescription: 'Identify other software partners (like Stripe or cloud storage) that process our data.',
    businessImpact: 'Secures data shared outside our company perimeter.',
    track: 'supplier',
    stage: 1,
    status: 'completed',
    prereqs: [],
    unlocks: ['S2']
  },
  {
    id: 'S2',
    label: 'Survey Cloud Providers',
    simpleLabel: 'Audit Vendor Roadmaps',
    description: 'Analyze compliance roadmaps and SLA commitments from AWS, Azure, and Cloudflare.',
    simpleDescription: 'Ask cloud providers (AWS, Azure) when they will upgrade their systems to support quantum-safe keys.',
    businessImpact: 'Ensures our cloud data is not left exposed by vendor negligence.',
    track: 'supplier',
    stage: 2,
    status: 'wip',
    prereqs: ['S1'],
    unlocks: ['S3']
  },
  {
    id: 'S3',
    label: 'Vendor PQC Mandate',
    simpleLabel: 'Require Vendor Upgrade',
    description: 'Mandate that all external cloud service providers support hybrid key encapsulations by Q4.',
    simpleDescription: 'Legally require all our vendors to support quantum-safe keys by a strict deadline.',
    businessImpact: 'Protects the company from supply chain security leaks.',
    track: 'supplier',
    stage: 3,
    status: 'locked',
    prereqs: ['S2'],
    unlocks: ['A4']
  }
];

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

const TRACKS = [
  { id: 'governance', label: 'Governance & Policy', simpleLabel: '1. Leadership & Budget', color: 'border-amber-500/20 text-amber-400 bg-amber-500/5' },
  { id: 'discovery', label: 'Asset Discovery', simpleLabel: '2. Find Vulnerabilities', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
  { id: 'agility', label: 'Crypto Agility', simpleLabel: '3. Technical Upgrade', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
  { id: 'supplier', label: 'Supplier Compliance', simpleLabel: '4. External Partners', color: 'border-teal-500/20 text-teal-400 bg-teal-500/5' }
];

const TIMELINE_STAGES = [
  { stage: 1, label: 'Preparation', description: 'Establish ownership & map out existing links.' },
  { stage: 2, label: 'Assessment', description: 'Formulate budget, compile CBOM, and analyze third-parties.' },
  { stage: 3, label: 'Hybrid Testing', description: 'Align policies and deploy dual-key configurations.' },
  { stage: 4, label: 'Quantum Immunity', description: 'Establish vendor mandates and cut over to pure PQC.' }
];

export const MigrationSimulator: React.FC = () => {

  const [nodes, setNodes] = useState<TechTreeNode[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('G2');
  const [showArrows, setShowArrows] = useState<boolean>(true);
  const [isExecutiveMode, setIsExecutiveMode] = useState<boolean>(true);
  
  // Country & Tier selection states
  
  
  
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; status: 'completed' | 'wip' | 'locked' }[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  

  // Filter countries by tier
  

  // Calculate overall metrics
  const completedCount = nodes.filter(n => n.status === 'completed').length;
  const wipCount = nodes.filter(n => n.status === 'wip').length;
  const totalCount = nodes.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Determine active timeline stage
  const getActiveTimelineStage = () => {
    if (progressPercent >= 100) return 4;
    if (progressPercent >= 60) return 3;
    if (progressPercent >= 30) return 2;
    return 1;
  };
  const activeTimelineStage = getActiveTimelineStage();

  // Recalculate arrow coordinates
  const updateLines = () => {
    if (!containerRef.current || !showArrows) {
      setLines([]);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const computedLines: typeof lines = [];

    nodes.forEach(node => {
      node.unlocks.forEach(targetId => {
        const sourceEl = document.getElementById(`node-${node.id}`);
        const targetEl = document.getElementById(`node-${targetId}`);

        if (sourceEl && targetEl) {
          const sRect = sourceEl.getBoundingClientRect();
          const tRect = targetEl.getBoundingClientRect();

          const x1 = (sRect.left + sRect.width / 2) - containerRect.left;
          const y1 = (sRect.top + sRect.height / 2) - containerRect.top;
          const x2 = (tRect.left + tRect.width / 2) - containerRect.left;
          const y2 = (tRect.top + tRect.height / 2) - containerRect.top;

          const targetNode = nodes.find(n => n.id === targetId);
          let status: 'completed' | 'wip' | 'locked' = 'locked';
          if (node.status === 'completed' && targetNode?.status === 'completed') {
            status = 'completed';
          } else if (node.status === 'completed') {
            status = 'wip';
          }

          computedLines.push({ x1, y1, x2, y2, status });
        }
      });
    });

    setLines(computedLines);
  };

  useEffect(() => {
    const timer = setTimeout(updateLines, 100);
    window.addEventListener('resize', updateLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLines);
    };
  }, [nodes, showArrows]);

  const handleUpdateStatus = (nodeId: string, nextStatus: 'completed' | 'wip') => {
    setNodes(prevNodes => {
      const newNodes = prevNodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, status: nextStatus };
        }
        return node;
      });

      return newNodes.map(node => {
        if (node.id === nodeId) return node;

        const allPrereqsMet = node.prereqs.every(reqId => {
          const reqNode = newNodes.find(n => n.id === reqId);
          return reqNode?.status === 'completed';
        });

        if (allPrereqsMet && node.status === 'locked') {
          return { ...node, status: 'wip' };
        } else if (!allPrereqsMet && node.status !== 'locked') {
          return { ...node, status: 'locked' };
        }
        return node;
      });
    });
  };

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flow {
          to { stroke-dashoffset: -20; }
        }
        .flow-line-completed {
          stroke-dasharray: 6, 4;
          animation: flow 1s linear infinite;
        }
        .flow-line-wip {
          stroke-dasharray: 4, 4;
          animation: flow 2s linear infinite;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .animate-pulse-subtle {
          animation: pulse-ring 2s infinite ease-in-out;
        }
      `}} />

      {/* Header panel */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00C4E8]/10 flex items-center justify-center text-[#00C4E8]">
            <GitFork size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-sans flex items-center gap-2">
              Migration Roadmap
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00C4E8]/10 text-[#00C4E8] border border-[#00C4E8]/20">
                PQC Compliance
              </span>
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Model internal transition compliance, audit corporate security parameters, and progress toward quantum-safe certification.
            </p>
          </div>
        </div>
      </div>

      <>
          {/* Guide Banner */}
          <div className="bg-[#00C4E8]/5 border border-[#00C4E8]/20 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
            <Compass size={16} className="text-[#00C4E8] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">How to navigate the tree:</strong> All milestones flow from top to bottom. Completed tasks are highlighted in <span className="text-green-400 font-semibold">green</span>. Active tasks currently in progress are in <span className="text-amber-400 font-semibold">amber (pulsing)</span>. Locked tasks await completion of earlier milestones and display a <span className="text-slate-500 font-semibold">padlock icon</span>. Click any node to view details or toggle progress.
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div ref={containerRef} className="xl:col-span-3 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 relative overflow-hidden min-h-[640px] select-none">
              {showArrows && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <marker id="arrow-completed" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#22C55E" />
                    </marker>
                    <marker id="arrow-wip" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#F59E0B" />
                    </marker>
                    <marker id="arrow-locked" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#1E2D45" />
                    </marker>
                  </defs>
                  {lines.map((line, idx) => (
                    <line
                      key={idx}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke={line.status === 'completed' ? '#22C55E' : line.status === 'wip' ? '#F59E0B' : '#1E2D45'}
                      strokeWidth={2}
                      markerEnd={`url(#arrow-${line.status})`}
                      className={`transition-all duration-300 ${
                        line.status === 'completed' 
                          ? 'flow-line-completed' 
                          : line.status === 'wip' 
                          ? 'flow-line-wip' 
                          : ''
                      }`}
                    />
                  ))}
                </svg>
              )}

              <div className="grid grid-cols-4 h-full relative z-10 gap-4">
                {TRACKS.map(track => {
                  const trackNodes = nodes.filter(n => n.track === track.id).sort((a, b) => a.stage - b.stage);
                  return (
                    <div key={track.id} className="flex flex-col gap-6 items-center">
                      <div className={`w-full py-2 px-3 border rounded text-center text-[10px] font-extrabold uppercase tracking-widest ${track.color}`}>
                        {isExecutiveMode ? track.simpleLabel : track.label}
                      </div>

                      <div className="flex flex-col gap-14 w-full pt-4">
                        {trackNodes.map(node => {
                          const isSelected = selectedNodeId === node.id;
                          return (
                            <div
                              key={node.id}
                              id={`node-${node.id}`}
                              onClick={() => setSelectedNodeId(node.id)}
                              className={`w-full p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 relative group ${
                                node.status === 'completed'
                                  ? 'bg-[#22C55E]/5 border-green-500 hover:bg-[#22C55E]/10'
                                  : node.status === 'wip'
                                  ? 'bg-amber-500/5 border-amber-500 hover:bg-amber-500/10 border-dashed animate-pulse-subtle'
                                  : 'bg-[#080C14] border-[#1E2D45] text-slate-500 hover:border-slate-700'
                              } ${isSelected ? 'ring-2 ring-[#00C4E8] ring-offset-2 ring-offset-[#0D1421]' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-mono font-bold bg-[#080C14] px-1.5 py-0.5 rounded border border-[#1E2D45]">
                                  Step {node.stage}
                                </span>
                                {node.status === 'completed' && <CheckCircle2 size={13} className="text-green-500" />}
                                {node.status === 'wip' && <Play size={10} className="text-amber-500 fill-amber-500" />}
                                {node.status === 'locked' && <Lock size={10} className="text-slate-600" />}
                              </div>

                              <h3 className={`text-xs font-bold leading-snug ${node.status === 'locked' ? 'text-slate-600' : 'text-white'}`}>
                                {isExecutiveMode ? node.simpleLabel : node.label}
                              </h3>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {/* Controls Toggle inside Sidebar */}
              <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 space-y-3">
                <span className="text-[9px] font-mono text-[#475569] uppercase block font-bold">Display Settings</span>
                <button
                  onClick={() => { setIsExecutiveMode(!isExecutiveMode); setTimeout(updateLines, 100); }}
                  className={`w-full py-2 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                    isExecutiveMode 
                      ? 'bg-[#00C4E8] text-[#080C14] border-transparent' 
                      : 'bg-transparent text-slate-400 border-[#1E2D45] hover:text-white'
                  }`}
                >
                  {isExecutiveMode ? <Briefcase size={13} /> : <Users size={13} />}
                  {isExecutiveMode ? 'Executive Mode' : 'Technical Mode'}
                </button>
                <button
                  onClick={() => setShowArrows(!showArrows)}
                  className={`w-full py-2 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-2 ${
                    showArrows 
                      ? 'bg-[#00C4E8]/10 text-[#00C4E8] border-[#00C4E8]/30 hover:bg-[#00C4E8]/20' 
                      : 'bg-transparent text-[#475569] border-[#1E2D45] hover:text-[#94A3B8]'
                  }`}
                >
                  <GitFork size={13} />
                  {showArrows ? 'Hide Flowlines' : 'Show Flowlines'}
                </button>
              </div>

              <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-[#00C4E8]" size={16} />
                  Overall Maturity
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-3xl font-extrabold text-white font-mono">{progressPercent}%</span>
                    <span className="text-xs text-[#94A3B8]">Maturity Score</span>
                  </div>
                  <div className="w-full bg-[#080C14] h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#00C4E8] h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-[#1E2D45]/60 pt-4">
                  <div>
                    <span className="text-[#475569] font-mono block">COMPLETED</span>
                    <span className="text-white font-bold">{completedCount} / {totalCount}</span>
                  </div>
                  <div>
                    <span className="text-[#475569] font-mono block">IN PROGRESS</span>
                    <span className="text-white font-bold">{wipCount} active</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 min-h-[360px] flex flex-col justify-between">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#1E2D45] bg-[#080C14] text-white">
                          Milestone {selectedNode.id}
                        </span>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${
                          selectedNode.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : selectedNode.status === 'wip'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {selectedNode.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-2 leading-snug">
                        {isExecutiveMode ? selectedNode.simpleLabel : selectedNode.label}
                      </h3>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wider block">Description</span>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        {isExecutiveMode ? selectedNode.simpleDescription : selectedNode.description}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wider block">Why This Matters</span>
                      <p className="text-xs text-[#00C4E8] leading-relaxed italic">
                        {selectedNode.businessImpact}
                      </p>
                    </div>

                    <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-[#475569]">Prerequisites:</span>
                        <span className="text-white font-mono">
                          {selectedNode.prereqs.map(pId => {
                            const target = nodes.find(n => n.id === pId);
                            return target ? (isExecutiveMode ? target.simpleLabel : target.label) : pId;
                          }).join(', ') || 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#475569]">Unlocks:</span>
                        <span className="text-white font-mono">
                          {selectedNode.unlocks.map(pId => {
                            const target = nodes.find(n => n.id === pId);
                            return target ? (isExecutiveMode ? target.simpleLabel : target.label) : pId;
                          }).join(', ') || 'None'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      {selectedNode.status === 'wip' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedNode.id, 'completed')}
                          className="w-full bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] transition font-semibold text-xs py-2 rounded-lg"
                        >
                          Mark as Completed
                        </button>
                      )}
                      {selectedNode.status === 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedNode.id, 'wip')}
                          className="w-full bg-transparent border border-amber-500/30 text-amber-400 hover:bg-amber-500/5 transition font-semibold text-xs py-2 rounded-lg"
                        >
                          Re-open / Set In-Progress
                        </button>
                      )}
                      {selectedNode.status === 'locked' && (
                        <div className="text-center text-[10px] text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5 flex items-center gap-1.5 justify-center">
                          <AlertTriangle size={12} />
                          Complete prerequisites to unlock.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <HelpCircle size={28} className="text-[#475569] mb-2" />
                    <span className="text-[#475569] text-xs font-mono">Select a Milestone Node</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Corporate Timeline Phases */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="text-[#00C4E8] animate-spin" style={{ animationDuration: '6s' }} size={16} />
              Enterprise Transition Roadmap Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {TIMELINE_STAGES.map(stage => {
                const isActive = activeTimelineStage === stage.stage;
                const isCompleted = activeTimelineStage > stage.stage;
                return (
                  <div 
                    key={stage.stage} 
                    className={`p-4 rounded-xl border relative transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#00C4E8]/5 border-[#00C4E8]' 
                        : isCompleted 
                        ? 'bg-green-500/5 border-green-500/50' 
                        : 'bg-[#080C14] border-[#1E2D45]/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isActive ? 'text-[#00C4E8]' : isCompleted ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        Phase {stage.stage}
                      </span>
                      {isCompleted && <CheckCircle2 size={13} className="text-green-500" />}
                      {isActive && <Play size={10} className="text-[#00C4E8] fill-[#00C4E8]" />}
                    </div>
                    <h3 className={`text-xs font-bold ${isActive || isCompleted ? 'text-white' : 'text-slate-400'}`}>
                      {stage.label}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-normal mt-1.5">
                      {stage.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>

    </div>
  );
};

export default MigrationSimulator;
