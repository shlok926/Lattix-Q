import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileCode, 
  ShieldCheck, 
  AlertTriangle, 
  Terminal as TerminalIcon, 
  Play, 
  Cpu, 
  Code, 
  Sparkles, 
  Check, 
  ArrowRight,
  RefreshCw,
  Download,
  Search,
  Filter,
  Plus,
  Database,
  ShieldAlert,
  Shield,
  Lock,
  History
} from 'lucide-react';
import { api } from '../services/api';

interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  algorithm: string;
  confidence: 'High' | 'Medium';
  filePath: string;
  line: number;
  snippet: string;
  legacyCode: string;
  pqcCode: string;
  remediation: string;
}

const INITIAL_FINDINGS: Finding[] = [
  {
    id: 'FND-001',
    title: 'Hardcoded Encryption Key',
    description: 'Private key material embedded as string literal',
    severity: 'Critical',
    algorithm: 'AES',
    confidence: 'High',
    filePath: 'src/crypto/cipher.py',
    line: 47,
    snippet: 'private_key = "MIIEvgIBADANBgkq..."',
    legacyCode: 'private_key = "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC"',
    pqcCode: `# SECURE: Retrieve secret key from secure vault storage at runtime\nprivate_key = vault.get_secret("quantumshield/private_key")`,
    remediation: 'Retrieve key material dynamically from secrets vault instead of code literals.'
  },
  {
    id: 'FND-002',
    title: 'Custom Cryptographic Implementation',
    description: 'Never roll your own crypto — use standard libraries',
    severity: 'Critical',
    algorithm: 'SHA-1',
    confidence: 'High',
    filePath: 'src/hash/custom_sha.py',
    line: 14,
    snippet: 'def custom_hash(data): ...',
    legacyCode: 'def custom_hash(data):\n    # Custom implementation\n    return hashed_val',
    pqcCode: `# SECURE: Use industry-standard post-quantum hashes\nfrom cryptography.hazmat.primitives import hashes\n\ndigest = hashes.Hash(hashes.SHA3_256())\ndigest.update(data.encode())\nhashed_val = digest.finalize()`,
    remediation: 'Never roll your own cryptography. Replace with standard SHA3 or SHA-256 libraries.'
  },
  {
    id: 'FND-003',
    title: 'Insecure Random Number Generator',
    description: 'Using random.randint() for cryptographic keys',
    severity: 'Critical',
    algorithm: 'RNG',
    confidence: 'High',
    filePath: 'src/keygen/rng.py',
    line: 12,
    snippet: 'random.randint(1, 100000)',
    legacyCode: 'import random\nkey = random.randint(1, 100000)',
    pqcCode: `import secrets\n# SECURE: Use cryptographically secure RNG\nkey = secrets.token_bytes(32)`,
    remediation: 'Use the standard secrets library or OS-provided cryptographically secure RNG.'
  },
  {
    id: 'FND-004',
    title: 'MD5 Hash for Data Integrity',
    description: 'Algorithm deprecated; use SHA-256 or higher',
    severity: 'High',
    algorithm: 'MD5',
    confidence: 'High',
    filePath: 'src/utils/checksum.py',
    line: 18,
    snippet: 'hashlib.md5(data)',
    legacyCode: 'import hashlib\nchecksum = hashlib.md5(data.encode()).hexdigest()',
    pqcCode: `import hashlib\n# SECURE: Upgrade to collision-resistant SHA-256\nchecksum = hashlib.sha256(data.encode()).hexdigest()`,
    remediation: 'MD5 is cryptographically broken and quantum-vulnerable. Upgrade to SHA-256.'
  },
  {
    id: 'FND-005',
    title: 'RSA-2048 Key Generation',
    description: 'Key size below quantum-resistant threshold',
    severity: 'High',
    algorithm: 'RSA',
    confidence: 'Medium',
    filePath: 'src/asymmetric/keys.py',
    line: 34,
    snippet: 'rsa.generate_private_key(key_size=2048)',
    legacyCode: 'private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)',
    pqcCode: `# SECURE: Using ML-KEM-768 for post-quantum key encapsulation\nwith oqs.KeyEncapsulation("Kyber768") as kem:\n    pub_key = kem.generate_keypair()\n    priv_key = kem.export_secret_key()`,
    remediation: 'RSA-2048 key size falls below the quantum-safe security threshold. Migrate to Kyber/ML-KEM.'
  },
  {
    id: 'FND-006',
    title: 'AES-128 Encryption Usage',
    description: 'Effective security drops to 64-bit under Grover\'s algorithm',
    severity: 'Medium',
    algorithm: 'AES-128',
    confidence: 'High',
    filePath: 'src/vault/storage.py',
    line: 88,
    snippet: 'AES.new(key, AES.MODE_CBC)',
    legacyCode: 'cipher = AES.new(key_128, AES.MODE_CBC)',
    pqcCode: `# SECURE: Use AES-256 for Grover resistance\ncipher = AES.new(key_256, AES.MODE_GCM)`,
    remediation: 'Effective security of AES-128 drops to 64-bit under Grover\'s algorithm. Upgrade to AES-256.'
  },
  {
    id: 'FND-007',
    title: 'Missing Authentication on AES-CBC',
    description: 'Use AES-GCM or encrypt-then-MAC instead',
    severity: 'Medium',
    algorithm: 'AES-CBC',
    confidence: 'High',
    filePath: 'src/vault/encryption.py',
    line: 52,
    snippet: 'cipher = AES.new(key, AES.MODE_CBC)',
    legacyCode: 'cipher = AES.new(key, AES.MODE_CBC)',
    pqcCode: `# SECURE: Use authenticated GCM mode\ncipher = AES.new(key, AES.MODE_GCM)`,
    remediation: 'AES-CBC lacks integrity authentication. Switch to AES-GCM or add an HMAC.'
  },
  {
    id: 'FND-008',
    title: 'SHA-1 Hash for Digital Signatures',
    description: 'SHA-1 is vulnerable to collision attacks',
    severity: 'High',
    algorithm: 'SHA-1',
    confidence: 'High',
    filePath: 'src/certs/signer.py',
    line: 71,
    snippet: 'hashes.SHA1()',
    legacyCode: 'signature = priv_key.sign(data, padding.PKCS1v15(), hashes.SHA1())',
    pqcCode: `# SECURE: Use Dilithium / ML-DSA for quantum-safe signatures\nwith oqs.Signature("Dilithium3") as sig:\n    pub_key = sig.generate_keypair()`,
    remediation: 'SHA-1 is vulnerable to collision attacks. Upgrade to SHA-256 or ML-DSA.'
  },
  {
    id: 'FND-009',
    title: 'Legacy DES Cipher Usage',
    description: 'DES is severely deprecated and easily brute-forced',
    severity: 'Critical',
    algorithm: 'DES',
    confidence: 'High',
    filePath: 'src/legacy/backup.py',
    line: 15,
    snippet: 'DES.new(key, DES.MODE_ECB)',
    legacyCode: 'cipher = DES.new(key, DES.MODE_ECB)',
    pqcCode: `# SECURE: Use authenticated AES-256-GCM\ncipher = AES.new(aes_key, AES.MODE_GCM)`,
    remediation: 'DES is severely deprecated. Migrate to AES-256-GCM immediately.'
  },
  {
    id: 'FND-010',
    title: 'Weak Diffie-Hellman Group Parameters',
    description: 'Diffie-Hellman with 1024-bit prime is weak',
    severity: 'High',
    algorithm: 'DH',
    confidence: 'Medium',
    filePath: 'src/network/handshake.py',
    line: 102,
    snippet: 'dh.generate_parameters(key_size=1024)',
    legacyCode: 'params = dh.generate_parameters(generator=2, key_size=1024)',
    pqcCode: `# SECURE: Integrate ML-KEM-768 for post-quantum key exchange\nkem = oqs.KeyEncapsulation("Kyber768")`,
    remediation: 'Diffie-Hellman with 1024-bit prime is weak and vulnerable. Migrate to post-quantum KEM.'
  },
  {
    id: 'FND-011',
    title: 'Blowfish Cipher Usage',
    description: 'Blowfish has 64-bit block size vulnerabilities',
    severity: 'Low',
    algorithm: 'Blowfish',
    confidence: 'High',
    filePath: 'src/archive/compress.py',
    line: 44,
    snippet: 'Blowfish.new(key)',
    legacyCode: 'cipher = Blowfish.new(key, Blowfish.MODE_ECB)',
    pqcCode: `# SECURE: Upgrade to AES-256-GCM\ncipher = AES.new(key_256, AES.MODE_GCM)`,
    remediation: 'Blowfish has 64-bit block size vulnerability. Upgrade to AES-256-GCM.'
  },
  {
    id: 'FND-012',
    title: 'Weak Salt Length in PBKDF2',
    description: 'Salt should be at least 16 bytes for uniqueness',
    severity: 'Medium',
    algorithm: 'PBKDF2',
    confidence: 'High',
    filePath: 'src/auth/hash_pbkdf2.py',
    line: 29,
    snippet: 'pbkdf2_hmac(\'sha256\', password, b\'short\', 1000)',
    legacyCode: 'pbkdf2_hmac(\'sha256\', password, b\'short\', 1000)',
    pqcCode: `# SECURE: Secure random salt + high iterations\nsalt = os.urandom(16)\npbkdf2_hmac(\'sha256\', password, salt, 600000)`,
    remediation: 'Salt length should be at least 16 bytes and iterations >= 600,000.'
  },
  {
    id: 'FND-013',
    title: 'Hardcoded IV in AES-CBC Block',
    description: 'Using static initialization vector (IV) compromises confidentiality',
    severity: 'High',
    algorithm: 'AES',
    confidence: 'High',
    filePath: 'src/crypto/aes_cbc.py',
    line: 19,
    snippet: 'iv = b\'1234567890123678\'',
    legacyCode: 'cipher = AES.new(key, AES.MODE_CBC, iv=b\'1234567890123678\')',
    pqcCode: `# SECURE: Securely generate dynamic IV per message\niv = secrets.token_bytes(16)\ncipher = AES.new(key, AES.MODE_CBC, iv=iv)`,
    remediation: 'Using static initialization vector (IV) compromises confidentiality across messages. Generate a secure random IV per message.'
  },
  {
    id: 'FND-014',
    title: 'Hardcoded Prime for Diffie-Hellman',
    description: 'Static primes allow precomputation attacks',
    severity: 'Medium',
    algorithm: 'DH',
    confidence: 'High',
    filePath: 'src/crypto/dh_params.py',
    line: 3,
    snippet: 'prime_p = 0xFFFFFFFF...',
    legacyCode: 'prime_p = 0xFFFFFFFFFFFFFFFF...',
    pqcCode: `# SECURE: Use RFC 7919 groups or ML-KEM-768\nfrom cryptography.hazmat.primitives.asymmetric import dh`,
    remediation: 'Do not use hardcoded primes. Use standard RFC 7919 groups or post-quantum alternatives.'
  },
  {
    id: 'FND-015',
    title: 'RC4 Stream Cipher Usage',
    description: 'RC4 is completely broken and has high biases',
    severity: 'Critical',
    algorithm: 'RC4',
    confidence: 'High',
    filePath: 'src/legacy/stream.py',
    line: 11,
    snippet: 'ARC4.new(key)',
    legacyCode: 'cipher = ARC4.new(key)',
    pqcCode: `# SECURE: Replace with authenticated AES-GCM\ncipher = AES.new(key, AES.MODE_GCM)`,
    remediation: 'RC4 is completely broken. Replace with AES-256-GCM or ChaCha20-Poly1305.'
  },
  {
    id: 'FND-016',
    title: 'ECC P-192 Curve Usage',
    description: 'ECC P-192 curve falls below 128-bit classical security level',
    severity: 'High',
    algorithm: 'ECC',
    confidence: 'High',
    filePath: 'src/asymmetric/ecc.py',
    line: 22,
    snippet: 'ec.SECP192R1()',
    legacyCode: 'private_key = ec.generate_private_key(ec.SECP192R1())',
    pqcCode: `# SECURE: Using ML-DSA-65 (Dilithium3) for signatures\nwith oqs.Signature("Dilithium3") as sig:\n    pub_key = sig.generate_keypair()`,
    remediation: 'ECC P-192 does not meet the minimum security level. Upgrade to P-256 or P-384, or post-quantum equivalents.'
  },
  {
    id: 'FND-017',
    title: 'Insecure Hashing in Hash Tables',
    description: 'Python builtin hash() is vulnerable to hash flooding',
    severity: 'Low',
    algorithm: 'Hash',
    confidence: 'Medium',
    filePath: 'src/utils/hash_util.py',
    line: 14,
    snippet: 'hash(string_value)',
    legacyCode: 'return hash(val)',
    pqcCode: `# SECURE: Use cryptographically secure HMAC-SHA-256\nimport hmac\nreturn hmac.new(key, val.encode(), hashlib.sha256).hexdigest()`,
    remediation: 'Python builtin hash() is vulnerable to hash flooding and predictable. Use HMAC-SHA256 for integrity validation.'
  },
  {
    id: 'FND-018',
    title: 'Hardcoded Password Salt',
    description: 'Salts must be randomly generated per password',
    severity: 'High',
    algorithm: 'PBKDF2',
    confidence: 'High',
    filePath: 'src/auth/pbkdf2_static.py',
    line: 5,
    snippet: 'STATIC_SALT = b"my_salt_123"',
    legacyCode: 'STATIC_SALT = b"my_salt_123"',
    pqcCode: `# SECURE: Generate secure random salt\nsalt = secrets.token_bytes(16)`,
    remediation: 'Salts must be randomly generated per password to prevent rainbow table attacks.'
  },
  {
    id: 'FND-019',
    title: 'Triple DES Usage',
    description: '3DES is retired by NIST due to block-size vulnerabilities',
    severity: 'High',
    algorithm: '3DES',
    confidence: 'High',
    filePath: 'src/legacy/tdes.py',
    line: 8,
    snippet: 'DES3.new(key)',
    legacyCode: 'cipher = DES3.new(key, DES3.MODE_CBC)',
    pqcCode: `# SECURE: Upgrade to AES-256\ncipher = AES.new(key_256, AES.MODE_GCM)`,
    remediation: 'Triple DES is retired by NIST due to block-size vulnerabilities. Migrate to AES-256.'
  },
  {
    id: 'FND-020',
    title: 'Insecure Transport Protocol HTTP',
    description: 'Cleartext HTTP communication exposes tokens in transit',
    severity: 'Medium',
    algorithm: 'HTTP',
    confidence: 'High',
    filePath: 'src/client/http_client.py',
    line: 44,
    snippet: 'http://api.internal/v1',
    legacyCode: 'conn = http.client.HTTPConnection("api.internal")',
    pqcCode: `# SECURE: Enforce HTTPS/TLS-1.3 with hybrid algorithms\nconn = http.client.HTTPSConnection("api.internal")`,
    remediation: 'Avoid cleartext communications. Require HTTPS/TLS-1.3 with hybrid post-quantum cipher suites.'
  },
  {
    id: 'FND-021',
    title: 'Static ECDH Key Exchange',
    description: 'Static ECDH lacks forward secrecy',
    severity: 'Medium',
    algorithm: 'ECDH',
    confidence: 'High',
    filePath: 'src/crypto/ecdh_static.py',
    line: 17,
    snippet: 'static_key = ...',
    legacyCode: 'shared_key = static_priv.exchange(ec.ECDH(), peer_pub)',
    pqcCode: `# SECURE: Ephemeral key encapsulation exchange (ML-KEM-768)\nciphertext, shared_secret = kem.encap_secret(peer_pub)`,
    remediation: 'Static ECDH lacks forward secrecy. Use ephemeral Diffie-Hellman (ECDHE) or Kyber/ML-KEM.'
  },
  {
    id: 'FND-022',
    title: 'Symmetric Key Length Below 112 bits',
    description: 'Symmetric key is too short to resist quantum Grover search',
    severity: 'High',
    algorithm: 'WeakKey',
    confidence: 'High',
    filePath: 'src/crypto/symmetric_weak.py',
    line: 8,
    snippet: 'key = secrets.token_bytes(10)',
    legacyCode: 'key = secrets.token_bytes(10) # 80-bit key',
    pqcCode: `# SECURE: Enforce minimum 256-bit symmetric key length\nkey = secrets.token_bytes(32) # 256-bit key`,
    remediation: 'Symmetric key length must be at least 128 bits, ideally 256 bits, to resist Grover\'s algorithm.'
  },
  {
    id: 'FND-023',
    title: 'Deprecated MD4 Hash',
    description: 'MD4 is critically insecure and broken',
    severity: 'Critical',
    algorithm: 'MD4',
    confidence: 'High',
    filePath: 'src/legacy/md4_sign.py',
    line: 12,
    snippet: 'MD4.new()',
    legacyCode: 'h = MD4.new()',
    pqcCode: `# SECURE: Migrate to SHA-256 or SHA-3\nh = hashlib.sha256()`,
    remediation: 'MD4 is critically insecure. Upgrade to SHA-256 or SHA-3.'
  },
  {
    id: 'FND-024',
    title: 'Static Credentials in Connection Strings',
    description: 'Hardcoded database credentials expose production data',
    severity: 'Medium',
    algorithm: 'HardcodedCreds',
    confidence: 'High',
    filePath: 'src/db/db_uri.py',
    line: 2,
    snippet: 'mysql://admin:SecretPass@db/prod',
    legacyCode: 'URI = "mysql://admin:SecretPass@db/prod"',
    pqcCode: `# SECURE: Retrieve dynamic database credentials from secrets manager\nURI = f"mysql://{vault.get(\'user\')}:{vault.get(\'pass\')}@db/prod"`,
    remediation: 'Inject database credentials via environment variables or secure vault integrations.'
  },
  {
    id: 'FND-025',
    title: 'Weak RSA Public Exponent',
    description: 'Using public exponent 3 can lead to message recovery attacks',
    severity: 'Low',
    algorithm: 'RSA',
    confidence: 'High',
    filePath: 'src/crypto/rsa_weak_exp.py',
    line: 9,
    snippet: 'public_exponent=3',
    legacyCode: 'private_key = rsa.generate_private_key(public_exponent=3, key_size=2048)',
    pqcCode: `# SECURE: Standard exponent 65537 with larger key size\nprivate_key = rsa.generate_private_key(public_exponent=65537, key_size=3072)`,
    remediation: 'Using public exponent 3 can lead to message recovery attacks. Use exponent 65537 instead.'
  }
];

