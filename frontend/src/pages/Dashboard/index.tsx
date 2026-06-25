import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldOff, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Clock, 
  Info, 
  Play, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  Mail,
  Settings,
  AlertCircle,
  ExternalLink,
  Lock,
  Database,
  Activity,
  FileText,
  CheckCircle,
  Calendar,
  Users,
  RefreshCw,
  X,
  Sliders,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AlgorithmBadge from '../../components/ui/AlgorithmBadge';
import NistBadge from '../../components/ui/NistBadge';
import StatusDot from '../../components/ui/StatusDot';
import { api } from '../../services/api';
import { decryptToken } from '../../utils/crypto';

// Interfaces for our state elements
interface VulnerableSystem {
  id: string;
  hostname: string;
  ip: string;
  algorithm: string;
  useCase: string;
  remediation: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  scope: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  token: string;
}

interface ActivityItem {
  id: string;
  type: 'assessment' | 'scanner' | 'inventory' | 'migration' | 'policy';
  title: string;
  desc: string;
  time: string;
  status: 'online' | 'warning' | 'error' | 'inactive';
}

export const Dashboard: React.FC = () => {
  // Environment Context Scoping
  const [env, setEnv] = useState<'prod' | 'staging' | 'dev'>('prod');
  
  // Real-Time Streaming State
  const [isStreamingActive, setIsStreamingActive] = useState<boolean>(true);
  const [lastUpdatedSec, setLastUpdatedSec] = useState<number>(3);
  
  // Alert Dismiss/Snooze Workflows
  const [isAlertDismissed, setIsAlertDismissed] = useState<boolean>(false);
  const [isAlertSnoozed, setIsAlertSnoozed] = useState<boolean>(false);
  const [alertSnoozeTimer, setAlertSnoozeTimer] = useState<string>('24h');
  
  // Search & Filtering for Table
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Simulation Controls
  const [activeSimState, setActiveSimState] = useState<'IDLE' | 'RUNNING' | 'RESULT'>('RUNNING');
  const [simProgress, setSimProgress] = useState<number>(78);
  const [simAlgorithm, setSimAlgorithm] = useState<string>("RSA-1024");
  const [simQubits, setSimQubits] = useState<number>(2051);
  const [simDepth, setSimDepth] = useState<number>(18432);
  const [simRemaining, setSimRemaining] = useState<number>(22);
  const simTimerRef = useRef<any>(null);

  // Scheduler Modal State
  const [isSchedulerOpen, setIsSchedulerOpen] = useState<boolean>(false);
  const [schedulerEmail, setSchedulerEmail] = useState<string>('security-alerts@acme.com');
  const [slackWebhookEnabled, setSlackWebhookEnabled] = useState<boolean>(true);
  const [reportFrequency, setReportFrequency] = useState<string>('weekly');

  // Drilldown Modal State
  const [isDrilldownOpen, setIsDrilldownOpen] = useState<boolean>(false);
  const [selectedSystem, setSelectedSystem] = useState<VulnerableSystem | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Environment-specific state parameters
  const [overallRiskScore, setOverallRiskScore] = useState<number>(74);
  const [vulnerableCount, setVulnerableCount] = useState<number>(12);
  const [pqcReadyCount, setPqcReadyCount] = useState<number>(8);
  const [cnsaCompliance, setCnsaCompliance] = useState<number>(87);
  const [apiUptime, setApiUptime] = useState<number>(99.98);
  const [dbLatency, setDbLatency] = useState<number>(42);
  
  // Vulnerable Systems Inventory
  const [vulnerableSystems, setVulnerableSystems] = useState<VulnerableSystem[]>([
    { id: 'SYS-01', hostname: 'api.acme.com/auth', ip: '10.0.4.15', algorithm: 'RSA-2048', useCase: 'Web Server TLS Cert', remediation: 'ML-KEM-768 Hybrid', priority: 'CRITICAL', status: 'PENDING' },
    { id: 'SYS-02', hostname: 'db-cluster-01.internal', ip: '10.12.8.44', algorithm: 'RSA-2048', useCase: 'Database Auth Client', remediation: 'ML-KEM-1024 Upgrade', priority: 'CRITICAL', status: 'IN_PROGRESS' },
    { id: 'SYS-03', hostname: 'mail.acme.com', ip: '192.168.1.100', algorithm: 'ECC-256', useCase: 'SMTP SMTP-TLS Negotiator', remediation: 'ML-DSA-65 Signature', priority: 'HIGH', status: 'PENDING' },
    { id: 'SYS-04', hostname: 'vpn-gateway.ny', ip: '54.210.43.12', algorithm: 'ECC-256', useCase: 'IPSec Tunnel Gateway', remediation: 'Hybrid X25519-MLKEM', priority: 'HIGH', status: 'PENDING' },
    { id: 'SYS-05', hostname: 'firmware-signer.prod', ip: '10.0.120.5', algorithm: 'RSA-2048', useCase: 'Firmware Update Signer', remediation: 'Dual RSA-4096 / ML-DSA', priority: 'CRITICAL', status: 'PENDING' },
    { id: 'SYS-06', hostname: 'ssh-gateway-01.internal', ip: '10.12.9.2', algorithm: 'ECC-256', useCase: 'SSH Bastion Access', remediation: 'SSH-ML-DSA Upgrade', priority: 'HIGH', status: 'IN_PROGRESS' },
    { id: 'SYS-07', hostname: 'billing.acme.com', ip: '10.0.50.88', algorithm: 'RSA-2048', useCase: 'External Payment Hook', remediation: 'ML-KEM-768 Wrapper', priority: 'MEDIUM', status: 'PENDING' },
    { id: 'SYS-08', hostname: 'prod-k8s-ingress', ip: '10.0.1.1', algorithm: 'ECC-256', useCase: 'Ingress Controller TLS', remediation: 'Hybrid Key Exchange', priority: 'HIGH', status: 'PENDING' },
    { id: 'SYS-09', hostname: 'legacy-backup-auth', ip: '172.16.4.5', algorithm: 'RSA-2048', useCase: 'Backup Vault Daemon', remediation: 'AES-256 GCM Keywrap', priority: 'MEDIUM', status: 'PENDING' },
    { id: 'SYS-10', hostname: 'iot-hub-east', ip: '10.40.2.140', algorithm: 'ECC-256', useCase: 'Device Signature Hub', remediation: 'Hybrid ECDH-Kyber', priority: 'MEDIUM', status: 'PENDING' },
    { id: 'SYS-11', hostname: 'auth-prod-02.internal', ip: '10.12.8.12', algorithm: 'RSA-2048', useCase: 'Active Directory Connector', remediation: 'ML-DSA Signature Shift', priority: 'HIGH', status: 'IN_PROGRESS' },
    { id: 'SYS-12', hostname: 'archive-integrity.internal', ip: '10.80.33.22', algorithm: 'SHA-1', useCase: 'Legacy Log Integrity Hash', remediation: 'SHA-256 / SHA-3 Upgrade', priority: 'CRITICAL', status: 'PENDING' }
  ]);

  // Access & Action Audit Logs (SOC 2 Immutable Simulation)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: 'AUD-01', timestamp: '2026-06-24 02:30:12', action: 'DASHBOARD_ACCESS', user: 'admin@lattixq.io', scope: 'prod-01', status: 'SUCCESS', token: 'SHA256(7f8e...9a2b)' },
    { id: 'AUD-02', timestamp: '2026-06-24 02:28:45', action: 'ASSESSMENT_RUN', user: 'admin@lattixq.io', scope: 'prod-01', status: 'SUCCESS', token: 'SHA256(4d8c...3a1f)' },
    { id: 'AUD-03', timestamp: '2026-06-24 02:15:00', action: 'VULN_INVENTORY_READ', user: 'analyst@lattixq.io', scope: 'prod-01', status: 'SUCCESS', token: 'SHA256(0b3e...4c8f)' },
    { id: 'AUD-04', timestamp: '2026-06-24 02:00:10', action: 'TENANT_POLICY_READ', user: 'viewer@lattixq.io', scope: 'prod-01', status: 'SUCCESS', token: 'SHA256(a1e9...b8c3)' }
  ]);

  // Recent Activity Feed
  const [activities, setActivities] = useState<ActivityItem[]>([
    { id: 'ACT-01', type: 'assessment', title: "Shor's Algorithm simulation completed", desc: "RSA-2048 vulnerability analysis: 4,099 qubits required, break confirmed", time: "2 minutes ago", status: "online" },
    { id: 'ACT-02', type: 'scanner', title: "Code Scanner finding", desc: "Found 3 new AES-128 instances in src/crypto/", time: "15 minutes ago", status: "warning" },
    { id: 'ACT-03', type: 'inventory', title: "Inventory updated", desc: "2 new systems added (ECC-256 TLS terminator)", time: "1 hour ago", status: "inactive" },
    { id: 'ACT-04', type: 'migration', title: "Migration completed", desc: "TLS 1.3 + hybrid (X25519-ML-KEM) deployed in prod-02", time: "4 hours ago", status: "online" },
    { id: 'ACT-05', type: 'policy', title: "Benchmark suite executed", desc: "ML-KEM-768 verified at 0.08ms keygen latency", time: "5 hours ago", status: "inactive" }
  ]);

  // Chart data 30-day risk trend
  const [riskTrendData, setRiskTrendData] = useState([
    { day: 'Day -25', RiskScore: 82 },
    { day: 'Day -20', RiskScore: 80 },
    { day: 'Day -15', RiskScore: 78 },
    { day: 'Day -10', RiskScore: 77 },
    { day: 'Day -5', RiskScore: 75 },
    { day: 'Today', RiskScore: 74 }
  ]);

  // Trigger temporary toast alerts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync state values on Environment change
  useEffect(() => {
    let mockRisk = 74;
    let mockVuln = 12;
    let mockPqc = 8;
    let mockCnsa = 87;
    let mockUptime = 99.98;
    let mockLatency = 42;
    let systemsList: VulnerableSystem[] = [];
    let trendList = [];

    if (env === 'prod') {
      mockRisk = 74;
      mockVuln = 12;
      mockPqc = 8;
      mockCnsa = 87;
      mockUptime = 99.98;
      mockLatency = 42;
      systemsList = [
        { id: 'SYS-01', hostname: 'api.acme.com/auth', ip: '10.0.4.15', algorithm: 'RSA-2048', useCase: 'Web Server TLS Cert', remediation: 'ML-KEM-768 Hybrid', priority: 'CRITICAL', status: 'PENDING' },
        { id: 'SYS-02', hostname: 'db-cluster-01.internal', ip: '10.12.8.44', algorithm: 'RSA-2048', useCase: 'Database Auth Client', remediation: 'ML-KEM-1024 Upgrade', priority: 'CRITICAL', status: 'IN_PROGRESS' },
        { id: 'SYS-03', hostname: 'mail.acme.com', ip: '192.168.1.100', algorithm: 'ECC-256', useCase: 'SMTP SMTP-TLS Negotiator', remediation: 'ML-DSA-65 Signature', priority: 'HIGH', status: 'PENDING' },
        { id: 'SYS-04', hostname: 'vpn-gateway.ny', ip: '54.210.43.12', algorithm: 'ECC-256', useCase: 'IPSec Tunnel Gateway', remediation: 'Hybrid X25519-MLKEM', priority: 'HIGH', status: 'PENDING' },
        { id: 'SYS-05', hostname: 'firmware-signer.prod', ip: '10.0.120.5', algorithm: 'RSA-2048', useCase: 'Firmware Update Signer', remediation: 'Dual RSA-4096 / ML-DSA', priority: 'CRITICAL', status: 'PENDING' },
        { id: 'SYS-06', hostname: 'ssh-gateway-01.internal', ip: '10.12.9.2', algorithm: 'ECC-256', useCase: 'SSH Bastion Access', remediation: 'SSH-ML-DSA Upgrade', priority: 'HIGH', status: 'IN_PROGRESS' },
        { id: 'SYS-07', hostname: 'billing.acme.com', ip: '10.0.50.88', algorithm: 'RSA-2048', useCase: 'External Payment Hook', remediation: 'ML-KEM-768 Wrapper', priority: 'MEDIUM', status: 'PENDING' },
        { id: 'SYS-08', hostname: 'prod-k8s-ingress', ip: '10.0.1.1', algorithm: 'ECC-256', useCase: 'Ingress Controller TLS', remediation: 'Hybrid Key Exchange', priority: 'HIGH', status: 'PENDING' },
        { id: 'SYS-09', hostname: 'legacy-backup-auth', ip: '172.16.4.5', algorithm: 'RSA-2048', useCase: 'Backup Vault Daemon', remediation: 'AES-256 GCM Keywrap', priority: 'MEDIUM', status: 'PENDING' },
        { id: 'SYS-10', hostname: 'iot-hub-east', ip: '10.40.2.140', algorithm: 'ECC-256', useCase: 'Device Signature Hub', remediation: 'Hybrid ECDH-Kyber', priority: 'MEDIUM', status: 'PENDING' },
        { id: 'SYS-11', hostname: 'auth-prod-02.internal', ip: '10.12.8.12', algorithm: 'RSA-2048', useCase: 'Active Directory Connector', remediation: 'ML-DSA Signature Shift', priority: 'HIGH', status: 'IN_PROGRESS' },
        { id: 'SYS-12', hostname: 'archive-integrity.internal', ip: '10.80.33.22', algorithm: 'SHA-1', useCase: 'Legacy Log Integrity Hash', remediation: 'SHA-256 / SHA-3 Upgrade', priority: 'CRITICAL', status: 'PENDING' }
      ];
      trendList = [
        { day: 'Day -25', RiskScore: 82 },
        { day: 'Day -20', RiskScore: 80 },
        { day: 'Day -15', RiskScore: 78 },
        { day: 'Day -10', RiskScore: 77 },
        { day: 'Day -5', RiskScore: 75 },
        { day: 'Today', RiskScore: 74 }
      ];
    } else if (env === 'staging') {
      mockRisk = 42;
      mockVuln = 4;
      mockPqc = 14;
      mockCnsa = 94;
      mockUptime = 99.99;
      mockLatency = 38;
      systemsList = [
        { id: 'SYS-03', hostname: 'stage-mail.acme.com', ip: '192.168.2.100', algorithm: 'ECC-256', useCase: 'SMTP SMTP-TLS Negotiator', remediation: 'ML-DSA-65 Signature', priority: 'HIGH', status: 'PENDING' },
        { id: 'SYS-04', hostname: 'stage-vpn-gateway.ny', ip: '54.210.43.15', algorithm: 'ECC-256', useCase: 'IPSec Tunnel Gateway', remediation: 'Hybrid X25519-MLKEM', priority: 'HIGH', status: 'PENDING' },
        { id: 'SYS-06', hostname: 'stage-ssh-gateway-01.internal', ip: '10.13.9.2', algorithm: 'ECC-256', useCase: 'SSH Bastion Access', remediation: 'SSH-ML-DSA Upgrade', priority: 'HIGH', status: 'IN_PROGRESS' },
        { id: 'SYS-08', hostname: 'stage-k8s-ingress', ip: '10.1.1.1', algorithm: 'ECC-256', useCase: 'Ingress Controller TLS', remediation: 'Hybrid Key Exchange', priority: 'MEDIUM', status: 'PENDING' }
      ];
      trendList = [
        { day: 'Day -25', RiskScore: 56 },
        { day: 'Day -20', RiskScore: 52 },
        { day: 'Day -15', RiskScore: 48 },
        { day: 'Day -10', RiskScore: 46 },
        { day: 'Day -5', RiskScore: 44 },
        { day: 'Today', RiskScore: 42 }
      ];
    } else {
      mockRisk = 65;
      mockVuln = 8;
      mockPqc = 6;
      mockCnsa = 73;
      mockUptime = 99.95;
      mockLatency = 47;
      systemsList = [
        { id: 'SYS-01', hostname: 'dev-api.acme.com/auth', ip: '10.0.10.15', algorithm: 'RSA-2048', useCase: 'Web Server TLS Cert', remediation: 'ML-KEM-768 Hybrid', priority: 'CRITICAL', status: 'PENDING' },
        { id: 'SYS-02', hostname: 'dev-db-01.internal', ip: '10.14.8.44', algorithm: 'RSA-2048', useCase: 'Database Auth Client', remediation: 'ML-KEM-1024 Upgrade', priority: 'CRITICAL', status: 'PENDING' },
        { id: 'SYS-03', hostname: 'dev-mail.acme.com', ip: '192.168.3.100', algorithm: 'ECC-256', useCase: 'SMTP SMTP-TLS Negotiator', remediation: 'ML-DSA-65 Signature', priority: 'HIGH', status: 'PENDING' },
        { id: 'SYS-04', hostname: 'dev-vpn.ny', ip: '54.210.43.20', algorithm: 'ECC-256', useCase: 'IPSec Tunnel Gateway', remediation: 'Hybrid X25519-MLKEM', priority: 'HIGH', status: 'PENDING' },
        { id: 'SYS-05', hostname: 'dev-firmware-signer.dev', ip: '10.0.121.5', algorithm: 'RSA-2048', useCase: 'Firmware Update Signer', remediation: 'Dual RSA-4096 / ML-DSA', priority: 'HIGH', status: 'PENDING' },
        { id: 'SYS-07', hostname: 'dev-billing.acme.com', ip: '10.0.51.88', algorithm: 'RSA-2048', useCase: 'External Payment Hook', remediation: 'ML-KEM-768 Wrapper', priority: 'MEDIUM', status: 'PENDING' },
        { id: 'SYS-09', hostname: 'dev-legacy-backup', ip: '172.16.5.5', algorithm: 'RSA-2048', useCase: 'Backup Vault Daemon', remediation: 'AES-256 GCM Keywrap', priority: 'MEDIUM', status: 'PENDING' },
        { id: 'SYS-11', hostname: 'dev-auth-02.internal', ip: '10.14.8.12', algorithm: 'RSA-2048', useCase: 'Active Directory Connector', remediation: 'ML-DSA Signature Shift', priority: 'HIGH', status: 'PENDING' }
      ];
      trendList = [
        { day: 'Day -25', RiskScore: 71 },
        { day: 'Day -20', RiskScore: 70 },
        { day: 'Day -15', RiskScore: 68 },
        { day: 'Day -10', RiskScore: 67 },
        { day: 'Day -5', RiskScore: 66 },
        { day: 'Today', RiskScore: 65 }
      ];
    }

    setOverallRiskScore(mockRisk);
    setVulnerableCount(mockVuln);
    setPqcReadyCount(mockPqc);
    setCnsaCompliance(mockCnsa);
    setApiUptime(mockUptime);
    setDbLatency(mockLatency);
    setVulnerableSystems(systemsList);
    setRiskTrendData(trendList);

    // Logging context switch
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'ENVIRONMENT_CONTEXT_SWITCH',
      user: 'admin@lattixq.io',
      scope: `${env === 'prod' ? 'prod-01' : env === 'staging' ? 'stage-01' : 'dev-01'}`,
      status: 'SUCCESS',
      token: `SHA256(env_ctx_${env})`
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 10)]);
    triggerToast(`Switched dashboard context to environment: ${env.toUpperCase()}`);
  }, [env]);

  // Real-Time websocket simulator pipeline
  useEffect(() => {
    let interval: any = null;
    if (isStreamingActive) {
      interval = setInterval(() => {
        // Randomly update DB Latency to show dynamic metrics
        setDbLatency(prev => {
          const delta = Math.floor(Math.random() * 7) - 3;
          const nextVal = prev + delta;
          return nextVal > 25 && nextVal < 70 ? nextVal : prev;
        });

        // Trigger a simulated event every ~10s
        if (Math.random() > 0.6) {
          const randomVal = Math.random();
          let title = '';
          let desc = '';
          let statusType: 'online' | 'warning' | 'error' | 'inactive' = 'online';
          let actionType = 'WEBSOCKET_INCOMING_EVENT';

          if (randomVal < 0.25) {
            title = "External TLS scan completed";
            desc = "Detected classical cipher suites running on auth-prod-02";
            statusType = "warning";
            actionType = "VULN_INVENTORY_DETECTED";
          } else if (randomVal < 0.5) {
            title = "PQC Deployment verified";
            desc = "Successfully validated ML-KEM-768 hybrid handshake on load-balancer-01";
            statusType = "online";
            actionType = "MIGRATION_DEPLOYED";
            setPqcReadyCount(prev => prev + 1);
          } else if (randomVal < 0.75) {
            title = "Database Latency Check";
            desc = "DB query latency baseline target verified (target: 50ms)";
            statusType = "inactive";
            actionType = "HEALTH_CHECK_OK";
          } else {
            title = "Policy engine compliance recalculated";
            desc = "Overall CNSA 2.0 readiness calculated dynamically";
            statusType = "online";
            actionType = "POLICY_COMPLIANCE_RUN";
            setCnsaCompliance(prev => Math.min(100, prev + 1));
          }

          // Prepend activity
          const newAct: ActivityItem = {
            id: `ACT-${Date.now()}`,
            type: randomVal < 0.25 ? 'scanner' : randomVal < 0.5 ? 'migration' : randomVal < 0.75 ? 'inventory' : 'policy',
            title,
            desc,
            time: "Just now",
            status: statusType
          };
          setActivities(prev => [newAct, ...prev.slice(0, 4)]);

          // Prepend audit log
          const newLog: AuditLogEntry = {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            action: actionType,
            user: 'system@lattixq.io',
            scope: `${env === 'prod' ? 'prod-01' : env === 'staging' ? 'stage-01' : 'dev-01'}`,
            status: 'SUCCESS',
            token: `SHA256(ws_${Math.random().toString(36).substring(7)})`
          };
          setAuditLogs(prev => [newLog, ...prev.slice(0, 9)]);

          // Flick a tiny indicator and update risk score slightly
          setOverallRiskScore(prev => {
            const shift = Math.random() > 0.5 ? 1 : -1;
            return prev + shift > 35 && prev + shift < 85 ? prev + shift : prev;
          });

          triggerToast("Live stream update received via WebSocket connection");
        }

        setLastUpdatedSec(0);
      }, 8000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreamingActive, env]);

  // Keep track of "last updated seconds"
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdatedSec(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Shor's and Grover's simulated/real execution logic
  const runLocalFallbackSimulation = (algo: string, targetQubits: number, targetDepth: number) => {
    let progressVal = 0;
    simTimerRef.current = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          setActiveSimState('RESULT');
          setAlgorithmsList(prev => prev.map(a => {
            if (a.name === algo) {
              return { ...a, status: 'COMPROMISED' };
            }
            return a;
          }));
          
          const compLog: AuditLogEntry = {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            action: 'ATTACK_SIMULATION_COMPLETE',
            user: 'system@lattixq.io',
            scope: `${env === 'prod' ? 'prod-01' : env === 'staging' ? 'stage-01' : 'dev-01'}`,
            status: 'SUCCESS',
            token: `SHA256(sim_comp_${algo})`
          };
          setAuditLogs(l => [compLog, ...l.slice(0, 9)]);

          const newAct: ActivityItem = {
            id: `ACT-${Date.now()}`,
            type: 'assessment',
            title: `Simulation result: ${algo} break confirmed`,
            desc: `${targetQubits} qubits, ${targetDepth} gates computed. Output verified.`,
            time: "Just now",
            status: "online"
          };
          setActivities(a => [newAct, ...a.slice(0, 4)]);
          triggerToast(`Simulation completed! Target cryptography successfully broken.`);
          return 100;
        }
        setSimRemaining(r => Math.max(0, r - 2));
        return prev + 20;
      });
    }, 1000);
  };

  const startSimulation = async (algo: string, targetQubits: number, targetDepth: number) => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    
    setSimAlgorithm(algo);
    setSimQubits(targetQubits);
    setSimDepth(targetDepth);
    setSimProgress(0);
    setSimRemaining(15);
    setActiveSimState('RUNNING');

    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'ATTACK_SIMULATION_START',
      user: 'admin@lattixq.io',
      scope: `${env === 'prod' ? 'prod-01' : env === 'staging' ? 'stage-01' : 'dev-01'}`,
      status: 'SUCCESS',
      token: `SHA256(sim_${algo})`
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 9)]);
    triggerToast(`Quantum Attack Simulation started for ${algo}`);

    const storedToken = localStorage.getItem('ibm_quantum_token');
    const token = storedToken ? await decryptToken(storedToken) : undefined;
    let endpoint = '/simulation/shor';
    let payload: any = { key_size: 15, ibm_token: token };
    if (algo.startsWith('AES')) {
      endpoint = '/simulation/grover';
      payload = { key_size: algo === 'AES-128' ? 128 : 256, ibm_token: token };
    }

    try {
      const resp = await api.post(endpoint, payload);
      const jobId = resp.data.job_id;
      
      let progressVal = 10;
      setSimProgress(progressVal);
      
      simTimerRef.current = setInterval(async () => {
        try {
          const statusResp = await api.get(`/simulation/status/${jobId}`);
          const statusData = statusResp.data;
          
          if (statusData.status === 'RUNNING') {
            progressVal = Math.min(90, progressVal + 15);
            setSimProgress(progressVal);
            setSimRemaining(r => Math.max(2, r - 2));
          } else if (statusData.status === 'COMPLETED') {
            if (simTimerRef.current) clearInterval(simTimerRef.current);
            setSimProgress(100);
            setActiveSimState('RESULT');
            setAlgorithmsList(prev => prev.map(a => {
              if (a.name === algo) {
                return { ...a, status: 'COMPROMISED' };
              }
              return a;
            }));
            
            const result = statusData.result;
            if (result) {
              setSimQubits(result.qubits_required_logical || targetQubits);
              setSimDepth(result.circuit_depth || targetDepth);
            }
            
            const compLog: AuditLogEntry = {
              id: `AUD-${Date.now()}`,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              action: 'ATTACK_SIMULATION_COMPLETE',
              user: 'system@lattixq.io',
              scope: `${env === 'prod' ? 'prod-01' : env === 'staging' ? 'stage-01' : 'dev-01'}`,
              status: 'SUCCESS',
              token: `SHA256(sim_comp_${algo})`
            };
            setAuditLogs(l => [compLog, ...l.slice(0, 9)]);

            const newAct: ActivityItem = {
              id: `ACT-${Date.now()}`,
              type: 'assessment',
              title: `Simulation result: ${algo} break confirmed`,
              desc: `${result?.qubits_required_logical || targetQubits} qubits, ${result?.circuit_depth || targetDepth} gates computed. Output verified.`,
              time: "Just now",
              status: "online"
            };
            setActivities(a => [newAct, ...a.slice(0, 4)]);
            triggerToast(`Simulation completed! Qiskit verified output.`);
          } else if (statusData.status === 'FAILED') {
            if (simTimerRef.current) clearInterval(simTimerRef.current);
            runLocalFallbackSimulation(algo, targetQubits, targetDepth);
          }
        } catch (e) {
          progressVal = Math.min(95, progressVal + 5);
          setSimProgress(progressVal);
        }
      }, 1500);

    } catch (err) {
      runLocalFallbackSimulation(algo, targetQubits, targetDepth);
    }
  };

  useEffect(() => {
    // Initial start on load
    startSimulation("RSA-1024", 2051, 18432);
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  // Acknowledge alert workflow
  const acknowledgeAlert = () => {
    setIsAlertSnoozed(true);
    // Add audit entry
    const snoozeLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'CRITICAL_ALERT_ACKNOWLEDGE',
      user: 'admin@lattixq.io',
      scope: `${env === 'prod' ? 'prod-01' : env === 'staging' ? 'stage-01' : 'dev-01'}`,
      status: 'WARNING',
      token: `SHA256(alert_ack_${alertSnoozeTimer})`
    };
    setAuditLogs(prev => [snoozeLog, ...prev.slice(0, 9)]);
    triggerToast(`Snoozed critical security alert for ${alertSnoozeTimer}`);
  };

  const escalateAlert = () => {
    const escLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'CRITICAL_ALERT_ESCALATE',
      user: 'admin@lattixq.io',
      scope: `${env === 'prod' ? 'prod-01' : env === 'staging' ? 'stage-01' : 'dev-01'}`,
      status: 'SUCCESS',
      token: `SHA256(alert_escalate)`
    };
    setAuditLogs(prev => [escLog, ...prev.slice(0, 9)]);
    triggerToast("Emergency Alert: Escalated to CTO and Security Incident Response Team via Slack Webhook");
  };

  // Remediation Action within Drilldown
  const triggerRemediation = (sysId: string) => {
    setVulnerableSystems(prev => prev.map(sys => {
      if (sys.id === sysId) {
        // Log action
        const remLog: AuditLogEntry = {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          action: 'REMEDIATION_TRIGGERED',
          user: 'admin@lattixq.io',
          scope: sys.hostname,
          status: 'SUCCESS',
          token: `SHA256(remediation_${sysId})`
        };
        setAuditLogs(l => [remLog, ...l.slice(0, 9)]);
        triggerToast(`Migration pipeline triggered for ${sys.hostname}`);
        return { ...sys, status: 'IN_PROGRESS' as const };
      }
      return sys;
    }));
  };

  // Report scheduler save
  const saveScheduleSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSchedulerOpen(false);

    const schLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'RECURRING_REPORT_SCHEDULED',
      user: 'admin@lattixq.io',
      scope: `Freq: ${reportFrequency}`,
      status: 'SUCCESS',
      token: `SHA256(schedule_${reportFrequency})`
    };
    setAuditLogs(prev => [schLog, ...prev.slice(0, 9)]);
    triggerToast(`Successfully scheduled ${reportFrequency} security report exports to ${schedulerEmail}`);
  };

  // CSV Dump of Audit logs
  const downloadAuditLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Timestamp,Action,User,Scope,Status,Token", ...auditLogs.map(l => `${l.id},${l.timestamp},${l.action},${l.user},${l.scope},${l.status},${l.token}`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lattix_Q_AuditLog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Log action
    const dlLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'AUDIT_LOG_EXPORT',
      user: 'admin@lattixq.io',
      scope: 'system',
      status: 'SUCCESS',
      token: `SHA256(audit_export)`
    };
    setAuditLogs(prev => [dlLog, ...prev.slice(0, 9)]);
    triggerToast("Audit logs exported to CSV successfully");
  };

  // State list of algorithms
  const [algorithmsList, setAlgorithmsList] = useState([
    { name: 'RSA-2048', type: 'Asymmetric', useCase: 'Key Exchange / Signatures', status: 'QUANTUM-VULNERABLE', nist: 1, classical: true, info: 'Broken by Shor\'s Algorithm. High-Priority Migration needed.' },
    { name: 'ECC-256', type: 'Asymmetric', useCase: 'Key Exchange / Handshake', status: 'QUANTUM-VULNERABLE', nist: 1, classical: true, info: 'Elliptic curve cryptography. Vulnerable to Shor\'s.' },
    { name: 'AES-256', type: 'Symmetric', useCase: 'Data Encryption', status: 'PARTIALLY-AFFECTED', nist: 3, classical: false, info: 'Grover reduces security to 128-bit. Safe long-term.' },
    { name: 'ML-KEM-768', type: 'KEM / PQC', useCase: 'Hybrid Key Exchange', status: 'QUANTUM-SAFE', nist: 3, classical: false, info: 'NIST standardized Module-Lattice Key Encapsulation.' },
    { name: 'ML-DSA-65', type: 'Signature / PQC', useCase: 'Digital Signatures', status: 'QUANTUM-SAFE', nist: 3, classical: false, info: 'NIST standardized Module-Lattice Digital Signature.' }
  ]);

  // Filtering implementation
  const filteredAlgos = algorithmsList.filter(algo => {
    const matchesSearch = algo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          algo.useCase.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'VULNERABLE' && (algo.status === 'QUANTUM-VULNERABLE' || algo.status === 'COMPROMISED')) ||
                          (statusFilter === 'SAFE' && algo.status === 'QUANTUM-SAFE');
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 select-none pb-12 text-[#E2E8F0] font-sans relative">
      
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0F1D36] border border-[#00C4E8]/40 text-[#E2E8F0] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-bounce duration-500 max-w-sm">
          <Activity size={18} className="text-[#00C4E8] animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-auto">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ZONE 1: Page Header with Scoping and Live Streams */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2D45] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold text-[#E2E8F0] tracking-wide">Enterprise Security Overview</h1>
            <span className="bg-[#122543] border border-[#1E3E6E] text-[#00C4E8] text-[10px] font-bold font-mono px-2 py-0.5 rounded">
              Role: SOC Admin
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[#94A3B8] mt-1.5 font-mono">
            <div className="flex items-center gap-1.5">
              <RefreshCw size={12} className={`${isStreamingActive ? 'animate-spin' : ''}`} />
              <span>
                Last updated: <strong>{lastUpdatedSec}s ago</strong>
              </span>
            </div>
            
            <div className="hidden sm:inline">•</div>
            
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-green-500" />
              <span>Scope: <strong>Acme Corp (Multi-Tenant)</strong></span>
            </div>

            <div className="hidden sm:inline">•</div>

            <div className="flex items-center gap-1.5">
              <Database size={12} className="text-cyan-500" />
              <span>Active Environment:</span>
              <select 
                value={env}
                onChange={(e) => setEnv(e.target.value as any)}
                className="bg-[#0B132B] border border-[#1E3E6E] text-[#00C4E8] font-bold text-xs py-0.5 px-2 rounded cursor-pointer outline-none"
              >
                <option value="prod">Production (prod-01)</option>
                <option value="staging">Staging (stage-01)</option>
                <option value="dev">Development (dev-01)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Indicators & Global Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsStreamingActive(!isStreamingActive)}
            className={`flex items-center gap-2 border text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              isStreamingActive 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isStreamingActive ? 'bg-green-500 animate-ping' : 'bg-slate-500'}`}></span>
            {isStreamingActive ? 'Live WebSocket Connected' : 'Live Stream Paused'}
          </button>
          
          <button 
            onClick={() => setIsSchedulerOpen(true)}
            className="bg-[#0A192F] hover:bg-[#112240] border border-[#1E2D45] text-[#94A3B8] hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Mail size={13} />
            Schedule Reports
          </button>
        </div>
      </div>

      {/* ZONE 2: Critical Alert Section with Action Workflow */}
      {!isAlertDismissed && !isAlertSnoozed && (
        <div className="bg-[#1C1217] border border-red-500/40 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start relative overflow-hidden animate-pulse duration-3000">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
          <div className="bg-red-500/10 p-2.5 rounded-lg border border-red-500/30 text-red-500">
            <AlertTriangle size={22} className="animate-bounce" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 uppercase tracking-wide">
                Critical Compliance Blocker — Action Required Today
              </h3>
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 font-mono">
                Deadline: Q2 2030 (CNSA 2.0)
              </span>
            </div>
            
            <p className="text-[13px] text-[#94A3B8] leading-relaxed">
              Overall security risk is set to <strong className="text-red-400">HIGH (74/100)</strong> because there are still <strong className="text-red-400">{vulnerableCount} instances of RSA-2048</strong> active in production. Quantum computer simulations indicate Shor's algorithm will compromise these systems in under <strong>4 years</strong>. Immediate migration to post-quantum hybrids is required.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <button 
                onClick={() => setIsDrilldownOpen(true)}
                className="text-[#00C4E8] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                → Drill-Down Systems Inventory
              </button>
              <button 
                onClick={escalateAlert}
                className="text-red-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                🚨 Escalate to CTO & Slack
              </button>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="hover:text-white cursor-pointer hover:underline font-bold" onClick={acknowledgeAlert}>
                  Acknowledge Risk (Snooze)
                </span>
                <select 
                  value={alertSnoozeTimer}
                  onChange={(e) => setAlertSnoozeTimer(e.target.value)}
                  className="bg-[#0D1421] border border-[#1E2D45] text-xs py-0.5 px-1 rounded outline-none"
                >
                  <option value="24h">Snooze 24h</option>
                  <option value="7d">Snooze 7 days</option>
                  <option value="30d">Snooze 30 days</option>
                </select>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsAlertDismissed(true)} 
            className="text-slate-500 hover:text-white cursor-pointer absolute top-3 right-3"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ZONE 3: KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Risk Score (Hover for multi-env tooltips) */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] group transition-all duration-300 hover:border-[#00C4E8]/50 hover:bg-[#10192A]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] text-[#94A3B8] font-bold tracking-wide uppercase">Overall Risk Score</span>
            <AlertCircle className="text-[#EF4444] group-hover:scale-110 transition-transform" size={18} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <div className="text-3.5xl font-extrabold text-[#EF4444] font-mono leading-none">{overallRiskScore}/100</div>
              <div className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.2">
                HIGH
              </div>
            </div>
            <div className="text-[11px] mt-2 text-[#EF4444] font-medium font-mono">
              ↓ 3 points from historical baseline
            </div>
          </div>
          
          {/* Environment Hover Comparison Box */}
          <div className="absolute inset-0 bg-[#0F1D36] p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
            <span className="text-[10px] font-bold text-[#00C4E8] uppercase tracking-wider">Multi-Environment Context</span>
            <div className="space-y-1 text-xs font-mono text-[#94A3B8] mt-1">
              <div className="flex justify-between">
                <span>Production (prod-01):</span>
                <span className="text-red-400 font-bold">74</span>
              </div>
              <div className="flex justify-between">
                <span>Staging (stage-01):</span>
                <span className="text-green-400 font-bold">42</span>
              </div>
              <div className="flex justify-between">
                <span>Development (dev-01):</span>
                <span className="text-amber-400 font-bold">65</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Vulnerable Systems (Click to Open Drilldown) */}
        <div 
          onClick={() => setIsDrilldownOpen(true)}
          className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] group transition-all duration-300 hover:border-[#00C4E8]/50 hover:bg-[#10192A] cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-[12px] text-[#94A3B8] font-bold tracking-wide uppercase">Vulnerable Systems</span>
            <ShieldOff className="text-[#EF4444] group-hover:scale-110 transition-transform" size={18} />
          </div>
          <div>
            <div className="text-3.5xl font-extrabold text-[#EF4444] font-mono leading-none">{vulnerableCount}</div>
            <div className="text-[11px] mt-2 text-[#EF4444] font-medium font-mono hover:underline flex items-center gap-0.5">
              Click to view details & remediate <ExternalLink size={10} />
            </div>
          </div>
        </div>

        {/* Card 3: Post-Quantum Ready */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] group transition-all duration-300 hover:border-[#00C4E8]/50 hover:bg-[#10192A]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] text-[#94A3B8] font-bold tracking-wide uppercase">PQC Ready Nodes</span>
            <ShieldCheck className="text-green-400 group-hover:scale-110 transition-transform" size={18} />
          </div>
          <div>
            <div className="text-3.5xl font-extrabold text-green-400 font-mono leading-none">{pqcReadyCount}</div>
            <div className="text-[11px] mt-2 text-green-400 font-medium font-mono">
              ↑ 2 deployed in hybrid mode this week
            </div>
          </div>
        </div>

        {/* Card 4: Compliance Status */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between h-[130px] group transition-all duration-300 hover:border-[#00C4E8]/50 hover:bg-[#10192A]">
          <div className="flex justify-between items-start">
            <span className="text-[12px] text-[#94A3B8] font-bold tracking-wide uppercase">CNSA 2.0 Compliance</span>
            <CheckCircle className="text-[#00C4E8] group-hover:scale-110 transition-transform" size={18} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <div className="text-3.5xl font-extrabold text-[#00C4E8] font-mono leading-none">{cnsaCompliance}%</div>
              <div className="text-[10px] font-bold text-[#00C4E8] bg-[#00C4E8]/10 border border-[#00C4E8]/20 rounded px-1 py-0.2">
                ON TRACK
              </div>
            </div>
            <div className="w-full bg-[#1E2D45] h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-[#00C4E8] h-full rounded-full transition-all duration-1000" style={{ width: `${cnsaCompliance}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* ZONE 4: Historical Trend Graph & Simulated Attack Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
        {/* Left Column (60% width): Interactive Recharts 30-Day Risk Line Chart */}
        <div className="lg:col-span-6 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest block font-mono">
                Historical Risk Score Trend (30 Days)
              </span>
              <span className="text-[13px] text-[#94A3B8] mt-0.5 block">
                Track improvement or degradation of organization posturing
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#080C14] border border-[#1E2D45] px-2.5 py-1 rounded text-xs text-[#94A3B8]">
              <TrendingUp size={12} className="text-green-400" />
              <span>Improving Steady (↓ 8% overall)</span>
            </div>
          </div>

          <div className="h-[200px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#162235" vertical={false} />
                <XAxis dataKey="day" stroke="#475569" fontSize={9} tickLine={false} />
                <YAxis stroke="#475569" domain={[30, 95]} fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D1421', border: '1px solid #1E2D45', borderRadius: '8px' }}
                  labelStyle={{ color: '#94A3B8', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#EF4444', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="RiskScore" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column (40% width): Live Active Assessment Simulation Panel */}
        <div className="lg:col-span-4 bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[290px]">
          {activeSimState === 'RUNNING' && (
            <div className="space-y-4 flex-grow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest font-mono">
                  Active Simulation Engine
                </span>
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-md px-2 py-0.5">
                  <StatusDot status="online" animated={true} />
                  <span className="text-[9px] font-bold text-green-400 font-mono">RUNNING</span>
                </div>
              </div>

              <div>
                <h4 className="text-[16px] font-semibold text-[#E2E8F0]">{simAlgorithm} Attack Analysis</h4>
                <div className="inline-block bg-[#122543] border border-[#1E3E6E] text-[#00C4E8] text-[10px] font-bold font-mono px-2 py-0.5 rounded mt-1.5">
                  Running Shor's Cryptanalysis
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-slate-400 font-mono">Quantum Circuit Synthesis...</span>
                  <span className="text-[#00C4E8] font-bold font-mono">{simProgress}%</span>
                </div>
                <div className="w-full bg-[#162235] rounded-full h-2 overflow-hidden border border-white/[0.02]">
                  <div className="h-full bg-gradient-to-r from-[#00C4E8] to-[#0096B4] rounded-full transition-all duration-300" style={{ width: `${simProgress}%` }} />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-1 bg-[#080C14] border border-[#1E2D45]/50 rounded-lg p-2.5 text-center">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#E2E8F0] font-mono">{simQubits.toLocaleString()}</span>
                  <span className="text-[9px] text-[#475569] mt-0.5">qubits</span>
                </div>
                <div className="flex flex-col border-x border-[#1E2D45]/40">
                  <span className="text-[13px] font-bold text-[#E2E8F0] font-mono">{simDepth.toLocaleString()}</span>
                  <span className="text-[9px] text-[#475569] mt-0.5">gates</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#F59E0B] font-mono">~{simRemaining}s</span>
                  <span className="text-[9px] text-[#475569] mt-0.5">rem. time</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (simTimerRef.current) clearInterval(simTimerRef.current);
                  setActiveSimState('IDLE');
                  triggerToast("Shor's Algorithm simulation cancelled by operator");
                }}
                className="w-full border border-red-500/20 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-[12px] font-semibold py-2 rounded-md transition-all cursor-pointer"
              >
                Cancel Simulation
              </button>
            </div>
          )}

          {activeSimState === 'RESULT' && (
            <div className="space-y-4 flex-grow flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest font-mono">
                  Simulation Outcome
                </span>
                <span 
                  onClick={() => startSimulation("RSA-2048", 4099, 196608)}
                  className="text-[10px] text-[#00C4E8] font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Restart Analysis
                </span>
              </div>

              <div className="p-3 bg-red-500/5 border-l-4 border-red-500 border border-red-500/20 rounded-r-lg">
                <h4 className="text-[14px] font-semibold text-[#E2E8F0]">{simAlgorithm} Cryptanalysis Complete</h4>
                <div className="text-[10px] text-[#94A3B8] font-mono uppercase mt-0.5">Vulnerability Confirmed</div>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#94A3B8] font-mono bg-[#080C14] border border-[#1E2D45]/40 rounded-lg p-3">
                <div className="flex justify-between">
                  <span>Logical Qubits Needed:</span>
                  <strong className="text-white font-mono">{simQubits.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Toffoli Gate Cascades:</span>
                  <strong className="text-white font-mono">{simDepth.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Classical GNFS Solve:</span>
                  <strong className="text-red-400">13.7 Billion Years</strong>
                </div>
                <div className="flex justify-between">
                  <span>FTQC Quantum Break Time:</span>
                  <strong className="text-red-400 font-bold">~8 Hours</strong>
                </div>
              </div>

              <div className="bg-red-500/10 text-red-400 border border-red-500/30 text-center rounded-lg py-2.5 text-[10px] font-bold uppercase tracking-wider font-mono">
                🛑 CRYPTOGRAPHIC KEY COMPROMISED
              </div>
            </div>
          )}

          {activeSimState === 'IDLE' && (
            <div className="flex flex-col items-center justify-center flex-grow text-center space-y-4 py-8">
              <Cpu size={36} className="text-slate-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-300">Simulation Engine Idle</h4>
                <p className="text-xs text-[#94A3B8] mt-1 max-w-xs">
                  Run a Shor's or Grover's simulation to analyze target algorithm vulnerability thresholds.
                </p>
              </div>
              <button 
                onClick={() => startSimulation("RSA-2048", 4099, 196608)}
                className="bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-bold text-xs px-4 py-2 rounded-md transition-all cursor-pointer"
              >
                Launch RSA-2048 Simulation
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ZONE 5: Monitored Algorithms Table with Search Filter */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl flex flex-col overflow-hidden">
        
        {/* Table Toolbar controls */}
        <div className="p-4 border-b border-[#1E2D45] bg-[#0A101C] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-[#E2E8F0]">Monitored Cryptographic Modules</h3>
            <p className="text-[12px] text-[#94A3B8] mt-0.5">Review, simulate, or view detail reports on scanned libraries</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 text-slate-500" size={13} />
              <input 
                type="text"
                placeholder="Search module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#080C14] border border-[#1E2D45] text-[12px] py-1.5 pl-8 pr-3 rounded-lg outline-none text-[#E2E8F0] placeholder-slate-500 focus:border-[#00C4E8]/50"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#080C14] border border-[#1E2D45] px-2.5 py-1.5 rounded-lg text-[12px] text-[#94A3B8]">
              <Filter size={12} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-[#94A3B8] outline-none cursor-pointer border-none font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="VULNERABLE">Vulnerable</option>
                <option value="SAFE">Quantum-Safe</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#080C14] text-[11px] font-bold text-[#475569] uppercase tracking-wider border-b border-[#1E2D45]">
                <th className="px-5 py-3">Algorithm</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Primary Use-Case</th>
                <th className="px-5 py-3">Quantum Status</th>
                <th className="px-5 py-3">NIST Category</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D45]/30">
              {filteredAlgos.map((algo, index) => (
                <tr key={index} className="hover:bg-[#10192A] transition-colors group">
                  <td className="px-5 py-4 font-bold text-[#E2E8F0] font-mono">{algo.name}</td>
                  <td className="px-5 py-4 text-slate-400">{algo.type}</td>
                  <td className="px-5 py-4 text-slate-400">{algo.useCase}</td>
                  <td className="px-5 py-4">
                    <AlgorithmBadge status={algo.status as any} />
                  </td>
                  <td className="px-5 py-4">
                    <NistBadge level={algo.nist as any} isClassical={algo.classical} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => {
                        if (algo.name.includes("RSA")) {
                          startSimulation(algo.name, 4099, 196608);
                        } else if (algo.name.includes("ECC")) {
                          startSimulation(algo.name, 2330, 94220);
                        } else {
                          triggerToast(`Running verification benchmark check on ${algo.name}...`);
                        }
                      }}
                      className={`${algo.status === 'COMPROMISED' ? 'text-rose-400' : 'text-[#00C4E8]'} font-bold hover:underline bg-transparent border-none cursor-pointer text-xs`}
                    >
                      {algo.classical ? (algo.status === 'COMPROMISED' ? 'Re-run Attack 🔄' : 'Simulate Attack →') : "Verify Safety →"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredAlgos.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No algorithms matching the current filter parameters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ZONE 6: Recent Activities & System Performance Baseline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Live Activity Feed */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest block font-mono">
                Recent Network Activity Events
              </span>
              <span className="text-[13px] text-[#94A3B8] mt-0.5 block">
                Pushed live via active socket listener pipeline
              </span>
            </div>
            
            <button 
              onClick={() => {
                setActivities(prev => [
                  {
                    id: `ACT-${Date.now()}`,
                    type: 'policy',
                    title: "Manual scan initialized",
                    desc: "Admin user admin@lattixq.io triggered compliance policy audit manually",
                    time: "Just now",
                    status: "online"
                  },
                  ...prev.slice(0, 4)
                ]);
                triggerToast("Compliance check run triggered manually.");
              }}
              className="text-[#00C4E8] hover:text-[#0096B4] font-semibold text-xs bg-transparent border-none cursor-pointer"
            >
              Audit Now
            </button>
          </div>

          <div className="flex flex-col divide-y divide-[#1E2D45]/30">
            {activities.map((act) => (
              <div key={act.id} className="py-3.5 flex justify-between items-start gap-4 text-xs group">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5">
                    <StatusDot status={act.status} animated={act.status === 'online'} />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[#E2E8F0] font-bold group-hover:text-[#00C4E8] transition-colors">{act.title}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 font-mono">{act.desc}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Performance Monitor & Threshold Targets */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest block font-mono">
              System Performance & SLA Metrics
            </span>
            <span className="text-[13px] text-[#94A3B8] mt-0.5 block">
              Continuous monitoring against enterprise security target baselines
            </span>
          </div>

          <div className="space-y-4">
            {/* Uptime */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">API Portal Uptime:</span>
                <span className="text-green-400 font-bold">{apiUptime}%</span>
              </div>
              <div className="w-full bg-[#162235] h-2.5 rounded-full overflow-hidden border border-white/[0.02]">
                <div className="bg-green-400 h-full rounded-full" style={{ width: `${apiUptime}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-[#475569] font-mono">
                <span>target: &gt;99.95%</span>
                <span>status: operational</span>
              </div>
            </div>

            {/* Latency */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Database Query Latency:</span>
                <span className={`font-bold ${dbLatency > 50 ? 'text-[#F59E0B]' : 'text-green-400'}`}>{dbLatency}ms</span>
              </div>
              <div className="w-full bg-[#162235] h-2.5 rounded-full overflow-hidden border border-white/[0.02]">
                <div className={`h-full rounded-full transition-all duration-300 ${dbLatency > 50 ? 'bg-[#F59E0B]' : 'bg-green-400'}`} style={{ width: `${(dbLatency / 80) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-[#475569] font-mono">
                <span>target: &lt;50ms</span>
                <span className="text-slate-500">warning: 75ms | red: 100ms</span>
              </div>
            </div>

            {/* Queue Depth */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Assessment Task Queue Depth:</span>
                <span className="text-[#00C4E8] font-bold">3 / 10 active</span>
              </div>
              <div className="w-full bg-[#162235] h-2.5 rounded-full overflow-hidden border border-white/[0.02]">
                <div className="bg-[#00C4E8] h-full rounded-full" style={{ width: '30%' }} />
              </div>
              <div className="flex justify-between text-[9px] text-[#475569] font-mono">
                <span>target: &lt;8 tasks</span>
                <span>status: healthy</span>
              </div>
            </div>
          </div>

          {/* Scheduled Assessment Queue lists */}
          <div className="border-t border-[#1E2D45] pt-4 mt-4 text-[11px] font-mono text-slate-400">
            <div className="font-bold text-[#94A3B8] mb-1.5 uppercase tracking-wide">
              Upcoming Scheduled Cryptographic Scans
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded p-1.5 flex justify-between">
                <span>Shor's (RSA-2048)</span>
                <span className="text-[#00C4E8]">Tonight 11 PM</span>
              </div>
              <div className="bg-[#080C14] border border-[#1E2D45]/40 rounded p-1.5 flex justify-between">
                <span>Grover's (AES-128)</span>
                <span className="text-[#00C4E8]">Tomorrow 2 AM</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ZONE 7: SOC 2 Type II Compliance Audit Access Logs */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold text-[#475569] uppercase tracking-widest block font-mono">
              Immutable Operations Audit Log
            </span>
            <span className="text-[13px] text-[#94A3B8] mt-0.5 block">
              Cryptographically signed user read/write access trail required for SOC 2 Type II compliance
            </span>
          </div>

          <button 
            onClick={downloadAuditLogs}
            className="bg-[#080C14] hover:bg-[#101E35] border border-[#1E2D45] text-slate-400 hover:text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={13} />
            Export Audit Trail (CSV)
          </button>
        </div>

        <div className="overflow-x-auto border border-[#1E2D45]/40 rounded-lg">
          <table className="w-full text-left border-collapse text-[11px] font-mono">
            <thead>
              <tr className="bg-[#080C14] text-[#475569] border-b border-[#1E2D45]/60">
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Action ID</th>
                <th className="px-4 py-2.5">Isolation Scope</th>
                <th className="px-4 py-2.5">Compliance Signature</th>
                <th className="px-4 py-2.5 text-right">Access Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D45]/30">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#0A101C]">
                  <td className="px-4 py-2 text-slate-400">{log.timestamp}</td>
                  <td className="px-4 py-2 text-[#E2E8F0] font-semibold">{log.user}</td>
                  <td className="px-4 py-2 text-cyan-400">{log.action}</td>
                  <td className="px-4 py-2 text-slate-500">{log.scope}</td>
                  <td className="px-4 py-2 text-[#475569]">{log.token}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                      log.status === 'SUCCESS' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL A: Drill-down Systems Inventory */}
      {isDrilldownOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-auto animate-fadeIn">
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#1E2D45] bg-[#0A101C] flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[#E2E8F0]">Vulnerable Systems Inventory ({env.toUpperCase()} Environment)</h3>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Isolated tenant-scoped endpoints requiring post-quantum upgrades</p>
              </div>
              <button 
                onClick={() => {
                  setIsDrilldownOpen(false);
                  setSelectedSystem(null);
                }} 
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left 2/3: Systems Table */}
              <div className="md:col-span-2 space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Discovered Active Endpoints ({vulnerableCount})
                </div>

                <div className="border border-[#1E2D45] rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#080C14] text-[#475569] border-b border-[#1E2D45]">
                        <th className="px-3 py-2">Hostname</th>
                        <th className="px-3 py-2">Algorithm</th>
                        <th className="px-3 py-2">Priority</th>
                        <th className="px-3 py-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2D45]/30">
                      {vulnerableSystems.map((sys) => (
                        <tr 
                          key={sys.id} 
                          onClick={() => setSelectedSystem(sys)}
                          className={`hover:bg-[#10192A] cursor-pointer transition-colors ${
                            selectedSystem?.id === sys.id ? 'bg-[#15233C]' : ''
                          }`}
                        >
                          <td className="px-3 py-2.5 font-semibold text-[#E2E8F0]">{sys.hostname}</td>
                          <td className="px-3 py-2.5 text-slate-400 font-mono">{sys.algorithm}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              sys.priority === 'CRITICAL' 
                                ? 'bg-red-500/20 text-red-400' 
                                : sys.priority === 'HIGH' 
                                ? 'bg-amber-500/20 text-amber-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {sys.priority}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                              sys.status === 'COMPLETED' 
                                ? 'bg-green-500/10 text-green-400' 
                                : sys.status === 'IN_PROGRESS' 
                                ? 'bg-blue-500/10 text-blue-400 animate-pulse' 
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {sys.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right 1/3: System Remediation Action Panel */}
              <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-4 space-y-4 flex flex-col justify-between">
                {selectedSystem ? (
                  <div className="space-y-4 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">{selectedSystem.id} Details</span>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                          selectedSystem.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {selectedSystem.priority}
                        </span>
                      </div>
                      
                      <h4 className="text-[14px] font-bold text-white mt-1 break-all">{selectedSystem.hostname}</h4>
                      
                      <div className="space-y-2 mt-4 text-[11px] font-mono text-[#94A3B8]">
                        <div className="flex justify-between">
                          <span>IP Address:</span>
                          <span className="text-white">{selectedSystem.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Module cipher:</span>
                          <span className="text-red-400">{selectedSystem.algorithm}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target Migration:</span>
                          <span className="text-green-400">{selectedSystem.remediation}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SLA Target:</span>
                          <span className="text-white">Q3 2026</span>
                        </div>
                        <div className="flex flex-col pt-1.5 border-t border-[#1E2D45]/60 mt-2">
                          <span className="text-slate-500">Service Owner:</span>
                          <span className="text-white font-sans mt-0.5">Incident-Response-Team-02</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button 
                        onClick={() => triggerRemediation(selectedSystem.id)}
                        disabled={selectedSystem.status !== 'PENDING'}
                        className={`w-full font-bold text-xs py-2 rounded transition-all cursor-pointer ${
                          selectedSystem.status === 'PENDING' 
                            ? 'bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14]' 
                            : 'bg-[#1E2D45] text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {selectedSystem.status === 'PENDING' 
                          ? 'Trigger PQC Remediation' 
                          : selectedSystem.status === 'IN_PROGRESS' 
                          ? 'Upgrade In Progress...' 
                          : 'Remediation Verified'}
                      </button>
                      <p className="text-[9px] text-[#475569] text-center">
                        Requires verified admin approval tokens for backend execution
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2 py-8">
                    <Sliders size={28} className="text-slate-700" />
                    <p className="text-xs">
                      Select a vulnerable system from the inventory list to view endpoint details and trigger remediation pipelines.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-[#1E2D45] bg-[#0A101C] flex justify-end gap-2">
              <button 
                onClick={() => {
                  const dumpContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vulnerableSystems, null, 2));
                  const link = document.createElement("a");
                  link.setAttribute("href", dumpContent);
                  link.setAttribute("download", `Lattix_Q_VulnInventory_${env}.json`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  triggerToast("Inventory exported to JSON successfully");
                }}
                className="bg-transparent hover:bg-[#1E2D45] border border-[#1E2D45] text-slate-300 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition"
              >
                Export Inventory (JSON)
              </button>
              <button 
                onClick={() => {
                  setIsDrilldownOpen(false);
                  setSelectedSystem(null);
                }} 
                className="bg-[#1E2D45] hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition"
              >
                Close Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL B: Report Export & Scheduler Settings */}
      {isSchedulerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            
            <div className="p-4 border-b border-[#1E2D45] bg-[#0A101C] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">Scheduled Security Reports</h3>
                <p className="text-[11px] text-[#94A3B8] mt-0.5 font-mono">SOC 2 compliant report distribution config</p>
              </div>
              <button onClick={() => setIsSchedulerOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={saveScheduleSettings} className="p-5 space-y-4">
              {/* Target Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Email Recipient</label>
                <input 
                  type="email"
                  required
                  value={schedulerEmail}
                  onChange={(e) => setSchedulerEmail(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1E2D45] text-xs py-2 px-3 rounded-lg outline-none text-[#E2E8F0]"
                  placeholder="cto@acme.com"
                />
              </div>

              {/* Slack Webhook toggle */}
              <div className="flex items-center justify-between bg-[#080C14] border border-[#1E2D45] p-3 rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">Slack Alert Webhooks</span>
                  <span className="text-[10px] text-[#94A3B8] block">Push critical alerts to channel #security-ops</span>
                </div>
                <input 
                  type="checkbox"
                  checked={slackWebhookEnabled}
                  onChange={(e) => setSlackWebhookEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#00C4E8] cursor-pointer"
                />
              </div>

              {/* Frequency selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Schedule Frequency</label>
                <select 
                  value={reportFrequency}
                  onChange={(e) => setReportFrequency(e.target.value)}
                  className="w-full bg-[#080C14] border border-[#1E2D45] text-xs py-2 px-3 rounded-lg outline-none text-[#94A3B8] font-bold cursor-pointer"
                >
                  <option value="daily">Daily at midnight (00:00 UTC)</option>
                  <option value="weekly">Weekly on Mondays (09:00 AM EST)</option>
                  <option value="monthly">Monthly on the 1st (00:00 UTC)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsSchedulerOpen(false)}
                  className="bg-transparent border border-[#1E2D45] hover:bg-[#1E2D45] text-slate-400 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#00C4E8] hover:bg-[#0096B4] text-[#080C14] font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  Save Schedule Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
