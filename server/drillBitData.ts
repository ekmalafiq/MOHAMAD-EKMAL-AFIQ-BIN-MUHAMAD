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
  connectionType?: string;
  cutterCountTotal?: number;
  faceProfile?: string;
  hydraulicsTfaSqIn?: number;
  serialNumber?: string;
}

export interface FormationPreset {
  id: string;
  name: string;
  basin: string;
  depthInterval: string;
  lithology: string;
  ucsRangeMpa: [number, number]; // Unconfined Compressive Strength
  abrasiveness: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  shalePlasticity: 'LOW' | 'MEDIUM' | 'HIGH' | 'GUMBO';
  interbedded: boolean;
  expectedChallenges: string[];
  recommendedBitTypes: string[];
}

export const DEFAULT_FALLBACK_BIT: DrillBit = {
  id: 'unicron-fallback',
  model: 'UniSpeed S519 Standard Steel PDC',
  manufacturer: 'Unicron Holdings',
  type: 'PDC_STEEL',
  sizeInch: 12.25,
  iadcCode: 'S333',
  bladeCount: 5,
  cutterSizeMm: 19,
  cutterCountTotal: 46,
  faceProfile: 'Aggressive Parabolic Cone',
  connectionType: '6-5/8" API Regular Pin',
  serialNumber: 'UCH-DEFAULT-01',
  hydraulicsTfaSqIn: 1.288,
  bearingType: 'NON_ROLLER',
  bodyMaterial: 'STEEL',
  hardfacingGrade: 'Carbide Matrix',
  gaugeLengthInch: 2.0,
  junkSlotAreaPct: 52,
  nozzleCount: 7,
  nozzleSizes32nds: [14, 14, 14, 16, 16, 16, 18],
  costUsd: 38000,
  idealFormations: ['Soft Sand', 'Claystone', 'Shallow Marine Clays'],
  maxWobKlbf: 30,
  recommendedWobKlbf: [12, 24],
  recommendedRpm: [110, 190],
  recommendedFlowGpm: [650, 900],
  maxTorqueFtLbs: 12000,
  description: 'Standard steel PDC tool assembly.',
  unicronCatalogRef: 'UCH-PDC-1225-S519'
};

// Cleared drill bit items from the catalog data/array
export const INITIAL_DRILL_BITS: DrillBit[] = [];

export const FORMATION_PRESETS: FormationPreset[] = [
  {
    id: 'malay-basin-baram',
    name: 'Baram Delta Formation (Offshore Sarawak / Sabah)',
    basin: 'Malay Basin / NW Borneo Shelf (Malaysia)',
    depthInterval: '1,500m - 2,800m TVD',
    lithology: 'Interbedded Sandstone, Siltstone & Reactive Marine Clays',
    ucsRangeMpa: [20, 65],
    abrasiveness: 'MEDIUM',
    shalePlasticity: 'HIGH',
    interbedded: true,
    expectedChallenges: ['Gumbo shale bit balling', 'Cutter micro-chipping in hard calcite stringers', 'Hydraulic flow stalling'],
    recommendedBitTypes: ['PDC_STEEL', 'PDC_MATRIX']
  },
  {
    id: 'pm3-carbonate-reef',
    name: 'Central Luconia Carbonate Reef (Offshore Terengganu / Sarawak)',
    basin: 'PM3 Commercial Arrangement Area & Sarawak Basin',
    depthInterval: '2,200m - 3,400m TVD',
    lithology: 'Dense Limestone, Dolomitic Carbonate & Chert Nodules',
    ucsRangeMpa: [80, 175],
    abrasiveness: 'HIGH',
    shalePlasticity: 'LOW',
    interbedded: true,
    expectedChallenges: ['Severe impact vibration', 'Torsional stick-slip', 'Thermal delamination of diamond table'],
    recommendedBitTypes: ['PDC_MATRIX', 'ROLLER_CONE_TCI']
  },
  {
    id: 'sabah-deepwater-kikeh',
    name: 'Deepwater Turbidite Channel Sand (Sabah Trough)',
    basin: 'NW Sabah Deepwater Block',
    depthInterval: '3,000m - 4,200m MD (High Angle / RSS)',
    lithology: 'Unconsolidated Fine Sands & Overpressured Mudstone',
    ucsRangeMpa: [15, 45],
    abrasiveness: 'LOW',
    shalePlasticity: 'MEDIUM',
    interbedded: false,
    expectedChallenges: ['Hole enlargement washouts', 'Directional steerability in rotary steerable systems (RSS)', 'High ROP cuttings evacuation'],
    recommendedBitTypes: ['PDC_STEEL']
  },
  {
    id: 'permian-wolfcamp',
    name: 'Wolfcamp Shale & Siltstone (Delaware Basin)',
    basin: 'Permian Basin, USA',
    depthInterval: '8,500ft - 11,200ft TVD (Lateral)',
    lithology: 'Siliceous Mudstone, Siltstone, Interbedded Calcite',
    ucsRangeMpa: [50, 110],
    abrasiveness: 'HIGH',
    shalePlasticity: 'LOW',
    interbedded: true,
    expectedChallenges: ['High lateral vibration', 'Abrasive cutter ring wear', 'High circulating temperatures'],
    recommendedBitTypes: ['PDC_MATRIX']
  }
];

// Initialize catalog fleet as empty array
export const DRILL_BITS_CATALOG: DrillBit[] = [...INITIAL_DRILL_BITS];

export function addBitToCatalog(bit: DrillBit): DrillBit {
  // Check if bit already exists by id
  const existingIdx = DRILL_BITS_CATALOG.findIndex(b => b.id === bit.id);
  if (existingIdx >= 0) {
    DRILL_BITS_CATALOG[existingIdx] = bit;
  } else {
    // Insert at front so uploaded bit is prominently featured
    DRILL_BITS_CATALOG.unshift(bit);
  }
  return bit;
}

export function removeBitFromCatalog(id: string): boolean {
  const index = DRILL_BITS_CATALOG.findIndex(b => b.id === id);
  if (index !== -1) {
    DRILL_BITS_CATALOG.splice(index, 1);
    return true;
  }
  return false;
}

export function updateBitInCatalog(id: string, updates: Partial<DrillBit>): DrillBit | null {
  const index = DRILL_BITS_CATALOG.findIndex(b => b.id === id);
  if (index !== -1) {
    const existing = DRILL_BITS_CATALOG[index];
    const updated: DrillBit = {
      ...existing,
      ...updates,
      id: existing.id
    };
    DRILL_BITS_CATALOG[index] = updated;
    return updated;
  }
  return null;
}

export function resetDrillBitsCatalog(): DrillBit[] {
  DRILL_BITS_CATALOG.length = 0;
  DRILL_BITS_CATALOG.push(...JSON.parse(JSON.stringify(INITIAL_DRILL_BITS)));
  return DRILL_BITS_CATALOG;
}

export function removeAllBitsFromCatalog(): boolean {
  DRILL_BITS_CATALOG.length = 0;
  return true;
}
