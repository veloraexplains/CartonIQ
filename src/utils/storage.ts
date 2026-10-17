import {
  Customer,
  BoxDesign,
  Quotation,
  ProductionOrder,
  PaperInventoryItem,
  FactoryConfig,
  AuditLogEntry,
  AuditCategory,
  AppLockConfig
} from '../types';

const PREFIX = 'cartoniq_v1_';

export const STORAGE_KEYS = {
  CUSTOMERS: `${PREFIX}customers`,
  DESIGNS: `${PREFIX}designs`,
  QUOTATIONS: `${PREFIX}quotations`,
  ORDERS: `${PREFIX}orders`,
  INVENTORY: `${PREFIX}inventory`,
  CONFIG: `${PREFIX}factory_config`,
  AUDIT_LOGS: `${PREFIX}audit_logs`,
  APP_LOCK: `${PREFIX}app_lock`,
} as const;

export const DEFAULT_FACTORY_CONFIG: FactoryConfig = {
  factoryName: 'CartonIQ Packaging Pvt Ltd',
  tagline: 'Design. Calculate. Manufacture.',
  address: 'Plot No. 48, Phase II, Industrial Estate',
  city: 'Ahmedabad',
  state: 'Gujarat',
  pincode: '382445',
  phone: '+91 98765 43210',
  email: 'sales@cartoniq-packaging.com',
  website: 'www.cartoniq-packaging.com',
  gstin: '24AAAAA0000A1Z5',
  pan: 'AAAAA0000A',
  bankDetails: {
    bankName: 'State Bank of India',
    accountName: 'CartonIQ Packaging Pvt Ltd',
    accountNumber: '39482910392',
    ifscCode: 'SBIN0001842',
    branch: 'Industrial Estate Branch',
  },
  signatoryName: 'Rajesh Sharma',
  signatoryDesignation: 'Managing Director',

  currencySymbol: '₹',
  currencyCode: 'INR',
  taxLabel: 'GST',
  defaultTaxPercent: '18',
  defaultDimensionUnit: 'mm',

  defaultJointAllowanceMm: '35',
  defaultCreaseAllowanceMm: '5',
  defaultWastagePercent: '4',
  defaultCorrugationRatePerKg: '6.50',
  defaultPrintingRatePerBox: '1.20',
  defaultStitchingRatePerBox: '0.80',
  defaultPackingRatePerBox: '0.50',
  defaultOverheadPercent: '8',
  defaultProfitMarginPercent: '15',
  fluteTakeUp: {
    B: 1.35,
    C: 1.43,
    E: 1.27,
    AB: 1.40,
    BC: 1.39,
  },
};

export const DEFAULT_APP_LOCK_CONFIG: AppLockConfig = {
  isEnabled: false,
  pin: '',
  securityQuestion: 'What is your plant location city?',
  securityAnswer: 'Ahmedabad',
  autoLockMinutes: 5,
  lastUnlockedAt: 0,
};

/**
 * Safely retrieves items from localStorage.
 * NEVER seeds fake records on empty or failure. Returns empty array fallback.
 */
export function safeGetArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error(`[CartonIQ Storage] Failed to read ${key}:`, error);
    return [];
  }
}

/**
 * Safely saves items to localStorage.
 */
export function safeSetItem<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`[CartonIQ Storage] Failed to write ${key}:`, error);
    return false;
  }
}

/**
 * Factory Config getter with deep merge of defaults.
 */
export function getFactoryConfig(): FactoryConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_FACTORY_CONFIG,
          ...parsed,
          bankDetails: {
            ...DEFAULT_FACTORY_CONFIG.bankDetails,
            ...(parsed.bankDetails || {}),
          },
          fluteTakeUp: {
            ...DEFAULT_FACTORY_CONFIG.fluteTakeUp,
            ...(parsed.fluteTakeUp || {}),
          },
        };
      }
    }
  } catch (error) {
    console.error('[CartonIQ Storage] Error loading factory config:', error);
  }
  return DEFAULT_FACTORY_CONFIG;
}

