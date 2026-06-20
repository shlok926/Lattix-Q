import React, { useState } from 'react';
import { Layers, Copy, Check, ShieldCheck, Terminal, Cpu, FileCode } from 'lucide-react';

export const PQCPlaybook: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const nginxConfig = `services:
  nginx-oqs:
    image: openquantumsafe/nginx
    container_name: qs-nginx-proxy
    ports:
      - "443:443"
    volumes:
      - ./nginx-oqs.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    restart: always`;

  const nginxConfContent = `events {
    worker_connections 1024;
  }

  http {
    # Open Quantum Safe configuration
    ssl_protocols TLSv1.3;
    
    # Configure post-quantum & hybrid key exchanges
    # e.g., X25519 + Kyber768 (ML-KEM)
    ssl_curves x25519_kyber768:x25519;

    server {
        listen 443 ssl;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;

        location / {
            proxy_pass http://your-app-service:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
  }`;

  const localAuditCommand = `npx @quantumshield/audit-cli --dir ./src --exclude node_modules`;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-[#00C4E8]/10 flex items-center justify-center text-[#00C4E8]">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-sans flex items-center gap-2">
              Zero-Touch PQC Migration Playbook
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#00C4E8]/10 text-[#00C4E8] border border-[#00C4E8]/20">
                SME & Startup Guide
              </span>
            </h1>
            <p className="text-sm text-[#94A3B8]">
              Secure your apps from Harvest Now, Decrypt Later (HNDL) at the boundary without changing a single line of codebase.
            </p>
          </div>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="bg-[#00C4E8]/5 border border-[#00C4E8]/20 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck size={16} className="text-[#00C4E8] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Why Boundary Migration Matters:</strong> upload karne ke bina hi external configuration changes ke through aap client data transit ko secure kar sakte hain. This complies with security privacy mandates and protects session handshakes before quantum-capable interceptors store them.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Card 1: Cloudflare Edge */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-[#00C4E8] bg-[#00C4E8]/10 border border-[#00C4E8]/20 px-2.5 py-0.5 rounded-full font-bold">
                OPTION 1
              </span>
              <span className="text-[10px] text-green-400 font-bold bg-green-500/5 px-2 py-0.5 rounded border border-green-500/25">
                Easy (No Code)
              </span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal size={15} className="text-[#00C4E8]" />
              Cloudflare CDN Hybrid PQC
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If your startup uses Cloudflare to manage DNS, you can instantly turn on hybrid post-quantum cryptography (Kyber/ML-KEM) at the network edge with zero app downtime.
            </p>
            
            <div className="bg-[#080C14] border border-[#1E2D45]/60 rounded-lg p-4 space-y-2 text-xs font-sans text-slate-300">
              <div className="font-bold text-white">How to enable:</div>
              <ol className="list-decimal pl-4 space-y-2 text-slate-400 text-[11px] leading-relaxed">
                <li>Log in to your <strong>Cloudflare Dashboard</strong>.</li>
                <li>Go to <strong>SSL/TLS &gt; Edge Certificates</strong> page.</li>
                <li>Scroll to <strong>Post-Quantum Cryptography</strong>.</li>
                <li>Toggle the switch to <span className="text-[#00C4E8] font-bold">ON</span>.</li>
              </ol>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 italic">
            *Compatible automatically with Chrome 124+ and Edge 124+ clients out-of-the-box.
          </div>
        </div>

        {/* Card 2: Nginx-OQS Container */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col justify-between space-y-4 col-span-1 xl:col-span-2">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-[#00C4E8] bg-[#00C4E8]/10 border border-[#00C4E8]/20 px-2.5 py-0.5 rounded-full font-bold">
                OPTION 2
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/25">
                Medium (DevOps Setup)
              </span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu size={15} className="text-[#00C4E8]" />
              Dockerized Nginx-OQS Reverse Proxy
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you host your own cloud VMs or staging environments, run an Nginx container built with the Open Quantum Safe module (`liboqs`) in front of your server.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Docker Compose config */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>docker-compose.yml</span>
                  <button 
                    onClick={() => handleCopy(nginxConfig, 'compose')}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    {copiedSection === 'compose' ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                    {copiedSection === 'compose' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-[#080C14] border border-[#1E2D45]/60 p-3 rounded-lg text-[10px] font-mono text-[#00C4E8] overflow-x-auto max-h-[160px]">
                  {nginxConfig}
                </pre>
              </div>

              {/* Nginx Config snippet */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>nginx-oqs.conf</span>
                  <button 
                    onClick={() => handleCopy(nginxConfContent, 'nginxconf')}
                    className="hover:text-white transition flex items-center gap-1"
                  >
                    {copiedSection === 'nginxconf' ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                    {copiedSection === 'nginxconf' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-[#080C14] border border-[#1E2D45]/60 p-3 rounded-lg text-[10px] font-mono text-[#00C4E8] overflow-x-auto max-h-[160px]">
                  {nginxConfContent}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500">
            This forces all incoming clients to terminate key agreements using hybrid `x25519_kyber768` (ML-KEM-768 equivalent) security parameters.
          </div>
        </div>

        {/* Card 3: Codebase Audit CLI */}
        <div className="bg-[#0D1421] border border-[#1E2D45] rounded-xl p-6 flex flex-col justify-between space-y-4 col-span-1 xl:col-span-3">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-[#00C4E8] bg-[#00C4E8]/10 border border-[#00C4E8]/20 px-2.5 py-0.5 rounded-full font-bold">
                OPTION 3
              </span>
              <span className="text-[10px] text-purple-400 font-bold bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/25">
                Developer Audit
              </span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode size={15} className="text-[#00C4E8]" />
              Offline Codebase Dependency Scanner
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify if your project contains packages importing deprecated/classical cryptography algorithms. This runs offline on your machine to respect strict privacy regulations.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#080C14] border border-[#1E2D45]/60 p-3.5 rounded-lg">
              <span className="text-[10px] font-mono text-slate-400 select-none bg-[#0D1421] border border-[#1E2D45] px-2 py-1 rounded">
                CLI COMMAND
              </span>
              <input
                type="text"
                readOnly
                value={localAuditCommand}
                className="flex-1 bg-transparent font-mono text-xs text-[#00C4E8] border-none outline-none overflow-x-auto"
              />
              <button
                onClick={() => handleCopy(localAuditCommand, 'cli')}
                className="bg-[#00C4E8] text-[#080C14] hover:bg-[#0096B4] font-semibold text-xs px-4 py-1.5 rounded-lg flex items-center gap-2 transition"
              >
                {copiedSection === 'cli' ? <Check size={13} /> : <Copy size={13} />}
                {copiedSection === 'cli' ? 'Copied!' : 'Copy Command'}
              </button>
            </div>
          </div>

          <div className="text-[10px] text-slate-500">
            Parses npm packages and prints warnings for modules using RSA, standard ECDSA (secp256r1), or SHA-1 hashes in build manifests.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PQCPlaybook;
