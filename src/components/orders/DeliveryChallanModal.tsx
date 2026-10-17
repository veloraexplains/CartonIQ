import { triggerPrint } from '../../utils/printHelper';
import React, { useState } from 'react';
import { ProductionOrder, FactoryConfig } from '../../types';
import { Printer, X, Truck, Send, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';

interface DeliveryChallanModalProps {
  order: ProductionOrder;
  factoryConfig: FactoryConfig;
  onClose: () => void;
}

export const DeliveryChallanModal: React.FC<DeliveryChallanModalProps> = ({
  order,
  factoryConfig,
  onClose,
}) => {
  const currency = factoryConfig.currencySymbol || '₹';
  const today = new Date().toLocaleDateString();
  const challanNo = `DC-${new Date().getFullYear()}-${order.orderNumber.replace(/\D/g, '').slice(-4) || '1021'}`;

  // Delivery details state
  const [vehicleNumber, setVehicleNumber] = useState('MH-04-AZ-8921');
  const [transporterName, setTransporterName] = useState('Speed Cargo Logistics');
  const [driverName, setDriverName] = useState('Rajesh Kumar');
  const [driverPhone, setDriverPhone] = useState('9876543210');
  const [dispatchBundles, setDispatchBundles] = useState(String(Math.ceil(order.quantityOrdered / 25)));
  const [deliveryAddress, setDeliveryAddress] = useState(order.customerName + ' Warehouse, Sector 12');

  const handlePrint = () => {
    triggerPrint();
  };

  // WhatsApp formatted dispatch message
  const handleShareWhatsApp = () => {
    const text = `📦 *DELIVERY CHALLAN & DISPATCH ADVICE*
*${factoryConfig.factoryName || 'CartonIQ Packaging'}*

📄 *Challan No:* ${challanNo}
📅 *Dispatch Date:* ${today}
🏢 *Customer:* ${order.customerName}

📦 *Items Dispatched:*
• Box: ${order.boxName}
• Qty: ${order.quantityOrdered.toLocaleString()} Boxes (${dispatchBundles} Bundles)
• Size & Board: ${order.dimensionsSummary}

🚚 *Logistics Details:*
• Transporter: ${transporterName}
• Vehicle No: ${vehicleNumber}
• Driver: ${driverName} (${driverPhone})
• Destination: ${deliveryAddress}

Thank you for your business! Please inspect goods upon arrival.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 text-white">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">Delivery Challan & Gate Pass</h3>
              <span className="text-[11px] text-slate-400">Order #{order.orderNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-950"
              title="Share delivery note via WhatsApp"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp Dispatch</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-all border border-slate-700"
            >
              <Printer className="w-4 h-4" />
              <span>Print DC</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dispatch Controls (vehicle, driver) */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Vehicle Number</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Transporter Name</label>
            <input
              type="text"
              value={transporterName}
              onChange={(e) => setTransporterName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Driver Name & Phone</label>
            <input
              type="text"
              value={`${driverName} - ${driverPhone}`}
              onChange={(e) => {
                const parts = e.target.value.split('-');
                setDriverName(parts[0]?.trim() || '');
                if (parts[1]) setDriverPhone(parts[1]?.trim());
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Bundle Count</label>
            <input
              type="text"
              value={dispatchBundles}
              onChange={(e) => setDispatchBundles(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-mono"
            />
          </div>
        </div>

        {/* Printable Delivery Challan Document */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-900 bg-white font-sans text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {factoryConfig.factoryName || 'CARTONIQ PACKAGING PLANT'}
              </h1>
              <p className="text-slate-600 text-[11px]">
                {factoryConfig.address || 'Industrial Park'}
              </p>
              <p className="text-slate-600 text-[11px]">
                GSTIN: <strong className="font-mono">{factoryConfig.gstin || '27AABCU9603R1ZM'}</strong> • Phone: {factoryConfig.phone || 'N/A'}
              </p>
              <span className="inline-block mt-1 bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                Official Delivery Challan & Gate Pass
              </span>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-500 block">CHALLAN NUMBER:</span>
              <span className="text-base font-black text-slate-900 block">{challanNo}</span>
              <span className="text-[11px] text-slate-700 block mt-1">Date: {today}</span>
              <span className="text-[11px] font-bold text-slate-800 block">Order Ref: #{order.orderNumber}</span>
            </div>
          </div>

          {/* Consignee & Vehicle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-100 rounded-xl border border-slate-300">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Consignee (Deliver To):</span>
              <span className="font-bold text-slate-900 block text-sm">{order.customerName}</span>
              <span className="text-slate-600 block">{deliveryAddress}</span>
            </div>

            <div className="space-y-0.5 text-slate-700">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Transport Details:</span>
              <p>Vehicle Number: <strong className="font-mono text-slate-900">{vehicleNumber}</strong></p>
              <p>Transporter: {transporterName}</p>
              <p>Driver Contact: {driverName} ({driverPhone})</p>
            </div>
          </div>

          {/* Goods Table */}
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 text-[10px] uppercase font-bold text-slate-800 border-b border-slate-300">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Description of Corrugated Goods</th>
                  <th className="py-2.5 px-3 text-center">Packaging</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Rate ({currency})</th>
                  <th className="py-2.5 px-3 text-right">Value ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                <tr>
                  <td className="py-3 px-3 font-sans text-slate-500 text-center">1</td>
                  <td className="py-3 px-3 font-sans">
                    <span className="font-bold text-slate-900 block">
                      {order?.boxType || 'Master Shipping Carton'}
                    </span>
                    <span className="text-slate-600 text-[10px] block">
                      {order?.dimensions ? `Dims: ${order.dimensions}` : ''}
                      {order?.boardPly ? ` | ${order.boardPly}` : ''}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-sans text-slate-700">
                    {Math.ceil((order?.quantityOrdered || 0) / 25)} Strapped Bundles
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {(order?.quantityOrdered || 0).toLocaleString()} PCS
                  </td>
                  <td className="py-3 px-3 text-right text-slate-700">
                    {(order?.unitPrice || order?.ratePerPiece || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    {((order?.quantityOrdered || 0) * (order?.unitPrice || order?.ratePerPiece || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Declaration */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600">
            <p className="font-semibold text-slate-800">Declaration & Terms:</p>
            <p>1. We declare that this delivery challan shows the actual quantity of corrugated goods described and all particulars are true and correct.</p>
            <p>2. Goods received once cannot be returned without formal written inspection notice within 48 hours of delivery.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-xs">
            <div>
              <span className="block font-bold uppercase text-slate-900">For {factoryConfig.factoryName}:</span>
              <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
              <span className="block mt-1 text-[10px] text-slate-500">Authorized Plant Dispatcher / Security Gate</span>
            </div>

            <div className="text-right">
              <span className="block font-bold uppercase text-slate-900">Customer Receiver&apos;s Acknowledgment:</span>
              <div className="h-12 border-b border-dashed border-slate-400 mt-2"></div>
              <span className="block mt-1 text-[10px] text-slate-500">Received Goods in Sound Condition (Signature & Seal)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
