export type BoxStyle = 'RSC_0201' | 'FOL' | 'DIE_CUT' | 'TRAY_LID';
export type FluteType = 'B' | 'C' | 'E' | 'BC' | 'AB';
export type PlyCount = 3 | 5 | 7;
export type BoxColor = 'kraft_natural' | 'kraft_golden' | 'bleached_white' | 'duplex_white';
export type DimensionUnit = 'mm' | 'cm' | 'inch';

export interface PlyLayer {
  name: string;
  type: 'liner' | 'flute';
  gsm: string; // Stored as string for editable numeric input rule
  ratePerKg: string; // Stored as string
  fluteTakeUp?: number; // E.g. 1.35 for B, 1.43 for C
}

export interface BoxDimensions {
  length: string; // in user's selected unit
  width: string;
  height: string;
  unit: DimensionUnit;
}

export interface BoxArtwork {
  brandText: string;
  brandColor: string;
  showFragile: boolean;
  showThisWayUp: boolean;
  showKeepDry: boolean;
  showRecyclable: boolean;
  showBarcode: boolean;
}

export interface BoxDesign {
  id: string;
  name: string;
  style: BoxStyle;
  dimensions: BoxDimensions;
  plyCount: PlyCount;
  fluteType: FluteType;
  color: BoxColor;
  artwork: BoxArtwork;
  foldProgress: number; // 0 (open) to 1 (fully closed/taped)
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculationInput {
  dimensions: BoxDimensions;
  boxStyle: BoxStyle;
  plyCount: PlyCount;
  fluteType: FluteType;
  plies: PlyLayer[];
  jointAllowanceMm: string;
  creaseAllowanceMm: string;
  wastagePercent: string;
  corrugationRatePerKg: string;
  printingRatePerBox: string;
  stitchingRatePerBox: string;
  packingRatePerBox: string;
  overheadPercent: string;
  profitMarginPercent: string;
  taxPercent: string;
  targetQuantities: string[];
}

export interface CalculationOutput {
  dimensionsInMm: {
    l: number;
    w: number;
    h: number;
  };
  originalDimensionsDisplay: string;
  sheetDeckleMm: number;
  sheetCutLengthMm: number;
  sheetAreaSqm: number;
  totalGsmCalculated: number;
  boxWeightGrams: number;
  estimatedBurstingStrength: number;
  estimatedECT: number;
  
  // Cost breakdown
  paperCostPerBox: number;
  conversionCostPerBox: number;
  printingCostPerBox: number;
  finishingCostPerBox: number;
  overheadCostPerBox: number;
  totalManufacturingCostPerBox: number;
  
  // Commercial
  suggestedSellingPricePerBox: number;
  profitPerBox: number;
  sellingPriceWithTax: number;
  
  // Tiered Pricing
  quantityTiers: {
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    discountPercent: number;
  }[];
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  gstOrTaxId: string;
  paymentTerms: string;
  notes: string;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  boxName: string;
  boxStyle: BoxStyle;
  dimensionsMm: {
    l: number;
    w: number;
    h: number;
  };
  dimensionsDisplay: string;
  plyCount: PlyCount;
  fluteType: FluteType;
  boardDescription: string;
  estimatedWeightGrams: number;
  quantity: number; // Custom or tier quantity
  unitPrice: number; // Custom or tier unit price
  totalPrice: number; // quantity * unitPrice
  quantityTiers?: {
    qty: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  date: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  deliveryTerms: string;
  paymentTerms: string;
  notes: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
  createdAt: string;
}

export type ProductionStage =
  | 'Order_Confirmed'
  | 'Paper_Allocated'
  | 'Corrugation'
  | 'Printing_Slotting'
  | 'Stitching_Gluing'
  | 'Quality_Inspection'
  | 'Ready_For_Dispatch'
  | 'Dispatched';

export interface ProductionOrder {
  id: string;
  orderNumber: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  boxName: string;
  dimensionsSummary: string;
  quantityOrdered: number;
  unitPrice: number;
  totalAmount: number;
  advancePaid: number;
  balanceDue: number;
  paymentStatus: 'Pending' | 'Partial' | 'Paid';
  productionStage: ProductionStage;
  orderDate: string;
  targetDeliveryDate: string;
  actualDeliveryDate?: string;
  notes: string;
}

export interface PaperInventoryItem {
  id: string;
  gradeName: string;
  gsm: number;
  reelWidthMm: number;
  supplier: string;
  ratePerKg: number;
  stockKg: number;
  minStockAlertKg: number;
  lastRestockedDate: string;
}

export interface FactoryBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
}

export interface FactoryConfig {
  factoryName: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  bankDetails: FactoryBankDetails;
  signatoryName: string;
  signatoryDesignation: string;

  currencySymbol: string;
  currencyCode: string;
  taxLabel: string;
  defaultTaxPercent: string;
  defaultDimensionUnit: DimensionUnit;

  defaultJointAllowanceMm: string;
  defaultCreaseAllowanceMm: string;
  defaultWastagePercent: string;
  defaultCorrugationRatePerKg: string;
  defaultPrintingRatePerBox: string;
  defaultStitchingRatePerBox: string;
  defaultPackingRatePerBox: string;
  defaultOverheadPercent: string;
  defaultProfitMarginPercent: string;
  fluteTakeUp: {
    B: number;
    C: number;
    E: number;
    AB: number;
    BC: number;
  };
}

export type AuditCategory = 'quote' | 'order' | 'customer' | 'inventory' | 'security' | 'system' | 'backup';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: AuditCategory;
  details: string;
}

export interface AppLockConfig {
  isEnabled: boolean;
  pin: string; // 4 or 6 digits
  securityQuestion: string;
  securityAnswer: string;
  autoLockMinutes: number; // 0 = immediate, 1, 5, 15, or -1 (disabled)
  lastUnlockedAt: number;
}

