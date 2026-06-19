import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  ShieldCheck, 
  FileSearch, 
  Settings, 
  Database,
  Radio,
  Server
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: 'dashboard' | 'analytics' | 'security' | 'audit-logs' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const { currentRole, currentUser, syncStatus, isRealtimeActive } = useDatabase();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roleRestricted: false },
    { id: 'analytics', name: 'Data Statistics', icon: BarChart3, roleRestricted: false },
    { id: 'security', name: 'Security Hub', icon: ShieldCheck, roleRestricted: false },
    { id: 'audit-logs', name: 'Audit Logs', icon: FileSearch, roleRestricted: true, requiredRole: 'admin' },
    { id: 'settings', name: 'Control Panel', icon: Settings, roleRestricted: false }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 text-slate-300">
      {/* Brand Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-500 to-indigo-500 p-2 rounded-lg text-white shadow-lg shadow-cyan-500/20">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0 leading-none">DataSphere</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">Enterprise BI</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 py-4">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isAllowed = !item.roleRestricted || currentRole === item.requiredRole;
          
          if (!isAllowed) return null;

          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border-l-4 border-cyan-500 text-white shadow-md'
                  : 'hover:bg-slate-800/50 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Real-time DB Monitor */}
      <div className="mx-4 my-2 p-4 bg-slate-800/40 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Database Node</span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isRealtimeActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            <span className={`text-[10px] font-bold ${isRealtimeActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isRealtimeActive ? 'SYNCING' : 'PAUSED'}
            </span>
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              Channel Sync
            </span>
            <span className="text-white font-mono text-[11px] font-semibold">OK</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Sim Latency
            </span>
            <span className="text-white font-mono text-[11px] font-semibold">
              {syncStatus.simulatedLatencyMs}ms
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Active Tabs
            </span>
            <span className="bg-slate-700 text-white font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
              {syncStatus.activeConnectionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* RBAC Profile Summary */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
          />
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-white truncate leading-snug">{currentUser.name}</div>
            <div className="text-xs text-slate-500 truncate mb-1">{currentUser.email}</div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
              currentRole === 'admin' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : currentRole === 'manager' 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-slate-500/10 text-slate-400 border border-slate-600/20'
            }`}>
              {currentRole}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
