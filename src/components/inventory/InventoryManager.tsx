import React, { useState, useEffect } from 'react';
import { PaperInventoryItem, FactoryConfig } from '../../types';
import { getInventory, saveInventory } from '../../utils/storage';
import { NumericInput } from '../common/NumericInput';
import {
  Boxes,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Check,
  TrendingDown,
  Warehouse,
  PackagePlus,
  Edit2
} from 'lucide-react';

interface InventoryManagerProps {
  factoryConfig: FactoryConfig;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ factoryConfig }) => {
  const [inventory, setInventory] = useState<PaperInventoryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [gradeName, setGradeName] = useState('Kraft Virgin Liner');
  const [gsm, setGsm] = useState('140');
  const [reelWidthMm, setReelWidthMm] = useState('1200');
  const [supplier, setSupplier] = useState('');
  const [ratePerKg, setRatePerKg] = useState('0.65');
  const [stockKg, setStockKg] = useState('5000');
  const [minStockAlertKg, setMinStockAlertKg] = useState('1500');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setInventory(getInventory());
  }, []);

  const resetForm = () => {
    setGradeName('Kraft Virgin Liner');
    setGsm('140');
    setReelWidthMm('1200');
    setSupplier('');
    setRatePerKg('0.65');
    setStockKg('5000');
    setMinStockAlertKg('1500');
    setFormError(null);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const gsmNum = parseInt(gsm, 10);
    const widthNum = parseInt(reelWidthMm, 10);
    const rateNum = parseFloat(ratePerKg);
    const stockNum = parseFloat(stockKg);
    const alertNum = parseFloat(minStockAlertKg);

    if (isNaN(gsmNum) || isNaN(widthNum) || isNaN(rateNum) || isNaN(stockNum)) {
      setFormError('Please fill out all numeric specifications.');
      return;
    }

    if (editingId) {
      const updated = inventory.map((item) =>
        item.id === editingId
          ? {
              ...item,
              gradeName,
              gsm: gsmNum,
              reelWidthMm: widthNum,
              supplier: supplier.trim(),
              ratePerKg: rateNum,
              stockKg: stockNum,
              minStockAlertKg: alertNum,
              lastRestockedDate: new Date().toLocaleDateString(),
            }
          : item
      );
      saveInventory(updated);
      setInventory(updated);
    } else {
      const newItem: PaperInventoryItem = {
        id: Date.now().toString(),
        gradeName,
        gsm: gsmNum,
        reelWidthMm: widthNum,
        supplier: supplier.trim() || 'Direct Mill Supplier',
        ratePerKg: rateNum,
        stockKg: stockNum,
        minStockAlertKg: alertNum,
        lastRestockedDate: new Date().toLocaleDateString(),
      };
      const updated = [newItem, ...inventory];
      saveInventory(updated);
      setInventory(updated);
    }

    resetForm();
  };

  const handleEditClick = (item: PaperInventoryItem) => {
    setEditingId(item.id);
    setGradeName(item.gradeName);
    setGsm(item.gsm.toString());
    setReelWidthMm(item.reelWidthMm.toString());
    setSupplier(item.supplier);
    setRatePerKg(item.ratePerKg.toString());
    setStockKg(item.stockKg.toString());
    setMinStockAlertKg(item.minStockAlertKg.toString());
    setIsAdding(true);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this paper reel record from inventory?')) {
      const updated = inventory.filter((item) => item.id !== id);
      saveInventory(updated);
      setInventory(updated);
    }
  };

  // Quick Restock helper
  const handleQuickRestock = (id: string) => {
    const qtyStr = prompt('Enter additional stock in kg to add to inventory:');
    if (!qtyStr) return;
    const addKg = parseFloat(qtyStr);
    if (isNaN(addKg) || addKg <= 0) {
      alert('Please enter a valid positive number in kg.');
      return;
    }

    const updated = inventory.map((item) =>
      item.id === id
        ? {
            ...item,
            stockKg: item.stockKg + addKg,
            lastRestockedDate: new Date().toLocaleDateString(),
          }
        : item
    );
    saveInventory(updated);
    setInventory(updated);
  };

  const currency = factoryConfig.currencySymbol;
  const totalStockKg = inventory.reduce((sum, item) => sum + item.stockKg, 0);
  const totalValuation = inventory.reduce((sum, item) => sum + item.stockKg * item.ratePerKg, 0);
  const lowStockCount = inventory.filter((item) => item.stockKg <= item.minStockAlertKg).length;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Boxes className="w-4 h-4" />
            <span>Paper Reel Warehouse & Raw Materials</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor Kraft reels, Fluting medium, reel deckle widths, and low stock thresholds.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-amber-950 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Paper Reel</span>
        </button>
      </div>

      {/* High-level Warehouse Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Total Paper Stock</span>
          <div className="text-base font-bold text-white mt-0.5">
            {(totalStockKg / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">Tons</span>
          </div>
          <span className="text-[10px] text-slate-500">{totalStockKg.toLocaleString()} kg</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Stock Valuation</span>
          <div className="text-base font-bold text-amber-400 mt-0.5">
            {currency}{totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-slate-500">{inventory.length} Reel Grades</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-medium">Reorder Alerts</span>
          <div
            className={`text-base font-bold mt-0.5 ${
              lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {lowStockCount} <span className="text-xs font-normal text-slate-400">reels low</span>
          </div>
          <span className="text-[10px] text-slate-500">Threshold alerts</span>
        </div>
      </div>

      {/* ADD / EDIT FORM MODAL */}
      {isAdding && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId ? 'Edit Paper Reel Details' : 'Add New Paper Reel Stock'}
            </h3>
            <button onClick={resetForm} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveItem} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Paper Grade / Type</label>
                <select
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Kraft Virgin Liner">Kraft Virgin Liner (High BF)</option>
                  <option value="Semi-Chemical Fluting">Semi-Chemical Fluting Medium</option>
                  <option value="Testliner (Recycled)">Testliner (Recycled Top Liner)</option>
                  <option value="Duplex Board">Duplex Board (White Back / Grey Back)</option>
                  <option value="Bleached White Kraft">Bleached White Kraft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Paper Mill / Supplier</label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Century Pulp & Paper / WestRock"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <NumericInput
                label="Grammage (GSM)"
                value={gsm}
                onChange={setGsm}
                suffix="GSM"
                placeholder="140"
              />
              <NumericInput
                label="Reel Width"
                value={reelWidthMm}
                onChange={setReelWidthMm}
                suffix="mm"
                placeholder="1200"
                helper="Deckle width"
              />
              <NumericInput
                label="Rate / kg"
                value={ratePerKg}
                onChange={setRatePerKg}
                prefix={currency}
                suffix="/kg"
                placeholder="0.65"
              />
              <NumericInput
                label="Current Stock"
                value={stockKg}
                onChange={setStockKg}
                suffix="kg"
                placeholder="5000"
              />
            </div>

            <div className="pt-1">
              <NumericInput
                label="Minimum Reorder Threshold Alert (kg)"
                value={minStockAlertKg}
                onChange={setMinStockAlertKg}
                suffix="kg"
                placeholder="1500"
                helper="Alerts when available stock drops below this value"
              />
            </div>

            {formError && <p className="text-xs text-rose-400">{formError}</p>}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
              >
                {editingId ? 'Update Reel Record' : 'Save to Warehouse'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REEL INVENTORY CARDS */}
      <div className="space-y-2.5">
        {inventory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
            No paper reels added yet. Click &quot;+ Add Paper Reel&quot; above to record your warehouse inventory.
          </div>
        ) : (
          inventory.map((item) => {
            const isLow = item.stockKg <= item.minStockAlertKg;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isLow
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : 'border-slate-800 bg-slate-900/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{item.gradeName}</span>
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        {item.gsm} GSM
                      </span>
                      <span className="text-[11px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        Deckle: {item.reelWidthMm} mm
                      </span>
                      {isLow && (
                        <span className="text-[10px] text-rose-400 bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supplier: {item.supplier} • Purchase: {currency}{item.ratePerKg}/kg
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        {item.stockKg.toLocaleString()} kg
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Value: {currency}{(item.stockKg * item.ratePerKg).toFixed(0)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickRestock(item.id)}
                        className="text-[11px] font-semibold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-lg transition-all"
                        title="Add Stock"
                      >
                        + Restock
                      </button>
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
