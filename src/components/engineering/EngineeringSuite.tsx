import React, { useState } from 'react';
import { FactoryConfig, DimensionUnit, BoxStyle, FluteType, PlyCount } from '../../types';
import { convertToMm, convertFromMm } from '../../utils/calculator';
import { NumericInput } from '../common/NumericInput';
import {
  Cpu,
  Layers,
  Scale,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Share2,
  Printer,
  ShieldAlert,
  ShieldCheck,
  PackageCheck,
  Boxes
} from 'lucide-react';

interface EngineeringSuiteProps {
  factoryConfig: FactoryConfig;
  onSendToCalculator?: (l: string, w: string, h: string) => void;
}

// Preset standard corrugator reel sizes in inches
const DEFAULT_REEL_SIZES_INCHES = [36, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 68, 72];

export const EngineeringSuite: React.FC<EngineeringSuiteProps> = ({
  factoryConfig,
  onSendToCalculator
}) => {
  const [activeTab, setActiveTab] = useState<'deckle' | 'bct'>('deckle');
  const currency = factoryConfig.currencySymbol || '₹';

  // -------------------------------------------------------------
  // TOOL 1: REEL DECKLE MATCHING & TRIM WASTAGE OPTIMIZER
  // -------------------------------------------------------------
  const [deckleUnit, setDeckleUnit] = useState<DimensionUnit>('inch');
  // Order 1 Sheet specs
  const [sheet1Width, setSheet1Width] = useState('42'); // Width / Deckle required
  const [sheet1Length, setSheet1Length] = useState('68'); // Cut length
  const [sheet1Qty, setSheet1Qty] = useState('2000'); // Number of sheets
  const [order1Name, setOrder1Name] = useState('Order A (Master Carton)');

  // 2-Up Combination Mode (Pairing two orders together)
  const [enableCombo2Up, setEnableCombo2Up] = useState(false);
  const [sheet2Width, setSheet2Width] = useState('22');
  const [sheet2Length, setSheet2Length] = useState('48');
  const [sheet2Qty, setSheet2Qty] = useState('2000');
  const [order2Name, setOrder2Name] = useState('Order B (Inner Box)');

  // Reel Paper GSM & Rate for cost calculation
  const [paperAvgGsm, setPaperAvgGsm] = useState('140');
  const [paperRatePerKg, setPaperRatePerKg] = useState('38');

  // Available plant reels in inches
  const [availableReels, setAvailableReels] = useState<number[]>(DEFAULT_REEL_SIZES_INCHES);
  const [customReelInput, setCustomReelInput] = useState('');

  // -------------------------------------------------------------
  // TOOL 2: BCT & STACKING COMPRESSION PREDICTOR (MCKEE FORMULA)
  // -------------------------------------------------------------
  const [bctUnit, setBctUnit] = useState<DimensionUnit>('mm');
  const [boxLength, setBoxLength] = useState('400');
  const [boxWidth, setBoxWidth] = useState('300');
  const [boxHeight, setBoxHeight] = useState('250');
  const [boxGrossWeightKg, setBoxGrossWeightKg] = useState('18'); // Gross weight inside box
  const [stackingTiers, setStackingTiers] = useState('5'); // Total boxes stacked vertically
  const [safetyEnv, setSafetyEnv] = useState<'normal' | 'humid' | 'cold' | 'export'>('humid');
  const [palletPattern, setPalletPattern] = useState<'column' | 'interlocked'>('column');

  // Convert sheet dimensions to mm for internal calculations
  const s1WidthMm = convertToMm(Number(sheet1Width) || 0, deckleUnit);
  const s1LengthMm = convertToMm(Number(sheet1Length) || 0, deckleUnit);
  const s1QtyNum = Number(sheet1Qty) || 0;

  const s2WidthMm = convertToMm(Number(sheet2Width) || 0, deckleUnit);
  const s2LengthMm = convertToMm(Number(sheet2Length) || 0, deckleUnit);
  const s2QtyNum = Number(sheet2Qty) || 0;

  // Deckle calculation results
  const computeDeckleOptimization = () => {
    // Total effective width needed across corrugator
    const totalCutWidthMm = enableCombo2Up ? s1WidthMm + s2WidthMm : s1WidthMm;
    const totalCutWidthInch = totalCutWidthMm / 25.4;

    if (totalCutWidthMm <= 0) return null;

    // Find best fitting reel from available inventory (reel size >= cut width)
    const validReels = availableReels
      .map((rInch) => {
        const rMm = rInch * 25.4;
        const trimScrapMm = rMm - totalCutWidthMm;
        const trimPercent = (trimScrapMm / rMm) * 100;
        return {
          reelInch: rInch,
          reelMm: rMm,
          trimScrapMm,
          trimPercent,
          isValid: trimScrapMm >= 0,
        };
      })
      .filter((r) => r.isValid)
      .sort((a, b) => a.trimScrapMm - b.trimScrapMm);

    const bestReel = validReels[0] || null;

    // Paper Consumption & Cost
    const linearMeters = ((s1LengthMm / 1000) * s1QtyNum);
    const avgGsmNum = Number(paperAvgGsm) || 140;
    const rateKgNum = Number(paperRatePerKg) || 38;

    let totalPaperWeightKg = 0;
    let scrapWeightKg = 0;
    let scrapCost = 0;

    if (bestReel) {
      // Paper weight = (Reel Width in m) * (Linear meters) * (GSM / 1000)
      totalPaperWeightKg = (bestReel.reelMm / 1000) * linearMeters * (avgGsmNum / 1000);
      scrapWeightKg = (bestReel.trimScrapMm / 1000) * linearMeters * (avgGsmNum / 1000);
      scrapCost = scrapWeightKg * rateKgNum;
    }

    return {
      totalCutWidthInch,
      totalCutWidthMm,
      bestReel,
      validReels: validReels.slice(0, 4),
      linearMeters,
      totalPaperWeightKg,
      scrapWeightKg,
      scrapCost,
    };
  };

  const deckleResult = computeDeckleOptimization();

  // BCT Calculation using McKee Formula
  // McKee Formula: BCT = 5.87 * ECT * sqrt(caliper * perimeter)
  // Required BCT = Dead load on bottom box * Total Safety Factor
  const computeBCT = () => {
    const lMm = convertToMm(Number(boxLength) || 0, bctUnit);
    const wMm = convertToMm(Number(boxWidth) || 0, bctUnit);
    const hMm = convertToMm(Number(boxHeight) || 0, bctUnit);
    const weightPerBox = Number(boxGrossWeightKg) || 15;
    const tiers = Number(stackingTiers) || 5;

    if (lMm <= 0 || wMm <= 0 || hMm <= 0 || tiers <= 1) return null;

    // Load on the bottom box = (tiers - 1) * weight per box
    const deadLoadKgf = (tiers - 1) * weightPerBox;

    // Environmental Safety Factors:
    // Normal: 4.0x
    // High Monsoon Humidity (>80% RH): 5.5x
    // Cold storage / Chiller: 6.0x
    // Export ocean transit: 6.5x
    let envFactor = 4.0;
    if (safetyEnv === 'humid') envFactor = 5.5;
    if (safetyEnv === 'cold') envFactor = 6.0;
    if (safetyEnv === 'export') envFactor = 6.5;

    // Pallet stacking pattern degradation
    // Interlocked stacking reduces box strength by ~35% due to corners not aligning!
    const patternFactor = palletPattern === 'interlocked' ? 1.45 : 1.0;

    const totalSafetyFactor = Number((envFactor * patternFactor).toFixed(2));
    const requiredBctKgf = Number((deadLoadKgf * totalSafetyFactor).toFixed(1));
    const requiredBctNewtons = Number((requiredBctKgf * 9.80665).toFixed(0));

    // Box perimeter in meters
    const perimeterM = (2 * (lMm + wMm)) / 1000;

    // Required ECT (Edge Crush Test) in kN/m using reversed McKee estimation
    // For standard 3-ply B-flute caliper ~ 3.0mm, 5-ply BC ~ 6.5mm
    const assumedCaliperM = tiers > 5 || weightPerBox > 20 ? 0.0065 : 0.0035; // 5-ply vs 3-ply
    const requiredEctKnm = Number(
      (requiredBctNewtons / (5.87 * Math.sqrt(assumedCaliperM * perimeterM * 1000) * 10)).toFixed(2)
    );

    // Recommended Board Spec
    let recommendedPly: PlyCount = 3;
    let recommendedFlute: FluteType = 'B';
    let recommendedPaperCombo = '150 GSM Kraft (Top) + 120 GSM Fluting (18 BF) + 140 GSM (Back)';
    let estimatedBurstStrength = '8.5 kg/cm²';

    if (requiredBctKgf > 350 || weightPerBox > 22 || tiers > 6) {
      recommendedPly = 5;
      recommendedFlute = 'BC';
      recommendedPaperCombo = '180 GSM Virgin Kraft (24 BF) + 140 GSM Fluting + 140 Virgin Center + 140 Fluting + 180 Back Liner';
      estimatedBurstStrength = '14.5 kg/cm² (Heavy Duty)';
    } else if (requiredBctKgf > 220 || weightPerBox > 15) {
      recommendedPly = 3;
      recommendedFlute = 'C';
      recommendedPaperCombo = '180 GSM Semi-Kraft (20 BF) + 140 GSM Fluting (20 BF) + 180 GSM Back Liner';
      estimatedBurstStrength = '11.0 kg/cm²';
    }

    return {
      deadLoadKgf,
      totalSafetyFactor,
      requiredBctKgf,
      requiredBctNewtons,
      requiredEctKnm,
      perimeterMm: 2 * (lMm + wMm),
      recommendedPly,
      recommendedFlute,
      recommendedPaperCombo,
      estimatedBurstStrength,
    };
  };

  const bctResult = computeBCT();

  const handleAddCustomReel = () => {
    const val = Number(customReelInput);
    if (val > 10 && val < 150 && !availableReels.includes(val)) {
      setAvailableReels([...availableReels, val].sort((a, b) => a - b));
      setCustomReelInput('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Cpu className="w-4 h-4" />
            <span>CartonIQ Plant Engineering & Optimization Suite</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Reduce reel trim waste by up to 8% and calculate safe box stacking strength with scientific McKee formulas.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveTab('deckle')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-bold transition-all ${
              activeTab === 'deckle'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Reel Deckle Optimizer</span>
          </button>
          <button
            onClick={() => setActiveTab('bct')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-bold transition-all ${
              activeTab === 'bct'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>BCT Strength Predictor</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: REEL DECKLE MATCHING & TRIM WASTAGE OPTIMIZER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'deckle' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-4">
              {/* Order 1 Specs */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Primary Order Sheet Dimensions
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {(['inch', 'cm', 'mm'] as DimensionUnit[]).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setDeckleUnit(u)}
                        className={`px-2 py-0.5 rounded font-semibold ${
                          deckleUnit === u ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Sheet Deckle Width * ({deckleUnit})
                    </label>
                    <NumericInput
                      value={sheet1Width}
                      onChange={setSheet1Width}
                      placeholder="e.g. 42"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Along paper reel width</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Sheet Cut Length * ({deckleUnit})
                    </label>
                    <NumericInput
                      value={sheet1Length}
                      onChange={setSheet1Length}
                      placeholder="e.g. 68"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Rotary knife cut size</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Required Quantity (Sheets)
                    </label>
                    <NumericInput
                      value={sheet1Qty}
                      onChange={setSheet1Qty}
                      placeholder="e.g. 2000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Box count required</span>
                  </div>
                </div>
              </div>

              {/* 2-Up Combination Toggle (Pairing two orders together) */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-emerald-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        2-Up Corrugator Combo Mode (Run 2 Orders Side-by-Side)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Pair a small box order with a large box order on the same reel to eliminate edge trim!
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableCombo2Up}
                      onChange={(e) => setEnableCombo2Up(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {enableCombo2Up && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Order 2 Deckle Width ({deckleUnit})
                      </label>
                      <NumericInput
                        value={sheet2Width}
                        onChange={setSheet2Width}
                        placeholder="e.g. 22"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Order 2 Cut Length ({deckleUnit})
                      </label>
                      <NumericInput
                        value={sheet2Length}
                        onChange={setSheet2Length}
                        placeholder="e.g. 48"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Order 2 Sheet Qty
                      </label>
                      <NumericInput
                        value={sheet2Qty}
                        onChange={setSheet2Qty}
                        placeholder="e.g. 2000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Plant Reel Inventory & Paper Economics */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Plant Paper Rates & Available Reel Sizes
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Average Paper GSM</label>
                    <NumericInput
                      value={paperAvgGsm}
                      onChange={setPaperAvgGsm}
                      placeholder="140"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Paper Purchase Rate ({currency}/kg)</label>
                    <NumericInput
                      value={paperRatePerKg}
                      onChange={setPaperRatePerKg}
                      placeholder="38"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Available plant reel chips */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Available Plant Reel Sizes (Inches):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {availableReels.map((r) => (
                      <span
                        key={r}
                        className={`text-xs px-2 py-0.5 rounded-lg font-mono font-bold ${
                          deckleResult?.bestReel?.reelInch === r
                            ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                            : 'bg-slate-950 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {r}&quot;
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text" inputMode="decimal"
                      value={customReelInput}
                      onChange={(e) => setCustomReelInput(e.target.value)}
                      placeholder="Add custom reel (e.g. 55)"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white font-mono w-48"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomReel}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold px-3 py-1 rounded-xl"
                    >
                      + Add Reel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Deckle Optimization Results Card */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Optimal Corrugator Match
                  </span>
                  <span className="text-[10px] text-slate-400">Real-Time Analysis</span>
                </div>

                {deckleResult?.bestReel ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                      <span className="text-[11px] text-emerald-400 font-medium block">
                        Recommended Reel Size:
                      </span>
                      <span className="text-3xl font-black font-mono text-emerald-400 block my-1">
                        {deckleResult.bestReel.reelInch}&quot; Reel
                      </span>
                      <span className="text-[11px] text-slate-300">
                        ({(deckleResult.bestReel.reelMm).toFixed(0)} mm corrugator width)
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Total Cut Width:</span>
                        <span className="font-mono font-bold text-white">
                          {deckleResult.totalCutWidthInch.toFixed(2)}&quot; ({deckleResult.totalCutWidthMm.toFixed(0)} mm)
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Edge Trim Scrap:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {deckleResult.bestReel.trimScrapMm.toFixed(0)} mm ({deckleResult.bestReel.trimPercent.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Linear Paper Run:</span>
                        <span className="font-mono font-bold text-white">
                          {deckleResult.linearMeters.toFixed(0)} meters
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Total Paper Weight:</span>
                        <span className="font-mono font-bold text-white">
                          {deckleResult.totalPaperWeightKg.toFixed(1)} kg
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                        <span>Trim Scrap Cost:</span>
                        <span className="font-mono font-bold">
                          {currency}{deckleResult.scrapCost.toFixed(0)} ({deckleResult.scrapWeightKg.toFixed(1)} kg)
                        </span>
                      </div>
                    </div>

                    {/* Efficiency Gauge */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Deckle Utilization:</span>
                        <span className="font-bold text-emerald-400">
                          {(100 - deckleResult.bestReel.trimPercent).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, 100 - deckleResult.bestReel.trimPercent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Other alternative reels table */}
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Alternative In-Stock Options:
                      </span>
                      <div className="space-y-1">
                        {deckleResult.validReels.map((alt) => (
                          <div
                            key={alt.reelInch}
                            className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-950 border border-slate-800"
                          >
                            <span className="font-mono font-bold text-slate-300">{alt.reelInch}&quot; Reel</span>
                            <span className={`font-mono text-[10px] ${alt.trimPercent < 3 ? 'text-emerald-400' : 'text-slate-400'}`}>
                              Trim: {alt.trimScrapMm.toFixed(0)}mm ({alt.trimPercent.toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    No available reel is wide enough for {deckleResult?.totalCutWidthInch.toFixed(1)}&quot; cut width. Add a larger reel above.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: BOX COMPRESSION TEST (BCT) & STACKING LOAD PREDICTOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bct' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Box Dimensions & Load Specifications
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                    {(['mm', 'cm', 'inch'] as DimensionUnit[]).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setBctUnit(u)}
                        className={`px-2 py-0.5 rounded font-semibold ${
                          bctUnit === u ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Length ({bctUnit})
                    </label>
                    <NumericInput
                      value={boxLength}
                      onChange={setBoxLength}
                      placeholder="400"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Width ({bctUnit})
                    </label>
                    <NumericInput
                      value={boxWidth}
                      onChange={setBoxWidth}
                      placeholder="300"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Height ({bctUnit})
                    </label>
                    <NumericInput
                      value={boxHeight}
                      onChange={setBoxHeight}
                      placeholder="250"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Gross Weight Inside Each Box (kg) *
                    </label>
                    <NumericInput
                      value={boxGrossWeightKg}
                      onChange={setBoxGrossWeightKg}
                      placeholder="18"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Total contents + packaging weight</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Warehouse Stacking Height (Tiers high) *
                    </label>
                    <NumericInput
                      value={stackingTiers}
                      onChange={setStackingTiers}
                      placeholder="5"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">Number of boxes stacked vertically on pallet</span>
                  </div>
                </div>
              </div>

              {/* Environmental & Stacking Safety Factors */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Storage Environment & Pallet Pattern (ASTM / TAPPI Factors)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Warehouse Storage Atmosphere:
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'normal', label: 'Standard Air-conditioned (50% RH, 4.0x safety)' },
                        { id: 'humid', label: 'High Monsoon Humidity (80-90% RH, 5.5x safety)' },
                        { id: 'cold', label: 'Cold Storage / Chiller (Condensation, 6.0x safety)' },
                        { id: 'export', label: 'Export Ocean Container Transit (6.5x safety)' },
                      ].map((env) => (
                        <label
                          key={env.id}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                            safetyEnv === env.id
                              ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="safetyEnv"
                            checked={safetyEnv === env.id}
                            onChange={() => setSafetyEnv(env.id as any)}
                            className="text-amber-400"
                          />
                          <span>{env.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Pallet Stacking Arrangement:
                    </label>
                    <div className="space-y-1.5">
                      <label
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                          palletPattern === 'column'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="palletPattern"
                          checked={palletPattern === 'column'}
                          onChange={() => setPalletPattern('column')}
                          className="text-emerald-400"
                        />
                        <div>
                          <span className="block font-medium">Column Stack (Corners Aligned)</span>
                          <span className="text-[10px] text-slate-400">100% box strength retained</span>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                          palletPattern === 'interlocked'
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="palletPattern"
                          checked={palletPattern === 'interlocked'}
                          onChange={() => setPalletPattern('interlocked')}
                          className="text-rose-400"
                        />
                        <div>
                          <span className="block font-medium">Interlocked Brick Pattern</span>
                          <span className="text-[10px] text-slate-400">Warning: 45% strength lost due to misaligned corners!</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BCT Prediction Result Card */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    BCT Strength Calculation
                  </span>
                  <span className="text-[10px] text-slate-400">McKee Formula</span>
                </div>

                {bctResult ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-center">
                      <span className="text-[11px] text-amber-400 font-medium block">
                        Minimum Required Box BCT:
                      </span>
                      <span className="text-3xl font-black font-mono text-amber-400 block my-1">
                        {bctResult.requiredBctKgf} kgf
                      </span>
                      <span className="text-[11px] text-slate-300 font-mono">
                        ({bctResult.requiredBctNewtons.toLocaleString()} Newtons)
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Dead Load on Bottom Box:</span>
                        <span className="font-mono font-bold text-white">
                          {bctResult.deadLoadKgf} kg
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Combined Safety Factor:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {bctResult.totalSafetyFactor}×
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Required Edge Crush (ECT):</span>
                        <span className="font-mono font-bold text-emerald-400">
                          ≥ {bctResult.requiredEctKnm} kN/m
                        </span>
                      </div>

                      <div className="flex justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Est. Bursting Strength:</span>
                        <span className="font-mono font-bold text-white">
                          ≥ {bctResult.estimatedBurstStrength}
                        </span>
                      </div>
                    </div>

                    {/* Recommended Paper Board Combination */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        Recommended Board Composition:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {bctResult.recommendedPly}-Ply ({bctResult.recommendedFlute} Flute)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                        {bctResult.recommendedPaperCombo}
                      </p>
                    </div>

                    {onSendToCalculator && (
                      <button
                        type="button"
                        onClick={() => onSendToCalculator(boxLength, boxWidth, boxHeight)}
                        className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-amber-950"
                      >
                        <span>Calculate Cost for this Box Spec</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 bg-slate-950 rounded-xl">
                    Enter box dimensions and gross weight to calculate required compression strength.
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
