import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  Sliders, 
  RotateCw, 
  ShieldCheck, 
  HardDrive,
  User,
  Activity,
  Cpu
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    isRealtimeActive, 
    setRealtimeActive, 
    syncStatus, 
    rotateCsrfToken,
    currentUser,
    currentRole
  } = useDatabase();

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear local storage? This will restore initial metric variables.')) {
      localStorage.removeItem('company_metrics');
      window.location.reload();
    }
  };

  const getRolePrivileges = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { name: 'View Indicators Dashboard', allowed: true },
          { name: 'Create & Update Indicators', allowed: true },
          { name: 'Full Deletion Rights', allowed: true },
          { name: 'Modify Global Security Configs', allowed: true },
          { name: 'Inspect Administrative Audit Trails', allowed: true }
        ];
      case 'manager':
        return [
          { name: 'View Indicators Dashboard', allowed: true },
          { name: 'Create & Update Indicators', allowed: true },
          { name: 'Full Deletion Rights', allowed: false },
          { name: 'Modify Global Security Configs', allowed: false },
          { name: 'Inspect Administrative Audit Trails', allowed: false }
        ];
      default:
        return [
          { name: 'View Indicators Dashboard', allowed: true },
          { name: 'Create & Update Indicators', allowed: false },
          { name: 'Full Deletion Rights', allowed: false },
          { name: 'Modify Global Security Configs', allowed: false },
          { name: 'Inspect Administrative Audit Trails', allowed: false }
        ];
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Telemetry and Database synchronization slider settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sync Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white leading-none">Database Synchronization</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Adjust parameters for the client-side simulated real-time data engine.
            </p>

            <div className="space-y-5 mt-6">
              
              {/* Toggle real-time */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Active Telemetry Stream</div>
                  <p className="text-[10px] text-slate-500">Injects random data updates into the memory cache</p>
                </div>
                <button
                  onClick={() => setRealtimeActive(!isRealtimeActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                    isRealtimeActive ? 'bg-cyan-500' : 'bg-slate-850'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isRealtimeActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></span>
                </button>
              </div>

              {/* Broadcast Sync Channel Info */}
              <div className="flex items-center justify-between border-t border-slate-850 pt-4">
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider">Peer-to-Peer Sync Channel</div>
                  <p className="text-[10px] text-slate-500">Syncs state across browser tabs using BroadcastChannel</p>
                </div>
                <span className="bg-slate-950 px-2.5 py-1 border border-slate-800 text-[10px] text-cyan-400 font-bold rounded-lg uppercase">
                  Enabled (Active)
                </span>
              </div>

            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-850">
            <button
              onClick={handleClearCache}
              className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-white transition-colors duration-200 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Reset Database Memory (Restore Defaults)</span>
            </button>
          </div>
        </div>

        {/* Current Active Account RBAC capabilities */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white leading-none">Security Permissions Profile</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active permissions mapped to current RBAC token context.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center gap-3.5 my-5">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-slate-850"
            />
            <div>
              <div className="text-sm font-bold text-white leading-none">{currentUser.name}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1 font-mono">{currentUser.email}</div>
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mt-1.5 border ${
                currentRole === 'admin' 
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                  : currentRole === 'manager' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-slate-500/10 text-slate-400 border-slate-600/20'
              }`}>
                {currentRole} ROLE
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-4 select-none">
            {getRolePrivileges(currentRole).map((priv, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-semibold py-1">
                <span className="text-slate-400">{priv.name}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  priv.allowed 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {priv.allowed ? 'Granted' : 'Revoked'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Database Security Ticker Banner details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white leading-none">Cryptographic Token Rotations</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Perform one-off administrative cryptographic verification actions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-550 block">Synchronized token (session)</span>
              <p className="text-[10.5px] text-slate-400 mt-1">Challenge code for write payload operations</p>
            </div>
            <button
              onClick={rotateCsrfToken}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
              <span>Rotate Token</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-550 block">Simulated Network Load</span>
              <p className="text-[10.5px] text-slate-400 mt-1">Current telemetry server state latency</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-white mt-1">
              <span className="flex items-center gap-1">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Latency: {syncStatus.simulatedLatencyMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-indigo-400" />
                Network: Active
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
