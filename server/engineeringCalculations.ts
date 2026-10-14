/**
 * Petroleum Drilling Engineering Calculations
 * Industry standard formulas for bit selection, optimization, and dull grading analysis.
 */

export interface CpfCalculationInput {
  bitCostUsd: number;
  rigSpreadRatePerHour: number; // e.g. $12,500/hr ($300k/day)
  rotatingHours: number;
  tripHours: number;
  connectionHours: number;
  footageDrilledFt: number;
}

export interface CpfCalculationResult {
  costPerFoot: number;
  totalRunCost: number;
  rotatingCost: number;
  tripCost: number;
  breakEvenRopFtPerHour: number;
  averageRopFtPerHour: number;
}

/**
 * Standard SPE Cost-Per-Foot formula:
 * CPF = (C_b + C_r * (t_b + t_t + t_c)) / Delta_D
 */
export function calculateCostPerFoot(input: CpfCalculationInput): CpfCalculationResult {
  const { bitCostUsd, rigSpreadRatePerHour, rotatingHours, tripHours, connectionHours, footageDrilledFt } = input;
  
  if (footageDrilledFt <= 0) {
    return {
      costPerFoot: 0,
      totalRunCost: 0,
      rotatingCost: 0,
      tripCost: 0,
      breakEvenRopFtPerHour: 0,
      averageRopFtPerHour: 0
    };
  }

  const totalRigHours = rotatingHours + tripHours + connectionHours;
  const rigOperatingCost = totalRigHours * rigSpreadRatePerHour;
  const totalRunCost = bitCostUsd + rigOperatingCost;
  const costPerFoot = totalRunCost / footageDrilledFt;

  const rotatingCost = rotatingHours * rigSpreadRatePerHour;
  const tripCost = (tripHours + connectionHours) * rigSpreadRatePerHour;
  const averageRop = rotatingHours > 0 ? footageDrilledFt / rotatingHours : 0;

  // Break-even ROP compared to continuing drilling vs pulling bit
  const breakEvenRop = rotatingHours > 0 ? (rigSpreadRatePerHour * footageDrilledFt) / totalRunCost : 0;

  return {
    costPerFoot: Math.round(costPerFoot * 100) / 100,
    totalRunCost: Math.round(totalRunCost),
    rotatingCost: Math.round(rotatingCost),
    tripCost: Math.round(tripCost),
    breakEvenRopFtPerHour: Math.round(breakEvenRop * 10) / 10,
    averageRopFtPerHour: Math.round(averageRop * 10) / 10
  };
}

export interface HydraulicsInput {
  flowRateGpm: number;
  mudWeightPpg: number;
  bitDiameterInch: number;
  nozzleSizes32nds: number[]; // e.g. [12, 12, 12, 14, 14, 14] in 1/32"
}

export interface HydraulicsResult {
  totalFlowAreaSqIn: number;
  nozzleVelocityFtPerSec: number;
  bitPressureDropPsi: number;
  hydraulicHorsepowerHhp: number;
  hydraulicHorsepowerPerSqInHsi: number;
  jetImpactForceLbf: number;
  optimumStatus: 'SUB_OPTIMAL' | 'ACCEPTABLE' | 'OPTIMUM' | 'EXCESSIVE_EROSION';
}

/**
 * Drill bit hydraulics:
 * TFA = sum(d_i^2) / 1303.8 (where d_i is nozzle size in 32nds) or sum(pi*(D_nozzle/2)^2)
 * Vn = (0.32086 * Q) / TFA
 * Delta_Pb = (MW * Q^2) / (10858 * TFA^2)  [using Cd = 0.95]
 * HHP = (Delta_Pb * Q) / 1714
 * HSI = HHP / (pi * (Db/2)^2) = HHP / Bit_Area
 * JIF = 0.000516 * MW * Q * Vn
 */
