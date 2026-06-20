import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw, 
  MoreVertical, 
  Key, 
  FileText, 
  Globe, 
  Layers, 
  AlertTriangle,
  Mail,
  ExternalLink,
  HelpCircle,
  Check
} from 'lucide-react';
import { api } from '../services/api';

interface CryptoAsset {
  id: string;
  name: string;
  type: 'Certificate' | 'Private Key' | 'Symmetric Key' | 'Root CA';
  algorithm: string;
  owner: string;
  status: 'Safe' | 'Vulnerable';
  expiry: string;
}

interface VendorRisk {
  id: string;
  name: string;
  domain: string;
  pqcReadiness: 'Compliant' | 'In Progress' | 'Vulnerable' | 'Unknown';
  riskScore: number; // 0 - 100
  questionnaireStatus: 'Verified' | 'Sent' | 'Overdue' | 'Not Started';
  riskVectors: string[];
}

const INITIAL_ASSETS: CryptoAsset[] = [
  { id: 'AST-001', name: 'Web-TLS-Production', type: 'Certificate', algorithm: 'RSA-2048', owner: 'Infra-Team', status: 'Vulnerable', expiry: '2026-12-01' },
  { id: 'AST-002', name: 'User-Auth-Token-Root', type: 'Private Key', algorithm: 'ECC-P256', owner: 'IAM-Service', status: 'Vulnerable', expiry: '2028-05-15' },
  { id: 'AST-003', name: 'Internal-VPN-Tunnel', type: 'Certificate', algorithm: 'Kyber-768 (PQC)', owner: 'NetSec', status: 'Safe', expiry: '2027-01-10' },
  { id: 'AST-004', name: 'Database-Encryption-Key', type: 'Symmetric Key', algorithm: 'AES-256', owner: 'DB-Admins', status: 'Safe', expiry: '2029-08-22' },
  { id: 'AST-005', name: 'Corporate-Root-CA', type: 'Root CA', algorithm: 'RSA-4096', owner: 'Security-Dept', status: 'Vulnerable', expiry: '2035-10-30' },
  { id: 'AST-006', name: 'Edge-Gateway-Signer', type: 'Certificate', algorithm: 'Dilithium3 (PQC)', owner: 'IoT-Hub', status: 'Safe', expiry: '2026-06-12' },
];

const INITIAL_VENDORS: VendorRisk[] = [
  {
    id: 'VND-001',
    name: 'Cloudflare Inc.',
    domain: 'cloudflare.com',
    pqcReadiness: 'Compliant',
    riskScore: 12,
    questionnaireStatus: 'Verified',
    riskVectors: ['Supports hybrid X25519Kyber768', 'All edge connections PQ-secure']
  },
  {
    id: 'VND-002',
    name: 'Amazon Web Services (AWS)',
    domain: 'aws.amazon.com',
    pqcReadiness: 'In Progress',
    riskScore: 45,
    questionnaireStatus: 'Verified',
    riskVectors: ['Hybrid key exchange in staging KMS', 'Production CloudFront endpoints still classic RSA']
  },
  {
    id: 'VND-003',
    name: 'Stripe Payments',
    domain: 'stripe.com',
    pqcReadiness: 'Vulnerable',
    riskScore: 82,
    questionnaireStatus: 'Overdue',
    riskVectors: ['No public PQC roadmap available', 'All API connections require classical RSA-2048/SHA-256']
  },
  {
    id: 'VND-004',
    name: 'Okta Identity',
    domain: 'okta.com',
    pqcReadiness: 'Vulnerable',
    riskScore: 88,
    questionnaireStatus: 'Sent',
    riskVectors: ['Authentication tokens use legacy SHA-256 signatures', 'No timeline for hybrid JWT integrations']
  },
  {
    id: 'VND-005',
    name: 'Slack Technologies',
    domain: 'slack.com',
    pqcReadiness: 'In Progress',
    riskScore: 38,
    questionnaireStatus: 'Verified',
    riskVectors: ['Testing PQC websocket channels internally', 'External integrations still legacy TLS']
  }
];

