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
  ucsRangeMpa: [number, number]; // Unconfined Compressive Strength
  abrasiveness: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  shalePlasticity: 'LOW' | 'MEDIUM' | 'HIGH' | 'GUMBO';
  interbedded: boolean;
  expectedChallenges: string[];
  recommendedBitTypes: string[];
}

export const INITIAL_DRILL_BITS: DrillBit[] = [
  {
    id: 'unicron-pdc-s616',
    model: 'UniForce S616 Steel PDC',
    manufacturer: 'Unicron Holdings / Exigent Tools',
    type: 'PDC_STEEL',
    sizeInch: 8.5,
    iadcCode: 'S433',
    bladeCount: 6,
    cutterSizeMm: 16,
    bearingType: 'NON_ROLLER',
    bodyMaterial: 'STEEL',
    hardfacingGrade: 'High-Density Tungsten Carbide Overcoat',
    gaugeLengthInch: 2.5,
    junkSlotAreaPct: 44, // Thin & tall blades leading to high Junk Slot Area (JSA)
    nozzleCount: 6,
    nozzleSizes32nds: [12, 12, 12, 14, 14, 14],
    costUsd: 28500,
    idealFormations: ['Shale', 'Sandstone', 'Siltstone', 'Claystone'],
    maxWobKlbf: 35,
    recommendedWobKlbf: [15, 28],
    recommendedRpm: [100, 180],
    recommendedFlowGpm: [450, 600],
    maxTorqueFtLbs: 9500,
    description: 'Engineered with high blade standoff and optimized Junk Slot Area (JSA). Maximum body toughness with spiral blade geometry for aggressive ROP in soft to medium formations.',
    unicronCatalogRef: 'UCH-PDC-850-S616',
    imageUrl: '/assets/real_pdc_steel_bit.jpg',
    image3dUrl: '/assets/real_pdc_steel_bit.jpg'
  },
  {
    id: 'unicron-pdc-m613',
    model: 'UniMatrix M613 Matrix PDC',
    manufacturer: 'Unicron Holdings / Exigent Tools',
    type: 'PDC_MATRIX',
    sizeInch: 8.5,
    iadcCode: 'M423',
    bladeCount: 6,
    cutterSizeMm: 13,
    bearingType: 'NON_ROLLER',
    bodyMaterial: 'TUNGSTEN_CARBIDE_MATRIX',
    hardfacingGrade: 'Full Infiltrated Tungsten Carbide Matrix',
    gaugeLengthInch: 3.0,
    junkSlotAreaPct: 36,
    nozzleCount: 6,
    nozzleSizes32nds: [11, 11, 12, 12, 13, 13],
    costUsd: 34000,
    idealFormations: ['Abrasive Sandstone', 'Carbonates', 'Limestone', 'Interbedded Chert'],
    maxWobKlbf: 40,
    recommendedWobKlbf: [18, 32],
    recommendedRpm: [90, 160],
    recommendedFlowGpm: [400, 580],
    maxTorqueFtLbs: 8800,
    description: 'High abrasion and erosion-resistant tungsten carbide matrix body with impact-resistant polished cutters. Ideal for interbedded formations and high fluid erosion sections.',
    unicronCatalogRef: 'UCH-PDC-850-M613',
    imageUrl: '/assets/real_pdc_matrix_bit.jpg',
    image3dUrl: '/assets/real_pdc_matrix_bit.jpg'
  },
  {
    id: 'unicron-pdc-s519',
    model: 'UniSpeed S519 Aggressive Steel PDC',
    manufacturer: 'Unicron Holdings',
    type: 'PDC_STEEL',
    sizeInch: 12.25,
    iadcCode: 'S333',
    bladeCount: 5,
    cutterSizeMm: 19,
    bearingType: 'NON_ROLLER',
    bodyMaterial: 'STEEL',
    hardfacingGrade: 'Laser Cladded Carbide Matrix',
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
    description: 'Large 19mm cutters with deep junk slots designed for top-hole and intermediate drilling to maximize instantaneous ROP while avoiding bit balling.',
    unicronCatalogRef: 'UCH-PDC-1225-S519',
    imageUrl: '/assets/real_pdc_steel_bit.jpg',
    image3dUrl: '/assets/real_pdc_steel_bit.jpg'
  },
  {
    id: 'unicron-rc-mt-sr',
    model: 'UniCone MT-111 Sealed Roller Bearing',
    manufacturer: 'Unicron Holdings',
    type: 'ROLLER_CONE_MILLED',
    sizeInch: 12.25,
    iadcCode: '111',
    cutterSizeMm: 0,
    bearingType: 'SEALED_ROLLER',
    bodyMaterial: 'FORGED_STEEL',
    hardfacingGrade: 'Tungsten Carbide Tooth Overlay',
    gaugeLengthInch: 1.5,
    junkSlotAreaPct: 40,
    nozzleCount: 3,
    nozzleSizes32nds: [16, 16, 18],
    costUsd: 14500,
    idealFormations: ['Unconsolidated Sands', 'Soft Clay', 'Low Compressive Formations'],
    maxWobKlbf: 45,
    recommendedWobKlbf: [15, 30],
    recommendedRpm: [80, 140],
    recommendedFlowGpm: [600, 850],
    maxTorqueFtLbs: 6500,
    description: 'Milled tooth roller cone bit with sealed roller bearings. Ideal for shallow, low WOB drilling with smooth-rolling design and high-temperature grease for long-lasting reliability.',
    unicronCatalogRef: 'UCH-RC-1225-MT111',
    imageUrl: '/assets/real_roller_cone_bit.jpg',
    image3dUrl: '/assets/real_roller_cone_bit.jpg'
  },
  {
    id: 'unicron-rc-tci-sj',
    model: 'UniCone TCI-537 Sealed Journal Bearing',
    manufacturer: 'Unicron Holdings',
    type: 'ROLLER_CONE_TCI',
    sizeInch: 8.5,
    iadcCode: '537',
    cutterSizeMm: 0,
    bearingType: 'SEALED_JOURNAL',
    bodyMaterial: 'FORGED_STEEL',
    hardfacingGrade: 'Silver-Plated Journal Bushing & Shirttail Inserts',
    gaugeLengthInch: 2.0,
    junkSlotAreaPct: 35,
    nozzleCount: 3,
    nozzleSizes32nds: [12, 13, 14],
    costUsd: 19800,
    idealFormations: ['Hard Limestone', 'Cherty Dolomite', 'Abrasive Hard Sandstone'],
    maxWobKlbf: 50,
    recommendedWobKlbf: [25, 45],
    recommendedRpm: [50, 100],
    recommendedFlowGpm: [350, 500],
    maxTorqueFtLbs: 5800,
    description: 'Sealed journal bearing TCI bit built for high WOB and abrasive, hard formations over extended runs. Features silver-plated bearing surfaces and pressure-compensated grease reservoirs.',
    unicronCatalogRef: 'UCH-RC-850-TCI537',
    imageUrl: '/assets/real_roller_cone_bit.jpg',
    image3dUrl: '/assets/real_roller_cone_bit.jpg'
  },
  {
    id: 'unicron-sho-1750',
    model: 'UniEnlarge SHO-1750 Stage Hole Opener',
    manufacturer: 'Unicron Holdings / Exigent',
    type: 'STAGE_HOLE_OPENER',
    sizeInch: 17.5,
    iadcCode: 'SHO-CONE',
    bearingType: 'SEALED_JOURNAL',
    bodyMaterial: 'FORGED_STEEL',
    hardfacingGrade: 'TCI Cutters on Demountable Saddles',
    gaugeLengthInch: 4.0,
    junkSlotAreaPct: 48,
    nozzleCount: 6,
    nozzleSizes32nds: [14, 14, 16, 16, 18, 18],
    costUsd: 46000,
    idealFormations: ['Pre-drilled pilot enlargement', 'Conductor Casing Interval', 'Surface Hole'],
    maxWobKlbf: 40,
    recommendedWobKlbf: [15, 30],
    recommendedRpm: [60, 110],
    recommendedFlowGpm: [800, 1200],
    maxTorqueFtLbs: 14000,
    description: 'Stage Hole Opener (SHO) for enlarging 12.25 pilot holes to 17.5 inch casing pass. Equipped with sealed journal cones, field-replaceable cutter arms, and dedicated jet directed cleaning.',
    unicronCatalogRef: 'UCH-SHO-1750-PILOT',
    imageUrl: '/assets/real_pdc_matrix_bit.jpg',
    image3dUrl: '/assets/real_pdc_matrix_bit.jpg'
  },
  {
    id: 'exigent-sho-s516',
    model: '8.25 x 12.25 HO S516 (Uploaded Spec Sheet)',
    manufacturer: 'Exigent Drill Bits',
    type: 'STAGE_HOLE_OPENER',
    sizeInch: 12.25,
    iadcCode: 'S516',
    bladeCount: 6,
    cutterSizeMm: 16,
    bearingType: 'NON_ROLLER',
    bodyMaterial: 'FORGED_STEEL',
    hardfacingGrade: 'High-Strength Tungsten Hardfacing Matrix',
    gaugeLengthInch: 3.0,
    junkSlotAreaPct: 45,
    nozzleCount: 6,
    nozzleSizes32nds: [14, 14, 14, 16, 16, 16],
    costUsd: 38500,
    idealFormations: ['Sandstone', 'Shale', 'Limestone', 'Hole Enlargement Interval'],
    maxWobKlbf: 42,
    recommendedWobKlbf: [16, 32],
    recommendedRpm: [70, 140],
    recommendedFlowGpm: [650, 950],
    maxTorqueFtLbs: 11500,
    description: '8.25" x 12.25" Stage Hole Opener (SHO S516) from uploaded technical spec sheet. Heavy duty pilot reaming tool with durable carbide matrix reinforcement.',
    unicronCatalogRef: 'EXG-SHO-825-1225-S516',
    imageUrl: undefined,
    image3dUrl: undefined,
    isCustomUploaded: true,
    sourceFileName: '8.25 x12.25 HO S516 Spec Sheet Exigent Drill Bits.pdf'
  }
];

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

// Initialize catalog fleet populated with uploaded authentic drill bit photographs
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