export function calculateHydraulics(input: HydraulicsInput): HydraulicsResult {
  const { flowRateGpm, mudWeightPpg, bitDiameterInch, nozzleSizes32nds } = input;

  // TFA calculation from 32nds of an inch
  // 1/32 inch diameter -> Area = pi * (d/32 / 2)^2 = (pi / 4096) * d^2 = d^2 / 1303.797
  const sumDsquared = nozzleSizes32nds.reduce((acc, curr) => acc + curr * curr, 0);
  const tfa = sumDsquared / 1303.8;

  if (tfa <= 0 || flowRateGpm <= 0) {
    return {
      totalFlowAreaSqIn: 0,
      nozzleVelocityFtPerSec: 0,
      bitPressureDropPsi: 0,
      hydraulicHorsepowerHhp: 0,
      hydraulicHorsepowerPerSqInHsi: 0,
      jetImpactForceLbf: 0,
      optimumStatus: 'SUB_OPTIMAL'
    };
  }

  const nozzleVelocity = (0.32086 * flowRateGpm) / tfa;
  const bitPressureDrop = (mudWeightPpg * Math.pow(flowRateGpm, 2)) / (10858 * Math.pow(tfa, 2));
  const hhp = (bitPressureDrop * flowRateGpm) / 1714;
  const bitArea = Math.PI * Math.pow(bitDiameterInch / 2, 2);
  const hsi = bitArea > 0 ? hhp / bitArea : 0;
  const jetImpactForce = 0.000516 * mudWeightPpg * flowRateGpm * nozzleVelocity;

  let optimumStatus: HydraulicsResult['optimumStatus'] = 'ACCEPTABLE';
  if (hsi < 2.0) {
    optimumStatus = 'SUB_OPTIMAL'; // insufficient cleaning, risk of bit balling
  } else if (hsi >= 2.5 && hsi <= 5.5) {
    optimumStatus = 'OPTIMUM'; // recommended target for most PDC operations
  } else if (hsi > 7.0 || nozzleVelocity > 450) {
    optimumStatus = 'EXCESSIVE_EROSION'; // erosion of bit body & cutter pocket washouts
  }

  return {
    totalFlowAreaSqIn: Math.round(tfa * 1000) / 1000,
    nozzleVelocityFtPerSec: Math.round(nozzleVelocity),
    bitPressureDropPsi: Math.round(bitPressureDrop),
    hydraulicHorsepowerHhp: Math.round(hhp * 10) / 10,
    hydraulicHorsepowerPerSqInHsi: Math.round(hsi * 100) / 100,
    jetImpactForceLbf: Math.round(jetImpactForce),
    optimumStatus
  };
}

export interface MseInput {
  wobKlbf: number;
  torqueFtLbs: number;
  rpm: number;
  ropFtPerHour: number;
  bitDiameterInch: number;
  ucsMpa?: number;
}

export interface MseResult {
  mechanicalSpecificEnergyPsi: number;
  drillingEfficiencyPct: number;
  vibrationDiagnosis: 'EFFICIENT' | 'STICK_SLIP_RISK' | 'WHIRL_OR_CHIP' | 'BIT_BALLING_DETECTED';
  diagnosticExplanation: string;
}

/**
 * Teale (1965) Mechanical Specific Energy:
 * MSE = (WOB / Ab) + (120 * pi * RPM * Torque) / (Ab * ROP)
 * where WOB is in lbs, Ab in sq in, Torque in ft-lbs, ROP in ft/hr.
 */
export function calculateMse(input: MseInput): MseResult {
  const { wobKlbf, torqueFtLbs, rpm, ropFtPerHour, bitDiameterInch, ucsMpa = 50 } = input;
  const bitArea = Math.PI * Math.pow(bitDiameterInch / 2, 2);

  if (bitArea <= 0 || ropFtPerHour <= 0) {
    return {
      mechanicalSpecificEnergyPsi: 0,
      drillingEfficiencyPct: 0,
      vibrationDiagnosis: 'EFFICIENT',
      diagnosticExplanation: 'Waiting for active rotating parameters.'
    };
  }

  const wobLbs = wobKlbf * 1000;
  const axialComponent = wobLbs / bitArea;
  const rotaryComponent = (120 * Math.PI * rpm * torqueFtLbs) / (bitArea * ropFtPerHour);
  const totalMsePsi = axialComponent + rotaryComponent;

  // Convert UCS from MPa to psi: 1 MPa = 145.038 psi
  const ucsPsi = ucsMpa * 145.038;
  const efficiency = Math.min(100, Math.max(5, (ucsPsi / totalMsePsi) * 100));

  let diagnosis: MseResult['vibrationDiagnosis'] = 'EFFICIENT';
  let explanation = 'Drilling mechanics within optimal rock destruction energy boundary.';

  if (efficiency < 25) {
    if (torqueFtLbs > 8000 && rpm < 110) {
      diagnosis = 'STICK_SLIP_RISK';
      explanation = 'High torque fluctuations with elevated rotary MSE indicate severe stick-slip torsional oscillation. Increase RPM by 15-20% and moderate WOB.';
    } else if (ropFtPerHour < 20 && wobKlbf > 25) {
      diagnosis = 'BIT_BALLING_DETECTED';
      explanation = 'Elevated MSE with suppressed ROP despite adequate WOB indicates shale cuttings sticking to bit face (bit balling). Increase pump flow rate and verify nozzle HSI.';
    } else {
      diagnosis = 'WHIRL_OR_CHIP';
      explanation = 'Energy dissipation exceeds rock compressive strength by >4x. Cutter impact micro-chipping or lateral backward whirl suspected. Check stabilizer clearance.';
    }
  }

  return {
    mechanicalSpecificEnergyPsi: Math.round(totalMsePsi),
    drillingEfficiencyPct: Math.round(efficiency * 10) / 10,
    vibrationDiagnosis: diagnosis,
    diagnosticExplanation: explanation
  };
}

export interface IadcDullGradingInput {
  innerCutters: number; // 0 to 8
  outerCutters: number; // 0 to 8
  dullCharPrimary: string; // e.g., 'BT', 'CT', 'ER', 'JD', 'NO', 'RO', 'WT'
  location: string; // 'N' (Nose), 'M' (Middle), 'G' (Gauge), 'S' (Shoulder), 'C' (Cone), 'A' (All)
  bearingSeals: string; // 'X' (Fixed cutter), 'E' (Seals effective), 'F' (Seals failed), 1-8 (wear)
  gaugeIn16ths: number; // 0 = In gauge, 1 = 1/16" under, etc.
  otherDullChar: string; // secondary dull characteristic
  reasonPulled: string; // 'TD', 'PR', 'BHA', 'HR', 'DP', 'CM'
}

