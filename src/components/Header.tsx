import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Shield, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import type { UserRole } from '../types';

interface HeaderProps {
  viewTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ viewTitle }) => {
  const { currentRole, setRole, csrfToken, rotateCsrfToken, rateLimitBlocked, rateLimitTimer } = useDatabase();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 h-20 px-8 flex items-center justify-between sticky top-0 z-40">
      {/* View Title */}
      <div>
        <h2 className="text-xl font-bold text-white leading-none m-0">{viewTitle}</h2>
      </div>

      {/* Security Context Controls */}
      <div className="flex items-center gap-6">
        
        {/* Anti-CSRF Badge */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <KeyRound className="w-4 h-4" />
            <span>CSRF Token:</span>
          </div>
          <span className="text-slate-300 font-semibold truncate max-w-[80px]" title={csrfToken}>
            {csrfToken.substring(0, 8)}...
          </span>
          <button
            onClick={rotateCsrfToken}
            className="text-slate-500 hover:text-white transition-colors duration-150 p-0.5 rounded"
            title="Rotate Security Token"
          >
            <RefreshCw className="w-3.5 h-3.5 hover:rotate-45 transition-transform" />
          </button>
        </div>

        {/* Rate Limiting Active Indicator */}
        {rateLimitBlocked && (
          <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3.5 py-2 rounded-xl text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span>API BLOCKED (THROTTLED: {rateLimitTimer}s)</span>
          </div>
        )}

        {/* RBAC Quick Swapper */}
        <div className="flex items-center gap-2.5 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>RBAC Context:</span>
          </div>
          <select
            value={currentRole}
            onChange={handleRoleChange}
            className="bg-transparent text-white font-semibold text-xs border-0 outline-none cursor-pointer pr-4 focus:ring-0"
          >
            <option value="admin" className="bg-slate-900 text-white font-semibold">Administrator (Full Access)</option>
            <option value="manager" className="bg-slate-900 text-white font-semibold">Manager (Write / Edit)</option>
            <option value="viewer" className="bg-slate-900 text-white font-semibold">Viewer (Read Only)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
