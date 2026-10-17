import { triggerPrint } from '../../utils/printHelper';
import React from 'react';
import { ProductionOrder, FactoryConfig } from '../../types';
import { Printer, X, FileText, CheckSquare, Layers, Scissors, Stamp, PackageCheck } from 'lucide-react';

interface JobCardModalProps {
  order: ProductionOrder;
  factoryConfig: FactoryConfig;
  onClose: () => void;
}

export const JobCardModal: React.FC<JobCardModalProps> = ({ order, factoryConfig, onClose }) => {
  const currency = factoryConfig.currencySymbol || '₹';
  const bundleSize = 25;
  const bundlesCount = Math.ceil(order.quantityOrdered / bundleSize);

  const handlePrint = () => {
    triggerPrint();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Shop-Floor Production Route Job Card</h3>
              <span className="text-[11px] text-slate-400">Order #{order.orderNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-amber-950"
            >
              <Printer className="w-4 h-4" />
              <span>Print Job Card</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-900 bg-white font-sans text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {factoryConfig.factoryName || 'CARTONIQ PACKAGING PLANT'}
              </h1>
              <p className="text-slate-600 text-[11px]">
                {factoryConfig.address || 'Industrial Area'} • Phone: {factoryConfig.phone || 'N/A'}
              </p>
              <span className="inline-block mt-1 bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                Corrugator & Converting Job Card
              </span>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-500 block">JOB TICKET NUMBER:</span>
              <span className="text-base font-black text-slate-900 block">JOB-{order.orderNumber}</span>
              <span className="text-[11px] text-slate-700 block mt-1">Issue Date: {order.orderDate}</span>
              <span className="text-[11px] font-bold text-rose-700 block">Target Dispatch: {order.targetDeliveryDate}</span>
            </div>
          </div>

          {/* Job Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-100 rounded-xl border border-slate-300 text-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Customer Name</span>
              <span className="font-bold text-slate-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Target Production Qty</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {order.quantityOrdered.toLocaleString()} PCS
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Box Style</span>
              <span className="font-semibold text-slate-900">{order.boxName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Est. Bundles</span>
              <span className="font-mono font-semibold text-slate-900">
                {bundlesCount} Bundles (@ {bundleSize} pcs)
              </span>
            </div>
          </div>

          {/* Detailed Box Dimensions & Construction */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">
              Box Specification & Construction Dimensions
            </span>
            <p className="font-mono text-sm font-bold text-slate-900">
              {order.dimensionsSummary}
            </p>
            {order.notes && (
              <p className="text-[11px] text-slate-600 italic">
                Operator Special Notes: {order.notes}
              </p>
            )}
          </div>

          {/* Machine Stations Sign-Off Checklist */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <div className="bg-slate-200 px-3 py-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Plant Department Sign-Off & Inspection Routing</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-300">
                  <th className="py-2 px-3">Process / Station</th>
                  <th className="py-2 px-3">Parameters & Machine Instructions</th>
                  <th className="py-2 px-3">Target Date</th>
                  <th className="py-2 px-3">Operator Initials</th>
                  <th className="py-2 px-3">QC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-sans text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                    <span>1. Corrugator Plant</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    Mount reels as per GSM specification. Check starch temperature & flute caliper.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{order.orderDate}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">__________</td>
                  <td className="py-2.5 px-3 font-bold text-slate-400">[ ] Passed</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-slate-600" />
                    <span>2. Flexo Printing</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    Verify ink viscosity, Pantone shades, stereo registration & barcode scannability.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{order.orderDate}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">__________</td>
                  <td className="py-2.5 px-3 font-bold text-slate-400">[ ] Passed</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-slate-600" />
                    <span>3. Rotary Slotter / Die-Cut</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    Check scoring depth to prevent paper crack. Verify slotting depth and flap gap.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">—</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">__________</td>
                  <td className="py-2.5 px-3 font-bold text-slate-400">[ ] Passed</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
                    <span>4. Stitching / Gluing</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    Pins pitch ~50mm, zinc wire, check flap alignment to avoid fishtailing.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">—</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">__________</td>
                  <td className="py-2.5 px-3 font-bold text-slate-400">[ ] Passed</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>5. Bundling & Palletizing</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    Pack in bundles of {bundleSize} pcs. Apply corner guards and stretch wrap.
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{order.targetDeliveryDate}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">__________</td>
                  <td className="py-2.5 px-3 font-bold text-slate-400">[ ] Passed</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Plant Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300 text-[10px] text-slate-600">
            <div>
              <span className="block font-bold uppercase text-slate-900">Plant Supervisor</span>
              <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
              <span className="block mt-1">Signature & Date</span>
            </div>
            <div>
              <span className="block font-bold uppercase text-slate-900">Quality Assurance Officer</span>
              <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
              <span className="block mt-1">Signature & Date</span>
            </div>
            <div>
              <span className="block font-bold uppercase text-slate-900">Dispatch Manager</span>
              <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
              <span className="block mt-1">Signature & Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
