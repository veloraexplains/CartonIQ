import React, { useState, useEffect } from 'react';
import {
  FactoryConfig,
  BoxStyle,
  Customer,
  ProductionOrder,
  AppLockConfig
} from './types';
import {
  getFactoryConfig,
  getAppLockConfig,
  saveAppLockConfig,
  logActivity
} from './utils/storage';
import { SmartCalculator } from './components/calculator/SmartCalculator';
import { BoxDesigner } from './components/designer/BoxDesigner';
import { CustomerCRM } from './components/crm/CustomerCRM';
import { QuotationManager } from './components/quotations/QuotationManager';
import { OrderTracker } from './components/orders/OrderTracker';
import { InventoryManager } from './components/inventory/InventoryManager';
import { ReportsView } from './components/reports/ReportsView';
import { FactorySettingsView } from './components/settings/FactorySettingsView';
import { AppLockScreen } from './components/security/AppLockScreen';
import { EngineeringSuite } from './components/engineering/EngineeringSuite';
import {
  Calculator,
  Box,
  Users,
  FileText,
  PackageCheck,
  Boxes,
  BarChart3,
  Settings,
  Download,
  Smartphone,
  Layers,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Lock,
  ShieldCheck,
  Cpu
} from 'lucide-react';

type ActiveNavTab =
  | 'calculator'
  | 'designer'
  | 'engineering'
  | 'crm'
  | 'quotations'
  | 'orders'
  | 'inventory'
  | 'reports'
  | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('calculator');
  const [factoryConfig, setFactoryConfig] = useState<FactoryConfig>(getFactoryConfig());
  const [appLockConfig, setAppLockConfig] = useState<AppLockConfig>(getAppLockConfig());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initial App Lock verification
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const cfg = getAppLockConfig();
    if (!cfg.isEnabled || !cfg.pin) return false;
    if (cfg.autoLockMinutes === 0) return true; // Immediate lock
    if (cfg.autoLockMinutes === -1) return false; // Manual lock only
    const idleMs = Date.now() - (cfg.lastUnlockedAt || 0);
    return idleMs > cfg.autoLockMinutes * 60 * 1000;
  });

  // Cross-module state flow
  // 1. Calculator -> Quotation transfer
  const [preloadedQuoteItem, setPreloadedQuoteItem] = useState<{
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
  } | null>(null);

  // 2. Calculator -> 3D Designer transfer
  const [designerInitialDims, setDesignerInitialDims] = useState<{
    l: string;
    w: string;
    h: string;
    style: BoxStyle;
    unit?: import('./types').DimensionUnit;
  } | undefined>(undefined);

  // ZIP Generation state
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  // Periodic Inactivity Checker for Auto-Lock
  useEffect(() => {
    if (!appLockConfig.isEnabled || !appLockConfig.pin || isAppLocked) return;
    if (appLockConfig.autoLockMinutes <= 0) return;

    const interval = setInterval(() => {
      const currentCfg = getAppLockConfig();
      if (!currentCfg.isEnabled || !currentCfg.pin) return;
      if (currentCfg.autoLockMinutes > 0 && currentCfg.lastUnlockedAt) {
        const elapsedMs = Date.now() - currentCfg.lastUnlockedAt;
        if (elapsedMs > currentCfg.autoLockMinutes * 60 * 1000) {
          setIsAppLocked(true);
          logActivity('Auto-Locked by Inactivity Timer', 'security', `Screen locked after ${currentCfg.autoLockMinutes} min idle`);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [appLockConfig, isAppLocked]);

  const handleUnlocked = () => {
    const updated: AppLockConfig = {
      ...appLockConfig,
      lastUnlockedAt: Date.now(),
    };
    saveAppLockConfig(updated);
    setAppLockConfig(updated);
    setIsAppLocked(false);
    logActivity('App Unlocked', 'security', 'User authenticated with PIN');
  };

  const handleResetPinWithRecovery = (newPin: string) => {
    const updated: AppLockConfig = {
      ...appLockConfig,
      pin: newPin,
      lastUnlockedAt: Date.now(),
    };
    saveAppLockConfig(updated);
    setAppLockConfig(updated);
    setIsAppLocked(false);
    logActivity('PIN Reset via Recovery', 'security', 'User reset PIN using security question');
  };

  const handleLockAppNow = () => {
    setIsAppLocked(true);
    logActivity('Manual App Lock', 'security', 'User locked screen manually');
  };

  const handleDatabaseChanged = () => {
    setFactoryConfig(getFactoryConfig());
    setAppLockConfig(getAppLockConfig());
  };

  const handleTransferToQuotation = (spec: any) => {
    setPreloadedQuoteItem(spec);
    setActiveTab('quotations');
  };

  const handleOpenDesigner = (
    l: string,
    w: string,
    h: string,
    style: BoxStyle,
    unit: import('./types').DimensionUnit
  ) => {
    setDesignerInitialDims({ l, w, h, style, unit });
  useEffect(() => {
    // Disable the Android text selection (ghost handles) globally
    const disableSelection = () => {
      document.querySelectorAll('input').forEach(input => {
        input.setAttribute('style', 'user-select: none; -webkit-user-select: none;');
      });
    };
    
    // Run immediately and whenever the DOM changes
    disableSelection();
    const observer = new MutationObserver(disableSelection);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Force the cursor color on all input elements
    const style = document.createElement('style');
    style.innerHTML = `
      input[type="text" inputMode="decimal"], input[type="text"] {
        caret-color: #fbbf24 !important;
      }
      ::selection {
        background-color: #fbbf24 !important;
        color: #000000 !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

    setActiveTab('designer');
  };

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadProjectZip = async () => {
    setIsGeneratingZip(true);
    setDownloadNotice('Preparing CartonIQ project package...');
    try {
      // Fetch the binary zip directly through the active session
      const res = await fetch('./termux-android-project.zip', { cache: 'no-cache' });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const blob = await res.blob();
      
      // If the file is smaller than 50KB, it's the 10KB Google Cloud auth redirect HTML page
      if (blob.size < 50000) {
        alert(
          `Warning: Downloaded file is only ${(blob.size / 1024).toFixed(1)} KB (authentication redirect). Please make sure you are tapping this button directly inside the CartonIQ app preview!`
        );
        setDownloadNotice('Download intercepted by auth redirect. Please retry inside preview.');
        return;
      }

      // Create blob URL for genuine binary download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'CartonIQ-Termux-Android.zip';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup object URL
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }, 1000);

      const sizeKb = (blob.size / 1024).toFixed(1);
      setDownloadNotice(`✅ CartonIQ-Termux-Android.zip (${sizeKb} KB) downloaded to your phone!`);
      setTimeout(() => setDownloadNotice(null), 6000);
    } catch (err: any) {
      console.error('ZIP download error:', err);
      // Fallback direct navigation
      const link = document.createElement('a');
      link.href = './termux-android-project.zip';
      link.download = 'CartonIQ-Termux-Android.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadNotice('Triggered browser download.');
      setTimeout(() => setDownloadNotice(null), 4000);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const navItems: { id: ActiveNavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'designer', label: '3D Designer', icon: Box },
    { id: 'engineering', label: 'Plant Tools', icon: Cpu },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'orders', label: 'Orders', icon: PackageCheck },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* APP LOCK OVERLAY */}
      {isAppLocked && appLockConfig.isEnabled && (
        <AppLockScreen
          config={appLockConfig}
          onUnlocked={handleUnlocked}
          onResetPinWithRecovery={handleResetPinWithRecovery}
        />
      )}

      {/* Top Professional Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-slate-900/95 backdrop-blur-md px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('calculator')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-950 font-black text-lg">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">CartonIQ</span>
                <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded">
                  Suite
                </span>
                {appLockConfig.isEnabled && (
                  <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded hidden sm:inline-flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    Locked
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                Design • Calculate • Manufacture
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action: Lock Button, Download Project ZIP & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {appLockConfig.isEnabled && (
              <button
                onClick={handleLockAppNow}
                className="flex items-center gap-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-2.5 py-1.5 rounded-xl transition-all"
                title="Lock Application Now"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock</span>
              </button>
            )}


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 pt-2 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-left transition-all ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Download Status Toast Banner */}
      {downloadNotice && (
        <div className="bg-emerald-600/95 border-b border-emerald-500 text-white text-xs font-semibold py-2.5 px-4 text-center shadow-lg flex items-center justify-center gap-2 transition-all">
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Secondary Mobile Quick Bar for Fast Thumb Navigation */}
      <div className="lg:hidden sticky top-[57px] z-30 bg-slate-900/90 border-b border-slate-800/80 px-2 py-1.5 overflow-x-auto flex items-center gap-1.5 no-scrollbar text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg whitespace-nowrap text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-4 pb-20 sm:pb-8">
        {activeTab === 'calculator' && (
          <SmartCalculator
            factoryConfig={factoryConfig}
            onTransferToQuotation={handleTransferToQuotation}
            onOpenDesigner={handleOpenDesigner}
          />
        )}

        {activeTab === 'designer' && (
          <BoxDesigner
            initialDimensions={designerInitialDims}
            onTransferToCalculator={(l, w, h, style) => {
              setActiveTab('calculator');
            }}
          />
        )}

        {activeTab === 'engineering' && (
          <EngineeringSuite
            factoryConfig={factoryConfig}
            onSendToCalculator={(l, w, h) => {
              setDesignerInitialDims({ l, w, h, style: 'RSC_0201', unit: 'mm' });
              setActiveTab('calculator');
            }}
          />
        )}

        {activeTab === 'crm' && (
          <CustomerCRM
            onSelectCustomerForQuote={(customer) => {
              setActiveTab('quotations');
            }}
          />
        )}

        {activeTab === 'quotations' && (
          <QuotationManager
            factoryConfig={factoryConfig}
            preloadedItem={preloadedQuoteItem}
            onClearPreloaded={() => setPreloadedQuoteItem(null)}
          />
        )}

        {activeTab === 'orders' && <OrderTracker factoryConfig={factoryConfig} />}

        {activeTab === 'inventory' && <InventoryManager factoryConfig={factoryConfig} />}

        {activeTab === 'reports' && <ReportsView factoryConfig={factoryConfig} />}

        {activeTab === 'settings' && (
          <FactorySettingsView
            currentConfig={factoryConfig}
            onConfigUpdated={setFactoryConfig}
            onDownloadProjectZip={handleDownloadProjectZip}
            isGeneratingZip={isGeneratingZip}
            onLockNow={handleLockAppNow}
            onDatabaseChanged={handleDatabaseChanged}
          />
        )}
      </main>

      {/* Mobile Bottom Dock Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 border-t border-slate-800/90 py-1.5 px-3 lg:hidden backdrop-blur-md flex items-center justify-around">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
            activeTab === 'calculator' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Calc</span>
        </button>

        <button
          onClick={() => setActiveTab('designer')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
            activeTab === 'designer' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>3D Box</span>
        </button>

        <button
          onClick={() => setActiveTab('engineering')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
            activeTab === 'engineering' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
            activeTab === 'quotations' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quotes</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
            activeTab === 'orders' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Orders</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 p-1 text-[10px] ${
            activeTab === 'settings' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Plant</span>
        </button>
      </div>

      {/* Desktop Footer */}
      <footer className="hidden sm:block border-t border-slate-900 bg-slate-950 py-3 px-4 text-center text-xs text-slate-500">
        CartonIQ — Smart Packaging Business Suite • Termux Android APK Ready • compileSdk 34 • targetSdk 34 • minSdk 24 • 100% On-Device Privacy
      </footer>
    </div>
  );
}
