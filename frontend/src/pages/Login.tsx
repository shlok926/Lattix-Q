import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (res.data.mfa_required) {
        setMfaRequired(true);
        setMfaToken(res.data.mfa_token);
      } else {
        login(res.data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-mfa', {
        mfa_token: mfaToken,
        code: mfaCode
      });

      login(res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid MFA code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Blobs */}
      <div className="bg-blur-blob top-[-10%] left-[-10%]" />
      <div className="bg-blur-blob bottom-[-10%] right-[-10%] scale-75 opacity-50" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="login-card"
      >
        <div className="login-header">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="login-logo"
          >
            <Shield size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Quantum<span style={{ color: 'var(--accent)' }}>Shield</span>
          </h1>
          <p className="text-muted text-sm">Enterprise Post-Quantum Intelligence</p>
        </div>

        {!mfaRequired ? (
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label ml-1">Username</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label ml-1">Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px', pointerEvents: 'none', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glowing-button"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Authenticate Access <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMFAVerify} className="space-y-6">
            <div className="mfa-info text-center mb-6">
              <Shield size={48} className="mx-auto mb-4 text-accent animate-pulse" />
              <h2 className="text-xl font-semibold text-white">MFA Required</h2>
              <p className="text-sm text-muted">Enter the 6-digit code from your authenticator app</p>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label ml-1">Verification Code</label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="form-input text-center text-2xl tracking-[1em]"
                placeholder="000000"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="glowing-button"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Verify & Access <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMfaRequired(false)}
              className="text-xs text-muted hover:text-white transition-colors w-full"
            >
              Back to Login
            </button>
          </form>
        )}

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
            CONFIDENTIAL — AUTHORIZED PERSONNEL ONLY<br />
            <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Demo: admin / QuantumShield@2026</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
