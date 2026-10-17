import React from 'react';
import { BoxStyle, DimensionUnit } from '../../types';
import { convertFromMm } from '../../utils/calculator';
import { Ruler, Scissors, Compass, Download } from 'lucide-react';

interface DieLine2DViewerProps {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  unit: DimensionUnit;
  boxStyle: BoxStyle;
  jointAllowanceMm?: number;
}

export const DieLine2DViewer: React.FC<DieLine2DViewerProps> = ({
  lengthMm,
  widthMm,
  heightMm,
  unit,
  boxStyle,
  jointAllowanceMm = 35,
}) => {
  // Convert mm values to user dimension unit for labels
  const formatUnit = (valMm: number) => {
    return `${convertFromMm(valMm, unit)} ${unit}`;
  };

  // Dimensions of the flat corrugated sheet (Blank Size)
  const flapHeightMm = widthMm / 2;
  const totalSheetWidthMm = heightMm + 2 * flapHeightMm;
  const totalSheetLengthMm = 2 * (lengthMm + widthMm) + jointAllowanceMm;

  // SVG viewport calculations
  // Scaled coordinates
  const scale = 500 / Math.max(totalSheetLengthMm, totalSheetWidthMm);
  const svgWidth = totalSheetLengthMm * scale + 60;
  const svgHeight = totalSheetWidthMm * scale + 60;

  const padX = 30;
  const padY = 30;

  // Panel widths
  const glueW = jointAllowanceMm * scale;
  const lW = lengthMm * scale;
  const wW = widthMm * scale;
  const hH = heightMm * scale;
  const flapH = flapHeightMm * scale;

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            2D CAD Die-Line & Creasing Blueprint
          </h3>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-white inline-block"></span> Solid: Cut Line
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 border-t border-dashed border-amber-400 inline-block"></span> Dashed: Crease / Score
          </span>
        </div>
      </div>

      {/* SVG Canvas for Flat Die-Line */}
      <div className="w-full overflow-x-auto bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center min-h-[300px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="max-h-[360px] w-auto text-xs"
          style={{ minWidth: '420px' }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

          {/* MAIN PANELS AND FLAPS (RSC_0201 Style) */}
          <g transform={`translate(${padX}, ${padY})`}>
            {/* Glue Flap */}
            <rect
              x={0}
              y={flapH}
              width={glueW}
              height={hH}
              fill="#d97706"
              fillOpacity="0.2"
              stroke="#fbbf24"
              strokeWidth="1.2"
            />
            <text
              x={glueW / 2}
              y={flapH + hH / 2}
              fill="#fbbf24"
              fontSize="8"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(-90, ${glueW / 2}, ${flapH + hH / 2})`}
            >
              Glue Flap ({jointAllowanceMm}mm)
            </text>

            {/* Panel 1: Length */}
            {/* Top Flap 1 */}
            <rect
              x={glueW}
              y={0}
              width={lW}
              height={flapH}
              fill="#334155"
              fillOpacity="0.4"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* Body Panel 1 */}
            <rect
              x={glueW}
              y={flapH}
              width={lW}
              height={hH}
              fill="#1e293b"
              fillOpacity="0.7"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <text x={glueW + lW / 2} y={flapH + hH / 2} fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
              Face L1 ({formatUnit(lengthMm)})
            </text>
            {/* Bottom Flap 1 */}
            <rect
              x={glueW}
              y={flapH + hH}
              width={lW}
              height={flapH}
              fill="#334155"
              fillOpacity="0.4"
              stroke="#ffffff"
              strokeWidth="1.2"
            />

            {/* Panel 2: Width */}
            {/* Top Flap 2 */}
            <rect
              x={glueW + lW}
              y={0}
              width={wW}
              height={flapH}
              fill="#334155"
              fillOpacity="0.3"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* Body Panel 2 */}
            <rect
              x={glueW + lW}
              y={flapH}
              width={wW}
              height={hH}
              fill="#1e293b"
              fillOpacity="0.7"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <text x={glueW + lW + wW / 2} y={flapH + hH / 2} fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
              Side W1 ({formatUnit(widthMm)})
            </text>
            {/* Bottom Flap 2 */}
            <rect
              x={glueW + lW}
              y={flapH + hH}
              width={wW}
              height={flapH}
              fill="#334155"
              fillOpacity="0.3"
              stroke="#ffffff"
              strokeWidth="1.2"
            />

            {/* Panel 3: Length */}
            {/* Top Flap 3 */}
            <rect
              x={glueW + lW + wW}
              y={0}
              width={lW}
              height={flapH}
              fill="#334155"
              fillOpacity="0.4"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* Body Panel 3 */}
            <rect
              x={glueW + lW + wW}
              y={flapH}
              width={lW}
              height={hH}
              fill="#1e293b"
              fillOpacity="0.7"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <text x={glueW + lW + wW + lW / 2} y={flapH + hH / 2} fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
              Face L2 ({formatUnit(lengthMm)})
            </text>
            {/* Bottom Flap 3 */}
            <rect
              x={glueW + lW + wW}
              y={flapH + hH}
              width={lW}
              height={flapH}
              fill="#334155"
              fillOpacity="0.4"
              stroke="#ffffff"
              strokeWidth="1.2"
            />

            {/* Panel 4: Width */}
            {/* Top Flap 4 */}
            <rect
              x={glueW + 2 * lW + wW}
              y={0}
              width={wW}
              height={flapH}
              fill="#334155"
              fillOpacity="0.3"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            {/* Body Panel 4 */}
            <rect
              x={glueW + 2 * lW + wW}
              y={flapH}
              width={wW}
              height={hH}
              fill="#1e293b"
              fillOpacity="0.7"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
            <text x={glueW + 2 * lW + wW + wW / 2} y={flapH + hH / 2} fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
              Side W2 ({formatUnit(widthMm)})
            </text>
            {/* Bottom Flap 4 */}
            <rect
              x={glueW + 2 * lW + wW}
              y={flapH + hH}
              width={wW}
              height={flapH}
              fill="#334155"
              fillOpacity="0.3"
              stroke="#ffffff"
              strokeWidth="1.2"
            />

            {/* HORIZONTAL SCORE / CREASE LINES (DASHED AMBER) */}
            <line
              x1={0}
              y1={flapH}
              x2={glueW + 2 * (lW + wW)}
              y2={flapH}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
            <line
              x1={0}
              y1={flapH + hH}
              x2={glueW + 2 * (lW + wW)}
              y2={flapH + hH}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4,3"
            />

            {/* VERTICAL SCORE / CREASE LINES */}
            <line
              x1={glueW}
              y1={flapH}
              x2={glueW}
              y2={flapH + hH}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
            <line
              x1={glueW + lW}
              y1={flapH}
              x2={glueW + lW}
              y2={flapH + hH}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
            <line
              x1={glueW + lW + wW}
              y1={flapH}
              x2={glueW + lW + wW}
              y2={flapH + hH}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
            <line
              x1={glueW + 2 * lW + wW}
              y1={flapH}
              x2={glueW + 2 * lW + wW}
              y2={flapH + hH}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="4,3"
            />
          </g>
        </svg>
      </div>

      {/* Sheet Blank Dimensions Spec */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Flat Blank Length:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {formatUnit(totalSheetLengthMm)}
          </span>
          <span className="text-[10px] text-slate-500 block">2(L+W) + Joint</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Flat Blank Width:</span>
          <span className="font-mono font-bold text-amber-400 text-sm">
            {formatUnit(totalSheetWidthMm)}
          </span>
          <span className="text-[10px] text-slate-500 block">Height + Width</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Top/Bottom Flap:</span>
          <span className="font-mono font-bold text-white text-sm">
            {formatUnit(flapHeightMm)}
          </span>
          <span className="text-[10px] text-slate-500 block">Width / 2</span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Stitching Glue Flap:</span>
          <span className="font-mono font-bold text-white text-sm">
            {formatUnit(jointAllowanceMm)}
          </span>
          <span className="text-[10px] text-slate-500 block">Standard 35mm</span>
        </div>
      </div>
    </div>
  );
};
