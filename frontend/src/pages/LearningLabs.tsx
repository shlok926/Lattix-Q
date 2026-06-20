import React, { useState } from 'react';
import { BookOpen, GraduationCap, PlayCircle, CheckCircle, Lock, Trophy, ArrowRight, Code } from 'lucide-react';
import { motion } from 'framer-motion';

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  completed: boolean;
  lessons: number;
}

const MODULES: Module[] = [
  { 
    id: 'm1', 
    title: 'Quantum Foundations', 
    description: 'Understand Qubits, Superposition, and why they threaten RSA.', 
    difficulty: 'Beginner', 
    duration: '15 min', 
    completed: true,
    lessons: 4
  },
  { 
    id: 'm2', 
    title: 'Shor\'s Algorithm Lab', 
    description: 'A hands-on simulation of integer factorization using quantum circuits.', 
    difficulty: 'Intermediate', 
    duration: '30 min', 
    completed: false,
    lessons: 6
  },
  { 
    id: 'm3', 
    title: 'Implementing ML-KEM', 
    description: 'Learn to deploy Kyber-768 in a production TLS handshake.', 
    difficulty: 'Advanced', 
    duration: '45 min', 
    completed: false,
    lessons: 8
  },
  { 
    id: 'm4', 
    title: 'PQC Migration Strategy', 
    description: 'Planning a corporate-wide transition to quantum-resistant standards.', 
    difficulty: 'Beginner', 
    duration: '20 min', 
    completed: false,
    lessons: 3
  }
];

const LearningLabs: React.FC = () => {
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-end">
        <div className="page-header mb-0">
          <h1 className="page-title">Interactive Learning Labs</h1>
          <p className="page-subtitle">Master Post-Quantum Cryptography through hands-on exercises and simulations.</p>
        </div>
        <div className="flex gap-4">
          <div className="card px-6 py-2 flex items-center gap-3 bg-green-500/10 border-green-500/20">
            <Trophy className="text-green-500" size={20} />
            <div>
              <div className="text-[10px] text-muted uppercase font-bold">XP Earned</div>
              <div className="text-xl font-black text-green-500">1,250</div>
            </div>
          </div>
        </div>
      </div>

      {!activeModule ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODULES.map((module, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={module.id}
              className={`card group cursor-pointer hover:border-accent/40 transition-all ${module.completed ? 'border-green-500/20' : 'border-white/5'}`}
              onClick={() => setActiveModule(module)}
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl ${module.completed ? 'bg-green-500/10 text-green-500' : 'bg-accent/10 text-accent'}`}>
                    <GraduationCap size={24} />
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    module.difficulty === 'Beginner' ? 'bg-blue-500/10 text-blue-500' :
                    module.difficulty === 'Intermediate' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {module.difficulty}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold group-hover:text-accent transition-colors flex items-center gap-2">
                    {module.title} {module.completed && <CheckCircle size={16} className="text-green-500" />}
                  </h3>
                  <p className="text-sm text-muted mt-2">{module.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {module.lessons} Lessons</span>
                    <span className="flex items-center gap-1"><PlayCircle size={14} /> {module.duration}</span>
                  </div>
                  <button className="text-accent flex items-center gap-1 text-sm font-bold opacity-0 group-hover:opacity-100 transition-all">
                    Start Lab <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <button 
            onClick={() => setActiveModule(null)}
            className="text-muted hover:text-white flex items-center gap-2 text-sm transition-colors"
          >
            ← Back to All Labs
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lesson Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-8 min-h-[400px] flex flex-col justify-center items-center text-center space-y-6">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center animate-pulse">
                  <Lock size={40} className="text-accent" />
                </div>
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold mb-4">{activeModule.title} - Lesson 1</h2>
                  <p className="text-muted leading-relaxed">
                    Welcome to the {activeModule.title} lab. In this section, we will explore the fundamental differences 
                    between classical bit logic and quantum superposition. 
                  </p>
                </div>
                <button className="btn px-8">Continue to Exercise</button>
              </div>
            </div>

            {/* Sidebar / Progress */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Course Content</h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((lesson) => (
                    <div key={lesson} className={`p-3 rounded-lg border flex items-center gap-3 ${lesson === 1 ? 'border-accent bg-accent/5 text-white' : 'border-white/5 text-muted'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${lesson === 1 ? 'bg-accent' : 'bg-white/10'}`}>
                        {lesson}
                      </div>
                      <span className="text-xs">Lesson {lesson}: Concept of Superposition</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 bg-accent/5 border-accent/20">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                  <Code size={18} /> Terminal Exercise
                </h3>
                <div className="bg-bg-dark p-4 rounded-lg font-mono text-[10px] text-muted space-y-2">
                  <div className="text-white"># Try initializing a 3-qubit circuit</div>
                  <div>$ quantum-shield init --qubits 3</div>
                  <div className="text-green-500">[SUCCESS] Circuit initialized. Ready for entanglement.</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LearningLabs;
