import React, { useState, useEffect } from 'react';
import { Flag, Trophy, Timer, Swords, Skull, ShieldAlert, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  description: string;
  category: 'Broken Crypto' | 'PQC Implementation' | 'Quantum Attack';
  status: 'Open' | 'Solved';
}

const CHALLENGES: Challenge[] = [
  { id: 'ctf-001', title: 'The RSA Weakness', difficulty: 'Easy', points: 100, description: 'Intercept a 512-bit RSA message and use Shor\'s Simulator to recover the private prime factors.', category: 'Broken Crypto', status: 'Solved' },
  { id: 'ctf-002', title: 'Hybrid Leakage', difficulty: 'Medium', points: 250, description: 'Analyze a dual-layer TLS handshake where the classical ECC layer has been downgraded. Recover the session key.', category: 'Quantum Attack', status: 'Open' },
  { id: 'ctf-003', title: 'Kyber Misconfig', difficulty: 'Hard', points: 500, description: 'Exploit a faulty ML-KEM implementation that reuses randomness across sessions. Perform a chosen-ciphertext attack.', category: 'PQC Implementation', status: 'Open' },
];

const LEADERBOARD = [
  { rank: 1, name: 'CyberSentinel', points: 1450 },
  { rank: 2, name: 'QuantumPirate', points: 1200 },
  { rank: 3, name: 'PQC_Hunter', points: 950 },
];

const CTFMode: React.FC = () => {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [flagInput, setFlagInput] = useState('');
  const [isFlagCorrect, setIsFlagCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const submitFlag = () => {
    if (flagInput === 'QS{QUANTUM_PWNED}') {
      setIsFlagCorrect(true);
      setTimeout(() => setActiveChallenge(null), 2000);
    } else {
      setIsFlagCorrect(false);
      setTimeout(() => setIsFlagCorrect(null), 2000);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-3">
            <Skull className="text-red-500" /> Quantum Arena: CTF Mode
          </h1>
          <p className="page-subtitle">Capture the flags by exploiting cryptographic vulnerabilities in a safe sandbox.</p>
        </div>
        <div className="flex gap-4">
          <div className="card px-6 py-2 flex items-center gap-3 border-red-500/20 bg-red-500/10">
            <Timer className="text-red-500" size={20} />
            <span className="text-2xl font-black text-red-500 tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Challenge List */}
        <div className="xl:col-span-3 space-y-4">
          {!activeChallenge ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHALLENGES.map((ch) => (
                <motion.div
                  whileHover={{ y: -4 }}
                  key={ch.id}
                  onClick={() => setActiveChallenge(ch)}
                  className={`card p-6 cursor-pointer border-l-4 transition-all ${
                    ch.status === 'Solved' ? 'border-l-green-500 opacity-60' : 'border-l-accent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/5 rounded-lg text-accent">
                      <Swords size={20} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-muted uppercase font-bold">Difficulty</div>
                      <div className={`text-xs font-bold ${
                        ch.difficulty === 'Easy' ? 'text-blue-500' : 
                        ch.difficulty === 'Medium' ? 'text-orange-500' : 'text-red-500'
                      }`}>{ch.difficulty}</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    {ch.title} {ch.status === 'Solved' && <CheckCircle2 size={16} className="text-green-500" />}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed mb-4">{ch.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-muted font-bold uppercase tracking-wider">{ch.category}</span>
                    <span className="text-lg font-black text-accent">{ch.points} PTS</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-10 space-y-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5">
                <Flag size={200} />
              </div>
              
              <button 
                onClick={() => setActiveChallenge(null)}
                className="text-muted hover:text-white text-sm"
              >
                ← Back to Mission Selection
              </button>

              <div className="space-y-2 relative z-10">
                <h2 className="text-3xl font-black">{activeChallenge.title}</h2>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded uppercase">{activeChallenge.category}</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-bold rounded uppercase">{activeChallenge.difficulty}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-bg-dark rounded-2xl border border-white/5 text-sm text-muted leading-relaxed">
                  <h4 className="text-white font-bold mb-2">Mission Briefing:</h4>
                  {activeChallenge.description}
                  <br /><br />
                  <span className="text-accent italic">Hint: The flag format is QS{'{...}'}</span>
                </div>

                <div className="card p-6 bg-accent/5 border-accent/20 space-y-4">
                  <div className="flex items-center gap-2 text-accent font-bold uppercase text-xs tracking-widest">
                    <Terminal size={16} /> Submit Captured Flag
                  </div>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="QS{...}" 
                      className={`form-input flex-1 font-mono tracking-widest ${
                        isFlagCorrect === true ? 'border-green-500 text-green-500' : 
                        isFlagCorrect === false ? 'border-red-500 text-red-500' : ''
                      }`}
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                    />
                    <button 
                      onClick={submitFlag}
                      className="btn px-8"
                    >
                      Authenticate
                    </button>
                  </div>
                  <AnimatePresence>
                    {isFlagCorrect === true && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={14} /> Correct Flag! Points awarded.
                      </motion.div>
                    )}
                    {isFlagCorrect === false && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle size={14} /> Invalid Flag. Authentication failed.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Leaderboard Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-bg-panel to-bg-main border-accent/20">
            <div className="flex items-center gap-2 mb-6 text-accent">
              <Trophy size={20} />
              <h3 className="font-bold uppercase tracking-widest text-sm">Global Rankings</h3>
            </div>
            <div className="space-y-4">
              {LEADERBOARD.map((user) => (
                <div key={user.rank} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-muted'
                    }`}>
                      {user.rank}
                    </div>
                    <span className="text-sm font-medium group-hover:text-accent transition-colors">{user.name}</span>
                  </div>
                  <span className="font-black text-white">{user.points}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-red-500/5 border-red-500/20">
            <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldAlert size={14} /> Recent Activities
            </h3>
            <div className="space-y-3 font-mono text-[9px] text-muted">
              <div>[14:38] user_x captured RSA_BREAK</div>
              <div className="text-red-500 animate-pulse">[14:40] New challenge deployed!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTFMode;
