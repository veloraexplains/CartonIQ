import { triggerPrint } from '../../utils/printHelper';
import React, { useState, useEffect } from 'react';
import {
  Quotation,
  QuotationItem,
  Customer,
  ProductionOrder,
  FactoryConfig,
  BoxStyle,
  PlyCount,
  FluteType
} from '../../types';
import {
  getQuotations,
  saveQuotations,
  getCustomers,
  getOrders,
  saveOrders,
  getDesigns
} from '../../utils/storage';
import { NumericInput } from '../common/NumericInput';
import {
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Share2,
  X,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  Sliders,
  Box,
  Edit2,
  Send,
  BarChart2
} from 'lucide-react';

interface QuotationManagerProps {
  factoryConfig: FactoryConfig;
  preloadedItem?: {
    name: string;
    style: any;
    l: number;
    w: number;
    h: number;
    dimensionsDisplay?: string;
    ply: any;
    flute: any;
    unitPrice: number;
    customQty?: number;
    weightGrams: number;
    quantities: { qty: number; unitPrice: number; totalPrice: number }[];
  } | null;
  onClearPreloaded?: () => void;
  onOrderCreated?: (order: ProductionOrder) => void;
}

export const QuotationManager: React.FC<QuotationManagerProps> = ({
  factoryConfig,
  preloadedItem,
  onClearPreloaded,
  onOrderCreated,
}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeQuotation, setActiveQuotation] = useState<Quotation | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New Quote header fields
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [validDays, setValidDays] = useState('30');
  const [deliveryTerms, setDeliveryTerms] = useState('Ex-Factory / Transport extra at actuals');
  const [paymentTerms, setPaymentTerms] = useState('50% Advance, balance against PI before dispatch');
  const [notes, setNotes] = useState('Tolerance: ±2mm dimensions, ±5% quantity as per corrugated industry standards.');

  // Quote Line Items (supports multiple different boxes & custom quantities)
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([]);

  // Add Item Drawer / Form within creator
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemName, setItemName] = useState('Master Shipping Carton');
  const [itemDimensionsDisplay, setItemDimensionsDisplay] = useState('14 × 10 × 8 inch (356 × 254 × 203 mm)');
  const [itemPlyCount, setItemPlyCount] = useState<PlyCount>(3);
  const [itemFluteType, setItemFluteType] = useState<FluteType>('B');
  const [itemStyle, setItemStyle] = useState<BoxStyle>('RSC_0201');
  const [itemQuantity, setItemQuantity] = useState('1200');
  const [itemUnitPrice, setItemUnitPrice] = useState('36.50');
  const [itemWeight, setItemWeight] = useState('280');

  useEffect(() => {
    setQuotations(getQuotations());
    setCustomers(getCustomers());
  }, []);

  // When a preloaded item arrives from the calculator, populate as first quote item
  useEffect(() => {
    if (preloadedItem) {
      setIsCreating(true);
      const preloadedQty = preloadedItem.customQty || (preloadedItem.quantities[0]?.qty ?? 1000);
      const preloadedRate = preloadedItem.unitPrice || (preloadedItem.quantities[0]?.unitPrice ?? 35);
      const preloadedTotal = Number((preloadedQty * preloadedRate).toFixed(2));

      const firstItem: QuotationItem = {
        id: Date.now().toString(),
        boxName: preloadedItem.name || 'Calculated Box',
        boxStyle: preloadedItem.style || 'RSC_0201',
        dimensionsMm: {
          l: preloadedItem.l,
          w: preloadedItem.w,
          h: preloadedItem.h,
        },
        dimensionsDisplay: preloadedItem.dimensionsDisplay || `${preloadedItem.l} × ${preloadedItem.w} × ${preloadedItem.h} mm`,
        plyCount: preloadedItem.ply || 3,
        fluteType: preloadedItem.flute || 'B',
        boardDescription: `${preloadedItem.ply || 3}-Ply ${preloadedItem.flute || 'B'}-Flute Industrial Corrugated`,
        estimatedWeightGrams: preloadedItem.weightGrams || 280,
        quantity: preloadedQty,
        unitPrice: preloadedRate,
        totalPrice: preloadedTotal,
        quantityTiers: preloadedItem.quantities,
      };

      setQuoteItems([firstItem]);
    }
  }, [preloadedItem]);

  // Add / Update item in the quote list
  const handleSaveItemToList = () => {
    const qty = parseInt(itemQuantity, 10) || 1000;
    const rate = parseFloat(itemUnitPrice) || 35;
    const total = Number((qty * rate).toFixed(2));
    const weight = parseInt(itemWeight, 10) || 280;

    const newItem: QuotationItem = {
      id: Date.now().toString(),
      boxName: itemName.trim() || 'Custom Corrugated Box',
      boxStyle: itemStyle,
      dimensionsMm: { l: 350, w: 250, h: 200 },
      dimensionsDisplay: itemDimensionsDisplay.trim() || '350 × 250 × 200 mm',
      plyCount: itemPlyCount,
      fluteType: itemFluteType,
      boardDescription: `${itemPlyCount}-Ply ${itemFluteType}-Flute Industrial Corrugated`,
      estimatedWeightGrams: weight,
      quantity: qty,
      unitPrice: rate,
      totalPrice: total,
      quantityTiers: [
        { qty: Math.round(qty * 0.5), unitPrice: Number((rate * 1.05).toFixed(2)), totalPrice: Number((qty * 0.5 * rate * 1.05).toFixed(2)) },
        { qty: qty, unitPrice: rate, totalPrice: total },
        { qty: Math.round(qty * 2), unitPrice: Number((rate * 0.95).toFixed(2)), totalPrice: Number((qty * 2 * rate * 0.95).toFixed(2)) },
      ],
    };

    if (editingItemIndex !== null && editingItemIndex >= 0) {
      const updated = [...quoteItems];
      updated[editingItemIndex] = newItem;
      setQuoteItems(updated);
      setEditingItemIndex(null);
    } else {
      setQuoteItems([...quoteItems, newItem]);
    }

    // Reset item form
    setItemName('Inner / Base Box');
    setItemDimensionsDisplay('250 × 200 × 150 mm');
    setItemQuantity('2000');
    setItemUnitPrice('22.00');
  };

  const handleRemoveItem = (index: number) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer for this quotation.');
      return;
    }

    if (quoteItems.length === 0) {
      alert('Please add at least one box item to the quotation.');
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    // Calculate subtotal from all items
    const subtotal = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxPercent = parseFloat(factoryConfig.defaultTaxPercent) || 18;
    const taxAmount = Number(((subtotal * taxPercent) / 100).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    const today = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + (parseInt(validDays, 10) || 30));

    const newQuotation: Quotation = {
      id: Date.now().toString(),
      quotationNumber: `QT-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: customer.id,
      customerName: customer.companyName,
      customerAddress: customer.address ? `${customer.address}, ${customer.city}` : customer.city || 'Factory Delivery',
      customerPhone: customer.phone,
      customerEmail: customer.email,
      date: today.toLocaleDateString(),
      validUntil: validUntilDate.toLocaleDateString(),
      items: quoteItems,
      subtotal,
      taxPercent,
      taxAmount,
      totalAmount,
      deliveryTerms,
      paymentTerms: customer.paymentTerms || paymentTerms,
      notes,
      status: 'Sent',
      createdAt: today.toISOString(),
    };

    const updated = [newQuotation, ...quotations];
    saveQuotations(updated);
    setQuotations(updated);
    setActiveQuotation(newQuotation);
    setIsCreating(false);
    if (onClearPreloaded) onClearPreloaded();
  };

  const handleUpdateStatus = (id: string, newStatus: Quotation['status']) => {
    const updated = quotations.map((q) => (q.id === id ? { ...q, status: newStatus } : q));
    saveQuotations(updated);
    setQuotations(updated);
    if (activeQuotation && activeQuotation.id === id) {
      setActiveQuotation({ ...activeQuotation, status: newStatus });
    }
  };

  const handleDeleteQuotation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this quotation permanently?')) {
      const updated = quotations.filter((q) => q.id !== id);
      saveQuotations(updated);
      setQuotations(updated);
      if (activeQuotation && activeQuotation.id === id) setActiveQuotation(null);
    }
  };

  // Convert Approved Quotation into live Production Order
  const handleConvertToOrder = (quote: Quotation) => {
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + 10);

    const itemsSummary = quote.items
      .map((it) => `${it.boxName} (${it.quantity.toLocaleString()} pcs @ ${currency}${it.unitPrice})`)
      .join(', ');

    const primaryItem = quote.items[0];
    const totalQty = quote.items.reduce((sum, it) => sum + it.quantity, 0);

    const newOrder: ProductionOrder = {
      id: Date.now().toString(),
      orderNumber: `ORD-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      quotationId: quote.id,
      customerId: quote.customerId,
      customerName: quote.customerName,
      boxName: quote.items.length > 1 ? `${quote.items[0].boxName} + ${quote.items.length - 1} more items` : primaryItem.boxName,
      dimensionsSummary: itemsSummary,
      quantityOrdered: totalQty,
      unitPrice: Number((quote.subtotal / totalQty).toFixed(2)),
      totalAmount: quote.totalAmount,
      advancePaid: 0,
      balanceDue: quote.totalAmount,
      paymentStatus: 'Pending',
      productionStage: 'Order_Confirmed',
      orderDate: today.toLocaleDateString(),
      targetDeliveryDate: targetDate.toLocaleDateString(),
      notes: `Converted from Quotation #${quote.quotationNumber}. ${quote.notes}`,
    };

    const existingOrders = getOrders();
    const updatedOrders = [newOrder, ...existingOrders];
    saveOrders(updatedOrders);

    handleUpdateStatus(quote.id, 'Approved');
    alert(`Order #${newOrder.orderNumber} created successfully! You can track production in Orders.`);
    if (onOrderCreated) onOrderCreated(newOrder);
  };

  const [showTierMatrixQuote, setShowTierMatrixQuote] = useState<Quotation | null>(null);

  // Instant WhatsApp Quotation Sharing
  const handleShareWhatsAppQuotation = (quote: Quotation) => {
    const itemsText = quote.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.boxName}*\n   • Size: ${it.dimensionsDisplay}\n   • Board: ${it.plyCount}-Ply (${it.fluteType})\n   • Qty: ${it.quantity.toLocaleString()} pcs @ ${currency}${it.unitPrice.toFixed(2)}\n   • Subtotal: ${currency}${it.totalPrice.toLocaleString()}`
      )
      .join('\n\n');

    const message = `📋 *OFFICIAL COMMERCIAL QUOTATION*
