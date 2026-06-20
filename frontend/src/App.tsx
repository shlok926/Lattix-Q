import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import React, { ReactNode } from 'react';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Core Pages (Refactored)
import Dashboard from './pages/Dashboard/index';
import QuantumAttackLab from './pages/QuantumAttackLab/index';
import CryptoWorkbench from './pages/CryptoWorkbench';
import BenchmarkCenter from './pages/BenchmarkCenter/index';
import MigrationSimulator from './pages/MigrationSimulator';
import GlobalRaceTracker from './pages/GlobalRaceTracker';
import PQCPlaybook from './pages/PQCPlaybook';
import ReportsPage from './pages/Reports/index';
import SettingsPage from './pages/SettingsPage';

// Other Pages (Legacy / Supplemental)
import AIHub from './pages/AIHub';
import Login from './pages/Login';
import ThreatAnalystPage from './pages/ThreatAnalyst';
import BatchScanner from './pages/BatchScanner';
import AttackVisualizer from './pages/AttackVisualizer';
import PolicyEngine from './pages/PolicyEngine';
import AssetInventory from './pages/AssetInventory';
import TimelineSimulator from './pages/TimelineSimulator';
import HybridSandbox from './pages/HybridSandbox';
import LearningLabs from './pages/LearningLabs';
import QuantumHardware from './pages/QuantumHardware';
import CTFMode from './pages/CTFMode';
import ReportDownloader from './components/ReportDownloader';

// Auth State Provider
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#080C14] text-[#00C4E8]">
        Loading...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Shell Layout Container (with Fixed Sidebar & Header)
const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#080C14] overflow-hidden">
      {/* Sidebar: Fixed 240px wide */}
      <Sidebar />
      
      {/* Right Column: Header & Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header: Fixed top 56px */}
        <Header />
        
        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#080C14]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<Login />} />
          
          {/* Authenticated Application Shell */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quantum-attack" element={<QuantumAttackLab />} />
            <Route path="/workbench" element={<CryptoWorkbench />} />
            <Route path="/benchmark" element={<BenchmarkCenter />} />
            <Route path="/migration" element={<MigrationSimulator />} />
            <Route path="/global-race" element={<GlobalRaceTracker />} />
            <Route path="/playbook" element={<PQCPlaybook />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Supplemental / Legacy routes kept active */}
            <Route path="/ai" element={<AIHub />} />
            <Route path="/analyst" element={<ThreatAnalystPage />} />
            <Route path="/batch-scan" element={<BatchScanner />} />
            <Route path="/visualizer" element={<AttackVisualizer />} />
            <Route path="/policies" element={<PolicyEngine />} />
            <Route path="/inventory" element={<AssetInventory />} />
            <Route path="/timeline" element={<TimelineSimulator />} />
            <Route path="/sandbox" element={<HybridSandbox />} />
            <Route path="/labs" element={<LearningLabs />} />
            <Route path="/hardware" element={<QuantumHardware />} />
            <Route path="/arena" element={<CTFMode />} />
            <Route path="/report" element={<ReportDownloader />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