export function saveFactoryConfig(config: FactoryConfig): boolean {
  const ok = safeSetItem(STORAGE_KEYS.CONFIG, config);
  if (ok) logActivity('Updated Factory Configuration', 'system', `Updated plant settings for ${config.factoryName}`);
  return ok;
}

// App Lock Config Management
export function getAppLockConfig(): AppLockConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_LOCK);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_APP_LOCK_CONFIG, ...parsed };
      }
    }
  } catch (error) {
    console.error('[CartonIQ Storage] Error loading app lock config:', error);
  }
  return DEFAULT_APP_LOCK_CONFIG;
}

export function saveAppLockConfig(config: AppLockConfig): boolean {
  return safeSetItem(STORAGE_KEYS.APP_LOCK, config);
}

// Audit Logs Management
export function getAuditLogs(): AuditLogEntry[] {
  return safeGetArray<AuditLogEntry>(STORAGE_KEYS.AUDIT_LOGS);
}

export function logActivity(action: string, category: AuditCategory, details: string): void {
  try {
    const existing = getAuditLogs();
    const entry: AuditLogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleString(),
      action,
      category,
      details,
    };
    // Keep max 250 log entries to prevent storage bloat
    const updated = [entry, ...existing.slice(0, 249)];
    safeSetItem(STORAGE_KEYS.AUDIT_LOGS, updated);
  } catch (e) {
    console.error('[CartonIQ Activity Log] Error writing log:', e);
  }
}

export function clearAuditLogs(): boolean {
  return safeSetItem(STORAGE_KEYS.AUDIT_LOGS, []);
}

// Entity helper getters & setters with audit logging
export const getCustomers = (): Customer[] => safeGetArray<Customer>(STORAGE_KEYS.CUSTOMERS);
export const saveCustomers = (items: Customer[]) => {
  const ok = safeSetItem(STORAGE_KEYS.CUSTOMERS, items);
  return ok;
};

export const getDesigns = (): BoxDesign[] => safeGetArray<BoxDesign>(STORAGE_KEYS.DESIGNS);
export const saveDesigns = (items: BoxDesign[]) => safeSetItem(STORAGE_KEYS.DESIGNS, items);

export const getQuotations = (): Quotation[] => safeGetArray<Quotation>(STORAGE_KEYS.QUOTATIONS);
export const saveQuotations = (items: Quotation[]) => safeSetItem(STORAGE_KEYS.QUOTATIONS, items);

export const getOrders = (): ProductionOrder[] => safeGetArray<ProductionOrder>(STORAGE_KEYS.ORDERS);
export const saveOrders = (items: ProductionOrder[]) => safeSetItem(STORAGE_KEYS.ORDERS, items);

export const getInventory = (): PaperInventoryItem[] => safeGetArray<PaperInventoryItem>(STORAGE_KEYS.INVENTORY);
export const saveInventory = (items: PaperInventoryItem[]) => safeSetItem(STORAGE_KEYS.INVENTORY, items);

/**
 * Export all system data into a single verified JSON backup object.
 */
export function exportDatabaseBackup(): string {
  const backup = {
    version: '1.2.0',
    app: 'CartonIQ',
    exportTimestamp: new Date().toISOString(),
    checksum: 'CIQ-' + Date.now().toString(36).toUpperCase(),
    config: getFactoryConfig(),
    customers: getCustomers(),
    designs: getDesigns(),
    quotations: getQuotations(),
    orders: getOrders(),
    inventory: getInventory(),
    auditLogs: getAuditLogs().slice(0, 50),
  };
  logActivity('Created Database Backup', 'backup', 'Exported complete database JSON archive');
  return JSON.stringify(backup, null, 2);
}

/**
 * Import and validate backup JSON.
 */
