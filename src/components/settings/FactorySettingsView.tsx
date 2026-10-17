import React, { useState } from 'react';
import { FactoryConfig, DimensionUnit, AppLockConfig } from '../../types';
import { saveFactoryConfig } from '../../utils/storage';
import { NumericInput } from '../common/NumericInput';
import { SecuritySettings } from './SecuritySettings';
import { BackupRestoreView } from './BackupRestoreView';
import { SafeDataDeletionView } from './SafeDataDeletionView';
import { ActivityHistoryView } from './ActivityHistoryView';
import { AboutLegalView } from './AboutLegalView';
import {
  Settings,
  Terminal,
  Download,
  Copy,
  Check,
  Building2,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Ruler,
  DollarSign,
  Shield,
  Database,
  Trash2,
  History,
  Info
} from 'lucide-react';

interface FactorySettingsViewProps {
  currentConfig: FactoryConfig;
  onConfigUpdated: (newConfig: FactoryConfig) => void;
  onDownloadProjectZip: () => void;
  isGeneratingZip: boolean;
  onLockNow?: () => void;
  onDatabaseChanged?: () => void;
}

export type SettingsSection =
  | 'company'
  | 'financial'
  | 'engineering'
  | 'security'
  | 'backup'
  | 'deletion'
  | 'activity'
  | 'about'
  | 'termux';

