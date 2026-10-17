import {
  CalculationInput,
  CalculationOutput,
  BoxStyle,
  FluteType,
  DimensionUnit
} from '../types';

/**
 * Standard Corrugated Packaging Manufacturing Calculations
 * Based on FEFCO standards, ASTM D685, and industrial box plant engineering.
 */

export interface SheetDimensionsResult {
  cutLengthMm: number;
  cutWidthMm: number;
  sheetAreaSqm: number;
  formulaNote: string;
}

/**
 * Convert any dimension unit (inch, cm, mm) to standard millimeters (mm).
 */
export function convertToMm(val: number, unit: DimensionUnit): number {
  if (unit === 'inch') return val * 25.4;
  if (unit === 'cm') return val * 10;
  return val;
}

/**
 * Convert millimeters (mm) to target unit (inch, cm, mm).
 */
export function convertFromMm(valMm: number, toUnit: DimensionUnit): number {
  if (toUnit === 'inch') return Number((valMm / 25.4).toFixed(2));
  if (toUnit === 'cm') return Number((valMm / 10).toFixed(2));
  return Math.round(valMm);
}

/**
 * Calculate the flat sheet corrugated board dimensions required before slotting/die-cutting.
 * Operates purely in millimeters.
 */
export function calculateSheetDimensions(
  style: BoxStyle,
  lengthMm: number,
  widthMm: number,
  heightMm: number,
  jointAllowanceMm: number,
  creaseAllowanceMm: number
): SheetDimensionsResult {
  let cutLengthMm = 0;
  let cutWidthMm = 0;
  let formulaNote = '';

  switch (style) {
    case 'RSC_0201':
      // Regular Slotted Carton (FEFCO 0201)
      // Cut Length = 2 * (L + W) + Manufacturer Stitching/Gluing Joint
      // Cut Width = W + H + Creasing allowance (Outer flaps meet in the center)
      cutLengthMm = 2 * (lengthMm + widthMm) + jointAllowanceMm;
      cutWidthMm = widthMm + heightMm + creaseAllowanceMm;
      formulaNote = 'FEFCO 0201 RSC: Cut Length = 2(L + W) + Joint; Cut Width = W + H';
      break;

    case 'FOL':
      // Full Overlap Slotted Carton (Flaps overlap completely = full width)
      cutLengthMm = 2 * (lengthMm + widthMm) + jointAllowanceMm;
      cutWidthMm = 2 * widthMm + heightMm + creaseAllowanceMm;
      formulaNote = 'FOL: Cut Length = 2(L + W) + Joint; Cut Width = 2W + H (Full overlap)';
      break;

    case 'DIE_CUT':
      // Mailer / Roll End Tuck Top (RETT) die-cut blank
      cutLengthMm = 2 * lengthMm + 2 * heightMm + 35;
      cutWidthMm = widthMm + 3 * heightMm + 40;
      formulaNote = 'Die-Cut Mailer Blank: Length ≈ 2L + 2H + 35mm; Width ≈ W + 3H + 40mm';
      break;

    case 'TRAY_LID':
      // Tray blank: base + 4 sidewalls
      cutLengthMm = lengthMm + 2 * heightMm + 10;
      cutWidthMm = widthMm + 2 * heightMm + 10;
      formulaNote = 'Tray: Cut Length = L + 2H + 10mm; Cut Width = W + 2H + 10mm';
      break;
  }

  const sheetAreaSqm = (cutLengthMm / 1000) * (cutWidthMm / 1000);

  return {
    cutLengthMm: Math.round(cutLengthMm),
    cutWidthMm: Math.round(cutWidthMm),
    sheetAreaSqm: Number(sheetAreaSqm.toFixed(4)),
    formulaNote,
  };
}

/**
 * Executes full manufacturing cost, paper weight, and price calculation.
 * Accurately accepts dimensions in inch, cm, or mm.
 */
