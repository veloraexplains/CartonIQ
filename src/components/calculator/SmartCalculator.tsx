import React, { useState, useEffect } from 'react';
import {
  BoxStyle,
  FluteType,
  PlyCount,
  DimensionUnit,
  CalculationInput,
  CalculationOutput,
  PlyLayer,
  FactoryConfig
} from '../../types';
import {
  calculateBoxManufacturing,
  getDefaultPlies,
  convertToMm,
  convertFromMm
} from '../../utils/calculator';
import { NumericInput } from '../common/NumericInput';
import {
  Calculator,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
  RotateCcw,
  Check,
  Ruler
} from 'lucide-react';

interface SmartCalculatorProps {
  factoryConfig: FactoryConfig;
  onTransferToQuotation?: (spec: {
    name: string;
    style: BoxStyle;
    l: number;
    w: number;
    h: number;
    dimensionsDisplay: string;
    ply: PlyCount;
    flute: FluteType;
    unitPrice: number;
    customQty?: number;
    weightGrams: number;
    quantities: { qty: number; unitPrice: number; totalPrice: number }[];
  }) => void;
  onOpenDesigner?: (l: string, w: string, h: string, style: BoxStyle, unit: DimensionUnit) => void;
}

export const SmartCalculator: React.FC<SmartCalculatorProps> = ({
  factoryConfig,
  onTransferToQuotation,
  onOpenDesigner,
}) => {
  // Dimensions state - strictly stored as string to avoid 0-locking
  const [boxName, setBoxName] = useState('Master Shipping Carton');
  const [dimensionUnit, setDimensionUnit] = useState<DimensionUnit>(
    factoryConfig.defaultDimensionUnit || 'mm'
  );

  // Initial dimensions based on unit
  const [length, setLength] = useState(dimensionUnit === 'inch' ? '14' : dimensionUnit === 'cm' ? '35' : '350');
  const [width, setWidth] = useState(dimensionUnit === 'inch' ? '10' : dimensionUnit === 'cm' ? '25' : '250');
  const [height, setHeight] = useState(dimensionUnit === 'inch' ? '8' : dimensionUnit === 'cm' ? '20' : '200');

  const [boxStyle, setBoxStyle] = useState<BoxStyle>('RSC_0201');
  const [plyCount, setPlyCount] = useState<PlyCount>(3);
  const [fluteType, setFluteType] = useState<FluteType>('B');

  // Manufacturing allowances & rates (using Rupee ₹ defaults from factoryConfig)
  const [jointAllowanceMm, setJointAllowanceMm] = useState(factoryConfig.defaultJointAllowanceMm);
  const [creaseAllowanceMm, setCreaseAllowanceMm] = useState(factoryConfig.defaultCreaseAllowanceMm);
  const [wastagePercent, setWastagePercent] = useState(factoryConfig.defaultWastagePercent);
  const [corrugationRate, setCorrugationRate] = useState(factoryConfig.defaultCorrugationRatePerKg);
  const [printingRate, setPrintingRate] = useState(factoryConfig.defaultPrintingRatePerBox);
  const [stitchingRate, setStitchingRate] = useState(factoryConfig.defaultStitchingRatePerBox);
  const [packingRate, setPackingRate] = useState(factoryConfig.defaultPackingRatePerBox);
  const [overheadPercent, setOverheadPercent] = useState(factoryConfig.defaultOverheadPercent);
  const [profitMargin, setProfitMargin] = useState(factoryConfig.defaultProfitMarginPercent);
  const [taxPercent, setTaxPercent] = useState(factoryConfig.defaultTaxPercent);

  // Paper Plies
  const [plies, setPlies] = useState<PlyLayer[]>(() =>
    getDefaultPlies(3, 'B', factoryConfig.fluteTakeUp, factoryConfig.currencySymbol)
  );

  // Calculation Result & Error State
  const [calcResult, setCalcResult] = useState<CalculationOutput | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dimensions' | 'plies' | 'costs'>('dimensions');

  // Custom Quantity & Custom Rate Quoter state
  const [customQuantity, setCustomQuantity] = useState('1200');
  const [customRateOverride, setCustomRateOverride] = useState('');

  // When unit is switched, convert existing numbers smoothly
  const handleUnitSwitch = (newUnit: DimensionUnit) => {
    if (newUnit === dimensionUnit) return;

    const curL = parseFloat(length);
    const curW = parseFloat(width);
    const curH = parseFloat(height);

    if (!isNaN(curL) && !isNaN(curW) && !isNaN(curH) && curL > 0 && curW > 0 && curH > 0) {
      const lMm = convertToMm(curL, dimensionUnit);
      const wMm = convertToMm(curW, dimensionUnit);
      const hMm = convertToMm(curH, dimensionUnit);

      setLength(convertFromMm(lMm, newUnit).toString());
      setWidth(convertFromMm(wMm, newUnit).toString());
      setHeight(convertFromMm(hMm, newUnit).toString());
    } else {
      // Default presets for the unit
      if (newUnit === 'inch') {
        setLength('14');
        setWidth('10');
        setHeight('8');
      } else if (newUnit === 'cm') {
        setLength('35');
        setWidth('25');
        setHeight('20');
      } else {
        setLength('350');
        setWidth('250');
        setHeight('200');
      }
    }

    setDimensionUnit(newUnit);
  };

  // When plyCount or fluteType changes, re-initialize plies
  const handlePlyChange = (newPly: PlyCount) => {
    setPlyCount(newPly);
    setPlies(getDefaultPlies(newPly, fluteType, factoryConfig.fluteTakeUp, factoryConfig.currencySymbol));
  };

  const handleFluteChange = (newFlute: FluteType) => {
    setFluteType(newFlute);
    setPlies(getDefaultPlies(plyCount, newFlute, factoryConfig.fluteTakeUp, factoryConfig.currencySymbol));
  };

  // Perform Calculation with strict validation
  const runCalculation = () => {
    setCalcError(null);

    const l = parseFloat(length);
    const w = parseFloat(width);
    const h = parseFloat(height);

    if (isNaN(l) || l <= 0 || isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      setCalcError('Please enter valid positive numbers for Length, Width, and Height.');
      setCalcResult(null);
      return;
    }

    // Validate plies
    for (let i = 0; i < plies.length; i++) {
      const gsm = parseFloat(plies[i].gsm);
      const rate = parseFloat(plies[i].ratePerKg);
      if (isNaN(gsm) || gsm <= 0) {
        setCalcError(`Please enter a valid GSM for ${plies[i].name}`);
        setCalcResult(null);
        return;
      }
      if (isNaN(rate) || rate <= 0) {
        setCalcError(`Please enter a valid paper rate for ${plies[i].name}`);
        setCalcResult(null);
        return;
      }
    }

    const inputData: CalculationInput = {
      dimensions: {
        length,
        width,
        height,
        unit: dimensionUnit,
      },
      boxStyle,
      plyCount,
      fluteType,
      plies,
      jointAllowanceMm,
      creaseAllowanceMm,
      wastagePercent,
      corrugationRatePerKg: corrugationRate,
      printingRatePerBox: printingRate,
      stitchingRatePerBox: stitchingRate,
      packingRatePerBox: packingRate,
      overheadPercent,
      profitMarginPercent: profitMargin,
      taxPercent,
      targetQuantities: ['500', '1000', '2500', '5000', '10000'],
    };

    const res = calculateBoxManufacturing(inputData);
    if (!res) {
      setCalcError('Unable to calculate. Please check all numeric fields.');
      setCalcResult(null);
    } else {
      setCalcResult(res);
    }
  };

  useEffect(() => {
    runCalculation();
  }, [
    length,
    width,
    height,
    dimensionUnit,
    boxStyle,
    plyCount,
    fluteType,
    plies,
    jointAllowanceMm,
    creaseAllowanceMm,
    wastagePercent,
    corrugationRate,
    printingRate,
    stitchingRate,
    packingRate,
    overheadPercent,
    profitMargin,
    taxPercent,
  ]);

  const updatePly = (index: number, field: 'gsm' | 'ratePerKg', val: string) => {
    const updated = [...plies];
    updated[index] = { ...updated[index], [field]: val };
    setPlies(updated);
  };

  const currency = factoryConfig.currencySymbol || '₹';

  // Preview converted mm
  const previewL = parseFloat(length) || 0;
  const previewW = parseFloat(width) || 0;
  const previewH = parseFloat(height) || 0;
  const convertedLMm = Math.round(convertToMm(previewL, dimensionUnit));
  const convertedWMm = Math.round(convertToMm(previewW, dimensionUnit));
  const convertedHMm = Math.round(convertToMm(previewH, dimensionUnit));

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Calculator className="w-4 h-4" />
            <span>Industrial Packaging Calculator</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            FEFCO standard box blanks, customizable size units (inch / cm / mm), and accurate paper costing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDesigner && (
            <button
              onClick={() => onOpenDesigner(length, width, height, boxStyle, dimensionUnit)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-amber-400 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <span>View in 3D</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {calcResult && onTransferToQuotation && (
            <button
              onClick={() => {
                onTransferToQuotation({
                  name: boxName || 'Custom Box',
                  style: boxStyle,
                  l: calcResult.dimensionsInMm.l,
                  w: calcResult.dimensionsInMm.w,
                  h: calcResult.dimensionsInMm.h,
                  dimensionsDisplay: calcResult.originalDimensionsDisplay,
                  ply: plyCount,
                  flute: fluteType,
                  unitPrice: calcResult.suggestedSellingPricePerBox,
                  weightGrams: calcResult.boxWeightGrams,
                  quantities: calcResult.quantityTiers.map((t) => ({
                    qty: t.quantity,
                    unitPrice: t.unitPrice,
                    totalPrice: t.totalAmount,
                  })),
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-950"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Create Quote</span>
            </button>
          )}
        </div>
      </div>

      {/* Calculator Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('dimensions')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all text-center ${
            activeTab === 'dimensions'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Box Specs & Size
        </button>
        <button
          onClick={() => setActiveTab('plies')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all text-center ${
            activeTab === 'plies'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Paper Plies & Rates
        </button>
        <button
          onClick={() => setActiveTab('costs')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all text-center ${
            activeTab === 'costs'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Factory Rates & Margin
        </button>
      </div>

      {/* TAB 1: BOX SPECS & CUSTOM DIMENSIONS (INCH, CM, MM) */}
      {activeTab === 'dimensions' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Carton Name / SKU Code:</label>
              <input
                type="text"
                value={boxName}
                onChange={(e) => setBoxName(e.target.value)}
                placeholder="e.g. Master Carton 350x250x200"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Packaging Style:</label>
              <select
                value={boxStyle}
                onChange={(e) => setBoxStyle(e.target.value as BoxStyle)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="RSC_0201">FEFCO 0201 - Regular Slotted Carton (RSC)</option>
                <option value="FOL">FEFCO 0203 - Full Overlap Slotted Carton (FOL)</option>
                <option value="DIE_CUT">Die-Cut Self-Locking Mailer</option>
                <option value="TRAY_LID">Tray & Lid (Two Piece)</option>
              </select>
            </div>
          </div>

          {/* Unit Selector Toggle Bar */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                <Ruler className="w-4 h-4 text-amber-400" />
                <span>Dimension Unit Selection:</span>
              </div>

              {/* Unit Buttons */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 self-start sm:self-auto">
                {(['inch', 'cm', 'mm'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleUnitSwitch(u)}
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${
                      dimensionUnit === u
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {u === 'inch' ? 'Inches (")' : u === 'cm' ? 'Centimeters (cm)' : 'Millimeters (mm)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Live conversion indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>
                Active: <strong className="text-amber-400 uppercase">{dimensionUnit}</strong>
                {dimensionUnit !== 'mm' && (
                  <span className="ml-2 text-slate-300">
                    ≈ {convertedLMm} × {convertedWMm} × {convertedHMm} mm
                  </span>
                )}
              </span>
              <span className="text-slate-500">1 inch = 25.4 mm • 1 cm = 10 mm</span>
            </div>
          </div>

          {/* Dimensions Inputs - String Backed */}
          <div className="grid grid-cols-3 gap-2.5">
            <NumericInput
              id="calc-length"
              label={`Length (L)`}
              value={length}
              onChange={setLength}
              suffix={dimensionUnit}
              placeholder={dimensionUnit === 'inch' ? '14' : dimensionUnit === 'cm' ? '35' : '350'}
              helper={dimensionUnit !== 'mm' ? `≈ ${convertedLMm} mm` : undefined}
            />
            <NumericInput
              id="calc-width"
              label={`Width (W)`}
              value={width}
              onChange={setWidth}
              suffix={dimensionUnit}
              placeholder={dimensionUnit === 'inch' ? '10' : dimensionUnit === 'cm' ? '25' : '250'}
              helper={dimensionUnit !== 'mm' ? `≈ ${convertedWMm} mm` : undefined}
            />
            <NumericInput
              id="calc-height"
              label={`Height (H)`}
              value={height}
              onChange={setHeight}
              suffix={dimensionUnit}
              placeholder={dimensionUnit === 'inch' ? '8' : dimensionUnit === 'cm' ? '20' : '200'}
              helper={dimensionUnit !== 'mm' ? `≈ ${convertedHMm} mm` : undefined}
            />
          </div>

          {/* Board Structure Selection */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Board Ply Count:</label>
              <div className="grid grid-cols-3 gap-2">
                {([3, 5, 7] as const).map((ply) => (
                  <button
                    key={ply}
                    type="button"
                    onClick={() => handlePlyChange(ply)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                      plyCount === ply
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {ply}-Ply
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Flute Profile:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['B', 'C', 'E', 'BC'] as const).map((flute) => (
                  <button
                    key={flute}
                    type="button"
                    onClick={() => handleFluteChange(flute)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                      fluteType === flute
                        ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {flute}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAPER PLIES & GSM CONFIGURATION */}
      {activeTab === 'plies' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Paper Layers ({plyCount}-Ply Board)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              Draw Take-up: B = {factoryConfig.fluteTakeUp.B}x, C = {factoryConfig.fluteTakeUp.C}x
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {plies.map((ply, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
              >
                <div className="sm:col-span-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-bold text-amber-400 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-white">{ply.name}</span>
                    <span className="block text-[10px] text-slate-400 capitalize">
                      {ply.type === 'flute' ? `Fluting (${ply.fluteTakeUp}x take-up)` : 'Solid Liner'}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <NumericInput
                    label="GSM"
                    value={ply.gsm}
                    onChange={(val) => updatePly(idx, 'gsm', val)}
                    suffix="GSM"
                    placeholder="140"
                  />
                </div>

                <div className="sm:col-span-4">
                  <NumericInput
                    label="Paper Rate"
                    value={ply.ratePerKg}
                    onChange={(val) => updatePly(idx, 'ratePerKg', val)}
                    prefix={currency}
                    suffix="/kg"
                    placeholder="42.00"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FACTORY RATES & MARGINS */}
      {activeTab === 'costs' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Manufacturing Allowances & Conversions
            </h3>
            <span className="text-[10px] text-amber-400">Configured in {currency}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <NumericInput
              label="Joint Allowance"
              value={jointAllowanceMm}
              onChange={setJointAllowanceMm}
              suffix="mm"
              placeholder="35"
              helper="Stitch/glue flap"
            />
            <NumericInput
              label="Crease Allowance"
              value={creaseAllowanceMm}
              onChange={setCreaseAllowanceMm}
              suffix="mm"
              placeholder="5"
            />
            <NumericInput
              label="Sheet Wastage"
              value={wastagePercent}
              onChange={setWastagePercent}
              suffix="%"
              placeholder="4"
              helper="Edge trimming"
            />
            <NumericInput
              label="Corrugation Cost"
              value={corrugationRate}
              onChange={setCorrugationRate}
              prefix={currency}
              suffix="/kg"
              placeholder="6.50"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <NumericInput
              label="Printing Rate"
              value={printingRate}
              onChange={setPrintingRate}
              prefix={currency}
              suffix="/box"
              placeholder="1.20"
            />
            <NumericInput
              label="Stitching / Gluing"
              value={stitchingRate}
              onChange={setStitchingRate}
              prefix={currency}
              suffix="/box"
              placeholder="0.80"
            />
            <NumericInput
              label="Factory Overheads"
              value={overheadPercent}
              onChange={setOverheadPercent}
              suffix="%"
              placeholder="8"
            />
            <NumericInput
              label="Target Profit"
              value={profitMargin}
              onChange={setProfitMargin}
              suffix="%"
              placeholder="15"
            />
          </div>

          <div className="pt-1">
            <NumericInput
              label={`Tax Rate (${factoryConfig.taxLabel})`}
              value={taxPercent}
              onChange={setTaxPercent}
              suffix="%"
              placeholder="18"
            />
          </div>
        </div>
      )}

      {/* Validation Error Message */}
      {calcError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{calcError}</span>
        </div>
      )}

      {/* CALCULATION RESULTS PANEL */}
      {calcResult && (
        <div className="space-y-3">
          {/* Main Key Figures Highlight */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
              <span className="text-[10px] font-medium text-slate-400 block">Selling Price / Box</span>
              <div className="text-lg font-extrabold text-amber-400 mt-0.5 font-mono">
                {currency}{calcResult.suggestedSellingPricePerBox}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                + Tax ({taxPercent}%): {currency}{calcResult.sellingPriceWithTax}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
              <span className="text-[10px] font-medium text-slate-400 block">Factory Cost / Box</span>
              <div className="text-lg font-bold text-white mt-0.5 font-mono">
                {currency}{calcResult.totalManufacturingCostPerBox}
              </div>
              <span className="text-[10px] text-emerald-400 block mt-0.5">
                Profit: +{currency}{calcResult.profitPerBox} ({profitMargin}%)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
              <span className="text-[10px] font-medium text-slate-400 block">Net Box Weight</span>
              <div className="text-lg font-bold text-white mt-0.5 font-mono">
                {calcResult.boxWeightGrams} <span className="text-xs text-slate-400 font-normal">grams</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {calcResult.totalGsmCalculated} Total Board GSM
              </span>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800">
              <span className="text-[10px] font-medium text-slate-400 block">Sheet Dimensions</span>
              <div className="text-xs font-bold text-white mt-1 font-mono">
                {calcResult.sheetCutLengthMm} × {calcResult.sheetDeckleMm} mm
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Area: {calcResult.sheetAreaSqm} m²
              </span>
            </div>
          </div>

          {/* Detailed Cost & Engineering Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Manufacturing Cost Split */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Cost Breakdown Per Box ({currency})
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Paper Raw Material (with {wastagePercent}% wastage):</span>
                  <span className="font-mono text-white">{currency}{calcResult.paperCostPerBox}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Corrugation Conversion:</span>
                  <span className="font-mono text-white">{currency}{calcResult.conversionCostPerBox}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Flexo Printing:</span>
                  <span className="font-mono text-white">{currency}{calcResult.printingCostPerBox}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Finishing (Stitch/Glue + Pack):</span>
                  <span className="font-mono text-white">{currency}{calcResult.finishingCostPerBox}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Factory Overheads ({overheadPercent}%):</span>
                  <span className="font-mono text-white">{currency}{calcResult.overheadCostPerBox}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-amber-400">
                  <span>Total Factory Cost:</span>
                  <span className="font-mono">{currency}{calcResult.totalManufacturingCostPerBox}</span>
                </div>
              </div>
            </div>

            {/* Quality & Strength Estimation */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Engineering Specifications & Size
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Input Size:</span>
                  <span className="font-mono font-semibold text-amber-400">
                    {calcResult.originalDimensionsDisplay}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Est. Bursting Strength:</span>
                  <span className="font-mono font-semibold text-white">
                    {calcResult.estimatedBurstingStrength} kg/cm²
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Est. Edge Crush Test (ECT):</span>
                  <span className="font-mono font-semibold text-white">
                    {calcResult.estimatedECT} kN/m
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Paper Deckle Width Needed:</span>
                  <span className="font-mono font-semibold text-white">
                    {calcResult.sheetDeckleMm} mm
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Sheet Cut Length:</span>
                  <span className="font-mono font-semibold text-white">
                    {calcResult.sheetCutLengthMm} mm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Order Quantity & Pricing Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Custom Order Quantity & Pricing</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  Calculate and quote any exact box batch (e.g. 750, 1,250, 3,400 pcs) without forced preset tiers.
                </p>
              </div>

              {onTransferToQuotation && (
                <button
                  type="button"
                  onClick={() => {
                    const customQ = parseInt(customQuantity, 10) || 1000;
                    let discount = 0;
                    if (customQ >= 10000) discount = 0.12;
                    else if (customQ >= 5000) discount = 0.09;
                    else if (customQ >= 2500) discount = 0.06;
                    else if (customQ >= 1000) discount = 0.03;

                    const calculatedCustomUnit = Number((calcResult.suggestedSellingPricePerBox * (1 - discount)).toFixed(2));
                    const finalUnit = parseFloat(customRateOverride) || calculatedCustomUnit;
                    const finalTotal = Number((finalUnit * customQ).toFixed(2));

                    onTransferToQuotation({
                      name: boxName || 'Custom Box',
                      style: boxStyle,
                      l: calcResult.dimensionsInMm.l,
                      w: calcResult.dimensionsInMm.w,
                      h: calcResult.dimensionsInMm.h,
                      dimensionsDisplay: calcResult.originalDimensionsDisplay,
                      ply: plyCount,
                      flute: fluteType,
                      unitPrice: finalUnit,
                      customQty: customQ,
                      weightGrams: calcResult.boxWeightGrams,
                      quantities: [
                        { qty: customQ, unitPrice: finalUnit, totalPrice: finalTotal },
                        ...calcResult.quantityTiers.map((t) => ({
                          qty: t.quantity,
                          unitPrice: t.unitPrice,
                          totalPrice: t.totalAmount,
                        })),
                      ],
                    });
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-amber-950 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Quote {parseInt(customQuantity, 10) || 1000} Custom Boxes</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <NumericInput
                label="Custom Batch Quantity (Units)"
                value={customQuantity}
                onChange={setCustomQuantity}
                suffix="pcs"
                placeholder="1250"
                helper="Any custom count"
              />

              <NumericInput
                label="Custom Unit Rate Override (Optional)"
                value={customRateOverride}
                onChange={setCustomRateOverride}
                prefix={currency}
                suffix="/box"
                placeholder={(() => {
                  const q = parseInt(customQuantity, 10) || 1000;
                  let d = 0;
                  if (q >= 10000) d = 0.12;
                  else if (q >= 5000) d = 0.09;
                  else if (q >= 2500) d = 0.06;
                  else if (q >= 1000) d = 0.03;
                  return (calcResult.suggestedSellingPricePerBox * (1 - d)).toFixed(2);
                })()}
                helper="Leave blank to use calculated rate"
              />

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-center font-mono">
                <span className="text-[10px] text-slate-400">Total Custom Amount:</span>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {currency}
                  {(() => {
                    const q = parseInt(customQuantity, 10) || 1000;
                    let d = 0;
                    if (q >= 10000) d = 0.12;
                    else if (q >= 5000) d = 0.09;
                    else if (q >= 2500) d = 0.06;
                    else if (q >= 1000) d = 0.03;
                    const calculatedUnit = Number((calcResult.suggestedSellingPricePerBox * (1 - d)).toFixed(2));
                    const unit = parseFloat(customRateOverride) || calculatedUnit;
                    return (unit * q).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  })()}
                </div>
                <span className="text-[10px] text-slate-500">
                  Rate: {currency}
                  {(() => {
                    const q = parseInt(customQuantity, 10) || 1000;
                    let d = 0;
                    if (q >= 10000) d = 0.12;
                    else if (q >= 5000) d = 0.09;
                    else if (q >= 2500) d = 0.06;
                    else if (q >= 1000) d = 0.03;
                    const calculatedUnit = Number((calcResult.suggestedSellingPricePerBox * (1 - d)).toFixed(2));
                    return (parseFloat(customRateOverride) || calculatedUnit).toFixed(2);
                  })()}/box
                </span>
              </div>
            </div>
          </div>

          {/* Volume Quantity Tier Pricing Table */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Volume Discount Slab Schedule
              </span>
              <span className="text-[10px] text-slate-400">Bulk efficiency discount schedule</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-1.5 px-2">Order Quantity</th>
                    <th className="py-1.5 px-2">Discount</th>
                    <th className="py-1.5 px-2">Unit Price</th>
                    <th className="py-1.5 px-2">Total Amount</th>
                    <th className="py-1.5 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {calcResult.quantityTiers.map((tier) => (
                    <tr key={tier.quantity} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2 px-2 text-white font-semibold">{tier.quantity.toLocaleString()} pcs</td>
                      <td className="py-2 px-2 text-emerald-400">
                        {tier.discountPercent > 0 ? `-${tier.discountPercent}%` : 'Base'}
                      </td>
                      <td className="py-2 px-2 text-amber-400 font-bold">{currency}{tier.unitPrice}</td>
                      <td className="py-2 px-2 text-white">{currency}{tier.totalAmount.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right">
                        {onTransferToQuotation && (
                          <button
                            onClick={() => {
                              onTransferToQuotation({
                                name: boxName || 'Custom Box',
                                style: boxStyle,
                                l: calcResult.dimensionsInMm.l,
                                w: calcResult.dimensionsInMm.w,
                                h: calcResult.dimensionsInMm.h,
                                dimensionsDisplay: calcResult.originalDimensionsDisplay,
                                ply: plyCount,
                                flute: fluteType,
                                unitPrice: tier.unitPrice,
                                weightGrams: calcResult.boxWeightGrams,
                                quantities: [{ qty: tier.quantity, unitPrice: tier.unitPrice, totalPrice: tier.totalAmount }],
                              });
                            }}
                            className="text-[10px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700"
                          >
                            Quote {tier.quantity}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
