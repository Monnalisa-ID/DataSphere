import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { 
  FileText, 
  Trash2, 
  Search, 
  ShieldAlert, 
  CheckCircle,
  Eye
} from 'lucide-react';
import type { AuditLog, UserRole } from '../types';

export const AuditLogView: React.FC = () => {
  const { logs, clearLogs, currentRole } = useDatabase();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Detail modal state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = filterRole === 'all' || log.userRole === filterRole;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'manager': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'viewer': return 'bg-slate-500/10 text-slate-400 border-slate-600/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const isAuthorized = currentRole === 'admin';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <ShieldAlert className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-white mb-2">ACCESS VIOLATION</h3>
        <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
          You are currently in a restricted context. The Audit Logs database contains sensitive operational data 
          visible only to users with administrative credentials.
        </p>
        <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-left font-mono text-xs text-rose-400">
          <div>$ SYSTEM_ERROR: Unauthorized access logged to core security server</div>
          <div>$ IP: 192.168.1.104 | ROLE: {currentRole.toUpperCase()}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Filters and Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer outline-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrator Only</option>
            <option value="manager">Manager Only</option>
            <option value="viewer">Viewer Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold cursor-pointer outline-none"
          >
            <option value="all">All Operations</option>
            <option value="success">Success Status</option>
            <option value="blocked">Blocked / Violation</option>
          </select>

          {/* Reset / Clear Buttons */}
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
              logs.length === 0 
                ? 'bg-transparent text-slate-700 border-slate-800/80 cursor-not-allowed' 
                : 'bg-rose-950/20 text-rose-400 hover:text-white hover:bg-rose-900/60 border-rose-900/30 active:scale-95'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Audit Trail</span>
          </button>
        </div>

      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Description Detail</th>
                <th className="px-6 py-4">Security IP</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500 font-semibold">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-slate-800/20 transition-colors ${
                      log.status === 'blocked' ? 'bg-rose-950/5 hover:bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-slate-500 select-all">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-bold text-white">{log.userName}</div>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border mt-0.5 ${getRoleBadge(log.userRole)}`}>
                            {log.userRole}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-300">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-slate-450 leading-relaxed max-w-[280px] truncate" title={log.details}>
                      {log.details || <span className="text-slate-650 italic">None provided</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500 font-semibold">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <span className={`inline-flex items-center gap-1.5 ${
                        log.status === 'success' ? 'text-emerald-400' : 'text-rose-400 font-extrabold animate-pulse'
                      }`}>
                        {log.status === 'success' ? <CheckCircle className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Inspect Log Entity"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= INSPECT LOG MODAL ================= */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-zoomIn">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inspect Log Entity</h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-500 hover:text-white transition-colors">
                <Trash2 className="w-4 h-4 hidden" /> {/* dummy */}
                <span className="text-xs font-bold bg-slate-850 px-2 py-1 rounded">CLOSE</span>
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4 font-mono text-xs text-slate-300">
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-2">
                <div><span className="text-slate-555 font-bold">LOG_ID:</span> {selectedLog.id}</div>
                <div><span className="text-slate-555 font-bold">TIMESTAMP:</span> {selectedLog.timestamp}</div>
                <div><span className="text-slate-555 font-bold">STATUS:</span> <span className={selectedLog.status === 'success' ? 'text-emerald-400' : 'text-rose-400 font-extrabold'}>{selectedLog.status.toUpperCase()}</span></div>
              </div>

              <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-850">
                <div><span className="text-slate-555 font-bold">ACTOR:</span> {selectedLog.userName} ({selectedLog.userRole.toUpperCase()})</div>
                <div><span className="text-slate-555 font-bold">USER_ID:</span> {selectedLog.userId}</div>
                <div><span className="text-slate-555 font-bold">IP_ADDR:</span> {selectedLog.ip}</div>
              </div>

              <div className="space-y-2 bg-slate-950/50 p-4 rounded-xl border border-slate-850">
                <div><span className="text-slate-555 font-bold">ACTION:</span> {selectedLog.action}</div>
                <div className="leading-relaxed border-t border-slate-800 pt-2 mt-2">
                  <span className="text-slate-555 font-bold block mb-1">RAW DETAILS:</span>
                  <span className="text-slate-200">{selectedLog.details || 'None'}</span>
                </div>
                {selectedLog.reason && (
                  <div className="text-rose-400 border-t border-slate-800 pt-2 mt-2">
                    <span className="text-slate-555 font-bold block mb-1">REJECTION REASON:</span>
                    <span>{selectedLog.reason}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