export function calculateBoxManufacturing(input: CalculationInput): CalculationOutput | null {
  const rawL = parseFloat(input.dimensions.length);
  const rawW = parseFloat(input.dimensions.width);
  const rawH = parseFloat(input.dimensions.height);
  const unit = input.dimensions.unit || 'mm';

  if (isNaN(rawL) || isNaN(rawW) || isNaN(rawH) || rawL <= 0 || rawW <= 0 || rawH <= 0) {
    return null;
  }

  // Convert to millimeters for standard physical formulas
  const lMm = convertToMm(rawL, unit);
  const wMm = convertToMm(rawW, unit);
  const hMm = convertToMm(rawH, unit);

  // Format readable display
  let originalDimensionsDisplay = '';
  if (unit === 'inch') {
    originalDimensionsDisplay = `${rawL} × ${rawW} × ${rawH} inch (${Math.round(lMm)} × ${Math.round(wMm)} × ${Math.round(hMm)} mm)`;
  } else if (unit === 'cm') {
    originalDimensionsDisplay = `${rawL} × ${rawW} × ${rawH} cm (${Math.round(lMm)} × ${Math.round(wMm)} × ${Math.round(hMm)} mm)`;
  } else {
    const lIn = (lMm / 25.4).toFixed(1);
    const wIn = (wMm / 25.4).toFixed(1);
    const hIn = (hMm / 25.4).toFixed(1);
    originalDimensionsDisplay = `${rawL} × ${rawW} × ${rawH} mm (${lIn} × ${wIn} × ${hIn} inch)`;
  }

  const joint = parseFloat(input.jointAllowanceMm) || 35;
  const crease = parseFloat(input.creaseAllowanceMm) || 5;
  const wastageRatio = 1 + (parseFloat(input.wastagePercent) || 0) / 100;
  const corrugationRate = parseFloat(input.corrugationRatePerKg) || 0;
  const printingRate = parseFloat(input.printingRatePerBox) || 0;
  const stitchingRate = parseFloat(input.stitchingRatePerBox) || 0;
  const packingRate = parseFloat(input.packingRatePerBox) || 0;
  const overheadPct = (parseFloat(input.overheadPercent) || 0) / 100;
  const profitMarginPct = (parseFloat(input.profitMarginPercent) || 0) / 100;
  const taxPct = (parseFloat(input.taxPercent) || 0) / 100;

  // 1. Calculate Sheet Dimensions in mm & Area in m²
  const sheet = calculateSheetDimensions(input.boxStyle, lMm, wMm, hMm, joint, crease);

  // 2. Calculate Effective Board GSM and Paper Cost
  let totalCalculatedGsm = 0;
  let paperCostPerBox = 0;

  for (const ply of input.plies) {
    const plyGsm = parseFloat(ply.gsm) || 0;
    const ratePerKg = parseFloat(ply.ratePerKg) || 0;
    const takeUp = ply.type === 'flute' ? (ply.fluteTakeUp || 1.35) : 1.0;

    const effectiveGsm = plyGsm * takeUp;
    totalCalculatedGsm += effectiveGsm;

    // Weight of this ply in kg for 1 box sheet (including manufacturing wastage ratio)
    const plyWeightKg = (sheet.sheetAreaSqm * effectiveGsm * wastageRatio) / 1000;
    const plyCost = plyWeightKg * ratePerKg;
    paperCostPerBox += plyCost;
  }

  // 3. Finished Box Weight (without wastage, actual net weight of finished carton)
  const netWeightGrams = sheet.sheetAreaSqm * totalCalculatedGsm;
  const weightKgWithWastage = (sheet.sheetAreaSqm * totalCalculatedGsm * wastageRatio) / 1000;

  // 4. Processing & Finishing Costs
  const conversionCostPerBox = weightKgWithWastage * corrugationRate;
  const finishingCostPerBox = stitchingRate + packingRate;
  const printingCostPerBox = printingRate;

  // 5. Overheads & Total Manufacturing Cost
  const directCost = paperCostPerBox + conversionCostPerBox + printingCostPerBox + finishingCostPerBox;
  const overheadCostPerBox = directCost * overheadPct;
  const totalManufacturingCostPerBox = directCost + overheadCostPerBox;

  // 6. Profit & Selling Price
  const profitPerBox = totalManufacturingCostPerBox * profitMarginPct;
  const suggestedSellingPricePerBox = totalManufacturingCostPerBox + profitPerBox;
  const sellingPriceWithTax = suggestedSellingPricePerBox * (1 + taxPct);

  // 7. Physical Properties Estimation
  // Estimated Bursting Strength (approx 10-14 BF for standard kraft/testliner combination)
  const estimatedBurstingStrength = Number((totalCalculatedGsm * 0.022).toFixed(2));
  // Edge Crush Test (ECT) estimation in kN/m
  const estimatedECT = Number((totalCalculatedGsm * 0.0075 + 1.2).toFixed(1));

  // 8. Quantity Tier Pricing Curves
  const defaultTiers = [500, 1000, 2500, 5000, 10000];
  const activeTiers = input.targetQuantities && input.targetQuantities.length > 0
    ? input.targetQuantities.map(q => parseInt(q, 10)).filter(q => !isNaN(q) && q > 0)
    : defaultTiers;

  const quantityTiers = activeTiers.map((qty) => {
    let discount = 0;
    if (qty >= 10000) discount = 0.12;
    else if (qty >= 5000) discount = 0.09;
    else if (qty >= 2500) discount = 0.06;
    else if (qty >= 1000) discount = 0.03;
    else discount = 0;

    const unitPrice = Number((suggestedSellingPricePerBox * (1 - discount)).toFixed(2));
    const totalAmount = Number((unitPrice * qty).toFixed(2));

    return {
      quantity: qty,
      unitPrice,
      totalAmount,
      discountPercent: discount * 100,
    };
  });

  return {
    dimensionsInMm: {
      l: Math.round(lMm),
      w: Math.round(wMm),
      h: Math.round(hMm),
    },
    originalDimensionsDisplay,
    sheetDeckleMm: sheet.cutWidthMm,
    sheetCutLengthMm: sheet.cutLengthMm,
    sheetAreaSqm: sheet.sheetAreaSqm,
    totalGsmCalculated: Math.round(totalCalculatedGsm),
    boxWeightGrams: Math.round(netWeightGrams),
    estimatedBurstingStrength,
    estimatedECT,
    paperCostPerBox: Number(paperCostPerBox.toFixed(2)),
    conversionCostPerBox: Number(conversionCostPerBox.toFixed(2)),
    printingCostPerBox: Number(printingCostPerBox.toFixed(2)),
    finishingCostPerBox: Number(finishingCostPerBox.toFixed(2)),
    overheadCostPerBox: Number(overheadCostPerBox.toFixed(2)),
    totalManufacturingCostPerBox: Number(totalManufacturingCostPerBox.toFixed(2)),
    suggestedSellingPricePerBox: Number(suggestedSellingPricePerBox.toFixed(2)),
    profitPerBox: Number(profitPerBox.toFixed(2)),
    sellingPriceWithTax: Number(sellingPriceWithTax.toFixed(2)),
    quantityTiers,
  };
}

