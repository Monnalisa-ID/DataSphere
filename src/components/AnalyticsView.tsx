import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import type { MetricData } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Lock,
  X,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { 
    metrics, 
    currentRole, 
    csrfToken, 
    addMetric, 
    updateMetric, 
    deleteMetric 
  } = useDatabase();

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof MetricData>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formCategory, setFormCategory] = useState<'financial' | 'operational' | 'hr' | 'sales'>('financial');
  const [formError, setFormError] = useState('');


  // Handle Sort
  const handleSort = (field: keyof MetricData) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter and Sort Metrics
  const filteredMetrics = metrics.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const sortedMetrics = [...filteredMetrics].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  // Open Edit form
  const handleOpenEdit = (metric: MetricData) => {
    setEditingId(metric.id);
    setFormName(metric.name);
    setFormValue(String(metric.value));
    setFormUnit(metric.unit);
    setFormCategory(metric.category);
    setFormError('');
    setIsEditOpen(true);
  };

  // Open Add form
  const handleOpenAdd = () => {
    setFormName('');
    setFormValue('');
    setFormUnit('');
    setFormCategory('financial');
    setFormError('');
    setIsAddOpen(true);
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formValue.trim()) {
      setFormError('Please fill in Name and Value fields.');
      return;
    }

    const numericVal = parseFloat(formValue);
    if (isNaN(numericVal)) {
      setFormError('Value must be a valid number.');
      return;
    }

    const res = addMetric({
      name: formName,
      value: numericVal,
      unit: formUnit,
      category: formCategory
    }, csrfToken);

    if (res.success) {
      setIsAddOpen(false);
    } else {
      setFormError(res.error || 'Failed to insert metric.');
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formValue.trim()) {
      setFormError('Please fill in Name and Value fields.');
      return;
    }

    const numericVal = parseFloat(formValue);
    if (isNaN(numericVal)) {
      setFormError('Value must be a valid number.');
      return;
    }

    const res = updateMetric(editingId, numericVal, csrfToken, formName);

    if (res.success) {
      setIsEditOpen(false);
    } else {
      setFormError(res.error || 'Failed to update metric.');
    }
  };

  // Handle Delete Click
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this metric and all historical records?')) {
      const res = deleteMetric(id, csrfToken);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  // UI helpers
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'financial': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'sales': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'operational': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'hr': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const isViewer = currentRole === 'viewer';
  const isAdmin = currentRole === 'admin';

  return (
    <div className="space-y-6">
      
      {/* Search and Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search metric name or segment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Add Record Trigger */}
        <button
          onClick={handleOpenAdd}
          disabled={isViewer}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
            isViewer 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800' 
              : 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:opacity-90 shadow-cyan-500/10 active:scale-95'
          }`}
        >
          {isViewer ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>Create New Indicator</span>
        </button>
      </div>

      {/* Main Stats Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider select-none">
                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  Indicator Name {sortField === 'name' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                  Category {sortField === 'category' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('value')}>
                  Current Value {sortField === 'value' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('change')}>
                  Delta (%) {sortField === 'change' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-white" onClick={() => handleSort('lastUpdated')}>
                  Telemetry Sync {sortField === 'lastUpdated' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="px-6 py-4 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {sortedMetrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-medium">
                    No matching indicator found. Create a new one above.
                  </td>
                </tr>
              ) : (
                sortedMetrics.map(m => {
                  const isChangePositive = m.change >= 0;
                  
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/25 transition-colors group">
                      <td className="px-6 py-4.5 font-semibold text-white truncate max-w-[180px]">
                        {m.name}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getCategoryColor(m.category)}`}>
                          {m.category}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 font-mono font-bold text-slate-200">
                        {m.unit === '$' ? `$${m.value.toLocaleString()}` : `${m.value.toLocaleString()}${m.unit}`}
                      </td>
                      <td className="px-6 py-4.5 font-mono font-bold">
                        <span className={isChangePositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isChangePositive ? '+' : ''}{m.change}%
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-slate-500 font-semibold font-mono">
                        {m.lastUpdated}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Edit Access Control */}
                          <button
                            onClick={() => handleOpenEdit(m)}
                            disabled={isViewer}
                            className={`p-2 rounded-xl transition-all ${
                              isViewer
                                ? 'bg-transparent text-slate-600 cursor-not-allowed'
                                : 'bg-slate-850 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                            title={isViewer ? 'Read-only Access restricted' : 'Edit Indicator Parameters'}
                          >
                            {isViewer ? <Lock className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          </button>

                          {/* Delete Access Control */}
                          <button
                            onClick={() => handleDelete(m.id)}
                            disabled={!isAdmin}
                            className={`p-2 rounded-xl transition-all ${
                              !isAdmin
                                ? 'bg-transparent text-slate-700 cursor-not-allowed'
                                : 'bg-slate-850 text-rose-400 hover:text-rose-200 hover:bg-rose-950/30'
                            }`}
                            title={isAdmin ? 'Delete Indicator' : 'Delete permission restricted to Admin role'}
                          >
                            {isAdmin ? <Trash2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= ADD INDICATOR MODAL ================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-zoomIn">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white leading-none">Create Indicator</h3>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold leading-relaxed">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Indicator Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Conversion Rate"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Numeric Value</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 78.4"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Unit Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. %, $, ms, or blank"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Business Segment</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="financial">Financial Insights</option>
                  <option value="sales">Sales & Growth</option>
                  <option value="operational">Operational Capacity</option>
                  <option value="hr">Human Resource Health</option>
                </select>
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2 mt-4 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security Sandbox Scanner</span>
                </div>
                <p className="text-slate-400 leading-normal text-[11px]">
                  All inputs are parsed dynamically through XSS sanitizers and parameterized query validations before disk persistence.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:opacity-90 shadow-md shadow-cyan-500/5 active:scale-95 transition-all"
                >
                  Commit to Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT INDICATOR MODAL ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-zoomIn">
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white leading-none">Modify Indicator</h3>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold leading-relaxed">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Indicator Name</label>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                    <Info className="w-3.5 h-3.5 text-indigo-400" /> Name is immutable on standard accounts
                  </span>
                </div>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-400 rounded-xl px-4 py-2.5 text-sm outline-none cursor-not-allowed"
                  disabled
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Value</label>
                <input
                  type="number"
                  step="any"
                  placeholder="Enter numeric value"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-2 mt-4 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validation Protection Layer</span>
                </div>
                <p className="text-slate-400 leading-normal text-[11px]">
                  Requires current session token confirmation: <code className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[9px] px-1 py-0.5 rounded">{csrfToken.substring(0, 12)}...</code>
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:opacity-90 shadow-md shadow-indigo-500/5 active:scale-95 transition-all"
                >
                  Update Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