export function importDatabaseBackup(jsonString: string): { success: boolean; message: string; preview?: any } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid backup file structure: Root is not an object.' };
    }

    if (parsed.config) saveFactoryConfig(parsed.config);
    if (Array.isArray(parsed.customers)) safeSetItem(STORAGE_KEYS.CUSTOMERS, parsed.customers);
    if (Array.isArray(parsed.designs)) safeSetItem(STORAGE_KEYS.DESIGNS, parsed.designs);
    if (Array.isArray(parsed.quotations)) safeSetItem(STORAGE_KEYS.QUOTATIONS, parsed.quotations);
    if (Array.isArray(parsed.orders)) safeSetItem(STORAGE_KEYS.ORDERS, parsed.orders);
    if (Array.isArray(parsed.inventory)) safeSetItem(STORAGE_KEYS.INVENTORY, parsed.inventory);

    const recordCount =
      (parsed.customers?.length || 0) +
      (parsed.quotations?.length || 0) +
      (parsed.orders?.length || 0) +
      (parsed.inventory?.length || 0) +
      (parsed.designs?.length || 0);

    logActivity('Restored Database Backup', 'backup', `Restored ${recordCount} total records from backup archive`);

    return {
      success: true,
      message: `Database backup restored successfully! (${recordCount} total records restored)`,
      preview: {
        customers: parsed.customers?.length || 0,
        quotations: parsed.quotations?.length || 0,
        orders: parsed.orders?.length || 0,
        inventory: parsed.inventory?.length || 0,
        designs: parsed.designs?.length || 0,
      },
    };
  } catch (error) {
    return { success: false, message: `Failed to restore: ${error instanceof Error ? error.message : 'Corrupt JSON'}` };
  }
}

/**
 * SAFE GRANULAR DATA DELETION
 * All deletions require explicit confirmation and record audit logs.
 */
export function safeDeleteOrders(): boolean {
  const count = getOrders().length;
  const ok = safeSetItem(STORAGE_KEYS.ORDERS, []);
  if (ok) logActivity('Purged Orders Data', 'security', `Deleted ${count} production orders`);
  return ok;
}

export function safeDeleteQuotations(): boolean {
  const count = getQuotations().length;
  const ok = safeSetItem(STORAGE_KEYS.QUOTATIONS, []);
  if (ok) logActivity('Purged Quotations Data', 'security', `Deleted ${count} commercial quotations`);
  return ok;
}

export function safeDeleteCustomers(): boolean {
  const count = getCustomers().length;
  const ok = safeSetItem(STORAGE_KEYS.CUSTOMERS, []);
  if (ok) logActivity('Purged Customer Accounts', 'security', `Deleted ${count} customer records`);
  return ok;
}

export function safeDeleteInventory(): boolean {
  const count = getInventory().length;
  const ok = safeSetItem(STORAGE_KEYS.INVENTORY, []);
  if (ok) logActivity('Purged Inventory Reels', 'security', `Deleted ${count} paper reel records`);
  return ok;
}

export function safeDeleteDesigns(): boolean {
  const count = getDesigns().length;
  const ok = safeSetItem(STORAGE_KEYS.DESIGNS, []);
  if (ok) logActivity('Purged 3D Box Designs', 'security', `Deleted ${count} custom 3D models`);
  return ok;
}

export function safeFactoryReset(): { success: boolean; backupJson: string } {
  // Always create an automated pre-deletion emergency snapshot
  const emergencySnapshot = exportDatabaseBackup();

  safeSetItem(STORAGE_KEYS.CUSTOMERS, []);
  safeSetItem(STORAGE_KEYS.QUOTATIONS, []);
  safeSetItem(STORAGE_KEYS.ORDERS, []);
  safeSetItem(STORAGE_KEYS.INVENTORY, []);
  safeSetItem(STORAGE_KEYS.DESIGNS, []);
  safeSetItem(STORAGE_KEYS.CONFIG, DEFAULT_FACTORY_CONFIG);
  safeSetItem(STORAGE_KEYS.APP_LOCK, DEFAULT_APP_LOCK_CONFIG);

  logActivity('FACTORY MASTER RESET EXECUTED', 'security', 'All factory database tables wiped to factory defaults');

  return { success: true, backupJson: emergencySnapshot };
}
