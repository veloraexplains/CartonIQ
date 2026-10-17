import React, { useState, useEffect } from 'react';
import { FactoryConfig } from '../../types';
import {
  getOrders,
  getQuotations,
  getCustomers,
  getInventory,
  getDesigns,
  exportDatabaseBackup,
  importDatabaseBackup
} from '../../utils/storage';
import {
  BarChart3,
  TrendingUp,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  DollarSign,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ReportsViewProps {
  factoryConfig: FactoryConfig;
  onRefreshData?: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ factoryConfig, onRefreshData }) => {
  const [orders, setOrders] = useState(getOrders());
  const [quotations, setQuotations] = useState(getQuotations());
  const [customers, setCustomers] = useState(getCustomers());
  const [inventory, setInventory] = useState(getInventory());
  const [designs, setDesigns] = useState(getDesigns());

  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const refreshAll = () => {
    setOrders(getOrders());
    setQuotations(getQuotations());
    setCustomers(getCustomers());
    setInventory(getInventory());
    setDesigns(getDesigns());
    if (onRefreshData) onRefreshData();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Compute metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalReceived = orders.reduce((sum, o) => sum + o.advancePaid, 0);
  const totalOutstanding = orders.reduce((sum, o) => sum + o.balanceDue, 0);
  const totalBoxesProduced = orders.reduce((sum, o) => sum + o.quantityOrdered, 0);
  const activeOrdersCount = orders.filter((o) => o.productionStage !== 'Dispatched').length;
  const completedOrdersCount = orders.filter((o) => o.productionStage === 'Dispatched').length;

  const quoteCount = quotations.length;
  const approvedQuotes = quotations.filter((q) => q.status === 'Approved').length;
  const conversionRate = quoteCount > 0 ? Math.round((approvedQuotes / quoteCount) * 100) : 0;

  const inventoryValue = inventory.reduce((sum, item) => sum + item.stockKg * item.ratePerKg, 0);

  // Backup Export
  const handleExportBackup = () => {
    const jsonStr = exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cartoniq-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Backup Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = importDatabaseBackup(content);
        setImportStatus(result);
        if (result.success) {
          refreshAll();
        }
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const currency = factoryConfig.currencySymbol;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <BarChart3 className="w-4 h-4" />
            <span>Business Intelligence & Plant Reports</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Production output, financial balances, quotation win-rate, and encrypted local backup.
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-950 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Database JSON</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Total Booked Sales</span>
          <div className="text-lg font-bold text-amber-400 mt-0.5">
            {currency}{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-slate-500">{orders.length} Total Orders</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Outstanding Dues</span>
          <div className="text-lg font-bold text-rose-400 mt-0.5">
            {currency}{totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-emerald-400">
            Collected: {currency}{totalReceived.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Cartons Manufactured</span>
          <div className="text-lg font-bold text-white mt-0.5">
            {totalBoxesProduced.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Units in pipeline</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Quote Win-Rate</span>
          <div className="text-lg font-bold text-emerald-400 mt-0.5">
            {conversionRate}%
          </div>
          <span className="text-[10px] text-slate-400">
            {approvedQuotes} of {quoteCount} approved
          </span>
        </div>
      </div>

      {/* Detailed Operational Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Production Stage Breakdown */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Manufacturing Status Overview
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Active Shopfloor Batches:</span>
              <span className="font-bold text-amber-400">{activeOrdersCount} orders</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Completed & Dispatched:</span>
              <span className="font-bold text-emerald-400">{completedOrdersCount} orders</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Warehouse Raw Material Value:</span>
              <span className="font-bold text-white">{currency}{inventoryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Custom 3D Designs in Vault:</span>
              <span className="font-bold text-white">{designs.length} box models</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Active Customer Accounts:</span>
              <span className="font-bold text-white">{customers.length} companies</span>
            </div>
          </div>
        </div>

        {/* Safe Backup & Restore Hub */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Data Integrity & Safe Backup
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Export a full encrypted JSON snapshot of your designs, customers, rates, quotations, and orders.
            Restore at any time with validation safeguards against corruption.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={handleExportBackup}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Download Backup</span>
            </button>

            <label className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all border border-slate-700 cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div
              className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                importStatus.success
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
              }`}
            >
              {importStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