*${factoryConfig.factoryName || 'CartonIQ Packaging'}*

📄 *Quote No:* ${quote.quotationNumber}
📅 *Date:* ${quote.date} (Valid until ${quote.validUntil})
🏢 *Client:* ${quote.customerName}

📦 *Specifications & Pricing:*
${itemsText}

💰 *Grand Total:* *${currency}${quote.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}* (Incl. Tax)
🚚 *Delivery Terms:* ${quote.deliveryTerms}
💳 *Payment Terms:* ${quote.paymentTerms}

For inquiries or order confirmation, please contact ${factoryConfig.phone || 'our sales desk'}.`;

    const encoded = encodeURIComponent(message);
    const targetPhone = quote.customerPhone ? quote.customerPhone.replace(/\D/g, '') : '';
    const url = targetPhone ? `https://wa.me/${targetPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const currency = factoryConfig.currencySymbol || '₹';

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <FileText className="w-4 h-4" />
            <span>Commercial Quotations & Custom Multi-Box Pricing</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Quote custom quantities, custom rates, and multiple different boxes in a single official document.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            if (quoteItems.length === 0) {
              setQuoteItems([
                {
                  id: '1',
                  boxName: 'Master Shipping Box',
                  boxStyle: 'RSC_0201',
                  dimensionsMm: { l: 400, w: 300, h: 250 },
                  dimensionsDisplay: '14 × 10 × 8 inch (356 × 254 × 203 mm)',
                  plyCount: 3,
                  fluteType: 'B',
                  boardDescription: '3-Ply B-Flute Kraft Linerboard',
                  estimatedWeightGrams: 320,
                  quantity: 1250,
                  unitPrice: 36.50,
                  totalPrice: 45625,
                },
              ]);
            }
          }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-amber-950 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* Internal Security Disclaimer Note */}
      <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-[11px] text-blue-300 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
        <span>
          <strong>Confidentiality Enforced:</strong> Internal factory paper costs, conversion rates, and profit margins
          are strictly hidden from customer view.
        </span>
      </div>

      {/* CREATE QUOTATION FORM WITH CUSTOM QUANTITY & MULTIPLE BOX ITEMS */}
      {isCreating && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Create Quotation with Custom Quantities & Different Boxes
              </h3>
              <p className="text-[11px] text-slate-400">
                Add one or more box sizes, type any exact quantity, and override unit prices.
              </p>
            </div>
            <button
              onClick={() => {
                setIsCreating(false);
                if (onClearPreloaded) onClearPreloaded();
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateQuotation} className="space-y-4">
            {/* Customer & Validity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Customer Account *</label>
                {customers.length === 0 ? (
                  <p className="text-xs text-amber-400 bg-amber-950/30 p-2 rounded border border-amber-500/30">
                    No customers found. Please add a customer in Customer CRM first.
                  </p>
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.contactPerson || c.city || 'Client'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Validity Period</label>
                <select
                  value={validDays}
                  onChange={(e) => setValidDays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="15">15 Days (Paper price volatile)</option>
                  <option value="30">30 Days Standard</option>
                  <option value="60">60 Days Extended</option>
                </select>
              </div>
            </div>

            {/* QUOTATION ITEMS LIST (THE CORE CUSTOM MULTI-BOX FEATURE) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Box className="w-4 h-4" />
                  <span>Carton Line Items in this Quotation ({quoteItems.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">Custom quantities & individual box prices</span>
              </div>

              {quoteItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-900 rounded-lg border border-slate-800">
                  No boxes added to this quotation yet. Add your first box below.
                </div>
              ) : (
                <div className="space-y-2">
                  {quoteItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-amber-400 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-white text-xs">{item.boxName}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                            {item.plyCount}-Ply ({item.fluteType})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 ml-7">
                          Size: <strong className="text-slate-300">{item.dimensionsDisplay}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto font-mono">
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-400 block">
                            {currency}{item.totalPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.quantity.toLocaleString()} pcs @ {currency}{item.unitPrice.toFixed(2)}/box
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ADD ANOTHER BOX ITEM FORM INLINE */}
              <div className="p-3 rounded-lg bg-slate-900/90 border border-dashed border-slate-700 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  + Add Another Box / Custom Item:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Box / Item Description:</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g. Inner Packaging Carton / Base Box"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Custom Size & Unit (inch / mm / cm):</label>
                    <input
                      type="text"
                      value={itemDimensionsDisplay}
                      onChange={(e) => setItemDimensionsDisplay(e.target.value)}
                      placeholder="e.g. 10 × 8 × 6 inch or 250 × 200 × 150 mm"
                      className="w-full bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Ply Count:</label>
                      <select
                        value={itemPlyCount}
                        onChange={(e) => setItemPlyCount(Number(e.target.value) as PlyCount)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value={3}>3-Ply</option>
                        <option value={5}>5-Ply</option>
                        <option value={7}>7-Ply</option>
                      </select>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Flute:</label>
                      <select
                        value={itemFluteType}
                        onChange={(e) => setItemFluteType(e.target.value as FluteType)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="B">B-Flute</option>
                        <option value="C">C-Flute</option>
                        <option value="E">E-Flute</option>
                        <option value="BC">BC-Flute</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                  <NumericInput
                    label="Custom Quantity (Units)"
                    value={itemQuantity}
                    onChange={setItemQuantity}
                    suffix="pcs"
                    placeholder="1200"
                  />
                  <NumericInput
                    label="Unit Selling Price"
                    value={itemUnitPrice}
                    onChange={setItemUnitPrice}
                    prefix={currency}
                    suffix="/box"
                    placeholder="36.50"
                  />
                  <NumericInput
                    label="Est. Unit Weight"
                    value={itemWeight}
                    onChange={setItemWeight}
                    suffix="g"
                    placeholder="280"
                  />
                  <button
                    type="button"
                    onClick={handleSaveItemToList}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs py-2 px-3 rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Box to Quote</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Terms & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Delivery Terms</label>
                <input
                  type="text"
                  value={deliveryTerms}
                  onChange={(e) => setDeliveryTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes & Tolerances</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={customers.length === 0 || quoteItems.length === 0}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-950 disabled:opacity-50"
              >
                Generate & Save Quotation ({quoteItems.length} Boxes)
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3.5 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUOTATION DOCUMENT MODAL (PRINTABLE / CUSTOMER FACING VIEW) */}
      {activeQuotation && (
        <div className="p-4 sm:p-6 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-300 space-y-4">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                Status: {activeQuotation.status}
              </span>
              <span className="text-xs text-slate-500 font-mono font-bold">#{activeQuotation.quotationNumber}</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleShareWhatsAppQuotation(activeQuotation)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                title="Share quotation via WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </button>

              <button
                onClick={() => setShowTierMatrixQuote(activeQuotation)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                title="View economies of scale tiered pricing table"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Tier Pricing</span>
              </button>

              <button
                onClick={() => triggerPrint()}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>

              {activeQuotation.status !== 'Approved' && (
                <button
                  onClick={() => handleConvertToOrder(activeQuotation)}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Create Order</span>
                </button>
              )}

              <button
                onClick={() => setActiveQuotation(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                title="Close View"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="space-y-4 text-xs font-sans">
            {/* Header / Complete Company Profile Branding */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 tracking-tight">
                  {factoryConfig.factoryName}
                </h2>
                {factoryConfig.tagline && (
                  <p className="text-[11px] font-semibold text-amber-600">{factoryConfig.tagline}</p>
                )}
                {factoryConfig.address && (
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {factoryConfig.address}, {factoryConfig.city} {factoryConfig.state ? `, ${factoryConfig.state}` : ''} {factoryConfig.pincode}
                  </p>
                )}
                <div className="text-[10px] text-slate-500 flex flex-wrap gap-x-3 mt-1">
                  {factoryConfig.phone && <span>Phone: {factoryConfig.phone}</span>}
                  {factoryConfig.email && <span>Email: {factoryConfig.email}</span>}
                  {factoryConfig.gstin && <span className="font-mono font-bold text-slate-700">GSTIN: {factoryConfig.gstin}</span>}
                  {factoryConfig.pan && <span className="font-mono text-slate-700">PAN: {factoryConfig.pan}</span>}
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-sm font-black text-amber-600 block">COMMERCIAL QUOTATION</span>
                <span className="font-mono text-slate-800 font-bold">{activeQuotation.quotationNumber}</span>
                <span className="block text-slate-500 text-[11px]">Date: {activeQuotation.date}</span>
                <span className="block text-slate-500 text-[11px]">Valid Until: {activeQuotation.validUntil}</span>
              </div>
            </div>

            {/* Bill / Ship To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Details:</span>
                <span className="font-bold text-slate-900 block text-sm">{activeQuotation.customerName}</span>
                <span className="text-slate-600 block">{activeQuotation.customerAddress}</span>
                <span className="text-slate-600 block">Phone: {activeQuotation.customerPhone || 'N/A'}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Terms & Logistics:</span>
                <span className="text-slate-700 block">Payment: {activeQuotation.paymentTerms}</span>
                <span className="text-slate-700 block">Delivery: {activeQuotation.deliveryTerms}</span>
              </div>
            </div>

            {/* ITEMIZED PRODUCT SPECIFICATIONS TABLE (CUSTOM QUANTITIES & DIFFERENT BOXES) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-300">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Dimensions</th>
                    <th className="py-2.5 px-3 text-center">Board Ply</th>
                    <th className="py-2.5 px-3 text-right">Order Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {activeQuotation.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="font-bold text-slate-900 block">{item.boxName}</span>
                        <span className="text-slate-500 text-[10px]">{item.boardDescription}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-semibold font-sans">
                        {item.dimensionsDisplay}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans font-medium text-slate-700">
                        {item.plyCount}-Ply ({item.fluteType})
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {item.quantity.toLocaleString()} pcs
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-900">
                        {currency}{item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {currency}{item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Optional Volume Slabs reference if item has tiers */}
            {activeQuotation.items[0]?.quantityTiers && activeQuotation.items[0].quantityTiers.length > 1 && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Reference Volume Slab Scale for {activeQuotation.items[0].boxName}:
                </span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-slate-700">
                  {activeQuotation.items[0].quantityTiers.map((t) => (
                    <span key={t.qty}>
                      {t.qty.toLocaleString()} pcs @ <strong>{currency}{t.unitPrice.toFixed(2)}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Totals Calculation */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-72 space-y-1.5 border-t border-slate-300 pt-2 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({activeQuotation.items.reduce((s, it) => s + it.quantity, 0).toLocaleString()} pcs):</span>
                  <span>{currency}{activeQuotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{factoryConfig.taxLabel} ({activeQuotation.taxPercent}%):</span>
                  <span>{currency}{activeQuotation.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-950 border-t border-slate-300 pt-1">
                  <span>Total Payable:</span>
                  <span className="text-amber-600">
                    {currency}{activeQuotation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Details & Authorized Signatory Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-slate-700" />
                  <span>Bank Payment Details for Wire Transfer:</span>
                </span>
                <p className="text-slate-600">
                  Bank: <strong>{factoryConfig.bankDetails?.bankName || 'State Bank of India'}</strong>
                </p>
                <p className="text-slate-600">
                  A/C Name: <strong>{factoryConfig.bankDetails?.accountName || factoryConfig.factoryName}</strong>
                </p>
                <p className="text-slate-600">
                  A/C Number: <strong className="font-mono">{factoryConfig.bankDetails?.accountNumber || '39482910392'}</strong>
                </p>
                <p className="text-slate-600">
                  IFSC Code: <strong className="font-mono uppercase">{factoryConfig.bankDetails?.ifscCode || 'SBIN0001842'}</strong> • Branch: {factoryConfig.bankDetails?.branch || 'Main Branch'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] flex flex-col justify-between">
                <span className="text-slate-500 block">For {factoryConfig.factoryName}:</span>
                <div className="pt-6">
                  <span className="font-bold text-slate-900 block">{factoryConfig.signatoryName || 'Authorized Signatory'}</span>
                  <span className="text-slate-500 text-[10px] block">{factoryConfig.signatoryDesignation || 'Plant Director'}</span>
                </div>
              </div>
            </div>

            {/* General Terms */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
              <span className="font-bold text-slate-800 block">Terms & Conditions:</span>
              <p>• {activeQuotation.notes}</p>
              <p>• Prices quoted are valid up to the expiration date. Printing stereo blocks / die cylinder charges extra if applicable.</p>
            </div>
          </div>
        </div>
      )}

      {/* QUOTATION LIST */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          All Quotations ({quotations.length})
        </h3>

        {quotations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
            No quotations generated yet. Calculate a box or click &quot;New Quotation&quot; above.
          </div>
        ) : (
          quotations.map((q) => {
            const totalItemCount = q.items.reduce((s, it) => s + it.quantity, 0);

            return (
              <div
                key={q.id}
                onClick={() => setActiveQuotation(q)}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{q.quotationNumber}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        q.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : q.status === 'Sent'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {q.status}
                    </span>
                    <span className="text-xs font-bold text-white">{q.customerName}</span>
                  </div>

                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4">
                    <span>
                      {q.items.length === 1 ? q.items[0].boxName : `${q.items.length} Box Models`}
                    </span>
                    <span>Total Qty: {totalItemCount.toLocaleString()} pcs</span>
                    <span>Total: {currency}{q.totalAmount.toLocaleString()}</span>
                    <span>Date: {q.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-semibold text-amber-400 group-hover:underline">
                    View PDF / Quote →
                  </span>
                  <button
                    onClick={(e) => handleDeleteQuotation(q.id, e)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                    title="Delete quote"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TIERED QUANTITY PRICING MATRIX MODAL */}
      {showTierMatrixQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950 text-white">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Economies of Scale Tiered Pricing Matrix</h3>
                  <span className="text-[11px] text-slate-400">
                    Quote #{showTierMatrixQuote.quotationNumber} • {showTierMatrixQuote.customerName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowTierMatrixQuote(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Show customers how ordering in larger batches reduces plate setup, ink wash-up, and machine makeready costs per unit:
              </p>

              {showTierMatrixQuote.items.map((it) => {
                const basePrice = it.unitPrice;
                const tiers = [
                  { qty: 500, discount: 0, label: 'Small Batch' },
                  { qty: 1000, discount: 0.05, label: 'Standard Run' },
                  { qty: 2500, discount: 0.10, label: 'Bulk Order' },
                  { qty: 5000, discount: 0.15, label: 'Plant Run' },
                  { qty: 10000, discount: 0.20, label: 'Volume Contract' },
                ];

                return (
                  <div key={it.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <div>
                        <span className="font-bold text-white block text-sm">{it.boxName}</span>
                        <span className="text-slate-400 text-[11px]">{it.dimensionsDisplay} • {it.plyCount}-Ply ({it.fluteType})</span>
                      </div>
                      <span className="text-[11px] text-amber-400 font-mono">
                        Quoted: {it.quantity.toLocaleString()} pcs @ {currency}{it.unitPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                            <th className="py-2 px-2.5">Tier Volume</th>
                            <th className="py-2 px-2.5">Run Type</th>
                            <th className="py-2 px-2.5 text-right">Unit Rate</th>
                            <th className="py-2 px-2.5 text-right">Total Batch</th>
                            <th className="py-2 px-2.5 text-right text-emerald-400">Customer Savings</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                          {tiers.map((t) => {
                            const unitRate = Number((basePrice * (1 - t.discount)).toFixed(2));
                            const batchTotal = unitRate * t.qty;
                            const saved = (basePrice - unitRate) * t.qty;

                            return (
                              <tr
                                key={t.qty}
                                className={it.quantity === t.qty ? 'bg-amber-400/10 text-amber-300 font-bold' : 'text-slate-300'}
                              >
                                <td className="py-2 px-2.5 font-bold">
                                  {t.qty.toLocaleString()} pcs
                                </td>
                                <td className="py-2 px-2.5 text-[11px] font-sans text-slate-400">
                                  {t.label}
                                </td>
                                <td className="py-2 px-2.5 text-right">
                                  {currency}{unitRate.toFixed(2)}
                                </td>
                                <td className="py-2 px-2.5 text-right font-bold text-white">
                                  {currency}{batchTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </td>
                                <td className="py-2 px-2.5 text-right text-emerald-400 font-bold">
                                  {saved > 0 ? `Save ${currency}${saved.toFixed(0)} (${(t.discount * 100).toFixed(0)}%)` : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTierMatrixQuote(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition-all"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