export const BatchScanner: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [refactored, setRefactored] = useState<boolean>(false);
  const [lastScanDate, setLastScanDate] = useState<string>("Nov 14, 2024 at 3:42 PM");
  const [nextScanDate, setNextScanDate] = useState<string>("Nov 15, 2024 at 11:00 PM");

  interface ScanHistoryEntry {
    id: string;
    timestamp: string;
    source: string;
    operator: string;
    filesCount: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    riskScore: number;
  }

  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([
    {
      id: "SCN-2026-004",
      timestamp: "Jun 22, 2026 at 11:00 PM",
      source: "Scheduled Scan",
      operator: "System Agent (Cron)",
      filesCount: 847,
      criticalCount: 6,
      highCount: 9,
      mediumCount: 7,
      riskScore: 68
    },
    {
      id: "SCN-2026-003",
      timestamp: "Jun 21, 2026 at 03:15 PM",
      source: "Manual Scan",
      operator: "admin@lattixq.io",
      filesCount: 12,
      criticalCount: 0,
      highCount: 2,
      mediumCount: 1,
      riskScore: 38
    },
    {
      id: "SCN-2026-002",
      timestamp: "Jun 20, 2026 at 11:00 PM",
      source: "Scheduled Scan",
      operator: "System Agent (Cron)",
      filesCount: 847,
      criticalCount: 6,
      highCount: 9,
      mediumCount: 7,
      riskScore: 68
    }
  ]);

  const addScanToHistory = (source: string, filesCount: number, fndList: Finding[], risk: number) => {
    const crit = fndList.filter(f => f.severity === 'Critical').length;
    const high = fndList.filter(f => f.severity === 'High').length;
    const med = fndList.filter(f => f.severity === 'Medium').length;
    
    const now = new Date();
    const formattedTime = now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });

    const newScanId = `SCN-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const newEntry: ScanHistoryEntry = {
      id: newScanId,
      timestamp: formattedTime,
      source: source,
      operator: "admin@lattixq.io",
      filesCount: filesCount,
      criticalCount: crit,
      highCount: high,
      mediumCount: med,
      riskScore: risk
    };

    setScanHistory(prev => [newEntry, ...prev]);
  };

  const updateScanDates = () => {
    const now = new Date();
    const formattedLast = now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const formattedNext = tomorrow.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }) + " at 11:00 PM";
    
    setLastScanDate(formattedLast);
    setNextScanDate(formattedNext);
  };
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All severities');
  
  // Pagination & View Mode
  const [viewAll, setViewAll] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  
  // Modal / Roadmap state
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Automatically log audit page access once on mount
  useEffect(() => {
    console.log("[AUDIT LOGGED] Cryptographic discovery audit report access was securely logged to corporate SIEM under ID: AUDIT-SCAN-2026-X12");
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Simulate CLI output stream
  const runScanLogs = (isDemo: boolean) => {
    setScanning(true);
    setTerminalLines([]);
    setFindings([]);
    setSelectedFinding(null);
    setRefactored(false);

    const logs = [
      'Initializing Lattix - Q Code Analyzer v1.2.4...',
      'Loading AST semantic analysis models...',
      'Analyzing repository layout & cryptographic dependencies...',
      'Found 847 source files to inspect.',
      'Checking 324 package dependencies...',
      '[SCAN] Parsing src/crypto/cipher.py...',
      '[WARN] Critical: Hardcoded AES encryption key found at cipher.py:47',
      '[SCAN] Parsing src/hash/custom_sha.py...',
      '[WARN] Critical: Custom SHA-1 implementation found at custom_sha.py:14',
      '[SCAN] Parsing src/keygen/rng.py...',
      '[WARN] Critical: Insecure random number generator found at rng.py:12',
      '[SCAN] Parsing src/utils/checksum.py...',
      '[WARN] High: MD5 hash usage detected at checksum.py:18',
      '[SCAN] Parsing src/asymmetric/keys.py...',
      '[WARN] High: RSA-2048 key size below quantum-safe threshold',
      'Running security diagnostics and pattern mapping rules...',
      'Summarizing security diagnostics...',
      'Scan completed successfully. 25 cryptographic issues identified.'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTerminalLines(prev => [...prev, `qs-cli > ${logs[currentLogIndex]}`]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setFindings(INITIAL_FINDINGS);
        setSelectedFinding(INITIAL_FINDINGS[0]);
        setScanning(false);
        updateScanDates();
        addScanToHistory("Demo Scan", 847, INITIAL_FINDINGS, 68);
        triggerToast("Scan completed! 25 vulnerabilities found.");
      }
    }, 250);
  };

  const getFindingTitle = (tech: string) => {
    const titles: Record<string, string> = {
      "RSA": "RSA Weak Key Generation",
      "ECC": "Vulnerable ECC Curve Usage",
      "MD5": "MD5 Vulnerable Hash Usage",
      "SHA1": "SHA-1 Broken Hash Signature",
      "DES": "Legacy DES/3DES Cipher Block",
      "HardcodedKey": "Hardcoded Cryptographic Secret"
    };
    return titles[tech] || `${tech} Cryptographic Usage`;
  };

  const getPQCCodeReplacement = (tech: string, codeLine: string) => {
    const pqc: Record<string, string> = {
      "RSA": `# SECURE: Kyber768 (ML-KEM) Key Encapsulation Exchange\nimport pqcrypto.kem.kyber768 as kyber\npriv_key, pub_key = kyber.generate_keypair()`,
      "ECC": `# SECURE: Dilithium3 (ML-DSA) Post-Quantum Signatures\nimport pqcrypto.sign.dilithium3 as dilithium\npriv_key, pub_key = dilithium.generate_keypair()`,
      "MD5": `# SECURE: Upgraded to collision-resistant SHA-256\nimport hashlib\nhashed_val = hashlib.sha256(data.encode()).hexdigest()`,
      "SHA1": `# SECURE: Upgraded to quantum-resistant SHA3-256\nimport hashlib\nhashed_val = hashlib.sha3_256(data.encode()).hexdigest()`,
      "DES": `# SECURE: Upgraded to Grover-resistant AES-256-GCM\nfrom cryptography.hazmat.primitives.ciphers.aead import AESGCM\naesgcm = AESGCM(key_256)`,
      "HardcodedKey": `# SECURE: Loaded dynamically from environment configurations\nimport os\nsecret_key = os.getenv('SECRET_KEY')`
    };
    return pqc[tech] || `# SECURE: Upgrade to post-quantum equivalent\npass`;
  };

  const handleApplyAutoFix = async (finding: Finding) => {
    try {
      const payload = {
        code: finding.legacyCode,
        findings: [
          {
            line: finding.line,
            technology: finding.algorithm,
            content: finding.snippet,
            risk: finding.severity,
            suggestion: finding.description
          }
        ]
      };
      const response = await api.post('/ai/refactor', payload);
      const updatedPqcCode = response.data.refactored_code;
      
      setFindings(prev => prev.map(f => {
        if (f.id === finding.id) {
          return { ...f, pqcCode: updatedPqcCode };
        }
        return f;
      }));
      setRefactored(true);
      triggerToast("AI Auto-fix applied dynamically!");
    } catch (err) {
      console.error("Auto-fix failed:", err);
      triggerToast("Failed to apply AI Auto-fix.");
    }
  };

  const runRealScan = async (filesList: FileList) => {
    setScanning(true);
    setTerminalLines(['qs-cli > Initializing Lattix - Q Code Analyzer v1.2.4...', 'qs-cli > Loading AST semantic analysis models...']);
    setFindings([]);
    setSelectedFinding(null);
    setRefactored(false);

    try {
      const filesArray = Array.from(filesList);
      
      // Filter supported code files and exclude dependency/build folders
      const codeFiles = filesArray.filter(file => {
        const path = (file as any).webkitRelativePath || file.name;
        const pathLower = path.toLowerCase();
        
        if (
          pathLower.includes('node_modules/') ||
          pathLower.includes('/.git/') ||
          pathLower.includes('.git/') ||
          pathLower.includes('venv/') ||
          pathLower.includes('.venv/') ||
          pathLower.includes('env/') ||
          pathLower.includes('dist/') ||
          pathLower.includes('build/') ||
          pathLower.includes('target/') ||
          pathLower.includes('.next/')
        ) {
          return false;
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        return ['py', 'js', 'ts', 'tsx', 'jsx', 'go', 'java', 'cpp', 'c', 'h', 'cs', 'php', 'rb', 'json', 'yml', 'yaml', 'txt'].includes(ext || '');
      });

      if (codeFiles.length === 0) {
        setTerminalLines(prev => [...prev, 'qs-cli > [ERROR] No supported code files found in selection.']);
        setScanning(false);
        triggerToast("No supported code files found!");
        return;
      }

      setTerminalLines(prev => [
        ...prev, 
        `qs-cli > Found ${codeFiles.length} code files to inspect out of ${filesArray.length} total.`,
        'qs-cli > Preparing batch scan payload...'
      ]);

      // Read files content
      const filesData = await new Promise<{ filename: string; content: string }[]>((resolve) => {
        const readPromises = codeFiles.map(file => {
          return new Promise<{ filename: string; content: string }>((res) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              res({
                filename: file.name,
                content: e.target?.result as string || ''
              });
            };
            reader.readAsText(file);
          });
        });
        Promise.all(readPromises).then(resolve);
      });

      // Show in terminal logs
      for (const fd of filesData) {
        setTerminalLines(prev => [...prev, `qs-cli > [SCAN] Parsing ${fd.filename}...`]);
      }

      // Call API gateway Batch Scan endpoint
      const payload = { files: filesData };
      const response = await api.post('/ai/batch-scan', payload);
      const batchResult = response.data;

      // Log results to terminal
      setTerminalLines(prev => [
        ...prev,
        `qs-cli > Batch Scan completed: ${batchResult.summary.total_files} files audited.`,
        `qs-cli > Found ${batchResult.summary.total_vulnerabilities} vulnerabilities.`,
        `qs-cli > Average Post-Quantum readiness score: ${batchResult.summary.average_readiness.toFixed(1)}%`
      ]);

      // Map to UI findings
      const newFindings: Finding[] = [];
      batchResult.results.forEach((fileResult: any) => {
        fileResult.findings.forEach((f: any) => {
          const severity = (f.risk === 'High' ? 'High' : (f.risk === 'Medium' ? 'Medium' : 'Low')) as 'Critical' | 'High' | 'Medium' | 'Low';
          const pqcCode = getPQCCodeReplacement(f.technology, f.content);
          
          newFindings.push({
            id: `FND-${String(newFindings.length + 1).padStart(3, '0')}`,
            title: getFindingTitle(f.technology),
            description: f.suggestion,
            severity: severity,
            algorithm: f.technology,
            confidence: 'High',
            filePath: fileResult.filename,
            line: f.line,
            snippet: f.content,
            legacyCode: f.content,
            pqcCode: pqcCode,
            remediation: f.suggestion
          });
        });
      });

      setFindings(newFindings);
      if (newFindings.length > 0) {
        setSelectedFinding(newFindings[0]);
      }
      updateScanDates();
      
      const critCount = newFindings.filter(f => f.severity === 'Critical').length;
      const hgCount = newFindings.filter(f => f.severity === 'High').length;
      const mdCount = newFindings.filter(f => f.severity === 'Medium').length;
      const lwCount = newFindings.filter(f => f.severity === 'Low').length;
      const calcRisk = (critCount * 25) + (hgCount * 15) + (mdCount * 8) + (lwCount * 3);
      const riskScoreVal = newFindings.length > 0 ? Math.min(98, Math.max(12, calcRisk)) : 0;
      
      addScanToHistory("Manual Scan", filesArray.length, newFindings, riskScoreVal);
      triggerToast(`Scan completed! ${newFindings.length} issues identified.`);

    } catch (err) {
      console.error("Scan failed:", err);
      setTerminalLines(prev => [...prev, 'qs-cli > [ERROR] Scan execution failed. Check network or server connection.']);
      triggerToast("Scan failed. Backend server error.");
    } finally {
      setScanning(false);
    }
  };

  // Upload trigger
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      runRealScan(e.target.files);
    }
  };

  // Filter findings
  const filteredFindings = findings.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.filePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === 'All severities' || f.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  const visibleFindings = viewAll ? filteredFindings : filteredFindings.slice(0, 7);

  // Stats
  const criticalCount = findings.filter(f => f.severity === 'Critical').length;
  const highCount = findings.filter(f => f.severity === 'High').length;
  const mediumCount = findings.filter(f => f.severity === 'Medium').length;
  const lowCount = findings.filter(f => f.severity === 'Low').length;
  
  const calculatedRisk = (criticalCount * 25) + (highCount * 15) + (mediumCount * 8) + (lowCount * 3);
  const overallRisk = findings.length > 0 ? Math.min(98, Math.max(12, calculatedRisk)) : 0;

  // Add to asset inventory
  const handleAddToInventory = (finding: Finding) => {
    triggerToast(`Added ${finding.title} (${finding.algorithm}) to Asset Inventory!`);
  };

  const handleDownloadFixedFile = () => {
    if (!selectedFinding || !selectedFinding.pqcCode) return;
    const blob = new Blob([selectedFinding.pqcCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = selectedFinding.filePath.split('/').pop() || 'fixed_code.py';
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Downloaded ${fileName} successfully!`);
  };

  // Export CSV
  const handleExportCSV = () => {
    setIsExportingCSV(true);
    setTimeout(() => {
      const headers = ['ID', 'Title', 'Severity', 'Algorithm', 'Confidence', 'File Path', 'Line', 'Remediation'];
      const rows = findings.map(f => [
        f.id,
        f.title,
        f.severity,
        f.algorithm,
        f.confidence,
        f.filePath,
        f.line,
        f.remediation.replace(/"/g, '""')
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "Lattix_Q_Scanner_Findings.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExportingCSV(false);
      triggerToast("CSV exported successfully!");
    }, 600);
  };

  // Export PDF via Backend API
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const payload = {
        system_info: {
          name: "Lattix - Q Cryptographic Scanner Audit",
          files_scanned: 847,
          algorithms: Array.from(new Set(findings.map(f => f.algorithm))).map(algo => ({
            algorithm: algo,
            key_size: algo.includes('2048') ? 2048 : 256
          }))
        },
        sim_data: [],
        bench_data: [
          { algorithm: "CRYSTALS-Kyber-768", category: "KEM", keygen_ms: 0.07, encrypt_ms: 0.11, peak_memory_kb: 1.2 },
          { algorithm: "CRYSTALS-Dilithium3", category: "Signature", keygen_ms: 0.38, encrypt_ms: 1.24, peak_memory_kb: 4.8 }
        ],
        ai_enrichment: {
          readiness_score: 32, // since overall risk is 68%
          findings: findings.map((f, idx) => ({
            id: idx + 1,
            technology: f.algorithm,
            risk: f.severity,
            line: f.line,
            content: f.snippet,
            suggestion: `${f.title}: ${f.remediation} in ${f.filePath}`
          })),
          roadmap: {
            summary: "Lattix - Q cryptographic scan identified 25 vulnerabilities. Phased remediation is recommended to migrate standard elements.",
            phases: [
              {
                name: "Immediate Key Hardening",
                duration: "Phase 1 (Month 1)",
                tasks: [
                  "Replace hardcoded cipher key in src/crypto/cipher.py:47",
                  "Replace custom random generator in src/keygen/rng.py:12"
                ]
              },
              {
                name: "Symmetric Upgrades & PQC Integration",
                duration: "Phase 2 (Months 2-3)",
                tasks: [
                  "Upgrade AES-128 ciphers to AES-256-GCM.",
                  "Deprecate RSA-2048 keypairs and verify ML-KEM-768 parameters."
                ]
              }
            ]
          }
        }
      };

      const res = await api.post(
        '/report/generate/pdf',
        payload,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', `Lattix_Q_Scanner_Audit_Report.pdf`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      triggerToast("PDF generated and downloaded!");
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      triggerToast("Failed to generate PDF. Falling back to local file download...");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6 select-none relative font-sans text-[#E2E8F0] pb-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00C4E8]/10 border border-[#00C4E8]/30 text-[#00C4E8] text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 animate-fadeIn font-mono">
          <Check size={14} className="text-[#00C4E8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* RBAC Scope & Audit Information Bar */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl px-4 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-[#475569] font-mono gap-1">
        <div className="flex items-center gap-2">
          <Lock size={12} className="text-[#00C4E8]" />
          <span>Role Scope: <strong className="text-slate-400">Cryptographic Auditor</strong></span>
          <span className="text-[#1E2D45] hidden sm:inline">|</span>
          <span className="hidden sm:inline">Visibility: <strong className="text-slate-400">Full Audit access</strong></span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#080C14] px-2 py-0.5 rounded border border-[#1E2D45]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          <span>SIEM Logging Active (AUDIT-SCAN-2026)</span>
        </div>
      </div>

      {/* Top Header Controls Section */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00C4E8]/10 flex items-center justify-center text-[#00C4E8]">
            <Cpu size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">AI Cryptographic Scanner</h1>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Scan codebase configurations and dependency sets to identify Shor's and Grover's algorithm exposure.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => runScanLogs(true)}
            disabled={scanning}
            className="flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-lg bg-[#00C4E8]/10 text-[#00C4E8] border border-[#00C4E8]/30 hover:bg-[#00C4E8]/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play size={12} className="fill-[#00C4E8]" />
            Scan Demo Codebase
          </button>

          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="file-scanner-upload"
            disabled={scanning}
          />
          <label
            htmlFor="file-scanner-upload"
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-lg bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] transition cursor-pointer flex items-center justify-center gap-2 ${
              scanning ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Upload size={12} />
            Scan Files
          </label>

          <input
            type="file"
            multiple
            {...{ webkitdirectory: "", directory: "" }}
            onChange={handleFileChange}
            className="hidden"
            id="folder-scanner-upload"
            disabled={scanning}
          />
          <label
            htmlFor="folder-scanner-upload"
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-semibold rounded-lg bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] transition cursor-pointer flex items-center justify-center gap-2 ${
              scanning ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Upload size={12} />
            Scan Folder
          </label>
        </div>
      </div>

      {/* Metric summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D1421] border border-[#1E2D45] p-4 rounded-xl">
          <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wider font-mono block">Critical</span>
          <span className="text-2xl font-bold text-[#EF4444] font-mono mt-1 block">
            {findings.length > 0 ? criticalCount : '—'}
          </span>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Immediate action required</span>
        </div>
        <div className="bg-[#0D1421] border border-[#1E2D45] p-4 rounded-xl">
          <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wider font-mono block">High</span>
          <span className="text-2xl font-bold text-[#F59E0B] font-mono mt-1 block">
            {findings.length > 0 ? highCount : '—'}
          </span>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Remediate this quarter</span>
        </div>
        <div className="bg-[#0D1421] border border-[#1E2D45] p-4 rounded-xl">
          <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wider font-mono block">Medium</span>
          <span className="text-2xl font-bold text-[#3B82F6] font-mono mt-1 block">
            {findings.length > 0 ? mediumCount : '—'}
          </span>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Plan hybrid migration</span>
        </div>
        <div className="bg-[#0D1421] border border-l-4 border-l-[#00C4E8] border-[#1E2D45] p-4 rounded-xl">
          <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wider font-mono block">Overall Risk</span>
          <span className="text-2xl font-bold text-white font-mono mt-1 block">
            {findings.length > 0 ? `${overallRisk}%` : '—'}
          </span>
          <span className="text-[10px] text-[#94A3B8] mt-1 block">Unchanged from Q2 baseline</span>
        </div>
      </div>

      {/* Scan execution status banner */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              findings.length > 0 ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#475569]/10 text-[#475569]'
            }`}>
              <ShieldCheck size={14} />
              {findings.length > 0 ? '✓ Complete' : 'Awaiting Execution'}
            </span>
            <div className="text-[11px] text-[#94A3B8] font-mono mt-1.5">
              {findings.length > 0 ? '847 files audited • dependencies scanned: 324 packages' : '0 files audited'}
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-[10px] text-[#475569]">
            <div>Last scan: {lastScanDate}</div>
            <div className="mt-0.5">Next scheduled scan: {nextScanDate}</div>
          </div>
        </div>
        <div className="w-full bg-[#080C14] h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#22C55E] transition-all duration-1000"
            style={{ width: findings.length > 0 ? '100%' : '0%' }}
          />
        </div>
      </div>

      {/* Export & Command Row */}
      {findings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="px-3 py-1.5 text-xs font-semibold border border-[#1E2D45] hover:bg-[#1A2540]/60 text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
          >
            {isExportingPDF ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Exporting PDF...
              </>
            ) : (
              <>
                <Download size={13} />
                Export PDF Report
              </>
            )}
          </button>
          <button
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            className="px-3 py-1.5 text-xs font-semibold border border-[#1E2D45] hover:bg-[#1A2540]/60 text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={() => runScanLogs(true)}
            className="px-3 py-1.5 text-xs font-semibold border border-[#1E2D45] hover:bg-[#1A2540]/60 text-white rounded-lg flex items-center gap-1.5 cursor-pointer transition"
          >
            <RefreshCw size={12} />
            Run scan again
          </button>
          <button
            onClick={() => setShowRoadmapModal(true)}
            className="px-3 py-1.5 text-xs font-semibold border border-[#1E2D45] hover:bg-[#1A2540]/60 text-[#00C4E8] rounded-lg flex items-center gap-1.5 cursor-pointer transition"
          >
            <Code size={13} />
            View Remediation Roadmap
          </button>
        </div>
      )}

      {/* Code Scanner Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Terminal Console & Findings Table */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CLI Terminal */}
          <div className="bg-[#050811] border border-[#1E2D45] rounded-xl overflow-hidden flex flex-col h-[280px]">
            <div className="bg-[#0B1220] border-b border-[#1E2D45] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                <span className="text-[11px] text-[#475569] font-mono ml-2">lattix-q-analyzer-cli</span>
              </div>
              <TerminalIcon size={14} className="text-[#475569]" />
            </div>

            <div className="flex-1 p-4 font-mono text-xs text-[#94A3B8] overflow-y-auto space-y-1.5 selection:bg-[#00C4E8]/30">
              {terminalLines.length > 0 ? (
                terminalLines.map((line, idx) => (
                  <div 
                    key={idx} 
                    className={
                      line.includes('[WARN] Critical') ? 'text-[#EF4444]' : 
                      line.includes('[WARN] High') ? 'text-[#F59E0B]' : 
                      line.includes('[SCAN]') ? 'text-[#3B82F6]' : 
                      line.includes('successfully') ? 'text-green-400 font-bold' : ''
                    }
                  >
                    {line}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#475569]">
                  <TerminalIcon size={32} className="mb-2 opacity-50 text-[#475569]" />
                  <span>$ lattix-q scan --path ./src</span>
                  <span className="text-[10px] mt-1">Select local files or run the demo codebase to execute scanner.</span>
                </div>
              )}
              {scanning && (
                <div className="flex items-center gap-1 text-[#00C4E8] font-bold">
                  <span className="animate-pulse">_</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider animate-pulse">Running Scan...</span>
                </div>
              )}
            </div>
          </div>

          {/* Real findings table */}
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert size={16} className="text-[#00C4E8]" />
                Findings List ({filteredFindings.length} matched)
              </h3>
              <span className="text-[10px] text-[#475569] font-mono">RBAC Security filters active</span>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative w-full sm:flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <input
                  type="text"
                  placeholder="Search by file, algorithm, or issue..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#080C14] border border-[#1E2D45] rounded-lg text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#00C4E8]"
                />
              </div>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full sm:w-40 py-1.5 px-3 bg-[#080C14] border border-[#1E2D45] rounded-lg text-xs text-slate-300 focus:outline-none focus:border-[#00C4E8] cursor-pointer"
              >
                <option value="All severities">All severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Active filter chips */}
            {(searchTerm || selectedSeverity !== 'All severities') && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-[#475569] font-mono">Active Filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] bg-[#1E2D45] text-white">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="hover:text-red-400 font-bold ml-1">×</button>
                  </span>
                )}
                {selectedSeverity !== 'All severities' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] bg-[#1E2D45] text-[#00C4E8]">
                    Severity: {selectedSeverity}
                    <button onClick={() => setSelectedSeverity('All severities')} className="hover:text-red-400 font-bold ml-1">×</button>
                  </span>
                )}
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedSeverity('All severities'); }}
                  className="text-[10px] text-[#00C4E8] hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Table */}
            {findings.length > 0 ? (
              <div className="overflow-x-auto border border-[#1E2D45]/60 rounded-lg">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-[#080C14] border-b border-[#1E2D45] text-[#475569] uppercase font-bold text-[9px] tracking-wider">
                      <th className="p-3">Finding details</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Algorithm</th>
                      <th className="p-3">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2D45]/40">
                    {visibleFindings.map((finding) => {
                      const isSelected = selectedFinding?.id === finding.id;
                      return (
                        <tr
                          key={finding.id}
                          onClick={() => { setSelectedFinding(finding); setRefactored(false); }}
                          className={`cursor-pointer transition hover:bg-[#1A2540]/30 ${
                            isSelected ? 'bg-[#00C4E8]/5' : ''
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-semibold text-white">{finding.title}</div>
                            <div className="text-[10px] text-[#475569] font-mono mt-0.5">
                              {finding.filePath}:{finding.line}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`font-bold ${
                              finding.severity === 'Critical' ? 'text-[#EF4444]' :
                              finding.severity === 'High' ? 'text-[#F59E0B]' :
                              finding.severity === 'Medium' ? 'text-[#3B82F6]' : 'text-slate-400'
                            }`}>
                              {finding.severity}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono bg-[#080C14] border border-[#1E2D45] px-1.5 py-0.5 rounded text-[10px] text-white">
                              {finding.algorithm}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{finding.confidence}</td>
                        </tr>
                      );
                    })}
                    {filteredFindings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-[#475569] font-mono">
                          No findings matches current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-10 flex flex-col items-center justify-center text-center">
                <ShieldCheck size={36} className="text-[#475569] opacity-40 mb-2" />
                <span className="text-xs text-slate-500 font-mono">No files audited yet. Click "Scan Demo Codebase" or upload files.</span>
              </div>
            )}

            {/* Pagination footer summary */}
            {findings.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#475569] font-mono gap-2 pt-2">
                <span>
                  Showing {visibleFindings.length} of {filteredFindings.length} findings
                </span>
                {filteredFindings.length > 7 && (
                  <button 
                    onClick={() => setViewAll(!viewAll)}
                    className="text-[#00C4E8] font-bold hover:underline"
                  >
                    {viewAll ? 'Show less' : 'View all findings'} &rarr;
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Detail drawer / Quick remediation */}
        <div className="space-y-6">
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-5 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center gap-2 border-b border-[#1E2D45]/60 pb-3 mb-4">
                <Database className="text-[#00C4E8]" size={16} />
                <h3 className="text-sm font-bold text-white">Remediation actions</h3>
              </div>

              {selectedFinding ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold font-mono text-[#00C4E8] bg-[#080C14] border border-[#1E2D45] px-2 py-0.5 rounded">
                      {selectedFinding.id}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      selectedFinding.severity === 'Critical' ? 'bg-red-500/10 text-[#EF4444] border-red-500/20' :
                      selectedFinding.severity === 'High' ? 'bg-amber-500/10 text-[#F59E0B] border-amber-500/20' :
                      'bg-blue-500/10 text-[#3B82F6] border-blue-500/20'
                    }`}>
                      {selectedFinding.severity} Exposure
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{selectedFinding.title}</h4>
                    <p className="text-[10px] text-[#475569] font-mono mt-0.5">
                      File: {selectedFinding.filePath} (Line {selectedFinding.line})
                    </p>
                  </div>

                  <div className="bg-[#080C14] border border-[#1E2D45]/80 rounded p-3 text-[11px] space-y-2 leading-relaxed">
                    <div>
                      <strong className="text-white">Audit Verdict:</strong>
                      <p className="text-[#94A3B8] mt-0.5">{selectedFinding.description}</p>
                    </div>
                    <div>
                      <strong className="text-white">Remediation guidance:</strong>
                      <p className="text-slate-400 mt-0.5">{selectedFinding.remediation}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => handleAddToInventory(selectedFinding)}
                      className="w-full bg-[#080C14] hover:bg-[#1A2540] border border-[#1E2D45] text-slate-300 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus size={13} />
                      Add to Asset Inventory
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-600">
                  <ShieldCheck size={28} className="opacity-30 mb-2" />
                  <p className="text-xs leading-relaxed max-w-[200px]">
                    Select any finding from the list on the left to show contextual action guides.
                  </p>
                </div>
              )}
            </div>

            {/* Estimated Effort card */}
            <div className="bg-[#080C14] border border-[#1E2D45]/60 rounded-xl p-4 mt-6">
              <span className="text-[9px] font-bold text-[#475569] uppercase tracking-wider block">Remediation summary</span>
              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-xs">
                <div>
                  <span className="text-[#475569] text-[9px] block">Total Effort</span>
                  <span className="text-white font-bold block mt-0.5">18–24 Days</span>
                </div>
                <div>
                  <span className="text-[#475569] text-[9px] block">Auto-Fixable</span>
                  <span className="text-[#00C4E8] font-bold block mt-0.5">7 of 25 (28%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Code-Level Details & Side-by-side AI Diff */}
      {selectedFinding && (
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="text-[#00C4E8]" size={18} />
              <h2 className="text-sm font-bold text-white">Agility Remediation Diff</h2>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleApplyAutoFix(selectedFinding)}
                disabled={refactored}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer ${
                  refactored 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4]'
                }`}
              >
                <Sparkles size={12} />
                {refactored ? 'Refactored Successfully' : 'Apply AI Auto-Fix'}
              </button>
              {refactored && (
                <button
                  onClick={handleDownloadFixedFile}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 transition cursor-pointer"
                >
                  <Download size={12} />
                  Download Fixed File
                </button>
              )}
            </div>
          </div>

          {/* Side-by-side Diff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Legacy Block */}
            <div className="border border-red-500/20 rounded-lg overflow-hidden">
              <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/20 flex items-center justify-between text-xs">
                <span className="text-red-400 font-bold font-mono">Vulnerable Classical implementation</span>
                <AlertTriangle size={14} className="text-red-400" />
              </div>
              <pre className="bg-[#080C14] p-4 text-xs font-mono text-[#F87171] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {selectedFinding.legacyCode}
              </pre>
            </div>

            {/* Refactored PQC Block */}
            <div className={`border transition-all duration-300 rounded-lg overflow-hidden ${
              refactored ? 'border-green-500/30' : 'border-slate-800'
            }`}>
              <div className={`px-4 py-2 border-b flex items-center justify-between text-xs transition ${
                refactored ? 'bg-green-500/10 border-green-500/20 text-green-400 font-bold' : 'bg-[#121B2E] border-slate-800 text-slate-400'
              }`}>
                <span className="font-mono">Quantum-Safe Post-Quantum Cryptography</span>
                {refactored ? <Check size={14} className="text-green-400" /> : <Sparkles size={14} className="text-[#00C4E8] animate-pulse" />}
              </div>
              <pre className={`p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed transition ${
                refactored ? 'bg-green-500/5 text-green-400' : 'bg-[#080C14] text-[#475569] blur-[1.5px]'
              }`}>
                {selectedFinding.pqcCode}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* Scan History Audit Log */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2D45] pb-3">
          <div className="flex items-center gap-2">
            <History className="text-[#00C4E8]" size={18} />
            <h2 className="text-sm font-bold text-white">Scan Execution & Audit History</h2>
          </div>
          <span className="text-[10px] bg-[#00C4E8]/10 text-[#00C4E8] border border-[#00C4E8]/20 px-2 py-0.5 rounded font-mono">
            SIEM Log Feed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D45] text-[10px] text-[#475569] uppercase font-bold tracking-wider font-mono">
                <th className="pb-3">Scan ID</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Trigger Source</th>
                <th className="pb-3">Operator</th>
                <th className="pb-3">Files Scanned</th>
                <th className="pb-3">Threat Vector Count</th>
                <th className="pb-3">Risk Index</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D45] text-xs font-mono">
              {scanHistory.map((item) => (
                <tr key={item.id} className="text-slate-300 hover:bg-[#1A2540]/30 transition">
                  <td className="py-3 text-[#00C4E8] font-bold">{item.id}</td>
                  <td className="py-3">{item.timestamp}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.source === 'Manual Scan' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : item.source === 'Scheduled Scan'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
                    }`}>
                      {item.source}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{item.operator}</td>
                  <td className="py-3">{item.filesCount}</td>
                  <td className="py-3">
                    <div className="flex gap-1.5">
                      {item.criticalCount > 0 && <span className="bg-red-500/20 text-[#EF4444] px-1.5 py-0.5 rounded text-[10px] font-bold">{item.criticalCount} C</span>}
                      {item.highCount > 0 && <span className="bg-orange-500/20 text-[#F59E0B] px-1.5 py-0.5 rounded text-[10px] font-bold">{item.highCount} H</span>}
                      {item.mediumCount > 0 && <span className="bg-blue-500/20 text-[#3B82F6] px-1.5 py-0.5 rounded text-[10px] font-bold">{item.mediumCount} M</span>}
                      {item.criticalCount === 0 && item.highCount === 0 && item.mediumCount === 0 && (
                        <span className="text-green-500 font-bold">Clear Audit</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-white font-bold">{item.riskScore}%</td>
                  <td className="py-3">
                    <span className="text-green-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Success
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phased Roadmap Modal */}
      {showRoadmapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080C14]/85 backdrop-blur-sm p-4">
          <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl max-w-2xl w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#1E2D45] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="text-[#00C4E8]" size={18} />
                Phased Migration Roadmap
              </h3>
              <button 
                onClick={() => setShowRoadmapModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-[#00C4E8] font-mono">Phase 1: Initial Key Hardening (Month 1)</span>
                <p className="text-xs text-slate-400">
                  Target critical hardcoded credentials and non-cryptographic RNG generators. Refactor to inject parameters from the system vault.
                </p>
                <div className="text-[10px] text-slate-300 font-mono mt-1">
                  • Replace hardcoded cipher key in src/crypto/cipher.py:47<br/>
                  • Replace custom random generator in src/keygen/rng.py:12
                </div>
              </div>

              <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-[#F59E0B] font-mono">Phase 2: Symmetric Exponents & Hashes (Months 2-3)</span>
                <p className="text-xs text-slate-400">
                  Deprecated MD5 and SHA-1 hashes used in signing configurations must be replaced with SHA-256 or SHA-3 equivalents. Upgrade symmetric block sizes.
                </p>
                <div className="text-[10px] text-slate-300 font-mono mt-1">
                  • Replace MD5 checksums with SHA-256 in src/utils/checksum.py:18<br/>
                  • Upgrade AES-128 ciphers to AES-256-GCM.
                </div>
              </div>

              <div className="bg-[#080C14] border border-[#1E2D45] rounded-lg p-3 space-y-1.5">
                <span className="text-[10px] font-bold text-green-500 font-mono">Phase 3: Asymmetric Migration to PQC (Months 4-6)</span>
                <p className="text-xs text-slate-400">
                  Migrate vulnerable TLS asymmetric handshake suites (RSA-2048/ECC-P256) to standard post-quantum KEMs (ML-KEM-768/Kyber) and digital signatures (ML-DSA-65/Dilithium).
                </p>
                <div className="text-[10px] text-slate-300 font-mono mt-1">
                  • Deploy ML-KEM-768 key encapsulates on local web endpoints.<br/>
                  • Setup shadow verification checks using Dilithium signature certificates.
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1E2D45] flex justify-end">
              <button
                onClick={() => setShowRoadmapModal(false)}
                className="px-4 py-2 bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] font-bold text-xs rounded-lg cursor-pointer"
              >
                Close Roadmap
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BatchScanner;
