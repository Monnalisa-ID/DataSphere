import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { CustomChart } from './CustomChart';
import { 
  DollarSign, 
  Users, 
  Cpu, 
  FolderGit2, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  ListTodo,
  CheckCircle2
} from 'lucide-react';


export const DashboardView: React.FC = () => {
  const { metrics, logs, exploits, syncStatus } = useDatabase();
  const [selectedMetricId, setSelectedMetricId] = useState<string>(metrics[0]?.id || '');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

  const selectedMetric = metrics.find(m => m.id === selectedMetricId);

  // Helper to format values
  const formatVal = (val: number, unit: string) => {
    if (unit === '$') {
      return val >= 1e6 
        ? `$${(val / 1e6).toFixed(2)}M` 
        : `$${val.toLocaleString()}`;
    }
    return `${val.toLocaleString()}${unit}`;
  };

  // Select metric icons based on name/category
  const getMetricIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('revenue') || n.includes('cost') || n.includes('expense')) return DollarSign;
    if (n.includes('customer') || n.includes('user') || n.includes('hire')) return Users;
    if (n.includes('cpu') || n.includes('server') || n.includes('load')) return Cpu;
    return FolderGit2;
  };

  // Categorize metrics count for breakdown list
  const categoryCounts = metrics.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalMetrics = metrics.length || 1;

  return (
    <div className="space-y-6">
      
      {/* Real-time Ticker Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </div>
          <span className="text-sm font-semibold text-slate-200">
            Real-time telemetry streaming active. Last synced at <span className="font-mono text-cyan-400">{syncStatus.lastSyncedAt}</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Interval: {(syncStatus.syncIntervalMs / 1000).toFixed(0)}s</span>
          <span className="text-slate-600">|</span>
          <span>Node latency: {syncStatus.simulatedLatencyMs}ms</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.slice(0, 4).map(m => {
          const Icon = getMetricIcon(m.name);
          const isPositive = m.change >= 0;

          return (
            <div
              key={m.id}
              onClick={() => setSelectedMetricId(m.id)}
              className={`p-5 rounded-2xl bg-slate-900 border transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                selectedMetricId === m.id
                  ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/5 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2.5 rounded-xl ${
                  selectedMetricId === m.id 
                    ? 'bg-cyan-500/10 text-cyan-400' 
                    : 'bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                } transition-colors`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isPositive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositive ? '+' : ''}{m.change}%
                </span>
              </div>

              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 truncate">
                {m.name}
              </div>
              <div className="text-2xl font-bold text-white font-mono tracking-tight truncate">
                {formatVal(m.value, m.unit)}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-slate-600" />
                <span>Updated: {m.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Graph & Custom Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Analytical Trends</h3>
            <p className="text-xs text-slate-500 mt-1">Interactive real-time database value tracking and prediction</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Metric Select Dropdown */}
            <select
              value={selectedMetricId}
              onChange={(e) => setSelectedMetricId(e.target.value)}
              className="flex-1 sm:flex-initial bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              {metrics.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {/* Chart Type Toggle Buttons */}
            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
              {(['line', 'area', 'bar'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    chartType === type
                      ? 'bg-slate-800 text-cyan-400 font-extrabold shadow'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Metric Details Panel */}
        {selectedMetric ? (
          <div className="space-y-4">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {formatVal(selectedMetric.value, selectedMetric.unit)}
              </span>
              <span className={`text-sm font-bold ${selectedMetric.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedMetric.change >= 0 ? '▲' : '▼'} {Math.abs(selectedMetric.change)}% this month
              </span>
            </div>

            {/* Custom SVG Chart */}
            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-900">
              <CustomChart
                data={selectedMetric.history}
                type={chartType}
                color={selectedMetric.change >= 0 ? '#00F2FE' : '#FF5E57'}
                gradientStart={selectedMetric.change >= 0 ? '#4FACFE' : '#FF5E57'}
                gradientEnd={selectedMetric.change >= 0 ? '#00F2FE' : '#FF7675'}
                height={220}
                unit={selectedMetric.unit}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 border border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500 text-sm">Select or add a metric to preview analytics.</p>
          </div>
        )}
      </div>

      {/* Two Column Layout: Categories & Security Shield Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Metric Categories Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Data Segmentations</h3>
            <p className="text-xs text-slate-500 mt-1">Allocation of indices across core enterprise segments</p>
          </div>

          <div className="space-y-4 my-6">
            {[
              { name: 'Financial Insights', key: 'financial', color: 'from-blue-500 to-indigo-500' },
              { name: 'Sales & Growth', key: 'sales', color: 'from-cyan-500 to-emerald-500' },
              { name: 'Operational Capacity', key: 'operational', color: 'from-purple-500 to-pink-500' },
              { name: 'Human Resource Health', key: 'hr', color: 'from-amber-500 to-orange-500' }
            ].map(cat => {
              const count = categoryCounts[cat.key] || 0;
              const percentage = Math.round((count / totalMetrics) * 100);

              return (
                <div key={cat.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">{cat.name}</span>
                    <span className="text-slate-400 font-mono">{count} metrics ({percentage}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              Categorized data is mapped to corresponding API endpoints
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valid</span>
          </div>
        </div>

        {/* Security Shield Real-time alerts ticker */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Security Shield Stream</h3>
              <p className="text-xs text-slate-500 mt-1">Live validation events and penetration logs</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>IDS ACTIVE</span>
            </div>
          </div>

          <div className="space-y-3 my-5 max-h-[170px] overflow-y-auto pr-1 select-none">
            {exploits.length === 0 && logs.filter(l => l.status === 'blocked').length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-600 py-6">
                <ShieldAlert className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs font-semibold">No intrusion attempts or security anomalies recorded</p>
                <p className="text-[10px] text-slate-500 mt-0.5">IDS system reports 0 high priority alarms</p>
              </div>
            ) : (
              // Blend block logs and exploits
              [
                ...exploits.map(e => ({
                  id: e.id,
                  type: 'exploit',
                  time: e.timestamp,
                  title: `${e.type} Shield Triggered`,
                  desc: `Source: ${e.attackerIp} | Payload: "${e.payload}"`,
                  critical: true,
                  status: e.status
                })),
                ...logs.filter(l => l.status === 'blocked').map(l => ({
                  id: l.id,
                  type: 'block',
                  time: l.timestamp,
                  title: l.action,
                  desc: `${l.reason}: ${l.details}`,
                  critical: true,
                  status: 'blocked'
                }))
              ].slice(0, 4).map(item => (
                <div key={item.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between gap-3 animate-slideIn">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'sanitized' ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`}></span>
                      <span className="font-bold text-white truncate">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate leading-snug">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0 flex flex-col justify-between items-end">
                    <span className="text-[10px] font-mono text-slate-600">{item.time}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded leading-none ${
                      item.status === 'sanitized' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <ListTodo className="w-4 h-4 text-cyan-400 shrink-0" />
              Intrusion Detection System logs are archived for compliance
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
