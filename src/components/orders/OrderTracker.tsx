import React, { useState, useEffect } from 'react';
import { ProductionOrder, ProductionStage, FactoryConfig } from '../../types';
import { getOrders, saveOrders, getCustomers } from '../../utils/storage';
import { NumericInput } from '../common/NumericInput';
import { JobCardModal } from './JobCardModal';
import { DeliveryChallanModal } from './DeliveryChallanModal';
import {
  PackageCheck,
  Truck,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  CreditCard,
  Building2,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface OrderTrackerProps {
  factoryConfig: FactoryConfig;
}

const PRODUCTION_STAGES: { stage: ProductionStage; label: string; desc: string }[] = [
  { stage: 'Order_Confirmed', label: 'Order Confirmed', desc: 'Commercial terms approved' },
  { stage: 'Paper_Allocated', label: 'Paper Allocated', desc: 'Reels booked from stock' },
  { stage: 'Corrugation', label: 'Corrugation Running', desc: 'Board fluting & laminating' },
  { stage: 'Printing_Slotting', label: 'Printing & Slotting', desc: 'Flexo pass & rotary crease' },
  { stage: 'Stitching_Gluing', label: 'Stitching / Gluing', desc: 'Joint fastening' },
  { stage: 'Quality_Inspection', label: 'Quality Check', desc: 'Caliper & burst strength test' },
  { stage: 'Ready_For_Dispatch', label: 'Ready for Dispatch', desc: 'Strapped in bundles on pallets' },
  { stage: 'Dispatched', label: 'Dispatched', desc: 'Out for delivery to customer' },
];

export const OrderTracker: React.FC<OrderTrackerProps> = ({ factoryConfig }) => {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New Order Form state
  const [customerName, setCustomerName] = useState('');
  const [boxName, setBoxName] = useState('');
  const [dimensionsSummary, setDimensionsSummary] = useState('400 × 300 × 250 mm (3-Ply B-Flute)');
  const [quantityOrdered, setQuantityOrdered] = useState('1000');
  const [unitPrice, setUnitPrice] = useState('1.35');
  const [advancePaid, setAdvancePaid] = useState('0');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment record modal
  const [paymentAmountToAdd, setPaymentAmountToAdd] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Shop floor Job Card & Delivery Challan state
  const [viewingJobCardOrder, setViewingJobCardOrder] = useState<ProductionOrder | null>(null);
  const [viewingChallanOrder, setViewingChallanOrder] = useState<ProductionOrder | null>(null);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !boxName.trim()) {
      alert('Please fill out Customer Name and Box Name.');
      return;
    }

    const qty = parseInt(quantityOrdered, 10) || 0;
    const price = parseFloat(unitPrice) || 0;
    const adv = parseFloat(advancePaid) || 0;
    const total = Number((qty * price).toFixed(2));
    const balance = Math.max(0, Number((total - adv).toFixed(2)));

    const newOrder: ProductionOrder = {
      id: Date.now().toString(),
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: Date.now().toString(),
      customerName: customerName.trim(),
      boxName: boxName.trim(),
      dimensionsSummary: dimensionsSummary.trim(),
      quantityOrdered: qty,
      unitPrice: price,
      totalAmount: total,
      advancePaid: adv,
      balanceDue: balance,
      paymentStatus: adv >= total && total > 0 ? 'Paid' : adv > 0 ? 'Partial' : 'Pending',
      productionStage: 'Order_Confirmed',
      orderDate: new Date().toLocaleDateString(),
      targetDeliveryDate: targetDeliveryDate || 'Within 7 working days',
      notes: orderNotes.trim(),
    };

    const updated = [newOrder, ...orders];
    saveOrders(updated);
    setOrders(updated);
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setCustomerName('');
    setBoxName('');
    setQuantityOrdered('1000');
    setUnitPrice('1.35');
    setAdvancePaid('0');
    setTargetDeliveryDate('');
    setOrderNotes('');
  };

  const handleUpdateStage = (orderId: string, newStage: ProductionStage) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          productionStage: newStage,
          actualDeliveryDate: newStage === 'Dispatched' ? new Date().toLocaleDateString() : o.actualDeliveryDate,
        };
      }
      return o;
    });
    saveOrders(updated);
    setOrders(updated);
  };

  const handleAddPayment = (orderId: string) => {
    setPaymentError(null);
    const amount = parseFloat(paymentAmountToAdd);
    if (isNaN(amount) || amount <= 0) {
      setPaymentError('Please enter a valid positive payment amount.');
      return;
    }

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const newPaid = Number((o.advancePaid + amount).toFixed(2));
        const newBalance = Math.max(0, Number((o.totalAmount - newPaid).toFixed(2)));
        const newStatus: ProductionOrder['paymentStatus'] =
          newBalance <= 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Pending';

        return {
          ...o,
          advancePaid: newPaid,
          balanceDue: newBalance,
          paymentStatus: newStatus,
        };
      }
      return o;
    });

    saveOrders(updated);
    setOrders(updated);
    setPaymentAmountToAdd('');
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Delete this production order?')) {
      const updated = orders.filter((o) => o.id !== orderId);
      saveOrders(updated);
      setOrders(updated);
      if (activeOrderId === orderId) setActiveOrderId(null);
    }
  };

  const currency = factoryConfig.currencySymbol;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <PackageCheck className="w-4 h-4" />
            <span>Manufacturing Orders & Shopfloor Tracking</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time batch progress from reel allocation to dispatch, with partial payment tracking.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-amber-950 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Order</span>
        </button>
      </div>

      {/* NEW ORDER MODAL */}
      {isCreating && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Create Manufacturing Order
            </h3>
            <button onClick={() => setIsCreating(false)} className="text-xs text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer / Client Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Logistics Pvt Ltd"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Box / Carton Name *</label>
                <input
                  type="text"
                  value={boxName}
                  onChange={(e) => setBoxName(e.target.value)}
                  placeholder="e.g. Master Carton 400x300x250"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Board & Dimensions Summary</label>
                <input
                  type="text"
                  value={dimensionsSummary}
                  onChange={(e) => setDimensionsSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Delivery Date</label>
                <input
                  type="text"
                  value={targetDeliveryDate}
                  onChange={(e) => setTargetDeliveryDate(e.target.value)}
                  placeholder="e.g. Oct 28, 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumericInput
                label="Order Quantity (Units)"
                value={quantityOrdered}
                onChange={setQuantityOrdered}
                suffix="pcs"
                placeholder="1000"
              />
              <NumericInput
                label="Unit Selling Price"
                value={unitPrice}
                onChange={setUnitPrice}
                prefix={currency}
                suffix="/box"
                placeholder="1.35"
              />
              <NumericInput
                label="Advance Payment Received"
                value={advancePaid}
                onChange={setAdvancePaid}
                prefix={currency}
                placeholder="0"
                helper="Initial deposit"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Production Notes</label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Specific printing plate numbers, strapping specs, or loading dock instructions..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
              >
                Register Order
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ORDERS LIST & TRACKER */}
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
            No active production orders yet. Convert an approved quotation or click &quot;+ New Order&quot; above.
          </div>
        ) : (
          orders.map((order) => {
            const currentStageIndex = PRODUCTION_STAGES.findIndex(
              (s) => s.stage === order.productionStage
            );

            return (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{order.orderNumber}</span>
                      <span className="text-xs font-bold text-white">{order.customerName}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : order.paymentStatus === 'Partial'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {order.boxName} • {order.dimensionsSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">
                        {currency}{order.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Paid: {currency}{order.advancePaid.toLocaleString()} • Due:{' '}
                        <span className="text-rose-400 font-semibold">{currency}{order.balanceDue.toLocaleString()}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      title="Delete order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar across stages */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-400">Production Stage:</span>
                    <span className="font-bold text-amber-400">
                      {PRODUCTION_STAGES[currentStageIndex]?.label || order.productionStage}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                    {PRODUCTION_STAGES.map((s, idx) => (
                      <button
                        key={s.stage}
                        onClick={() => handleUpdateStage(order.id, s.stage)}
                        className={`p-1.5 rounded text-[10px] text-center font-medium transition-all ${
                          idx <= currentStageIndex
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                        }`}
                        title={s.desc}
                      >
                        {idx + 1}. {s.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions: Job Card, Delivery Challan & Payment */}
                <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setViewingJobCardOrder(order)}
                      className="flex items-center gap-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 px-2.5 py-1 rounded-lg font-semibold transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Job Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewingChallanOrder(order)}
                      className="flex items-center gap-1 text-[11px] bg-slate-950 hover:bg-slate-800 text-emerald-400 border border-slate-800 px-2.5 py-1 rounded-lg font-semibold transition-all"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Delivery Challan & Gate Pass</span>
                    </button>
                  </div>

                  {order.balanceDue > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={activeOrderId === order.id ? paymentAmountToAdd : ''}
                        onFocus={() => setActiveOrderId(order.id)}
                        onChange={(e) => {
                          setActiveOrderId(order.id);
                          setPaymentAmountToAdd(e.target.value);
                        }}
                        placeholder={`Receive (${currency})`}
                        className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={() => handleAddPayment(order.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-2.5 py-1 rounded-lg transition-all"
                      >
                        Record Pay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODALS */}
      {viewingJobCardOrder && (
        <JobCardModal
          order={viewingJobCardOrder}
          factoryConfig={factoryConfig}
          onClose={() => setViewingJobCardOrder(null)}
        />
      )}

      {viewingChallanOrder && (
        <DeliveryChallanModal
          order={viewingChallanOrder}
          factoryConfig={factoryConfig}
          onClose={() => setViewingChallanOrder(null)}
        />
      )}
    </div>
  );
};
