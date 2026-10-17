import React, { useState, useEffect } from 'react';
import { AuditLogEntry, AuditCategory } from '../../types';
import { getAuditLogs, clearAuditLogs, logActivity } from '../../utils/storage';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  Shield,
  FileText,
  PackageCheck,
  Users,
  Boxes,
  Database,
  Sliders,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const ActivityHistoryView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadLogs = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClearLogs = () => {
    clearAuditLogs();
    logActivity('Cleared Activity History', 'system', 'User emptied the audit trail');
    loadLogs();
    setShowClearConfirm(false);
    setStatusMsg('Activity audit log cleared.');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleExportLogs = () => {
    const textData = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.category.toUpperCase()}] ${l.action} - ${l.details}`
      )
      .join('\n');

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cartoniq_activity_log_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesCategory =
      categoryFilter === 'all' || log.category === categoryFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query) ||
      log.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (category: AuditCategory) => {
    switch (category) {
      case 'security':
        return {
          icon: Shield,
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          label: 'Security',
        };
      case 'quote':
        return {
          icon: FileText,
          color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          label: 'Quotation',
        };
      case 'order':
        return {
          icon: PackageCheck,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: 'Order',
        };
      case 'customer':
        return {
          icon: Users,
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: 'Customer',
        };
      case 'inventory':
        return {
          icon: Boxes,
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          label: 'Inventory',
        };
      case 'backup':
        return {
          icon: Database,
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          label: 'Backup',
        };
      default:
        return {
          icon: Sliders,
          color: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
          label: 'System',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Operational Activity History & Audit Trail</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically timestamped actions across quotes, orders, inventory, PIN access, and backups.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl transition-all"
            title="Download audit text file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 text-xs font-semibold bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-800/50 px-3 py-1.5 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity records..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'security', label: 'Security' },
            { id: 'quote', label: 'Quotes' },
            { id: 'order', label: 'Orders' },
            { id: 'customer', label: 'CRM' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'backup', label: 'Backup' },
            { id: 'system', label: 'System' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all text-[11px] ${
                categoryFilter === cat.id
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-semibold text-slate-400">No activity logged in this category</p>
            <p className="text-[11px] text-slate-500">
              Actions like generating quotations, adding reels, changing PIN, and making backups will appear here.
            </p>
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const badge = getCategoryBadge(entry.category);
            const Icon = badge.icon;
            return (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-2 rounded-lg border shrink-0 ${badge.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{entry.action}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {entry.details}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 shrink-0 self-end sm:self-auto">
                  <Clock className="w-3 h-3" />
                  <span>{entry.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Clear Activity Audit Trail?</h3>
            <p className="text-xs text-slate-400">
              This will remove historical activity records from local storage. Your actual customers, quotes, orders, and rates will NOT be affected.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearLogs}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-xl transition-all"
              >
                Confirm Clear
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
