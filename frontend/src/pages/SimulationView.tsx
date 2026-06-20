import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Play } from 'lucide-react';

export default function SimulationView() {
  const [keySize, setKeySize] = useState('2048');
  const [algo, setAlgo] = useState('shor');
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<any>(null);

  const startSimulation = async () => {
    try {
      setStatus('Starting...');
      setResult(null);
      const res = await api.post(`/simulation/${algo}`, { key_size: parseInt(keySize) });
      setJobId(res.data.job_id);
      setStatus('PENDING');
    } catch (e) {
      console.error(e);
      setStatus('Error starting simulation');
    }
  };

  useEffect(() => {
    let ws: WebSocket;
    if (jobId) {
      const wsUrl = `ws://${window.location.hostname}/ws/simulation/${jobId}`;
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setStatus(data.status);
        if (data.status === 'COMPLETED') {
          setResult(data.result);
          ws.close();
        }
      };
    }
    return () => {
      if (ws) ws.close();
    };
  }, [jobId]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Quantum Attack Simulation</h1>
        <p className="page-subtitle">Simulate Shor's and Grover's algorithms against classical keys.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginBottom: '24px' }}>
        <div className="form-group">
          <label className="form-label">Algorithm</label>
          <select className="form-select" value={algo} onChange={(e) => setAlgo(e.target.value)}>
            <option value="shor">Shor's Algorithm (RSA/ECC)</option>
            <option value="grover">Grover's Algorithm (AES)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Target Key Size (bits)</label>
          <input 
            type="number" 
            className="form-input" 
            value={keySize} 
            onChange={(e) => setKeySize(e.target.value)} 
          />
        </div>

        <button className="btn" onClick={startSimulation} disabled={status === 'RUNNING' || status === 'PENDING'}>
          <Play size={18} /> Run Simulation
        </button>
      </div>

      {status && (
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Status: <span style={{ color: 'var(--accent)' }}>{status}</span></h3>
          {result && (
            <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', overflowX: 'auto' }}>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