/**
 * Standard default plies for 3-Ply, 5-Ply, and 7-Ply corrugated boards.
 */
export function getDefaultPlies(
  plyCount: 3 | 5 | 7,
  fluteType: FluteType,
  fluteTakeUpFactors: { B: number; C: number; E: number },
  currencySymbol: string = '₹'
): CalculationInput['plies'] {
  const takeUp = fluteType === 'C' ? fluteTakeUpFactors.C : fluteTakeUpFactors.B;
  const isRupee = currencySymbol === '₹';

  // Realistic paper rates in Rupees (₹/kg) or dollars ($/kg)
  const linerRate = isRupee ? '42.00' : '0.65';
  const fluteRate = isRupee ? '35.00' : '0.55';
  const innerRate = isRupee ? '38.00' : '0.60';
  const heavyLinerRate = isRupee ? '46.00' : '0.72';

  if (plyCount === 3) {
    return [
      { name: 'Top Outer Liner', type: 'liner', gsm: '140', ratePerKg: linerRate },
      { name: `Fluting Medium (${fluteType})`, type: 'flute', gsm: '120', ratePerKg: fluteRate, fluteTakeUp: takeUp },
      { name: 'Bottom Inner Liner', type: 'liner', gsm: '140', ratePerKg: innerRate },
    ];
  }

  if (plyCount === 5) {
    return [
      { name: 'Top Outer Liner', type: 'liner', gsm: '180', ratePerKg: linerRate },
      { name: 'Fluting 1 (Outer Flute)', type: 'flute', gsm: '130', ratePerKg: fluteRate, fluteTakeUp: fluteTakeUpFactors.B },
      { name: 'Center Partition Liner', type: 'liner', gsm: '140', ratePerKg: innerRate },
      { name: 'Fluting 2 (Inner Flute)', type: 'flute', gsm: '130', ratePerKg: fluteRate, fluteTakeUp: fluteTakeUpFactors.C },
      { name: 'Bottom Inner Liner', type: 'liner', gsm: '150', ratePerKg: innerRate },
    ];
  }

  // 7-Ply Heavy Duty
  return [
    { name: 'Top Heavy Liner', type: 'liner', gsm: '220', ratePerKg: heavyLinerRate },
    { name: 'Fluting 1 (B-Flute)', type: 'flute', gsm: '140', ratePerKg: fluteRate, fluteTakeUp: fluteTakeUpFactors.B },
    { name: 'Mid Liner 1', type: 'liner', gsm: '150', ratePerKg: innerRate },
    { name: 'Fluting 2 (C-Flute)', type: 'flute', gsm: '140', ratePerKg: fluteRate, fluteTakeUp: fluteTakeUpFactors.C },
    { name: 'Mid Liner 2', type: 'liner', gsm: '150', ratePerKg: innerRate },
    { name: 'Fluting 3 (B-Flute)', type: 'flute', gsm: '140', ratePerKg: fluteRate, fluteTakeUp: fluteTakeUpFactors.B },
    { name: 'Bottom Heavy Liner', type: 'liner', gsm: '200', ratePerKg: heavyLinerRate },
  ];
}