export interface DullGradingAnalysis {
  codeString: string;
  severityLevel: 'MILD' | 'MODERATE' | 'SEVERE' | 'TERMINAL';
  wearMechanism: string;
  rootCause: string;
  recommendedMitigation: string;
  nextBitModification: string;
}

export function analyzeIadcDullGrade(input: IadcDullGradingInput): DullGradingAnalysis {
  const {
    innerCutters,
    outerCutters,
    dullCharPrimary,
    location,
    bearingSeals,
    gaugeIn16ths,
    otherDullChar,
    reasonPulled
  } = input;

  const gaugeStr = gaugeIn16ths === 0 ? 'I' : `${gaugeIn16ths}/16`;
  const codeString = `${innerCutters}-${outerCutters}-${dullCharPrimary}-${location}-${bearingSeals}-${gaugeStr}-${otherDullChar || 'NO'}-${reasonPulled}`;

  const avgWear = (innerCutters + outerCutters) / 2;
  let severity: DullGradingAnalysis['severityLevel'] = 'MILD';
  if (avgWear >= 6 || dullCharPrimary === 'RO' || dullCharPrimary === 'LT') {
    severity = 'TERMINAL';
  } else if (avgWear >= 4 || dullCharPrimary === 'BT' || gaugeIn16ths >= 3) {
    severity = 'SEVERE';
  } else if (avgWear >= 2 || dullCharPrimary === 'CT' || dullCharPrimary === 'ER') {
    severity = 'MODERATE';
  }

  let wearMechanism = 'Normal abrasive cutter wear flat generation';
  let rootCause = 'Standard cyclic fatigue and abrasive friction with formation matrix';
  let mitigation = 'Maintain optimized parameters and monitor dull flats periodically';
  let nextBitModification = 'Retain existing bit design with similar cutter grade';

  switch (dullCharPrimary) {
    case 'BT': // Broken Teeth / Cutters
      wearMechanism = 'High impact dynamic shock loading';
      rootCause = 'Interbedded hard stringers or lateral vibration (drill bit whirl) causing shock fracture of diamond table';
      mitigation = 'Reduce RPM when tagging stringers, increase WOB cautiously to anchor bit, and engage Depth of Cut Control (DOCC)';
      nextBitModification = 'Select cutter structure with enhanced impact toughness and secondary backup cutters';
      break;
    case 'CT': // Chipped Teeth
      wearMechanism = 'Moderate cyclic impact and thermal stress micro-fracturing';
      rootCause = 'Hard chert/pyrite inclusions or excessive rotary speed inducing cutter tip temperature spikes >750°C';
      mitigation = 'Limit maximum RPM to 120, verify mud lubrication, and monitor MSE trends';
      nextBitModification = 'Use chamfered dual-radius diamond cutters with thermally stable polycrystalline diamond (TSP)';
      break;
    case 'ER': // Erosion
      wearMechanism = 'Fluid abrasive cavitation and cuttings sandblasting';
      rootCause = 'Excessive nozzle velocity (>450 ft/s) or high solids percentage in drilling mud recirculating through junk slots';
      mitigation = 'Upsize nozzles to reduce pressure drop while maintaining HSI between 3.0-4.5; clean mud shaker screens';
      nextBitModification = 'Switch from steel body to infiltrated Tungsten Carbide Matrix body (Unicron UniMatrix) with erosion sleeves';
      break;
    case 'RO': // Ring Out
      wearMechanism = 'Catastrophic concentric cutter destruction';
      rootCause = 'Severe bit whirl or junk in hole creating stress concentration along a single radial track';
      mitigation = 'Run junk basket / magnet run prior to tripping bit; use spiral blade gauge pads to stabilize radial whirl';
      nextBitModification = 'Utilize continuous spiral blade geometry with tracking cutters and active depth-of-cut limiters';
      break;
    case 'WT': // Worn Teeth / Normal Wear
      wearMechanism = 'Thermal mechanical abrasion';
      rootCause = 'Natural wear progression over prolonged rotating hours in abrasive sandstone';
      mitigation = 'Monitor ROP decline curve to pull at economic break-even before gauge damage occurs';
      nextBitModification = 'Upgrade to premium polished diamond table cutters with high abrasion index';
      break;
    case 'JD': // Junk Damage
      wearMechanism = 'External steel impact damage';
      rootCause = 'Dropped metallic object, tong dies, or reamer cutter fragments in wellbore';
      mitigation = 'Perform full hole cleanup with reverse circulation junk sub before running new bit';
      nextBitModification = 'Steel body rebuild or replacement; inspect BHA stabilizers for missing hardfacing';
      break;
  }

  return {
    codeString,
    severityLevel: severity,
    wearMechanism,
    rootCause,
    recommendedMitigation: mitigation,
    nextBitModification
  };
}
