import React, { useState } from 'react';
import { ShieldCheck, Zap, Lock, Settings, AlertTriangle, CheckCircle2, Sliders, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  category: 'Encryption' | 'Access' | 'Compliance';
  enabled: boolean;
  severity: 'Critical' | 'High' | 'Medium';
}

const INITIAL_POLICIES: PolicyRule[] = [
  {
    id: 'p1',
    name: 'Block Legacy RSA',
    description: 'Reject any handshake using RSA key size below 3072 bits.',
    category: 'Encryption',
    enabled: true,
    severity: 'Critical'
  },
  {
    id: 'p2',
    name: 'Enforce ML-KEM (Kyber)',
    description: 'Mandate Kyber-768 for all TLS 1.3 key encapsulation.',
    category: 'Encryption',
    enabled: true,
    severity: 'High'
  },
  {
    id: 'p3',
    name: 'Disable Classic ECC',
    description: 'Phase out NIST P-256 in favor of Dilithium2 signatures.',
    category: 'Compliance',
    enabled: false,
    severity: 'High'
  },
  {
    id: 'p4',
    name: 'Multi-Factor PQC Auth',
    description: 'Require quantum-safe hardware tokens for administrative access.',
    category: 'Access',
    enabled: true,
    severity: 'Medium'
  },
  {
    id: 'p5',
    name: 'Zero-Knowledge Auditing',
    description: 'Enable ZK-proofs for cryptographic inventory verification.',
    category: 'Compliance',
    enabled: false,
    severity: 'Medium'
  }
];

const PolicyEngine: React.FC = () => {
  const [policies, setPolicies] = useState<PolicyRule[]>(INITIAL_POLICIES);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Encryption' | 'Access' | 'Compliance'>('All');

  const togglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // Show success notification or logic
    }, 1500);
  };

  const filteredPolicies = activeTab === 'All' 
    ? policies 
    : policies.filter(p => p.category === activeTab);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div className="page-header mb-0">
          <h1 className="page-title">Quantum Policy Engine</h1>
          <p className="page-subtitle">Enforce post-quantum cryptographic standards across your infrastructure.</p>
        </div>
        <button 
          className="btn flex items-center gap-2 px-6 py-3"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Applying Policies...' : <><Save size={18} /> Apply Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="space-y-4">
          <div className="card p-4 space-y-2">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Categories</h3>
            {['All', 'Encryption', 'Access', 'Compliance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === tab ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-white/5 text-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="card p-4 bg-accent/5 border-accent/20">
            <div className="flex items-center gap-2 text-accent mb-2">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Status</span>
            </div>
            <div className="text-2xl font-bold">94%</div>
            <div className="text-[10px] text-muted">Global Compliance Score</div>
          </div>
        </div>

        {/* Policy List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredPolicies.map((policy, index) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={policy.id}
              className={`card p-6 flex items-center justify-between group transition-all ${
                policy.enabled ? 'border-l-4 border-l-accent' : 'opacity-60 grayscale'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  policy.enabled ? 'bg-accent/10 text-accent' : 'bg-white/5 text-muted'
                }`}>
                  {policy.category === 'Encryption' && <Lock size={22} />}
                  {policy.category === 'Access' && <Zap size={22} />}
                  {policy.category === 'Compliance' && <Settings size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{policy.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      policy.severity === 'Critical' ? 'bg-red-500/20 text-red-500' : 
                      policy.severity === 'High' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {policy.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted max-w-xl">{policy.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-muted uppercase mb-1">Status</div>
                  <div className={`text-xs font-bold ${policy.enabled ? 'text-green-500' : 'text-red-500'}`}>
                    {policy.enabled ? 'ENFORCED' : 'DISABLED'}
                  </div>
                </div>
                <button
                  onClick={() => togglePolicy(policy.id)}
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 ${
                    policy.enabled ? 'bg-accent' : 'bg-white/10'
                  }`}
                >
                  <motion.div
                    animate={{ x: policy.enabled ? 28 : 4 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>
            </motion.div>
          ))}

          {filteredPolicies.length === 0 && (
            <div className="card text-center py-20">
              <Sliders size={48} className="mx-auto text-muted mb-4 opacity-20" />
              <p className="text-muted">No policies found for this category.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Visual Enforcement Animation */}
      {saving && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-bg-dark/80 backdrop-blur-md flex flex-col items-center justify-center"
        >
          <div className="relative w-32 h-32 mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck size={48} className="text-accent animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Deploying PQC Policies</h2>
          <p className="text-muted">Updating cryptographic handlers across 14 enterprise nodes...</p>
        </motion.div>
      )}
    </div>
  );
};

export default PolicyEngine;
