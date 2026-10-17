import React, { useState, useEffect } from 'react';
import {
  BoxDesign,
  BoxStyle,
  BoxColor,
  BoxArtwork,
  PlyCount,
  FluteType,
  DimensionUnit
} from '../../types';
import { getDesigns, saveDesigns } from '../../utils/storage';
import { convertToMm, convertFromMm } from '../../utils/calculator';
import { Box3DViewer } from '../3d/Box3DViewer';
import { DieLine2DViewer } from './DieLine2DViewer';
import { NumericInput } from '../common/NumericInput';
import {
  Box,
  Palette,
  Stamp,
  Sliders,
  BookmarkPlus,
  FolderOpen,
  Trash2,
  Check,
  Calculator,
  ArrowRight,
  Sparkles,
  Ruler,
  Compass,
  Eye
} from 'lucide-react';

interface BoxDesignerProps {
  initialDimensions?: { l: string; w: string; h: string; style: BoxStyle; unit?: DimensionUnit };
  onTransferToCalculator?: (l: string, w: string, h: string, style: BoxStyle, unit: DimensionUnit) => void;
}

export const BoxDesigner: React.FC<BoxDesignerProps> = ({
  initialDimensions,
  onTransferToCalculator,
}) => {
  // Design state
  const [designName, setDesignName] = useState('Standard RSC Box Design');
  const [dimensionUnit, setDimensionUnit] = useState<DimensionUnit>(
    initialDimensions?.unit || 'mm'
  );
  const [boxStyle, setBoxStyle] = useState<BoxStyle>(initialDimensions?.style || 'RSC_0201');
  const [length, setLength] = useState(initialDimensions?.l || (dimensionUnit === 'inch' ? '16' : dimensionUnit === 'cm' ? '40' : '400'));
  const [width, setWidth] = useState(initialDimensions?.w || (dimensionUnit === 'inch' ? '12' : dimensionUnit === 'cm' ? '30' : '300'));
  const [height, setHeight] = useState(initialDimensions?.h || (dimensionUnit === 'inch' ? '10' : dimensionUnit === 'cm' ? '25' : '250'));
  const [color, setColor] = useState<BoxColor>('kraft_natural');
  const [plyCount, setPlyCount] = useState<PlyCount>(3);
  const [fluteType, setFluteType] = useState<FluteType>('B');
  const [foldProgress, setFoldProgress] = useState(0.85); // mostly closed by default
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // Artwork state
  const [brandText, setBrandText] = useState('CARTONIQ LOGISTICS');
  const [brandColor, setBrandColor] = useState('#1e293b');
  const [showFragile, setShowFragile] = useState(true);
  const [showThisWayUp, setShowThisWayUp] = useState(true);
  const [showKeepDry, setShowKeepDry] = useState(true);
  const [showRecyclable, setShowRecyclable] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);

  // Saved designs library
  const [savedDesigns, setSavedDesigns] = useState<BoxDesign[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'dimensions' | 'materials' | 'artwork' | 'library'>('dimensions');

  useEffect(() => {
    setSavedDesigns(getDesigns());
  }, []);

  // Update initial dimensions if passed
  useEffect(() => {
    if (initialDimensions) {
      if (initialDimensions.l) setLength(initialDimensions.l);
      if (initialDimensions.w) setWidth(initialDimensions.w);
      if (initialDimensions.h) setHeight(initialDimensions.h);
      if (initialDimensions.style) setBoxStyle(initialDimensions.style);
      if (initialDimensions.unit) setDimensionUnit(initialDimensions.unit);
    }
  }, [initialDimensions]);

  const rawL = parseFloat(length) || 400;
  const rawW = parseFloat(width) || 300;
  const rawH = parseFloat(height) || 250;

  // Convert to millimeters for 3D engine
  const lMm = convertToMm(rawL, dimensionUnit);
  const wMm = convertToMm(rawW, dimensionUnit);
  const hMm = convertToMm(rawH, dimensionUnit);

  const displayDimensions =
    dimensionUnit === 'mm'
      ? `${rawL} × ${rawW} × ${rawH} mm (${(lMm / 25.4).toFixed(1)}" × ${(wMm / 25.4).toFixed(1)}" × ${(hMm / 25.4).toFixed(1)}")`
      : `${rawL} × ${rawW} × ${rawH} ${dimensionUnit} (${Math.round(lMm)} × ${Math.round(wMm)} × ${Math.round(hMm)} mm)`;

  const currentArtwork: BoxArtwork = {
    brandText,
    brandColor,
    showFragile,
    showThisWayUp,
    showKeepDry,
    showRecyclable,
    showBarcode,
  };

  const handleUnitSwitch = (newUnit: DimensionUnit) => {
    if (newUnit === dimensionUnit) return;
    const curL = parseFloat(length);
    const curW = parseFloat(width);
    const curH = parseFloat(height);

    if (!isNaN(curL) && !isNaN(curW) && !isNaN(curH) && curL > 0 && curW > 0 && curH > 0) {
      const curLMm = convertToMm(curL, dimensionUnit);
      const curWMm = convertToMm(curW, dimensionUnit);
      const curHMm = convertToMm(curH, dimensionUnit);

      setLength(convertFromMm(curLMm, newUnit).toString());
      setWidth(convertFromMm(curWMm, newUnit).toString());
      setHeight(convertFromMm(curHMm, newUnit).toString());
    }
    setDimensionUnit(newUnit);
  };

  const handleSaveDesign = () => {
    const newDesign: BoxDesign = {
      id: Date.now().toString(),
      name: designName.trim() || 'Corrugated Box Design',
      style: boxStyle,
      dimensions: {
        length,
        width,
        height,
        unit: dimensionUnit,
      },
      plyCount,
      fluteType,
      color,
      artwork: currentArtwork,
      foldProgress,
      notes: '',
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString(),
    };

    const updated = [newDesign, ...savedDesigns];
    saveDesigns(updated);
    setSavedDesigns(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLoadDesign = (d: BoxDesign) => {
    setDesignName(d.name);
    setBoxStyle(d.style);
    setLength(d.dimensions.length);
    setWidth(d.dimensions.width);
    setHeight(d.dimensions.height);
    setDimensionUnit(d.dimensions.unit || 'mm');
    setColor(d.color);
    setPlyCount(d.plyCount);
    setFluteType(d.fluteType);
    setFoldProgress(d.foldProgress);
    if (d.artwork) {
      setBrandText(d.artwork.brandText || '');
      setBrandColor(d.artwork.brandColor || '#1e293b');
      setShowFragile(!!d.artwork.showFragile);
      setShowThisWayUp(!!d.artwork.showThisWayUp);
      setShowKeepDry(!!d.artwork.showKeepDry);
      setShowRecyclable(!!d.artwork.showRecyclable);
      setShowBarcode(!!d.artwork.showBarcode);
    }
  };

  const handleDeleteDesign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedDesigns.filter(d => d.id !== id);
    saveDesigns(updated);
    setSavedDesigns(updated);
  };

  return (
    <div className="space-y-4">
      {/* View Mode Switcher: 3D Model vs 2D Die-Line Blueprint */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Realistic Model</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 py-1 px-3 rounded-lg font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>2D Die-Line Blueprint</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          Ratio: {(lMm / wMm).toFixed(1)} : 1 : {(hMm / wMm).toFixed(1)}
        </span>
      </div>

      {/* Viewport Render (3D or 2D) */}
      {viewMode === '3d' ? (
        <div className="space-y-2">
          <Box3DViewer
            lengthMm={lMm}
            widthMm={wMm}
            heightMm={hMm}
            displayDimensions={displayDimensions}
            color={color}
            artwork={currentArtwork}
            boxStyle={boxStyle}
            foldProgress={foldProgress}
            onFoldChange={setFoldProgress}
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Drag to orbit • Scroll / Pinch to zoom • Slider controls RSC flaps</span>
            <span className="font-mono text-amber-400">{displayDimensions}</span>
          </div>
        </div>
      ) : (
        <DieLine2DViewer
          lengthMm={lMm}
          widthMm={wMm}
          heightMm={hMm}
          unit={dimensionUnit}
          boxStyle={boxStyle}
        />
      )}

      {/* Design Actions Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Name your box design..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDesign}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-all"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
            <span>{saveSuccess ? 'Saved to Library!' : 'Save Design'}</span>
          </button>

          {onTransferToCalculator && (
            <button
              onClick={() => onTransferToCalculator(length, width, height, boxStyle, dimensionUnit)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg transition-all shadow-sm shadow-amber-950"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculate Costs</span>
            </button>
          )}
        </div>
      </div>

      {/* Designer Control Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('dimensions')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
            activeTab === 'dimensions'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dimensions & Unit
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
            activeTab === 'materials'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Cardboard Finish
        </button>
        <button
          onClick={() => setActiveTab('artwork')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all text-center ${
            activeTab === 'artwork'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Artwork & Stamps
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1 ${
            activeTab === 'library'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderOpen className="w-3 h-3" />
          <span>Library ({savedDesigns.length})</span>
        </button>
      </div>

      {/* TAB 1: DIMENSIONS & UNIT SELECTION */}
      {activeTab === 'dimensions' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Packaging Structure:</label>
              <select
                value={boxStyle}
                onChange={(e) => setBoxStyle(e.target.value as BoxStyle)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="RSC_0201">FEFCO 0201 - Regular Slotted Carton (RSC)</option>
                <option value="FOL">FEFCO 0203 - Full Overlap Slotted Carton (FOL)</option>
                <option value="DIE_CUT">Die-Cut Self-Locking Mailer</option>
                <option value="TRAY_LID">Tray & Separate Lid (Two-Piece)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Board Specification:</label>
              <div className="flex gap-2">
                <select
                  value={plyCount}
                  onChange={(e) => setPlyCount(Number(e.target.value) as PlyCount)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value={3}>3-Ply (Single Wall)</option>
                  <option value={5}>5-Ply (Double Wall)</option>
                  <option value={7}>7-Ply (Triple Wall Heavy Duty)</option>
                </select>
                <select
                  value={fluteType}
                  onChange={(e) => setFluteType(e.target.value as FluteType)}
                  className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="B">B-Flute</option>
                  <option value="C">C-Flute</option>
                  <option value="E">E-Flute</option>
                  <option value="BC">BC-Flute</option>
                </select>
              </div>
            </div>
          </div>

          {/* Unit selection toggle */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>Unit:</span>
            </span>
            <div className="flex items-center gap-1">
              {(['inch', 'cm', 'mm'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitSwitch(u)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase transition-all ${
                    dimensionUnit === u
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              Carton Size ({dimensionUnit.toUpperCase()})
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <NumericInput
                label="Length (L)"
                value={length}
                onChange={setLength}
                suffix={dimensionUnit}
                placeholder={dimensionUnit === 'inch' ? '16' : dimensionUnit === 'cm' ? '40' : '400'}
                helper={dimensionUnit !== 'mm' ? `≈ ${Math.round(lMm)} mm` : undefined}
              />
              <NumericInput
                label="Width (W)"
                value={width}
                onChange={setWidth}
                suffix={dimensionUnit}
                placeholder={dimensionUnit === 'inch' ? '12' : dimensionUnit === 'cm' ? '30' : '300'}
                helper={dimensionUnit !== 'mm' ? `≈ ${Math.round(wMm)} mm` : undefined}
              />
              <NumericInput
                label="Height (H)"
                value={height}
                onChange={setHeight}
                suffix={dimensionUnit}
                placeholder={dimensionUnit === 'inch' ? '10' : dimensionUnit === 'cm' ? '25' : '250'}
                helper={dimensionUnit !== 'mm' ? `≈ ${Math.round(hMm)} mm` : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CARDBOARD FINISH */}
      {activeTab === 'materials' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Outer Liner Cardboard Shade
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'kraft_natural', label: 'Natural Kraft', hex: '#bfa172', desc: 'Standard unbleached' },
              { id: 'kraft_golden', label: 'Golden Kraft', hex: '#cf9d56', desc: 'Premium virgin kraft' },
              { id: 'bleached_white', label: 'Bleached White', hex: '#e2e8f0', desc: 'High print contrast' },
              { id: 'duplex_white', label: 'Duplex Top', hex: '#f8fafc', desc: 'Smooth coated white' },
            ].map((shade) => (
              <button
                key={shade.id}
                onClick={() => setColor(shade.id as BoxColor)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  color === shade.id
                    ? 'border-amber-400 bg-slate-950 ring-1 ring-amber-400/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div
                  className="w-full h-8 rounded-lg mb-2 border border-black/20 shadow-inner"
                  style={{ backgroundColor: shade.hex }}
                />
                <span className="block text-xs font-semibold text-white">{shade.label}</span>
                <span className="block text-[10px] text-slate-400">{shade.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ARTWORK & STAMPS */}
      {activeTab === 'artwork' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Printed Brand / Company Text:
              </label>
              <input
                type="text"
                value={brandText}
                onChange={(e) => setBrandText(e.target.value)}
                placeholder="e.g. ACME CARGO • HANDLE WITH CARE"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Print Ink Color:</label>
              <div className="flex gap-2">
                {[
                  { hex: '#1e293b', label: 'Navy' },
                  { hex: '#0f172a', label: 'Black' },
                  { hex: '#b91c1c', label: 'Red' },
                  { hex: '#15803d', label: 'Green' },
                ].map((ink) => (
                  <button
                    key={ink.hex}
                    onClick={() => setBrandColor(ink.hex)}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-medium flex items-center justify-center gap-1 ${
                      brandColor === ink.hex
                        ? 'border-amber-400 bg-slate-950 text-white ring-1 ring-amber-400/40'
                        : 'border-slate-700 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ink.hex }} />
                    <span>{ink.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              International Packaging & Handling Symbols
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={showFragile}
                  onChange={(e) => setShowFragile(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                <span>Fragile (Wineglass)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={showThisWayUp}
                  onChange={(e) => setShowThisWayUp(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                <span>This Way Up (Arrows)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={showKeepDry}
                  onChange={(e) => setShowKeepDry(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                <span>Keep Dry (Umbrella)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={showRecyclable}
                  onChange={(e) => setShowRecyclable(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                <span>Recyclable Mobius</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={(e) => setShowBarcode(e.target.checked)}
                  className="rounded accent-amber-400"
                />
                <span>Barcode & QC Stamp</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SAVED DESIGNS LIBRARY */}
      {activeTab === 'library' && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Saved Design Library ({savedDesigns.length})
            </h3>
            <span className="text-[10px] text-slate-400">Preserved in safe namespaced storage</span>
          </div>

          {savedDesigns.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
              No custom designs saved yet. Configure your box above and click &quot;Save Design&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {savedDesigns.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleLoadDesign(d)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {d.name}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {d.dimensions.length} × {d.dimensions.width} × {d.dimensions.height} {d.dimensions.unit || 'mm'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteDesign(d.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete design"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                    <span>{d.style.replace('_', ' ')} • {d.plyCount}-Ply</span>
                    <span className="text-amber-400 font-semibold group-hover:underline">Load in 3D →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