export const FactorySettingsView: React.FC<FactorySettingsViewProps> = ({
  currentConfig,
  onConfigUpdated,
  onDownloadProjectZip,
  isGeneratingZip,
  onLockNow = () => {},
  onDatabaseChanged,
}) => {
  // Navigation tab within settings
  const [activeSection, setActiveSection] = useState<SettingsSection>('company');

  // 1. Company Profile Fields
  const [factoryName, setFactoryName] = useState(currentConfig.factoryName);
  const [tagline, setTagline] = useState(currentConfig.tagline || 'Design. Calculate. Manufacture.');
  const [address, setAddress] = useState(currentConfig.address || '');
  const [city, setCity] = useState(currentConfig.city || '');
  const [state, setState] = useState(currentConfig.state || '');
  const [pincode, setPincode] = useState(currentConfig.pincode || '');
  const [phone, setPhone] = useState(currentConfig.phone || '');
  const [email, setEmail] = useState(currentConfig.email || '');
  const [website, setWebsite] = useState(currentConfig.website || '');
  const [gstin, setGstin] = useState(currentConfig.gstin || '');
  const [pan, setPan] = useState(currentConfig.pan || '');

  // Bank details for quotations
  const [bankName, setBankName] = useState(currentConfig.bankDetails?.bankName || '');
  const [accountName, setAccountName] = useState(currentConfig.bankDetails?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(currentConfig.bankDetails?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(currentConfig.bankDetails?.ifscCode || '');
  const [branch, setBranch] = useState(currentConfig.bankDetails?.branch || '');

  // Signatory
  const [signatoryName, setSignatoryName] = useState(currentConfig.signatoryName || '');
  const [signatoryDesignation, setSignatoryDesignation] = useState(currentConfig.signatoryDesignation || 'Managing Director');

  // 2. Currency & Financial Defaults (defaults to ₹ Rupees)
  const [currencySymbol, setCurrencySymbol] = useState(currentConfig.currencySymbol || '₹');
  const [currencyCode, setCurrencyCode] = useState(currentConfig.currencyCode || 'INR');
  const [taxLabel, setTaxLabel] = useState(currentConfig.taxLabel || 'GST');
  const [defaultTaxPercent, setDefaultTaxPercent] = useState(currentConfig.defaultTaxPercent || '18');
  const [defaultDimensionUnit, setDefaultDimensionUnit] = useState<DimensionUnit>(
    currentConfig.defaultDimensionUnit || 'mm'
  );

  // 3. Plant Manufacturing Parameters
  const [jointAllowance, setJointAllowance] = useState(currentConfig.defaultJointAllowanceMm);
  const [creaseAllowance, setCreaseAllowance] = useState(currentConfig.defaultCreaseAllowanceMm);
  const [wastagePercent, setWastagePercent] = useState(currentConfig.defaultWastagePercent);
  const [corrugationRate, setCorrugationRate] = useState(currentConfig.defaultCorrugationRatePerKg);
  const [printingRate, setPrintingRate] = useState(currentConfig.defaultPrintingRatePerBox);
  const [stitchingRate, setStitchingRate] = useState(currentConfig.defaultStitchingRatePerBox);
  const [packingRate, setPackingRate] = useState(currentConfig.defaultPackingRatePerBox);
  const [overheadPercent, setOverheadPercent] = useState(currentConfig.defaultOverheadPercent);
  const [profitMargin, setProfitMargin] = useState(currentConfig.defaultProfitMarginPercent);

  // Flute draw take-up factors
  const [bFluteTakeUp, setBFluteTakeUp] = useState(currentConfig.fluteTakeUp.B.toString());
  const [cFluteTakeUp, setCFluteTakeUp] = useState(currentConfig.fluteTakeUp.C.toString());
  const [eFluteTakeUp, setEFluteTakeUp] = useState(currentConfig.fluteTakeUp.E.toString());

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: FactoryConfig = {
      factoryName: factoryName.trim() || 'CartonIQ Packaging Pvt Ltd',
      tagline: tagline.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim(),
      gstin: gstin.trim(),
      pan: pan.trim(),
      bankDetails: {
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim(),
        branch: branch.trim(),
      },
      signatoryName: signatoryName.trim(),
      signatoryDesignation: signatoryDesignation.trim(),
      currencySymbol: currencySymbol.trim() || '₹',
      currencyCode: currencyCode.trim() || 'INR',
      taxLabel: taxLabel.trim() || 'GST',
      defaultTaxPercent,
      defaultDimensionUnit,
      defaultJointAllowanceMm: jointAllowance,
      defaultCreaseAllowanceMm: creaseAllowance,
      defaultWastagePercent: wastagePercent,
      defaultCorrugationRatePerKg: corrugationRate,
      defaultPrintingRatePerBox: printingRate,
      defaultStitchingRatePerBox: stitchingRate,
      defaultPackingRatePerBox: packingRate,
      defaultOverheadPercent: overheadPercent,
      defaultProfitMarginPercent: profitMargin,
      fluteTakeUp: {
        B: parseFloat(bFluteTakeUp) || 1.35,
        C: parseFloat(cFluteTakeUp) || 1.43,
        E: parseFloat(eFluteTakeUp) || 1.27,
        AB: 1.40,
        BC: 1.39,
      },
    };

    saveFactoryConfig(updated);
    onConfigUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const setCurrencyPreset = (symbol: string, code: string, label: string) => {
    setCurrencySymbol(symbol);
    setCurrencyCode(code);
    setTaxLabel(label);
  };

  const termuxBuildScript = `#!/data/data/com.termux/files/usr/bin/bash
set -e
echo "🚀 Building CartonIQ Android APK inside Termux..."

# 1. Update Termux and install dependencies
pkg update -y
pkg install -y nodejs-lts openjdk-17 unzip zip termux-api

# 2. Extract downloaded project
# unzip ~/storage/downloads/termux-android-project.zip -d ~/projects/cartoniq
# cd ~/projects/cartoniq

# 3. Build web assets with relative base: "./"
npm install
npm run build

# 4. Sync assets into Capacitor Android project
npx cap sync android

# 5. Compile Android APK using Gradle (compileSdk 34, targetSdk 34, minSdk 24)
cd android
chmod +x gradlew
./gradlew assembleDebug

# 6. Trigger native package installation
echo "✅ Build complete! Launching package installer..."
termux-open app/build/outputs/apk/debug/app-debug.apk
`;

  const copyTermuxScript = () => {
    navigator.clipboard.writeText(termuxBuildScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const tabs: { id: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'financial', label: 'Currency & Units', icon: DollarSign },
    { id: 'engineering', label: 'Factory Rates', icon: Sliders },
    { id: 'security', label: 'App Lock & Security', icon: Shield },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
    { id: 'deletion', label: 'Safe Deletion', icon: Trash2 },
    { id: 'activity', label: 'Activity History', icon: History },
    { id: 'about', label: 'About & Legal', icon: Info },
    { id: 'termux', label: 'Termux Build', icon: Terminal },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Settings className="w-4 h-4" />
            <span>Plant Settings & Management Console</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure company legal details, security PIN, currency ({currencySymbol}), backups, audit history, and Termux APK tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 4: SECURITY & APP LOCK */}
      {activeSection === 'security' && (
        <SecuritySettings onLockNow={onLockNow} />
      )}

      {/* SECTION 5: BACKUP & RESTORE */}
      {activeSection === 'backup' && (
        <BackupRestoreView onDatabaseChanged={onDatabaseChanged} />
      )}

      {/* SECTION 6: SAFE DATA DELETION */}
      {activeSection === 'deletion' && (
        <SafeDataDeletionView onDataCleared={onDatabaseChanged} />
      )}

      {/* SECTION 7: ACTIVITY HISTORY */}
      {activeSection === 'activity' && (
        <ActivityHistoryView />
      )}

      {/* SECTION 8: ABOUT & LEGAL */}
      {activeSection === 'about' && (
        <AboutLegalView />
      )}


      {/* MAIN SETTINGS FORM (FOR COMPANY, FINANCIAL, ENGINEERING) */}
      {(activeSection === 'company' || activeSection === 'financial' || activeSection === 'engineering') && (
        <form onSubmit={handleSaveAll} className="space-y-4">
          {/* SECTION 1: COMPLETE COMPANY PROFILE */}
          {activeSection === 'company' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Complete Company / Factory Profile
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">Used in official quotations & PDFs</span>
              </div>

              {/* Legal Entity & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Company / Factory Name *</label>
                  <input
                    type="text"
                    value={factoryName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    placeholder="e.g. CartonIQ Packaging Pvt Ltd"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Design. Calculate. Manufacture."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Plant / Works Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Plot No., Industrial Area, Phase..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ahmedabad / Mumbai"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">State & PIN Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Gujarat"
                      className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="382445"
                      className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Registration IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@company.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="24AAAAA0000A1Z5"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="AAAAA0000A"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Official Bank Account for Invoicing & Quotes */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 pb-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Bank Account Details (Printed on Quotations & Proformas)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. CartonIQ Packaging Pvt Ltd"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="39482910392"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="SBIN0001842"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Branch Name</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Industrial Estate Branch"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Authorized Signatory</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={signatoryName}
                        onChange={(e) => setSignatoryName(e.target.value)}
                        placeholder="Name"
                        className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        value={signatoryDesignation}
                        onChange={(e) => setSignatoryDesignation(e.target.value)}
                        placeholder="Title"
                        className="w-1/2 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CURRENCY & UNITS */}
          {activeSection === 'financial' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Currency & Dimension Unit Settings
                  </h3>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">Currently: {currencySymbol} {currencyCode}</span>
              </div>

              {/* Quick Currency Presets */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Quick Currency Selection:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrencyPreset('₹', 'INR', 'GST')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      currencySymbol === '₹'
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg font-black text-amber-400 block">₹ INR</span>
                    <span className="text-[11px] text-white font-semibold">Indian Rupee</span>
                    <span className="text-[10px] text-slate-400 block">Default GST tax system</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrencyPreset('$', 'USD', 'Sales Tax')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      currencySymbol === '$'
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg font-black text-amber-400 block">$ USD</span>
                    <span className="text-[11px] text-white font-semibold">US Dollar</span>
                    <span className="text-[10px] text-slate-400 block">Standard Sales Tax</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrencyPreset('€', 'EUR', 'VAT')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      currencySymbol === '€'
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg font-black text-amber-400 block">€ EUR</span>
                    <span className="text-[11px] text-white font-semibold">Euro</span>
                    <span className="text-[10px] text-slate-400 block">European VAT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrencyPreset('£', 'GBP', 'VAT')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      currencySymbol === '£'
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400/50'
                        : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-lg font-black text-amber-400 block">£ GBP</span>
                    <span className="text-[11px] text-white font-semibold">British Pound</span>
                    <span className="text-[10px] text-slate-400 block">UK VAT</span>
                  </button>
                </div>
              </div>

              {/* Custom Currency & Tax Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="₹"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-400 focus:outline-none focus:border-amber-400 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tax Label</label>
                  <input
                    type="text"
                    value={taxLabel}
                    onChange={(e) => setTaxLabel(e.target.value)}
                    placeholder="GST"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <NumericInput
                    label="Default Tax Rate %"
                    value={defaultTaxPercent}
                    onChange={setDefaultTaxPercent}
                    suffix="%"
                    placeholder="18"
                  />
                </div>
              </div>

              {/* Default Dimension Unit Preference */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-amber-400" />
                  <span>Default Measurement Unit for Box Sizes:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mm', 'cm', 'inch'] as const).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setDefaultDimensionUnit(unit)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                        defaultDimensionUnit === unit
                          ? 'bg-amber-400 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {unit === 'inch' ? 'Inches (")' : unit === 'cm' ? 'Centimeters (cm)' : 'Millimeters (mm)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ENGINEERING PARAMETERS */}
          {activeSection === 'engineering' && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Factory Rates & Manufacturing Formulas
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">All conversion rates in {currencySymbol}</span>
              </div>

              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                  Flute Take-Up Factors (Paper Draw Ratios)
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <NumericInput
                    label="B-Flute Draw Factor"
                    value={bFluteTakeUp}
                    onChange={setBFluteTakeUp}
                    placeholder="1.35"
                    helper="1.32 - 1.36x take-up"
                  />
                  <NumericInput
                    label="C-Flute Draw Factor"
                    value={cFluteTakeUp}
                    onChange={setCFluteTakeUp}
                    placeholder="1.43"
                    helper="1.40 - 1.46x take-up"
                  />
                  <NumericInput
                    label="E-Flute Draw Factor"
                    value={eFluteTakeUp}
                    onChange={setEFluteTakeUp}
                    placeholder="1.27"
                    helper="1.25 - 1.29x take-up"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                  Manufacturing Allowances & Operations
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <NumericInput
                    label="Joint Allowance"
                    value={jointAllowance}
                    onChange={setJointAllowance}
                    suffix="mm"
                    placeholder="35"
                    helper="Manufacturer flap tab"
                  />
                  <NumericInput
                    label="Crease Allowance"
                    value={creaseAllowance}
                    onChange={setCreaseAllowance}
                    suffix="mm"
                    placeholder="5"
                  />
                  <NumericInput
                    label="Default Wastage"
                    value={wastagePercent}
                    onChange={setWastagePercent}
                    suffix="%"
                    placeholder="4"
                    helper="Trimming scrap %"
                  />
                  <NumericInput
                    label="Corrugation Cost"
                    value={corrugationRate}
                    onChange={setCorrugationRate}
                    prefix={currencySymbol}
                    suffix="/kg"
                    placeholder="6.50"
                    helper="Conversion rate"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                  <NumericInput
                    label="Printing Cost"
                    value={printingRate}
                    onChange={setPrintingRate}
                    prefix={currencySymbol}
                    suffix="/box"
                    placeholder="1.20"
                  />
                  <NumericInput
                    label="Stitching / Gluing"
                    value={stitchingRate}
                    onChange={setStitchingRate}
                    prefix={currencySymbol}
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
                    label="Target Profit Margin"
                    value={profitMargin}
                    onChange={setProfitMargin}
                    suffix="%"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PROMINENT SAVE BUTTON */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-amber-950 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Company Profile & Settings</span>
              </button>
              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  Profile & Settings Saved Successfully!
                </span>
              )}
            </div>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Persisted in safe namespaced local storage
            </span>
          </div>
        </form>
      )}
    </div>
  );
};
