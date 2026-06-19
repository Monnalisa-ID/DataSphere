import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Skull,
  Zap,
  Info
} from 'lucide-react';

export const SecurityView: React.FC = () => {
  const { 
    patches, 
    togglePatch, 
    exploits, 
    triggerExploitSimulation,
    rateLimitBlocked
  } = useDatabase();

  const getAttackTypeBadge = (type: string) => {
    switch (type) {
      case 'XSS': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'SQL Injection': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'CSRF': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Rate Limit': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const activePatchesCount = patches.filter(p => p.patched).length;

  return (
    <div className="space-y-6">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core status card */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-white leading-none">Firewall & Encryption Layer</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              DataSphere utilizes a multi-layer sanitization schema to protect transactional data. 
              By validating requests at the middleware level, SQL query injection pathways are eliminated, 
              and client-supplied text properties are stripped of executable scripting tags.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Shields</div>
              <div className="text-xl font-bold text-white mt-1 font-mono">{activePatchesCount}/4</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sanitization</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">Automatic</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center col-span-2">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Telemetry State</div>
              <div className="text-sm font-semibold text-cyan-400 mt-1 truncate">AES-GCM Local Channel</div>
            </div>
          </div>
        </div>

        {/* Attack indicator stats */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Intrusion Stats</h4>
            <div className="space-y-3 font-semibold text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Threat Detections</span>
                <span className="text-white font-mono">{exploits.length}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Sanitized Payloads</span>
                <span className="text-amber-400 font-mono">
                  {exploits.filter(e => e.status === 'sanitized').length}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Direct Drops / Blocks</span>
                <span className="text-rose-400 font-mono">
                  {exploits.filter(e => e.status === 'blocked').length}
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            exploits.length > 5 
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' 
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {exploits.length > 5 ? 'High traffic threat warning' : 'System integrity within nominal bounds'}
            </span>
          </div>
        </div>

      </div>

      {/* Main interactive grid: Patch Switches vs Attack Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Toggle Shields Switches */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-white leading-tight">Shield Control Center</h3>
            <p className="text-xs text-slate-500 mt-1">Toggle active database middleware sanitization levels (simulated sandbox)</p>
          </div>

          <div className="space-y-4">
            {patches.map(patch => (
              <div 
                key={patch.id} 
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  patch.patched 
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300' 
                    : 'bg-rose-950/5 border-rose-900/35 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${patch.patched ? 'bg-cyan-400' : 'bg-rose-500 animate-pulse'}`}></span>
                      <span className="font-bold text-white text-sm">{patch.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">{patch.description}</p>
                  </div>

                  {/* Switch */}
                  <button
                    onClick={() => togglePatch(patch.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      patch.patched ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        patch.patched ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attack Simulator Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <h3 className="text-lg font-bold text-white leading-tight">Exploit Penetration Simulator</h3>
              <p className="text-xs text-slate-500 mt-1">Trigger simulated malicious operations to verify active database defenses</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { 
                  type: 'XSS', 
                  title: 'Inject XSS Payload', 
                  desc: 'Attempts to insert an executable HTML <script> tag into the indicators database.',
                  payload: '<script>alert("hack")</script>'
                },
                { 
                  type: 'SQL Injection', 
                  title: 'Inject SQL Query', 
                  desc: 'Attempts to inject structural code quotes ("DROP TABLE metrics; --") to hijack parameters.',
                  payload: "Active CPU'; DROP TABLE..."
                },
                { 
                  type: 'CSRF', 
                  title: 'Forge Admin Request', 
                  desc: 'Attempts to edit properties from an external site context without matching session tokens.',
                  payload: 'Forged POST /delete-metric'
                },
                { 
                  type: 'Rate Limit', 
                  title: 'Spam Burst Writes', 
                  desc: 'Sends a sudden burst of 6 rapid requests in 1 second to trigger API rate limiting blocks.',
                  payload: 'Spam write queries'
                }
              ].map(sim => (
                <button
                  key={sim.type}
                  onClick={() => triggerExploitSimulation(sim.type as any)}
                  disabled={sim.type === 'Rate Limit' && rateLimitBlocked}
                  className={`p-4 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900/80 transition-all text-left flex flex-col justify-between gap-3 group active:scale-[0.98] ${
                    sim.type === 'Rate Limit' && rateLimitBlocked ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {sim.title}
                      </span>
                      <Skull className="w-3.5 h-3.5 text-slate-600 group-hover:text-rose-500 transition-colors" />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{sim.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded w-full border border-slate-800">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="truncate">Payload: {sim.payload}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl mt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-1.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Attacker Sandbox Settings</span>
            </div>
            <p className="text-[10.5px] text-slate-400 leading-normal font-medium">
              Disable shields in the Control Center first to observe how vulnerability patches block attacks, 
              then run a simulator to test the browser sandbox behaviour.
            </p>
          </div>
        </div>

      </div>

      {/* Exploit logs list */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-white leading-tight">Vulnerability Intrusion Logs</h3>
          <p className="text-xs text-slate-500 mt-1">Live firewall logs tracking blocked, sanitized, or bypassed intrusion vectors</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Vector Type</th>
                <th className="px-5 py-3">Malicious Input Payload</th>
                <th className="px-5 py-3">Source IP</th>
                <th className="px-5 py-3">Firewall Sanitized Output</th>
                <th className="px-5 py-3 text-right">Shield Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {exploits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-600 font-semibold">
                    0 Exploit payloads scanned. Run the penetration simulator above to populate.
                  </td>
                </tr>
              ) : (
                exploits.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-500">{exp.timestamp}</td>
                    <td className="px-5 py-3.5 font-bold">
                      <span className={`inline-flex px-2 py-0.5 rounded border ${getAttackTypeBadge(exp.type)}`}>
                        {exp.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-rose-400 select-all max-w-[200px] truncate" title={exp.payload}>
                      {exp.payload}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">{exp.attackerIp}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300 max-w-[200px] truncate" title={exp.sanitizedPayload}>
                      {exp.sanitizedPayload || <span className="text-slate-600 italic">None (Rejected)</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold uppercase">
                      <span className={`inline-flex items-center gap-1 leading-none ${
                        exp.status === 'sanitized' 
                          ? 'text-amber-400' 
                          : exp.status === 'blocked' 
                            ? 'text-cyan-400' 
                            : 'text-rose-500 animate-pulse'
                      }`}>
                        {exp.status === 'sanitized' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                        {exp.status === 'blocked' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                        {exp.status === 'blocked' ? 'BLOCKED' : exp.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
