export interface DrillBit {
  id: string;
  model: string;
  manufacturer: string;
  type: 'PDC_STEEL' | 'PDC_MATRIX' | 'ROLLER_CONE_MILLED' | 'ROLLER_CONE_TCI' | 'STAGE_HOLE_OPENER';
  sizeInch: number;
  iadcCode: string;
  bladeCount?: number;
  cutterSizeMm?: number;
  bearingType?: 'SEALED_ROLLER' | 'SEALED_JOURNAL' | 'OPEN_BEARING' | 'NON_ROLLER';
  bodyMaterial: 'STEEL' | 'TUNGSTEN_CARBIDE_MATRIX' | 'FORGED_STEEL';
  hardfacingGrade: string;
  gaugeLengthInch: number;
  junkSlotAreaPct: number;
  nozzleCount: number;
  nozzleSizes32nds: number[];
  costUsd: number;
  idealFormations: string[];
  maxWobKlbf: number;
  recommendedWobKlbf: [number, number];
  recommendedRpm: [number, number];
  recommendedFlowGpm: [number, number];
  maxTorqueFtLbs: number;
  description: string;
  unicronCatalogRef: string;
  imageUrl?: string;
  image3dUrl?: string;
  isCustomUploaded?: boolean;
  uploadedAt?: string;
  sourceFileName?: string;
  allExtractedData?: { key: string; value: string; category?: string }[];
  rawAiSummary?: string;
}

export interface FormationPreset {
  id: string;
  name: string;
  basin: string;
  depthInterval: string;
  lithology: string;
  ucsRangeMpa: [number, number];
  abrasiveness: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  shalePlasticity: 'LOW' | 'MEDIUM' | 'HIGH' | 'GUMBO';
  interbedded: boolean;
  expectedChallenges: string[];
  recommendedBitTypes: string[];
}

export interface OperatingEnvelope {
  wobRangeKlbf: [number, number];
  rpmRange: [number, number];
  targetHsi: number;
  recommendedFlowGpm: [number, number];
  maxTorqueFtLbs: number;
}

export interface CpfResult {
  costPerFoot: number;
  totalRunCost: number;
  rotatingCost: number;
  tripCost: number;
  breakEvenRopFtPerHour: number;
  averageRopFtPerHour: number;
}

export interface AdvisoryRecommendation {
  primaryBit: DrillBit;
  contingencyBit: DrillBit;
  operatingEnvelope: OperatingEnvelope;
  aiRationale: string;
  drillingRisks: string[];
  engineeringAdvice: string;
  costAnalysis: CpfResult;
  sourceFileName?: string;
  extractedFileParameters?: { parameter: string; value: string; category?: string }[];
  fileSummary?: string;
}

export interface HydraulicsCalculation {
  totalFlowAreaSqIn: number;
  nozzleVelocityFtPerSec: number;
  bitPressureDropPsi: number;
  hydraulicHorsepowerHhp: number;
  hydraulicHorsepowerPerSqInHsi: number;
  jetImpactForceLbf: number;
  optimumStatus: 'SUB_OPTIMAL' | 'ACCEPTABLE' | 'OPTIMUM' | 'EXCESSIVE_EROSION';
}

export interface MseCalculation {
  mechanicalSpecificEnergyPsi: number;
  drillingEfficiencyPct: number;
  vibrationDiagnosis: 'EFFICIENT' | 'STICK_SLIP_RISK' | 'WHIRL_OR_CHIP' | 'BIT_BALLING_DETECTED';
  diagnosticExplanation: string;
}

export interface DullGradingResult {
  codeString: string;
  severityLevel: 'MILD' | 'MODERATE' | 'SEVERE' | 'TERMINAL';
  wearMechanism: string;
  rootCause: string;
  recommendedMitigation: string;
  nextBitModification: string;
}

export interface LaravelFileItem {
  path: string;
  category: 'Controller' | 'Service' | 'Model' | 'Migration' | 'Route' | 'Artisan' | 'Config';
  description: string;
  code: string;
}
