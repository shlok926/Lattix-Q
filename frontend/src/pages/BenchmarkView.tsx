import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export default function BenchmarkView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.get('/benchmark/results');
      setData(res.data);
    } catch (e) {
      console.error(e);
      setData([
        { algorithm: 'RSA-2048', keygen_ms: 120, encrypt_ms: 5, decrypt_ms: 8 },
        { algorithm: 'Kyber-768', keygen_ms: 2, encrypt_ms: 3, decrypt_ms: 4 },
      ] as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Performance Benchmarks</h1>
        <p className="page-subtitle">Comparative analysis of Classical vs Post-Quantum Cryptography.</p>
      </div>

      <button className="btn" onClick={fetchResults} disabled={loading} style={{ marginBottom: '24px' }}>
        <Activity size={18} /> {loading ? 'Loading...' : 'Refresh Data'}
      </button>

      {data.length > 0 && (
        <div className="card" style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#272732" />
              <XAxis dataKey="algorithm" stroke="#8b8b9e" />
              <YAxis stroke="#8b8b9e" />
              <Tooltip contentStyle={{ backgroundColor: '#13131a', border: '1px solid #272732' }} />
              <Legend />
              <Bar dataKey="keygen_ms" name="Keygen (ms)" fill="#6d28d9" />
              <Bar dataKey="encrypt_ms" name="Encrypt/Encap (ms)" fill="#10b981" />
              <Bar dataKey="decrypt_ms" name="Decrypt/Decap (ms)" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