export const AssetInventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assets' | 'vendors'>('assets');
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [vendors, setVendors] = useState<VendorRisk[]>(INITIAL_VENDORS);
  const [searchTerm, setSearchTerm] = useState('');
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('AST-001');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sentAlert, setSentAlert] = useState<string | null>(null);

  // States for live HNDL Domain Scanner
  const [scanDomain, setScanDomain] = useState('');
  const [scanningDomain, setScanningDomain] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScanDomain = async () => {
    if (!scanDomain) return;
    setScanningDomain(true);
    setScanResult(null);
    setScanError(null);
    try {
      const response = await api.post('/classical/scan-domain', { domain: scanDomain });
      setScanResult(response.data);
    } catch (err: any) {
      console.error(err);
      setScanError(err.response?.data?.detail || 'Failed to scan domain. Ensure port 443/SSL is open.');
    } finally {
      setScanningDomain(false);
    }
  };


  const selectedVendor = vendors.find(v => v.id === selectedVendorId);
  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  // Asset Rotation
  const handleRotate = (id: string) => {
    setRotatingId(id);
    setTimeout(() => {
      setAssets(prev => prev.map(a => 
        a.id === id 
          ? { ...a, algorithm: a.algorithm.includes('RSA') ? 'Kyber-768 (PQC)' : 'Dilithium3 (PQC)', status: 'Safe' } 
          : a
      ));
      setRotatingId(null);
    }, 1500);
  };

  // Trigger Questionnaire send
  const handleSendQuestionnaire = (id: string) => {
    setSendingEmailId(id);
    setTimeout(() => {
      setVendors(prev => prev.map(v => 
        v.id === id 
          ? { ...v, questionnaireStatus: 'Sent' } 
          : v
      ));
      setSendingEmailId(null);
      setSentAlert("Compliance Questionnaire dispatched to Vendor security contact.");
      setTimeout(() => setSentAlert(null), 3000);
    }, 1200);
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.algorithm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats computation
  const totalAssetsCount = assets.length;
  const vulnerableAssetsCount = assets.filter(a => a.status === 'Vulnerable').length;
  const safeAssetsCount = assets.filter(a => a.status === 'Safe').length;

  const averageVendorRisk = Math.round(vendors.reduce((acc, v) => acc + v.riskScore, 0) / vendors.length);

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00C4E8]/10 flex items-center justify-center text-[#00C4E8]">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Asset & Vendor Compliance</h1>
            <p className="text-sm text-[#94A3B8]">
              Manage internal cryptographic assets and audit third-party software supply chain readiness.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#080C14] border border-[#1E2D45] p-1 rounded-lg">
          <button
            onClick={() => { setActiveTab('assets'); setSearchTerm(''); }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'assets' ? 'bg-[#00C4E8] text-[#080C14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Crypto Assets ({assets.length})
          </button>
          <button
            onClick={() => { setActiveTab('vendors'); setSearchTerm(''); }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'vendors' ? 'bg-[#00C4E8] text-[#080C14]' : 'text-slate-400 hover:text-white'
            }`}
          >
            Supply Chain ({vendors.length})
          </button>
        </div>
      </div>

      {/* Dynamic Status Banner Alerts */}
      {sentAlert && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={14} />
          {sentAlert}
        </div>
      )}

      {/* Executive stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTab === 'assets' ? (
          <>
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">Total Assets</span>
                <span className="text-2xl font-bold text-white font-mono mt-1 block">{totalAssetsCount}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Database size={20} />
              </div>
            </div>
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">Vulnerable</span>
                <span className="text-2xl font-bold text-[#EF4444] font-mono mt-1 block">{vulnerableAssetsCount}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-500/10 text-[#EF4444] flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
            </div>
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">Quantum-Safe</span>
                <span className="text-2xl font-bold text-green-500 font-mono mt-1 block">{safeAssetsCount}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">Vendors Audited</span>
                <span className="text-2xl font-bold text-white font-mono mt-1 block">{vendors.length}</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Globe size={20} />
              </div>
            </div>
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">Avg Supply Chain Risk</span>
                <span className="text-2xl font-bold text-amber-500 font-mono mt-1 block">{averageVendorRisk}%</span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider font-mono">Compliant Vendors</span>
                <span className="text-2xl font-bold text-green-500 font-mono mt-1 block">
                  {vendors.filter(v => v.pqcReadiness === 'Compliant').length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Workspace (Assets Inventory Table vs Vendor Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-fadeIn">
        
        <div className="xl:col-span-3 bg-[#0D1421] border border-[#1E2D45] rounded-xl overflow-hidden">
          {/* Filters header bar */}
          <div className="p-4 border-b border-[#1E2D45] bg-[#0A101A] flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={16} />
              <input
                type="text"
                placeholder={activeTab === 'assets' ? "Search by asset name or algorithm..." : "Search by vendor name..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-[#080C14] border border-[#1E2D45] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C4E8] font-sans"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#080C14] border border-[#1E2D45] text-slate-300 hover:text-white flex items-center gap-1.5 transition">
                <Filter size={14} />
                Filters
              </button>
            </div>
          </div>

          {/* Tab Content 1: Assets List Table */}
          {activeTab === 'assets' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-[#475569] uppercase tracking-wider bg-[#080C14] border-b border-[#1E2D45]">
                    <th className="px-6 py-4">Asset Identification</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Algorithm Signature</th>
                    <th className="px-6 py-4">Compliance Status</th>
                    <th className="px-6 py-4 text-right">Action Handler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D45]/40 text-xs">
                  {filteredAssets.map((asset) => (
                    <tr 
                      key={asset.id} 
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedAssetId === asset.id ? 'bg-[#00C4E8]/5' : 'hover:bg-[#121B2E]/25'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            asset.type === 'Certificate' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                          }`}>
                            {asset.type === 'Certificate' ? <FileText size={16} /> : <Key size={16} />}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{asset.name}</div>
                            <div className="text-[10px] text-[#475569] font-mono">{asset.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-sans">{asset.type}</td>
                      <td className="px-6 py-4 font-mono text-[#00C4E8]">{asset.algorithm}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          asset.status === 'Safe' ? 'text-green-500' : 'text-[#EF4444]'
                        }`}>
                          {asset.status === 'Safe' ? <CheckCircle2 size={13} /> : <ShieldAlert size={13} />}
                          {asset.status === 'Safe' ? 'QUANTUM-SAFE' : 'VULNERABLE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {asset.status === 'Vulnerable' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRotate(asset.id); }}
                            disabled={rotatingId === asset.id}
                            className={`px-3 py-1.5 rounded-lg bg-[#00C4E8]/10 text-[#00C4E8] hover:bg-[#00C4E8]/20 transition flex items-center gap-1.5 text-[11px] font-semibold ml-auto border border-[#00C4E8]/20 ${
                              rotatingId === asset.id ? 'animate-pulse' : ''
                            }`}
                          >
                            <RotateCcw size={12} className={rotatingId === asset.id ? 'animate-spin' : ''} />
                            {rotatingId === asset.id ? 'Rotating...' : 'Rotate to PQC'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredAssets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                        No cryptographic assets matched the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab Content 2: Vendor Risk Grid */}
          {activeTab === 'vendors' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-[#475569] uppercase tracking-wider bg-[#080C14] border-b border-[#1E2D45]">
                    <th className="px-6 py-4">Vendor Entity</th>
                    <th className="px-6 py-4">PQC Compliance</th>
                    <th className="px-6 py-4">Questionnaire Status</th>
                    <th className="px-6 py-4">Supply Chain Risk</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D45]/40 text-xs">
                  {filteredVendors.map((vendor) => {
                    const isSelected = selectedVendorId === vendor.id;
                    
                    return (
                      <tr 
                        key={vendor.id}
                        onClick={() => setSelectedVendorId(vendor.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#00C4E8]/5' : 'hover:bg-[#121B2E]/25'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 text-[#00C4E8] flex items-center justify-center font-bold font-mono">
                              {vendor.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{vendor.name}</div>
                              <div className="text-[10px] text-[#475569] font-mono">{vendor.domain}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            vendor.pqcReadiness === 'Compliant'
                              ? 'text-green-500'
                              : vendor.pqcReadiness === 'In Progress'
                              ? 'text-amber-500'
                              : 'text-[#EF4444]'
                          }`}>
                            {vendor.pqcReadiness === 'Compliant' && <CheckCircle2 size={13} />}
                            {vendor.pqcReadiness === 'In Progress' && <RotateCcw size={13} className="animate-pulse-subtle" />}
                            {vendor.pqcReadiness === 'Vulnerable' && <ShieldAlert size={13} />}
                            {vendor.pqcReadiness}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            vendor.questionnaireStatus === 'Verified'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : vendor.questionnaireStatus === 'Sent'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {vendor.questionnaireStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 bg-[#080C14] h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  vendor.riskScore > 75 ? 'bg-red-500' : vendor.riskScore > 30 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${vendor.riskScore}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-white font-bold">{vendor.riskScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {vendor.questionnaireStatus !== 'Verified' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSendQuestionnaire(vendor.id); }}
                              disabled={sendingEmailId === vendor.id}
                              className="px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white transition flex items-center gap-1 text-[10px] ml-auto border border-[#1E2D45]"
                            >
                              <Mail size={12} />
                              {sendingEmailId === vendor.id ? 'Sending...' : 'Remind Vendor'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredVendors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500 font-mono">
                        No vendor records matched the query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info sidebar Details drawer */}
        <div className="xl:col-span-1 space-y-6">
          {activeTab === 'assets' ? (
            selectedAsset ? (
              <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 min-h-[350px] flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold font-mono text-[#00C4E8] bg-[#080C14] border border-[#1E2D45] px-2 py-0.5 rounded">
                      {selectedAsset.id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      selectedAsset.status === 'Safe' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {selectedAsset.status === 'Safe' ? 'Immune to HNDL' : 'HNDL Vulnerable'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white mt-1">{selectedAsset.name}</h3>
                    <p className="text-[10px] text-[#475569] font-mono mt-0.5">Owner: {selectedAsset.owner}</p>
                  </div>

                  <div className="border-t border-[#1E2D45]/60 pt-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">Signature Algorithm</span>
                      <p className="text-white font-mono text-xs mt-0.5">{selectedAsset.algorithm}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">Expiration Date</span>
                      <p className="text-slate-300 font-mono text-xs mt-0.5">{selectedAsset.expiry}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">Security Risk Vector</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                        {selectedAsset.status === 'Safe' 
                          ? 'This asset is secured with next-generation Post-Quantum Cryptography parameters protecting TLS/handshake negotiations.' 
                          : 'This classical public-key algorithm is vulnerable to "Harvest Now, Decrypt Later" (HNDL) state-sponsored interceptors.'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedAsset.status === 'Vulnerable' && (
                  <button
                    onClick={() => handleRotate(selectedAsset.id)}
                    disabled={rotatingId === selectedAsset.id}
                    className="w-full bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] disabled:opacity-50 transition font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={13} className={rotatingId === selectedAsset.id ? 'animate-spin' : ''} />
                    {rotatingId === selectedAsset.id ? 'Rotating to PQC...' : 'Rotate to PQC'}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 min-h-[350px] flex flex-col justify-center items-center text-center">
                <Database size={32} className="text-[#475569] mb-2" />
                <h3 className="text-sm font-bold text-white mb-1">Asset Audit Center</h3>
                <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                  Click on any cryptographic asset row or select "Rotate to PQC" to view its compliance audit profile.
                </p>
              </div>
            )
          ) : (
            <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 min-h-[350px] flex flex-col justify-between">
              {selectedVendor ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold font-mono text-[#00C4E8] bg-[#080C14] border border-[#1E2D45] px-2 py-0.5 rounded">
                      {selectedVendor.id}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2">{selectedVendor.name}</h3>
                    <a 
                      href={`https://${selectedVendor.domain}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="text-[10px] text-[#475569] hover:text-[#00C4E8] flex items-center gap-1 mt-1 font-mono"
                    >
                      {selectedVendor.domain}
                      <ExternalLink size={10} />
                    </a>
                  </div>

                  <div className="border-t border-[#1E2D45]/60 pt-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">Risk Analysis</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xl font-extrabold font-mono ${
                          selectedVendor.riskScore > 75 ? 'text-red-500' : selectedVendor.riskScore > 30 ? 'text-amber-500' : 'text-green-500'
                        }`}>
                          {selectedVendor.riskScore}%
                        </span>
                        <span className="text-xs text-slate-400">Threat Rating</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block mb-1">Observed Risk Vectors</span>
                      <ul className="space-y-2 pt-1">
                        {selectedVendor.riskVectors.map((vector, idx) => (
                          <li key={idx} className="text-[11px] text-slate-300 leading-relaxed flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C4E8] mt-1 shrink-0"></span>
                            <span>{vector}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {selectedVendor.questionnaireStatus !== 'Verified' && (
                    <button
                      onClick={() => handleSendQuestionnaire(selectedVendor.id)}
                      disabled={sendingEmailId === selectedVendor.id}
                      className="w-full bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] transition font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 mt-4"
                    >
                      <Mail size={13} />
                      {sendingEmailId === selectedVendor.id ? 'Sending...' : 'Send PQC Audit Form'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={18} className="text-[#00C4E8]" />
                    <h3 className="text-sm font-bold text-white">HNDL Threat Auditor</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Test any public domain (e.g. google.com or cloudflare.com) to audit its real-time SSL key exchange and HNDL susceptibility.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <input 
                      type="text" 
                      placeholder="Enter domain (e.g. google.com)" 
                      value={scanDomain}
                      onChange={(e) => setScanDomain(e.target.value)}
                      disabled={scanningDomain}
                      className="w-full bg-[#080C14] border border-[#1E2D45] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00C4E8]"
                    />
                    <button
                      onClick={handleScanDomain}
                      disabled={scanningDomain || !scanDomain}
                      className="w-full bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] disabled:opacity-50 transition font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5"
                    >
                      {scanningDomain ? (
                        <>
                          <RotateCcw size={12} className="animate-spin" />
                          Auditing SSL...
                        </>
                      ) : (
                        <>
                          <Search size={12} />
                          Scan Domain
                        </>
                      )}
                    </button>
                  </div>

                  {scanError && (
                    <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2 mt-2 leading-relaxed">
                      {scanError}
                    </div>
                  )}

                  {scanResult && (
                    <div className="border-t border-[#1E2D45]/60 pt-4 space-y-3 animate-fadeIn text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-white truncate max-w-[120px] font-bold">{scanResult.domain}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          scanResult.hndl_status === 'IMMUNE'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {scanResult.hndl_status === 'IMMUNE' ? 'IMMUNE TO HNDL' : 'VULNERABLE'}
                        </span>
                      </div>

                      <div className="space-y-2 bg-[#080C14] border border-[#1E2D45]/50 rounded-lg p-3">
                        <div className="flex justify-between text-[10px] border-b border-[#1E2D45]/40 pb-1.5 font-mono">
                          <span className="text-slate-500">Key Type:</span>
                          <span className="text-white">{scanResult.key_type} ({scanResult.key_size} bit)</span>
                        </div>
                        <div className="flex justify-between text-[10px] border-b border-[#1E2D45]/40 pb-1.5 font-mono">
                          <span className="text-slate-500">Signature:</span>
                          <span className="text-white truncate max-w-[120px]">{scanResult.signature_algorithm}</span>
                        </div>

                        <div className="pt-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Audit Log</span>
                          <ul className="space-y-1.5">
                            {scanResult.details.map((detail: string, idx: number) => (
                              <li key={idx} className="text-[10px] text-slate-300 leading-relaxed flex items-start gap-1">
                                <span className={`w-1 h-1 rounded-full mt-1 shrink-0 ${
                                  scanResult.hndl_status === 'IMMUNE' ? 'bg-green-400' : 'bg-red-400'
                                }`}></span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => { setScanResult(null); setScanDomain(''); }}
                        className="w-full text-center text-[10px] text-[#00C4E8] hover:underline"
                      >
                        Reset Auditor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AssetInventory;
