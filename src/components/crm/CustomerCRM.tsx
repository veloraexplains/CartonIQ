import React, { useState, useEffect } from 'react';
import { Customer, Quotation, ProductionOrder } from '../../types';
import { getCustomers, saveCustomers, getQuotations, getOrders } from '../../utils/storage';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
  Trash2,
  Edit2,
  Check,
  Building2,
  Plus
} from 'lucide-react';

interface CustomerCRMProps {
  onSelectCustomerForQuote?: (customer: Customer) => void;
}

export const CustomerCRM: React.FC<CustomerCRMProps> = ({ onSelectCustomerForQuote }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Form modal/drawer state
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [gstOrTaxId, setGstOrTaxId] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30 Days Net');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setCustomers(getCustomers());
    setQuotations(getQuotations());
    setOrders(getOrders());
  }, []);

  const resetForm = () => {
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setGstOrTaxId('');
    setPaymentTerms('30 Days Net');
    setNotes('');
    setFormError(null);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEditClick = (c: Customer) => {
    setEditingId(c.id);
    setCompanyName(c.companyName);
    setContactPerson(c.contactPerson);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address);
    setCity(c.city);
    setGstOrTaxId(c.gstOrTaxId);
    setPaymentTerms(c.paymentTerms);
    setNotes(c.notes);
    setIsAdding(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!companyName.trim()) {
      setFormError('Company or Customer Name is required.');
      return;
    }

    if (editingId) {
      // Update existing
      const updated = customers.map((c) =>
        c.id === editingId
          ? {
              ...c,
              companyName: companyName.trim(),
              contactPerson: contactPerson.trim(),
              phone: phone.trim(),
              email: email.trim(),
              address: address.trim(),
              city: city.trim(),
              gstOrTaxId: gstOrTaxId.trim(),
              paymentTerms,
              notes: notes.trim(),
            }
          : c
      );
      saveCustomers(updated);
      setCustomers(updated);
    } else {
      // Create new
      const newCust: Customer = {
        id: Date.now().toString(),
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        gstOrTaxId: gstOrTaxId.trim(),
        paymentTerms,
        notes: notes.trim(),
        createdAt: new Date().toLocaleDateString(),
      };
      const updated = [newCust, ...customers];
      saveCustomers(updated);
      setCustomers(updated);
    }

    resetForm();
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Are you sure you want to delete this customer record?')) {
      const updated = customers.filter((c) => c.id !== id);
      saveCustomers(updated);
      setCustomers(updated);
      if (selectedCustomerId === id) setSelectedCustomerId(null);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerQuotes = quotations.filter((q) => q.customerId === selectedCustomerId);
  const customerOrders = orders.filter((o) => o.customerId === selectedCustomerId);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>Customer CRM & Account History</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage client profiles, shipping destinations, tax registrations, and orders.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-amber-950 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Add / Edit Customer Form Modal/Card */}
      {isAdding && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId ? 'Edit Customer Details' : 'New Customer Profile'}
            </h3>
            <button
              onClick={resetForm}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSaveCustomer} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Electronics Ltd."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. John Doe (Procurement)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone / Mobile</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. purchases@apexelectronics.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">GST / Tax Registration ID</label>
                <input
                  type="text"
                  value={gstOrTaxId}
                  onChange={(e) => setGstOrTaxId(e.target.value)}
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="100% Advance">100% Advance</option>
                  <option value="50% Advance, Balance on Dispatch">50% Advance, Balance on Dispatch</option>
                  <option value="15 Days Net">15 Days Net</option>
                  <option value="30 Days Net">30 Days Net</option>
                  <option value="45 Days Net">45 Days Net</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Delivery / Factory Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Industrial Area, Unit #"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City, State"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {formError && <p className="text-xs text-rose-400">{formError}</p>}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all"
              >
                {editingId ? 'Update Customer' : 'Save Customer'}
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

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by company name, contact, city, or phone..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Customer List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
            {customers.length === 0
              ? 'No customers added yet. Click "+ Add Customer" above to begin. (No fake data is seeded).'
              : 'No matching customers found for your search query.'}
          </div>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className={`p-3.5 rounded-xl border transition-all ${
                selectedCustomerId === c.id
                  ? 'border-amber-400/80 bg-slate-900 shadow-md'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div
                  className="cursor-pointer flex-1"
                  onClick={() =>
                    setSelectedCustomerId(selectedCustomerId === c.id ? null : c.id)
                  }
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-white text-sm">{c.companyName}</span>
                    {c.city && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {c.city}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                    {c.contactPerson && <span>Contact: {c.contactPerson}</span>}
                    {c.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {c.phone}
                      </span>
                    )}
                    {c.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {c.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  {onSelectCustomerForQuote && (
                    <button
                      onClick={() => onSelectCustomerForQuote(c)}
                      className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-2.5 py-1 rounded-lg transition-all"
                    >
                      New Quote
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(c)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                    title="Edit Customer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCustomer(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded History Details */}
              {selectedCustomerId === c.id && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Delivery Address:</span>
                      <span>{c.address || 'No address specified'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Tax / GST ID:</span>
                      <span className="font-mono">{c.gstOrTaxId || 'Unregistered'}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Quotations: <strong>{customerQuotes.length}</strong> • Active Orders:{' '}
                      <strong>{customerOrders.length}</strong>
                    </span>
                    <span>Payment Terms: {c.paymentTerms}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
