import React, { useState, useEffect, useRef } from 'react';
import {
  exportDatabaseBackup,
  importDatabaseBackup,
  getCustomers,
  getQuotations,
  getOrders,
  getInventory,
  getDesigns,
  getFactoryConfig,
  logActivity
} from '../../utils/storage';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  RefreshCw,
  ShieldCheck,
  HardDrive,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';

interface BackupRestoreViewProps {
  onDatabaseChanged?: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  onDatabaseChanged,
}) => {
  const [stats, setStats] = useState({
    customers: 0,
    quotations: 0,
    orders: 0,
    inventory: 0,
    designs: 0,
  });

  const [jsonInput, setJsonInput] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshStats = () => {
    setStats({
      customers: getCustomers().length,
      quotations: getQuotations().length,
      orders: getOrders().length,
      inventory: getInventory().length,
      designs: getDesigns().length,
    });
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleExportBackup = () => {
    try {
      const backupJson = exportDatabaseBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `cartoniq_backup_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMsg({
        type: 'success',
        text: `Backup exported successfully (${filename}). Keep this file safe for data redundancy!`,
      });
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      });
    }
  };

  const handleCopyBackupToClipboard = () => {
    try {
      const backupJson = exportDatabaseBackup();
      navigator.clipboard.writeText(backupJson);
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2500);
      setStatusMsg({
        type: 'success',
        text: 'Backup JSON copied to clipboard! You can paste it into a secure document or note.',
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to copy to clipboard.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        parseAndPreview(content);
      }
    };
    reader.onerror = () => {
      setStatusMsg({ type: 'error', text: 'Error reading uploaded backup file.' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonInput.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste JSON backup contents.' });
      return;
    }
    parseAndPreview(jsonInput.trim());
  };

  const parseAndPreview = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        setStatusMsg({ type: 'error', text: 'Invalid JSON: Expected a root object.' });
        return;
      }

      setPreviewData({
        rawJson: jsonStr,
        version: parsed.version || 'Unknown',
        exportTimestamp: parsed.exportTimestamp || 'Unknown',
        checksum: parsed.checksum || 'N/A',
        factoryName: parsed.config?.factoryName || 'Unnamed Plant',
        customersCount: parsed.customers?.length || 0,
        quotationsCount: parsed.quotations?.length || 0,
        ordersCount: parsed.orders?.length || 0,
        inventoryCount: parsed.inventory?.length || 0,
        designsCount: parsed.designs?.length || 0,
      });

      setShowConfirmModal(true);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: `Invalid backup file: ${err instanceof Error ? err.message : 'Corrupt JSON format'}`,
      });
    }
  };

  const handleExecuteRestore = () => {
    if (!previewData?.rawJson) return;

    // Create automatic safety snapshot in localStorage before overwriting
    try {
      const emergencySnapshot = exportDatabaseBackup();
      localStorage.setItem('cartoniq_emergency_pre_restore_snapshot', emergencySnapshot);
    } catch (e) {
      console.warn('Could not save emergency snapshot:', e);
    }

    const result = importDatabaseBackup(previewData.rawJson);
    if (result.success) {
      setShowConfirmModal(false);
      setPreviewData(null);
      setJsonInput('');
      setShowPasteArea(false);
      refreshStats();
      if (onDatabaseChanged) onDatabaseChanged();

      setStatusMsg({
        type: 'success',
        text: result.message,
      });
      setTimeout(() => setStatusMsg(null), 6000);
    } else {
      setStatusMsg({
        type: 'error',
        text: result.message,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Database Summary Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Offline Database Records
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Encrypted Namespaced Storage
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xl font-black text-amber-400">{stats.customers}</span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase mt-0.5">Customers</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xl font-black text-cyan-400">{stats.quotations}</span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase mt-0.5">Quotations</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xl font-black text-emerald-400">{stats.orders}</span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase mt-0.5">Orders</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-xl font-black text-purple-400">{stats.inventory}</span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase mt-0.5">Paper Reels</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center col-span-2 sm:col-span-1">
            <span className="text-xl font-black text-pink-400">{stats.designs}</span>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase mt-0.5">3D Boxes</span>
          </div>
        </div>
      </div>

      {/* Export & Import Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Backup Box */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Export Database Backup</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Creates a complete snapshot of all customer accounts, active quotes, production orders, reel stock, 3D designs, and factory configurations.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-950 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup JSON File</span>
            </button>

            <button
              type="button"
              onClick={handleCopyBackupToClipboard}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              {copiedBackup ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBackup ? 'Copied to Clipboard!' : 'Copy Backup JSON to Clipboard'}</span>
            </button>
          </div>
        </div>

        {/* Restore Backup Box */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Restore from Backup</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a previously exported CartonIQ JSON backup file to restore your manufacturing plant data on a new phone or browser.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Backup JSON File</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPasteArea(!showPasteArea)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>{showPasteArea ? 'Hide Direct Paste' : 'Direct JSON Paste (Termux / Mobile)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paste Area for Mobile/Termux Users */}
      {showPasteArea && (
        <form onSubmit={handlePasteSubmit} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Paste Backup JSON Content</span>
            </label>
            <span className="text-[10px] text-slate-400">Direct string validation</span>
          </div>

          <textarea
            rows={5}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"version": "1.2.0", "app": "CartonIQ", "customers": [...], ...}'
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
          />

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all"
            >
              Verify & Preview Restore
            </button>
          </div>
        </form>
      )}

      {/* Status Notifications */}
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

      {/* MODAL: PREVIEW & CONFIRM RESTORE */}
      {showConfirmModal && previewData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Confirm Database Restoration</h3>
                <p className="text-[11px] text-slate-400">Review records to be restored into CartonIQ</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Backup Created:</span>
                <span className="font-semibold text-white">{new Date(previewData.exportTimestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Plant / Company:</span>
                <span className="font-semibold text-amber-400">{previewData.factoryName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900 flex justify-between">
                  <span className="text-slate-400">Customers:</span>
                  <span className="font-bold text-white">{previewData.customersCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 flex justify-between">
                  <span className="text-slate-400">Quotations:</span>
                  <span className="font-bold text-white">{previewData.quotationsCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 flex justify-between">
                  <span className="text-slate-400">Orders:</span>
                  <span className="font-bold text-white">{previewData.ordersCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 flex justify-between">
                  <span className="text-slate-400">Reel Inventory:</span>
                  <span className="font-bold text-white">{previewData.inventoryCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 flex justify-between col-span-2">
                  <span className="text-slate-400">3D Box Designs:</span>
                  <span className="font-bold text-white">{previewData.designsCount}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-amber-300 bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>An automatic rollback snapshot will be created before restoring to safeguard your existing records.</span>
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleExecuteRestore}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950"
              >
                Execute Restore
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPreviewData(null);
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
