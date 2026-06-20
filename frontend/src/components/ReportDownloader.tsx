import { useState } from 'react';
import { Download, Brain, FileJson, FileText, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export default function ReportDownloader() {
  const [loading, setLoading] = useState<string | null>(null);

  // ── AI Enrichment state ─────────────────────────────────────────────────────
  const [code, setCode]         = useState('');
  const [filename, setFilename] = useState('main.py');
  const [scanned, setScanned]   = useState(false);
  const [scanning, setScanning] = useState(false);
  const [aiData, setAiData]     = useState<any>(null);   // { readiness_score, findings, roadmap }

  // ── Step 1: AI Scan ─────────────────────────────────────────────────────────
  const runScan = async () => {
    if (!code) return;
    setScanning(true);
    setScanned(false);
    try {
      const scanRes = await api.post('/ai/scan', { filename, content: code });
      const { findings, score } = scanRes.data;
      let roadmap = {};
      if (findings.length > 0) {
        const rmRes = await api.post('/ai/roadmap', { findings });
        roadmap = rmRes.data;
      }
      setAiData({ readiness_score: score, findings, roadmap });
      setScanned(true);
    } catch (e) { console.error(e); }
    finally { setScanning(false); }
  };

  // ── Step 2: Download Report ─────────────────────────────────────────────────
  const downloadReport = async (format: 'json' | 'pdf') => {
    setLoading(format);
    try {
      const payload = {
        system_info: {
          name: "QuantumShield Primary Assessment",
          files_scanned: 1,
          algorithms: [
            { algorithm: "RSA",  key_size: 2048 },
            { algorithm: "ECC",  key_size: 256  },
            { algorithm: "AES",  key_size: 256  },
          ]
        },
        sim_data: [],
        bench_data: [],
        ai_enrichment: aiData || { readiness_score: 100, findings: [], roadmap: {} }
      };

      const res = await api.post(
        `/report/generate/${format}`,
        payload,
        { responseType: format === 'pdf' ? 'blob' : 'json' }
      );

      if (format === 'pdf') {
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', 'QuantumShield_Audit_Report.pdf');
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const json = JSON.stringify(res.data, null, 2);
        const a = document.createElement('a');
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(json);
        a.setAttribute('download', 'QuantumShield_Audit_Report.json');
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) {
      console.error(e);
      alert('Report generation failed. Check services are running.');
    }
    setLoading(null);
  };

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="page-title">Audit Report Generator</h1>
        <p className="page-subtitle">
          AI-enriched, audit-grade reports — scan your code first, then export a professional PDF or JSON.
        </p>
      </div>

      {/* ── Step 1: Code Scan ─────────────────────────────────────────────── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">1</div>
          <h2 className="text-lg font-bold">AI Code Scan  <span className="text-muted text-sm font-normal ml-2">— optional but recommended</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label">Filename</label>
            <input className="form-input" value={filename}
              onChange={e => setFilename(e.target.value)} placeholder="e.g. crypto.py" />
          </div>
          <div className="form-group lg:col-span-2">
            <label className="form-label">Source Code to Scan</label>
            <textarea className="form-input font-mono text-xs min-h-[120px]" value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Paste code here to detect RSA, ECC, MD5... and enrich the report." />
          </div>
        </div>

        <button className="btn" onClick={runScan} disabled={scanning || !code}>
          {scanning
            ? <><Loader2 size={16} className="animate-spin mr-2 inline" /> Scanning...</>
            : <><Brain size={16} className="mr-2 inline" /> Run AI Scan</>
          }
        </button>

        {scanned && aiData && (
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="p-4 rounded-lg bg-bg-dark border border-border text-center">
              <div className="text-xs text-muted uppercase font-bold mb-1">Readiness Score</div>
              <div className={`text-3xl font-bold ${aiData.readiness_score >= 80 ? 'text-green-500' : aiData.readiness_score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {aiData.readiness_score}/100
              </div>
            </div>
            <div className="p-4 rounded-lg bg-bg-dark border border-border text-center">
              <div className="text-xs text-muted uppercase font-bold mb-1">Vulnerabilities</div>
              <div className="text-3xl font-bold text-red-500">{aiData.findings.length}</div>
            </div>
            <div className="p-4 rounded-lg bg-bg-dark border border-border text-center">
              <div className="text-xs text-muted uppercase font-bold mb-1">Roadmap Phases</div>
              <div className="text-3xl font-bold text-accent">{aiData.roadmap?.phases?.length ?? 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Step 2: Export ────────────────────────────────────────────────── */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">2</div>
          <h2 className="text-lg font-bold">Export Report</h2>
        </div>

        {!scanned && (
          <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <AlertTriangle size={16} />
            No AI scan done — report will use default system data only. Run scan above for full AI enrichment.
          </div>
        )}
        {scanned && (
          <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <CheckCircle2 size={16} />
            AI scan complete — report will include vulnerability findings, readiness score, and migration roadmap.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* PDF */}
          <div className="p-6 rounded-xl border border-border bg-bg-dark space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg"><FileText size={24} className="text-accent" /></div>
              <div>
                <div className="font-bold">PDF Audit Report</div>
                <div className="text-xs text-muted">Professional, print-ready audit document</div>
              </div>
            </div>
            <ul className="text-xs text-muted space-y-1">
              <li>✦ Dark cover page with org name & date</li>
              <li>✦ Quantum Readiness Score card</li>
              <li>✦ Colour-coded vulnerability table</li>
              <li>✦ AI migration roadmap (phased)</li>
              <li>✦ NIST/CNSA 2.0 compliance reference</li>
            </ul>
            <button className="btn w-full" onClick={() => downloadReport('pdf')} disabled={loading === 'pdf'}>
              {loading === 'pdf'
                ? <><Loader2 size={16} className="animate-spin mr-2 inline" /> Generating PDF...</>
                : <><Download size={16} className="mr-2 inline" /> Download PDF</>
              }
            </button>
          </div>

          {/* JSON */}
          <div className="p-6 rounded-xl border border-border bg-bg-dark space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg"><FileJson size={24} className="text-accent" /></div>
              <div>
                <div className="font-bold">JSON Audit Report</div>
                <div className="text-xs text-muted">Machine-readable, CI/CD pipeline ready</div>
              </div>
            </div>
            <ul className="text-xs text-muted space-y-1">
              <li>✦ Full metadata with classification</li>
              <li>✦ AI enrichment block (score + findings)</li>
              <li>✦ Risk assessment array</li>
              <li>✦ Structured roadmap object</li>
              <li>✦ Benchmark performance data</li>
            </ul>
            <button className="btn w-full" onClick={() => downloadReport('json')} disabled={loading === 'json'}>
              {loading === 'json'
                ? <><Loader2 size={16} className="animate-spin mr-2 inline" /> Generating JSON...</>
                : <><Download size={16} className="mr-2 inline" /> Download JSON</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
