import React, { useState } from 'react';
import {
  safeDeleteOrders,
  safeDeleteQuotations,
  safeDeleteCustomers,
  safeDeleteInventory,
  safeDeleteDesigns,
  safeFactoryReset,
  getOrders,
  getQuotations,
  getCustomers,
  getInventory,
  getDesigns,
  exportDatabaseBackup
} from '../../utils/storage';
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Download,
  X,
  Lock,
  Layers,
  Users,
  FileText,
  Boxes,
  Box
} from 'lucide-react';

interface SafeDataDeletionViewProps {
  onDataCleared?: () => void;
}

type DeletionTarget =
  | 'orders'
  | 'quotations'
  | 'customers'
  | 'inventory'
  | 'designs'
  | 'master_reset'
  | null;

export const SafeDataDeletionView: React.FC<SafeDataDeletionViewProps> = ({
  onDataCleared,
}) => {
  const [activeTarget, setActiveTarget] = useState<DeletionTarget>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const getRecordCount = (target: DeletionTarget): number => {
    switch (target) {
      case 'orders': return getOrders().length;
      case 'quotations': return getQuotations().length;
      case 'customers': return getCustomers().length;
      case 'inventory': return getInventory().length;
      case 'designs': return getDesigns().length;
      case 'master_reset':
        return (
          getOrders().length +
          getQuotations().length +
          getCustomers().length +
          getInventory().length +
          getDesigns().length
        );
      default: return 0;
    }
  };

  const getTargetTitle = (target: DeletionTarget): string => {
    switch (target) {
      case 'orders': return 'Production Orders';
      case 'quotations': return 'Commercial Quotations';
      case 'customers': return 'Customer CRM Accounts';
      case 'inventory': return 'Paper Reel Inventory';
      case 'designs': return 'Custom 3D Box Designs';
      case 'master_reset': return 'FACTORY MASTER RESET (All Data)';
      default: return '';
    }
  };

  const getRequiredWord = (target: DeletionTarget): string => {
    return target === 'master_reset' ? 'RESET' : 'DELETE';
  };

  const handleTriggerDeletion = (target: DeletionTarget) => {
    setActiveTarget(target);
    setConfirmInput('');
  };

  const executeConfirmedDeletion = () => {
    if (!activeTarget) return;

    const required = getRequiredWord(activeTarget);
    if (confirmInput.trim().toUpperCase() !== required) {
      setStatusMsg({
        type: 'error',
        text: `Confirmation failed: You must type "${required}" to proceed.`,
      });
      return;
    }

    // Automatically trigger an emergency JSON backup download prior to wiping anything!
    try {
      const emergencyJson = exportDatabaseBackup();
      const blob = new Blob([emergencyJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cartoniq_pre_deletion_snapshot_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Could not auto-download emergency snapshot:', e);
    }

    let success = false;
    let message = '';

    switch (activeTarget) {
      case 'orders':
        success = safeDeleteOrders();
        message = 'All production orders purged successfully.';
        break;
      case 'quotations':
        success = safeDeleteQuotations();
        message = 'All quotations purged successfully.';
        break;
      case 'customers':
        success = safeDeleteCustomers();
        message = 'All customer accounts purged successfully.';
        break;
      case 'inventory':
        success = safeDeleteInventory();
        message = 'All paper inventory reels purged successfully.';
        break;
      case 'designs':
        success = safeDeleteDesigns();
        message = 'All saved 3D box models purged successfully.';
        break;
      case 'master_reset':
        const res = safeFactoryReset();
        success = res.success;
        message = 'Factory master reset executed. All tables wiped to defaults.';
        break;
    }

    setActiveTarget(null);
    setConfirmInput('');

    if (success) {
      setStatusMsg({
        type: 'success',
        text: `${message} (Emergency backup JSON auto-downloaded).`,
      });
      if (onDataCleared) onDataCleared();
      setTimeout(() => setStatusMsg(null), 6000);
    } else {
      setStatusMsg({
        type: 'error',
        text: 'Failed to purge data. Storage error encountered.',
      });
    }
  };

  const categories = [
    {
      id: 'orders' as const,
      name: 'Production Orders',
      desc: 'Active job orders, production stages, partial payments, and balance tracking.',
      count: getOrders().length,
      icon: Layers,
    },
    {
      id: 'quotations' as const,
      name: 'Quotations',
      desc: 'Commercial price quotes, tiered pricing, and historical quotation revisions.',
      count: getQuotations().length,
      icon: FileText,
    },
    {
      id: 'customers' as const,
      name: 'Customer CRM Directory',
      desc: 'Client accounts, contact persons, tax GSTINs, and delivery addresses.',
      count: getCustomers().length,
      icon: Users,
    },
    {
      id: 'inventory' as const,
      name: 'Paper Reel Inventory',
      desc: 'Paper grades, GSMs, mill suppliers, stock reels (kg), and minimum alert levels.',
      count: getInventory().length,
      icon: Boxes,
    },
    {
      id: 'designs' as const,
      name: '3D Box Designs',
      desc: 'Saved FEFCO 0201 dimensions, artwork labels, brand logos, and 3D folding models.',
      count: getDesigns().length,
      icon: Box,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Safeguard Assurance Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Granular & Safe Business Data Deletion</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Accidental data loss is prohibited in CartonIQ. Every deletion action requires typed keyword confirmation and generates an automated emergency pre-deletion JSON snapshot before any records are cleared.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Granular Table Deletion Cards */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider px-1">
          Selective Table Purging
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{cat.name}</span>
                      <span className="text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                        {cat.count} records
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight line-clamp-1">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerDeletion(cat.id)}
                  disabled={cat.count === 0}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    cat.count === 0
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 active:scale-95'
                  }`}
                >
                  Purge
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master Factory Reset (High Danger Zone) */}
      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-3 mt-6">
        <div className="flex items-center justify-between pb-2 border-b border-rose-800/30">
          <div className="flex items-center gap-2 text-rose-400">
            <RotateCcw className="w-4 h-4" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider">
              Factory Master Reset (Wipe All Data)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Nuclear Option</span>
        </div>

        <p className="text-xs text-rose-200/80 leading-relaxed">
          Wipes all customers, quotations, production orders, reel stock, 3D designs, and restores factory configuration to clean initial setup. CartonIQ will automatically download an emergency JSON backup snapshot to your device before executing the reset.
        </p>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={() => handleTriggerDeletion('master_reset')}
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md shadow-rose-950 flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Execute Factory Master Reset</span>
          </button>
        </div>
      </div>

      {/* CONFIRMATION SAFETY MODAL */}
      {activeTarget && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-700/60 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl shadow-rose-950/50 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Confirm Deletion: {getTargetTitle(activeTarget)}
                </h3>
                <p className="text-[11px] text-rose-300">
                  {getRecordCount(activeTarget)} record(s) will be permanently cleared.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <p>
                To prevent accidental deletion, please type{' '}
                <strong className="text-amber-400 font-mono text-sm px-1 bg-amber-950/40 rounded">
                  {getRequiredWord(activeTarget)}
                </strong>{' '}
                in the box below to unlock deletion.
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1">
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>An automated emergency JSON backup snapshot will download immediately.</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Type <strong className="text-white">{getRequiredWord(activeTarget)}</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={`Type ${getRequiredWord(activeTarget)}`}
                autoFocus
                className="w-full bg-slate-950 border border-rose-700/70 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-mono uppercase tracking-widest text-center"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={executeConfirmedDeletion}
                disabled={confirmInput.trim().toUpperCase() !== getRequiredWord(activeTarget)}
                className={`flex-1 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md ${
                  confirmInput.trim().toUpperCase() === getRequiredWord(activeTarget)
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950 cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Confirm & Purge Data
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTarget(null);
                  setConfirmInput('');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 px-4 rounded-xl"
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
