import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  RotateCw,
  Sparkles,
  Layers,
  Wrench,
  Check,
  Code,
  Camera,
  Trash2,
  Edit3,
  ArrowRight,
  Activity,
  Droplets,
  Compass,
  ShieldCheck,
  Zap,
  Info,
  SlidersHorizontal,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { DrillBit } from '../types';
import { BitVisualizer } from './BitVisualizer';

interface BitUploadTabProps {
  catalog: DrillBit[];
  activeBit?: DrillBit;
  onSelectBit: (bit: DrillBit) => void;
  onAddBit: (bit: DrillBit) => void;
  onUpdateBit?: (bit: DrillBit) => void;
  onDeleteBit?: (id: string) => void;
  onNavigateToAdvisory?: () => void;
  onNavigateToMse?: (bit: DrillBit) => void;
  onNavigateToHydraulics?: (bit: DrillBit) => void;
}

export const BitUploadTab: React.FC<BitUploadTabProps> = ({
  catalog,
  activeBit,
  onSelectBit,
  onAddBit,
  onUpdateBit,
  onDeleteBit,
  onNavigateToAdvisory,
  onNavigateToMse,
  onNavigateToHydraulics
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'upload' | 'manual' | 'inventory'>('upload');
  
  // Staged / extracted bit waiting for user review & confirmation
  const [stagedBits, setStagedBits] = useState<DrillBit[]>([]);
  const [currentFile, setCurrentFile] = useState<{ name: string; size: number } | null>(null);
  
  // Raw manual JSON / CSV spec input
  const [rawText, setRawText] = useState<string>('');
  
  // Search & filter for uploaded inventory
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Support direct clipboard paste (Ctrl+V) for drill bit images & screenshots
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          processUploadedFile(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Pre-load realistic industry drill bit examples
  const handleLoadIndustrySample = (sampleType: 'UNICRON_PDC' | 'VIPER_MATRIX' | 'TRITON_RC' | 'BAKER_DYNAMUS') => {
    let sampleBit: DrillBit;

    if (sampleType === 'UNICRON_PDC') {
      sampleBit = {
        id: `custom-sample-${Date.now()}-1`,
        model: "Apex Titan A616 Premium PDC",
        manufacturer: "Unicron Drilling Technologies",
        type: "PDC_STEEL",
        sizeInch: 8.5,
        iadcCode: "S433",
        bladeCount: 6,
        cutterSizeMm: 16,
        cutterCountTotal: 48,
        faceProfile: "Aggressive Spiral Parabolic",
        connectionType: '4-1/2" API Regular Pin',
        serialNumber: "UDT-A616-8500",
        bearingType: "NON_ROLLER",
        bodyMaterial: "STEEL",
        hardfacingGrade: "Laser Clad Tungsten Carbide Overlay",
        gaugeLengthInch: 2.5,
        junkSlotAreaPct: 44,
        nozzleCount: 6,
        nozzleSizes32nds: [12, 12, 12, 14, 14, 14],
        hydraulicsTfaSqIn: 0.697,
        costUsd: 29500,
        idealFormations: ["Interbedded Sandstone", "Shale", "Claystone", "Siltstone"],
        maxWobKlbf: 35,
        recommendedWobKlbf: [16, 30],
        recommendedRpm: [110, 160],
        recommendedFlowGpm: [480, 580],
        maxTorqueFtLbs: 13500,
        description: "Optimized 6-blade aggressive cutting structure engineered for high penetration rates in offshore Malay Basin clastics.",
        unicronCatalogRef: "U-APEX-850-A616",
        isCustomUploaded: true,
        uploadedAt: new Date().toISOString(),
        sourceFileName: "apex_titan_a616_specsheet.json"
      };
    } else if (sampleType === 'VIPER_MATRIX') {
      sampleBit = {
        id: `custom-sample-${Date.now()}-2`,
        model: "ViperPro M519 Heavy Matrix PDC",
        manufacturer: "Unicron Upstream Tools",
        type: "PDC_MATRIX",
        sizeInch: 12.25,
        iadcCode: "M423",
        bladeCount: 5,
        cutterSizeMm: 19,
        cutterCountTotal: 52,
        faceProfile: "Deep Cone Impact Shielded",
        connectionType: '6-5/8" API Regular Pin',
        serialNumber: "UDT-M519-1225",
        bearingType: "NON_ROLLER",
        bodyMaterial: "TUNGSTEN_CARBIDE_MATRIX",
        hardfacingGrade: "Infiltration Tungsten Carbide Matrix",
        gaugeLengthInch: 3.0,
        junkSlotAreaPct: 42,
        nozzleCount: 7,
        nozzleSizes32nds: [13, 13, 13, 14, 14, 16, 16],
        hydraulicsTfaSqIn: 1.082,
        costUsd: 38500,
        idealFormations: ["Abrasive Quartzite Sandstone", "Dolomite", "Dense Limestone", "Shale"],
        maxWobKlbf: 42,
        recommendedWobKlbf: [20, 36],
        recommendedRpm: [90, 140],
        recommendedFlowGpm: [650, 850],
        maxTorqueFtLbs: 16500,
        description: "Heavy-duty matrix body bit with premium diamond table cutters designed for highly abrasive and interbedded formations.",
        unicronCatalogRef: "U-VIPER-1225-M519",
        isCustomUploaded: true,
        uploadedAt: new Date().toISOString(),
        sourceFileName: "viperpro_m519_catalog.json"
      };
    } else if (sampleType === 'TRITON_RC') {
      sampleBit = {
        id: `custom-sample-${Date.now()}-3`,
        model: "Triton TC517 Tungsten Carbide Roller Cone",
        manufacturer: "Unicron Rock Tooling",
        type: "ROLLER_CONE_TCI",
        sizeInch: 8.5,
        iadcCode: "517",
        bladeCount: 3,
        cutterSizeMm: 0,
        bearingType: "SEALED_JOURNAL",
        bodyMaterial: "FORGED_STEEL",
        hardfacingGrade: "Hardfaced Shirley Leg & Shirttail",
        gaugeLengthInch: 1.5,
        junkSlotAreaPct: 48,
        nozzleCount: 3,
        nozzleSizes32nds: [16, 16, 16],
        hydraulicsTfaSqIn: 0.589,
        costUsd: 24000,
        idealFormations: ["Chert Nodules", "Hard Limestone", "Granite Stringers", "Dense Carbonates"],
        maxWobKlbf: 48,
        recommendedWobKlbf: [25, 45],
        recommendedRpm: [60, 110],
        recommendedFlowGpm: [400, 520],
        maxTorqueFtLbs: 10500,
        description: "Tungsten carbide insert (TCI) roller cone with sealed journal bearing for chert stringers and unyielding rock compressive strength.",
        unicronCatalogRef: "U-TRITON-850-517",
        isCustomUploaded: true,
        uploadedAt: new Date().toISOString(),
        sourceFileName: "triton_tc517_brochure.pdf"
      };
    } else {
      sampleBit = {
        id: `custom-sample-${Date.now()}-4`,
        model: "Dynamus D616 Extreme Vibration Steerable",
        manufacturer: "Baker Hughes / Unicron Integration",
        type: "PDC_STEEL",
        sizeInch: 8.5,
        iadcCode: "S422",
        bladeCount: 6,
        cutterSizeMm: 16,
        cutterCountTotal: 44,
        faceProfile: "Continuous Lateral Steerable Cone",
        connectionType: '4-1/2" API Regular Pin',
        serialNumber: "BH-D616-85-CUST",
        bearingType: "NON_ROLLER",
        bodyMaterial: "STEEL",
        hardfacingGrade: "Crushed Carbide Hardfacing",
        gaugeLengthInch: 2.25,
        junkSlotAreaPct: 46,
        nozzleCount: 6,
        nozzleSizes32nds: [13, 13, 13, 13, 13, 13],
        hydraulicsTfaSqIn: 0.776,
        costUsd: 31000,
        idealFormations: ["Interbedded Sandstone", "Marine Shales", "Turbidite Sands"],
        maxWobKlbf: 36,
        recommendedWobKlbf: [18, 32],
        recommendedRpm: [120, 175],
        recommendedFlowGpm: [480, 600],
        maxTorqueFtLbs: 14000,
        description: "Directional steerable drill bit with stay-sharp cutters engineered for RSS motor drives and vibration reduction.",
        unicronCatalogRef: "U-BH-D616-850",
        isCustomUploaded: true,
        uploadedAt: new Date().toISOString(),
        sourceFileName: "baker_hughes_dynamus_spec.csv"
      };
    }

    setStagedBits([sampleBit]);
    setCurrentFile({ name: sampleBit.sourceFileName || "sample_spec.json", size: 1480 });
    setStatusMsg(`Loaded industry specification: ${sampleBit.model} (${sampleBit.sizeInch}"). Review details below and click Confirm.`);
    setErrorMsg(null);
  };

  // Download Sample CSV Template
  const handleDownloadCsvTemplate = () => {
    const csvContent = 
`model,sizeInch,type,iadcCode,bladeCount,cutterSizeMm,bodyMaterial,nozzleCount,wobMinKlbf,wobMaxKlbf,rpmMin,rpmMax,flowMinGpm,flowMaxGpm,costUsd,manufacturer,description
"Apex Titan A616",8.5,"PDC_STEEL","S433",6,16,"STEEL",6,18,32,120,160,480,580,29500,"Unicron Drilling Technologies","High ROP 6-blade steel body PDC with polished cutters for interbedded sandstone"
"Viper M519 Matrix",12.25,"PDC_MATRIX","M423",5,19,"TUNGSTEN_CARBIDE_MATRIX",7,22,38,100,140,650,850,38000,"Unicron Upstream Tools","Heavy duty matrix PDC for abrasive shale and carbonate intervals"
"Triton TC517 Roller Cone",8.5,"ROLLER_CONE_TCI","517",3,0,"FORGED_STEEL",3,25,45,60,110,400,520,24000,"Unicron Rock Tooling","Tungsten carbide insert roller cone bit for chert nodules and hard limestone"`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'drill_bit_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample JSON Template
  const handleDownloadJsonTemplate = () => {
    const jsonSample = [
      {
        model: "Apex Titan A616 Steel PDC",
        manufacturer: "Unicron Upstream / Operator Spec",
        type: "PDC_STEEL",
        sizeInch: 8.5,
        iadcCode: "S433",
        bladeCount: 6,
        cutterSizeMm: 16,
        bodyMaterial: "STEEL",
        hardfacingGrade: "Laser Clad Tungsten Carbide",
        gaugeLengthInch: 2.5,
        junkSlotAreaPct: 44,
        nozzleCount: 6,
        nozzleSizes32nds: [12, 12, 12, 14, 14, 14],
        costUsd: 29500,
        idealFormations: ["Sandstone", "Shale", "Claystone"],
        maxWobKlbf: 35,
        recommendedWobKlbf: [16, 30],
        recommendedRpm: [110, 160],
        recommendedFlowGpm: [460, 580],
        maxTorqueFtLbs: 13500,
        description: "Optimized 6-blade aggressive cutting structure engineered for high penetration rates in offshore clastics."
      }
    ];

    const blob = new Blob([JSON.stringify(jsonSample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'drill_bit_upload_template.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side CSV Parser
  const parseCsvContent = (text: string, fileName: string): DrillBit[] => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) throw new Error("CSV file does not contain header and data rows.");

    const parseRow = (rowStr: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if ((char === ',' || char === '\t') && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const bits: DrillBit[] = [];

    for (let r = 1; r < lines.length; r++) {
      const cols = parseRow(lines[r]);
      if (cols.length < 2) continue;

      const getCol = (keyMatches: string[]): string => {
        for (const k of keyMatches) {
          const idx = headers.findIndex(h => h.includes(k));
          if (idx >= 0 && cols[idx] !== undefined) return cols[idx];
        }
        return '';
      };

      const model = getCol(['model', 'name', 'bitname', 'tool']) || `Uploaded Bit #${r}`;
      const sizeInch = parseFloat(getCol(['size', 'diameter', 'inch'])) || 8.5;
      const typeRaw = getCol(['type', 'category', 'bittype']).toUpperCase();
      const iadcCode = (getCol(['iadc', 'code']) || 'S433').toUpperCase();
      const bladeCount = parseInt(getCol(['blade', 'blades', 'wing'])) || 6;
      const cutterSizeMm = parseInt(getCol(['cutter', 'cuttersize', 'mm'])) || 16;
      const bodyMatRaw = getCol(['body', 'material']).toUpperCase();
      const wobMin = parseFloat(getCol(['wobmin', 'minwob', 'wobstart'])) || 15;
      const wobMax = parseFloat(getCol(['wobmax', 'maxwob', 'wobend', 'wob'])) || 30;
      const rpmMin = parseFloat(getCol(['rpmmin', 'minrpm'])) || 110;
      const rpmMax = parseFloat(getCol(['rpmmax', 'maxrpm', 'rpm'])) || 160;
      const flowMin = parseFloat(getCol(['flowmin', 'minflow'])) || 450;
      const flowMax = parseFloat(getCol(['flowmax', 'maxflow', 'flow', 'gpm'])) || 600;
      const costUsd = parseFloat(getCol(['cost', 'price', 'usd', 'value'])) || 28000;
      const manufacturer = getCol(['mfg', 'manufacturer', 'vendor', 'make']) || 'Imported Tooling';
      const description = getCol(['desc', 'description', 'notes', 'spec']) || `${sizeInch}" ${bladeCount}-blade drill bit specification.`;

      let bitType: DrillBit['type'] = 'PDC_STEEL';
      if (typeRaw.includes('MATRIX') || bodyMatRaw.includes('MATRIX')) {
        bitType = 'PDC_MATRIX';
      } else if (typeRaw.includes('ROLLER') || typeRaw.includes('CONE') || typeRaw.includes('TCI')) {
        bitType = 'ROLLER_CONE_TCI';
      } else if (typeRaw.includes('OPENER') || typeRaw.includes('SHO')) {
        bitType = 'STAGE_HOLE_OPENER';
      }

      let bodyMaterial: DrillBit['bodyMaterial'] = 'STEEL';
      if (bodyMatRaw.includes('MATRIX')) {
        bodyMaterial = 'TUNGSTEN_CARBIDE_MATRIX';
      }

      const bit: DrillBit = {
        id: `csv-bit-${Date.now()}-${r}`,
        model,
        manufacturer,
        type: bitType,
        sizeInch,
        iadcCode,
        bladeCount,
        cutterSizeMm,
        bearingType: bitType.includes('ROLLER') ? 'SEALED_JOURNAL' : 'NON_ROLLER',
        bodyMaterial,
        hardfacingGrade: 'Standard Tungsten Carbide Hardfacing',
        gaugeLengthInch: 2.25,
        junkSlotAreaPct: 40,
        nozzleCount: 6,
        nozzleSizes32nds: [12, 12, 12, 14, 14, 14],
        costUsd,
        idealFormations: ['Sandstone', 'Shale', 'Limestone'],
        maxWobKlbf: wobMax + 8,
        recommendedWobKlbf: [wobMin, wobMax],
        recommendedRpm: [rpmMin, rpmMax],
        recommendedFlowGpm: [flowMin, flowMax],
        maxTorqueFtLbs: 12500,
        description,
        unicronCatalogRef: `U-CSV-${Math.floor(1000 + Math.random() * 9000)}`,
        isCustomUploaded: true,
        uploadedAt: new Date().toISOString(),
        sourceFileName: fileName
      };

      bits.push(bit);
    }

    return bits;
  };

  // Main file processing engine
  const processUploadedFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setStatusMsg(null);
    setCurrentFile({ name: file.name, size: file.size });

    try {
      const fileNameLower = file.name.toLowerCase();

      // Case 1: JSON File
      if (fileNameLower.endsWith('.json')) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const arrayPayload = Array.isArray(parsed) ? parsed : (parsed.bits ? parsed.bits : [parsed]);

        const normalizedBits: DrillBit[] = arrayPayload.map((raw: any, index: number) => ({
          id: String(raw.id || `json-bit-${Date.now()}-${index}`),
          model: String(raw.model || `Imported PDC ${raw.sizeInch || 8.5}"`),
          manufacturer: String(raw.manufacturer || 'Imported Technical Spec'),
          type: (raw.type || (String(raw.bodyMaterial || '').includes('MATRIX') ? 'PDC_MATRIX' : 'PDC_STEEL')) as any,
          sizeInch: Number(raw.sizeInch) || 8.5,
          iadcCode: String(raw.iadcCode || 'S433').toUpperCase(),
          bladeCount: Number(raw.bladeCount) || 6,
          cutterSizeMm: Number(raw.cutterSizeMm) || 16,
          bearingType: (raw.bearingType || 'NON_ROLLER') as any,
          bodyMaterial: (raw.bodyMaterial || 'STEEL') as any,
          hardfacingGrade: String(raw.hardfacingGrade || 'Tungsten Carbide Clad'),
          gaugeLengthInch: Number(raw.gaugeLengthInch) || 2.25,
          junkSlotAreaPct: Number(raw.junkSlotAreaPct) || 40,
          nozzleCount: Number(raw.nozzleCount) || 6,
          nozzleSizes32nds: Array.isArray(raw.nozzleSizes32nds) ? raw.nozzleSizes32nds : [12, 12, 12, 14, 14, 14],
          costUsd: Number(raw.costUsd) || 28000,
          idealFormations: Array.isArray(raw.idealFormations) ? raw.idealFormations : ['Sandstone', 'Shale'],
          maxWobKlbf: Number(raw.maxWobKlbf) || 35,
          recommendedWobKlbf: Array.isArray(raw.recommendedWobKlbf) ? raw.recommendedWobKlbf : [16, 30],
          recommendedRpm: Array.isArray(raw.recommendedRpm) ? raw.recommendedRpm : [110, 160],
          recommendedFlowGpm: Array.isArray(raw.recommendedFlowGpm) ? raw.recommendedFlowGpm : [450, 600],
          maxTorqueFtLbs: Number(raw.maxTorqueFtLbs) || 12500,
          description: String(raw.description || 'Imported drill bit specification.'),
          unicronCatalogRef: String(raw.unicronCatalogRef || `U-JSON-${Math.floor(1000 + Math.random() * 9000)}`),
          isCustomUploaded: true,
          uploadedAt: new Date().toISOString(),
          sourceFileName: file.name
        }));

        setStagedBits(normalizedBits);
        setStatusMsg(`Successfully extracted ${normalizedBits.length} drill bit specification(s) from JSON.`);
      } 
      // Case 2: CSV / TSV File
      else if (fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.tsv') || file.type === 'text/csv') {
        const text = await file.text();
        const bits = parseCsvContent(text, file.name);
        if (bits.length === 0) throw new Error("No valid drill bit rows found in CSV spreadsheet.");
        setStagedBits(bits);
        setStatusMsg(`Successfully extracted ${bits.length} drill bit(s) from CSV spreadsheet.`);
      } 
      // Case 3: Universal Extraction via Gemini Multimodal AI (PDF, Images, Excel, Logs)
      else {
        const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|svg|tiff|gif|jfif|heic|avif)$/i.test(file.name);
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        
        setStatusMsg(isImage ? `Processing image "${file.name}" with visual AI parameter extraction...` : `Analyzing "${file.name}" with Gemini AI multimodal vision & document parser...`);
        
        let fileContent = '';
        let isBase64 = false;
        let imagePreviewUrl: string | undefined = undefined;

        if (isImage || isPdf || file.size > 200000 || !file.type.startsWith('text')) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              if (isImage) {
                imagePreviewUrl = res;
              }
              const cleanBase64 = res.split(',')[1] || res;
              resolve(cleanBase64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          fileContent = base64;
          isBase64 = true;
        } else {
          fileContent = await file.text();
        }

        const response = await fetch('/api/bits/extract-from-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileContent,
            fileName: file.name,
            mimeType: file.type || (isImage ? 'image/jpeg' : isPdf ? 'application/pdf' : 'application/octet-stream'),
            isBase64
          })
        });

        if (!response.ok) {
          throw new Error(`Extraction service returned HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success' && data.extractedBit) {
          const raw = data.extractedBit;

          // Priority: 1. Direct uploaded file image preview, 2. Embedded image from server (e.g. extracted from PDF), 3. Raw image URL
          const resolvedImageUrl = imagePreviewUrl || (raw.imageUrl?.startsWith('data:') ? raw.imageUrl : (raw.imageUrl || imagePreviewUrl));

          const bit: DrillBit = {
            id: String(raw.id || `extracted-${Date.now()}`),
            model: String(raw.model || `Extracted Drill Bit ${raw.sizeInch || 8.5}"`),
            manufacturer: String(raw.manufacturer || 'Extracted Technical Spec'),
            type: (raw.type || (String(raw.bodyMaterial || '').includes('MATRIX') ? 'PDC_MATRIX' : 'PDC_STEEL')) as any,
            sizeInch: Number(raw.sizeInch) || 8.5,
            iadcCode: String(raw.iadcCode || 'S433').toUpperCase(),
            bladeCount: Number(raw.bladeCount) || 6,
            cutterSizeMm: Number(raw.cutterSizeMm) || 16,
            bearingType: (raw.bearingType || 'NON_ROLLER') as any,
            bodyMaterial: (raw.bodyMaterial || 'STEEL') as any,
            hardfacingGrade: String(raw.hardfacingGrade || 'Tungsten Carbide Clad'),
            gaugeLengthInch: Number(raw.gaugeLengthInch) || 2.25,
            junkSlotAreaPct: Number(raw.junkSlotAreaPct) || 40,
            nozzleCount: Number(raw.nozzleCount) || 6,
            nozzleSizes32nds: Array.isArray(raw.nozzleSizes32nds) && raw.nozzleSizes32nds.length > 0
              ? raw.nozzleSizes32nds.map((n: any) => Number(n) || 12)
              : [12, 12, 12, 14, 14, 14],
            costUsd: Number(raw.costUsd) || 28000,
            idealFormations: Array.isArray(raw.idealFormations) && raw.idealFormations.length > 0
              ? raw.idealFormations.map((f: any) => String(f))
              : ['Sandstone', 'Shale'],
            maxWobKlbf: Number(raw.maxWobKlbf) || 35,
            recommendedWobKlbf: Array.isArray(raw.recommendedWobKlbf) && raw.recommendedWobKlbf.length >= 2
              ? [Number(raw.recommendedWobKlbf[0]) || 15, Number(raw.recommendedWobKlbf[1]) || 30]
              : [15, 30],
            recommendedRpm: Array.isArray(raw.recommendedRpm) && raw.recommendedRpm.length >= 2
              ? [Number(raw.recommendedRpm[0]) || 110, Number(raw.recommendedRpm[1]) || 160]
              : [110, 160],
            recommendedFlowGpm: Array.isArray(raw.recommendedFlowGpm) && raw.recommendedFlowGpm.length >= 2
              ? [Number(raw.recommendedFlowGpm[0]) || 450, Number(raw.recommendedFlowGpm[1]) || 600]
              : [450, 600],
            maxTorqueFtLbs: Number(raw.maxTorqueFtLbs) || 12500,
            description: String(raw.description || 'Imported drill bit specification.'),
            unicronCatalogRef: String(raw.unicronCatalogRef || `U-EXT-${Math.floor(1000 + Math.random() * 9000)}`),
            allExtractedData: Array.isArray(data.allExtractedData) ? data.allExtractedData : [],
            rawAiSummary: data.rawAiSummary || '',
            imageUrl: resolvedImageUrl,
            image3dUrl: resolvedImageUrl,
            sourceFileName: file.name,
            isCustomUploaded: true,
            uploadedAt: new Date().toISOString()
          };
          setStagedBits([bit]);
          setStatusMsg(imagePreviewUrl 
            ? `Extracted specifications and loaded actual photo from "${file.name}" for "${bit.model}" (${bit.sizeInch}").`
            : `AI extracted full drilling parameters from "${file.name}" for "${bit.model}" (${bit.sizeInch}").`
          );
        } else {
          throw new Error(data.message || 'AI could not extract drill bit parameters from this file.');
        }
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMsg(err.message || 'Failed to parse file. Please verify file format or download the sample template.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Parse raw JSON or CSV text
  const handleManualParse = () => {
    if (!rawText.trim()) {
      setErrorMsg("Please paste valid JSON or CSV drill bit specifications.");
      return;
    }

    try {
      if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        const parsed = JSON.parse(rawText.trim());
        const arr = Array.isArray(parsed) ? parsed : (parsed.bits ? parsed.bits : [parsed]);
        const bits: DrillBit[] = arr.map((raw: any, idx: number) => ({
          id: String(raw.id || `manual-bit-${Date.now()}-${idx}`),
          model: String(raw.model || `PDC ${raw.sizeInch || 8.5}"`),
          manufacturer: String(raw.manufacturer || 'Operator Spec'),
          type: (raw.type || 'PDC_STEEL') as any,
          sizeInch: Number(raw.sizeInch) || 8.5,
          iadcCode: String(raw.iadcCode || 'S433').toUpperCase(),
          bladeCount: Number(raw.bladeCount) || 6,
          cutterSizeMm: Number(raw.cutterSizeMm) || 16,
          bearingType: (raw.bearingType || 'NON_ROLLER') as any,
          bodyMaterial: (raw.bodyMaterial || 'STEEL') as any,
          hardfacingGrade: String(raw.hardfacingGrade || 'Tungsten Carbide'),
          gaugeLengthInch: Number(raw.gaugeLengthInch) || 2.25,
          junkSlotAreaPct: Number(raw.junkSlotAreaPct) || 40,
          nozzleCount: Number(raw.nozzleCount) || 6,
          nozzleSizes32nds: Array.isArray(raw.nozzleSizes32nds) ? raw.nozzleSizes32nds : [12, 12, 12, 14, 14, 14],
          costUsd: Number(raw.costUsd) || 28000,
          idealFormations: Array.isArray(raw.idealFormations) ? raw.idealFormations : ['Sandstone'],
          maxWobKlbf: Number(raw.maxWobKlbf) || 35,
          recommendedWobKlbf: Array.isArray(raw.recommendedWobKlbf) ? raw.recommendedWobKlbf : [16, 30],
          recommendedRpm: Array.isArray(raw.recommendedRpm) ? raw.recommendedRpm : [110, 160],
          recommendedFlowGpm: Array.isArray(raw.recommendedFlowGpm) ? raw.recommendedFlowGpm : [450, 600],
          maxTorqueFtLbs: Number(raw.maxTorqueFtLbs) || 12500,
          description: String(raw.description || 'Pasted drill bit specification.'),
          unicronCatalogRef: String(raw.unicronCatalogRef || `U-MAN-${Math.floor(1000 + Math.random() * 9000)}`),
          isCustomUploaded: true,
          uploadedAt: new Date().toISOString(),
          sourceFileName: 'manual_pasted_spec.json'
        }));
        setStagedBits(bits);
        setStatusMsg(`Parsed ${bits.length} drill bit(s) from JSON.`);
        setErrorMsg(null);
      } else {
        const bits = parseCsvContent(rawText, 'pasted_spec.csv');
        setStagedBits(bits);
        setStatusMsg(`Parsed ${bits.length} drill bit(s) from CSV text.`);
        setErrorMsg(null);
      }
    } catch (err: any) {
      setErrorMsg(`Failed to parse pasted text: ${err.message}`);
    }
  };

  // Commit staged bit to catalog & active bit state
  const handleConfirmBit = async (bitToSave: DrillBit) => {
    try {
      setIsProcessing(true);
      // Persist to server API
      const res = await fetch('/api/bits/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bitToSave)
      });
      
      onAddBit(bitToSave);
      onSelectBit(bitToSave);

      // Remove from staged bits
      setStagedBits(prev => prev.filter(b => b.id !== bitToSave.id));
      setStatusMsg(`"${bitToSave.model}" successfully added to drill bit fleet and set as active tool!`);
      setErrorMsg(null);
    } catch (e: any) {
      // Fallback local save
      onAddBit(bitToSave);
      onSelectBit(bitToSave);
      setStagedBits(prev => prev.filter(b => b.id !== bitToSave.id));
      setStatusMsg(`"${bitToSave.model}" saved locally and set as active.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update field of a staged bit in the review form
  const handleUpdateStagedField = (bitId: string, field: keyof DrillBit, val: any) => {
    setStagedBits(prev => prev.map(b => {
      if (b.id !== bitId) return b;
      return { ...b, [field]: val };
    }));
  };

  // Filtered inventory list
  const filteredCatalog = catalog.filter(b => {
    const matchesSearch = !searchFilter.trim() || 
      b.model.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.manufacturer.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.iadcCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(b.sizeInch).includes(searchFilter);

    const matchesType = typeFilter === 'ALL' || b.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-sky-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-sky-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-400/30">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Drill Bit Specification Ingestion Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Drill Bit File Upload & Specification Hub
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              Upload drill bit engineering datasheets, CSV inventories, JSON models, PDF manufacturer catalogs, or field camera snapshots. Automatic AI extraction identifies cutting structures, IADC codes, hydraulic TFA nozzles, and SPE operating envelopes.
            </p>
          </div>

          {/* Quick Actions & Templates */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadCsvTemplate}
              className="flex items-center space-x-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 backdrop-blur-sm transition cursor-pointer"
              title="Download standard CSV spreadsheet template"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV Template</span>
              <Download className="w-3 h-3 text-slate-300" />
            </button>

            <button
              onClick={handleDownloadJsonTemplate}
              className="flex items-center space-x-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 backdrop-blur-sm transition cursor-pointer"
              title="Download standard JSON model template"
            >
              <Code className="w-4 h-4 text-sky-400" />
              <span>JSON Template</span>
              <Download className="w-3 h-3 text-slate-300" />
            </button>

            {onNavigateToAdvisory && (
              <button
                onClick={onNavigateToAdvisory}
                className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-lg transition cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Go to Bit Advisor</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navigation tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs">
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeSubTab === 'upload'
                ? 'bg-sky-500 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>File & Camera Upload</span>
          </button>

          <button
            onClick={() => setActiveSubTab('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeSubTab === 'manual'
                ? 'bg-sky-500 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Paste JSON / CSV Code</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'bg-sky-500 text-white font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Uploaded Fleet ({catalog.length})</span>
          </button>
        </div>
      </div>

      {/* Status & Error Alerts */}
      {statusMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-4 rounded-xl flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Success: </span>
            <span>{statusMsg}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-emerald-500 hover:text-emerald-800 p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-4 rounded-xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Upload Error: </span>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800 p-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: File & Camera Upload */}
      {activeSubTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dropzone & Fast Load */}
          <div className="lg:col-span-7 space-y-5">
            {/* Main Interactive Drag-and-Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/30 scale-[1.01] shadow-lg'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-sky-400 dark:hover:border-sky-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.pdf,.xlsx,.xls,.png,.jpg,.jpeg,.webp,.txt"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                  isProcessing
                    ? 'bg-sky-500/20 text-sky-500 animate-spin'
                    : 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                }`}>
                  {isProcessing ? <RotateCw className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isProcessing ? 'Processing Drill Bit Specifications...' : 'Drop Drill Bit File Here'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Support for <strong>CSV, JSON, PDF datasheets, Drill Bit Photos (PNG/JPG), Excel, or Well Log Text</strong> up to 25MB.
                </p>

                {currentFile && (
                  <div className="mt-3 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="font-semibold">{currentFile.name}</span>
                    <span className="text-slate-400 text-[10px]">({(currentFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}

                {/* Buttons: Browse & Camera */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Choose File to Upload</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                    title="Capture live drill bit photo on rig floor"
                  >
                    <Camera className="w-4 h-4 text-sky-500" />
                    <span>Take Rig Photo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Load Industry Presets */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Quick Load Industry Drill Bit Samples
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">Click to preview spec</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={() => handleLoadIndustrySample('UNICRON_PDC')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      Apex Titan A616
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono font-bold">
                      8.5" PDC
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    6-Blade Steel PDC for Sandstone/Shale
                  </p>
                </button>

                <button
                  onClick={() => handleLoadIndustrySample('VIPER_MATRIX')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      ViperPro M519
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono font-bold">
                      12.25" Matrix
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    Heavy Matrix Body for Abrasive Sand
                  </p>
                </button>

                <button
                  onClick={() => handleLoadIndustrySample('TRITON_RC')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      Triton TC517
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono font-bold">
                      8.5" TCI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    3-Cone Roller Bit for Hard Chert & Dolomite
                  </p>
                </button>

                <button
                  onClick={() => handleLoadIndustrySample('BAKER_DYNAMUS')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      Dynamus D616
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                      8.5" RSS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    Directional Motor / RSS Steerable PDC
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Extraction Capabilities & Format Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xs text-slate-600 dark:text-slate-400 space-y-4">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-sky-500" />
                <span>Multimodal AI Vision & Spec Extraction</span>
              </div>
              <p className="leading-relaxed">
                Our Gemini AI engine automatically ingests raw manufacturer spec sheets, PDFs, and field photos to extract technical drilling parameters without tedious manual entry:
              </p>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Cutting Structure & Body:</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Blades, cutter diameter (mm), body metallurgy (Steel vs Matrix), hardfacing, gauge pad length.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Hydraulic TFA & Nozzle Ports:</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Number of interchangeable nozzles, sizes in 32nds of an inch, Total Flow Area ($in^2$), flow range.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Operational Limits & SPE Envelopes:</strong>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Recommended WOB (klbf), RPM range, torque limits, suitable formations, unit cost.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Currently Active Bit</div>
                  <div className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold truncate max-w-[200px]">
                    {activeBit ? `${activeBit.model} (${activeBit.sizeInch}")` : 'No bit active'}
                  </div>
                </div>
                {activeBit && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                    ONLINE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Manual JSON / CSV Code Paste */}
      {activeSubTab === 'manual' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Paste JSON or CSV Drill Bit Specifications</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste raw drill bit arrays, JSON specs, or comma-separated rows directly from your engineering database.
              </p>
            </div>
            <button
              onClick={() => {
                setRawText(`[\n  {\n    "model": "Apex Titan A616",\n    "sizeInch": 8.5,\n    "type": "PDC_STEEL",\n    "iadcCode": "S433",\n    "bladeCount": 6,\n    "cutterSizeMm": 16,\n    "wobMin": 18,\n    "wobMax": 32,\n    "rpmMin": 120,\n    "rpmMax": 160,\n    "flowMin": 480,\n    "flowMax": 580,\n    "costUsd": 29500,\n    "manufacturer": "Unicron Drilling Technologies"\n  }\n]`);
              }}
              className="text-xs text-sky-600 hover:text-sky-500 font-semibold cursor-pointer"
            >
              Fill Example JSON
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={10}
            placeholder={`[\n  {\n    "model": "Apex Titan A616",\n    "sizeInch": 8.5,\n    "type": "PDC_STEEL",\n    "iadcCode": "S433",\n    "bladeCount": 6,\n    "cutterSizeMm": 16,\n    "wobMin": 18,\n    "wobMax": 32,\n    "rpmMin": 120,\n    "rpmMax": 160,\n    "flowMin": 480,\n    "flowMax": 580,\n    "costUsd": 29500,\n    "manufacturer": "Unicron Drilling Technologies"\n  }\n]`}
            className="w-full p-4 rounded-xl font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setRawText('')}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={handleManualParse}
              className="flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Parse & Stage Drill Bit</span>
            </button>
          </div>
        </div>
      )}

      {/* STAGED BITS REVIEW & CONFIRMATION SECTION */}
      {stagedBits.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
                {stagedBits.length}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Review & Confirm Staged Drill Bit Specifications
              </h3>
            </div>
            <button
              onClick={() => setStagedBits([])}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
            >
              Clear Staged
            </button>
          </div>

          <div className="space-y-6">
            {stagedBits.map((bit) => (
              <div 
                key={bit.id}
                className="bg-white dark:bg-slate-900 border-2 border-sky-500/50 rounded-2xl p-6 shadow-xl space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* Left: 3D Visualizer & Uploaded File Picture Controls */}
                  <div className="w-full md:w-60 shrink-0 flex flex-col items-center space-y-2.5">
                    <div className="w-full relative">
                      <BitVisualizer bit={bit} className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" />
                      {bit.imageUrl && (bit.imageUrl.startsWith('data:') || bit.isCustomUploaded) && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-md">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Gambar Dari Fail Upload</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center w-full">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                        Sumber Fail: <strong>{bit.sourceFileName || 'Fail Drill Bit Dimuat Naik'}</strong>
                      </span>
                    </div>

                    {/* Change or Upload Image for this bit */}
                    <div className="w-full flex flex-col gap-1.5 text-xs">
                      <label className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 rounded-xl font-semibold cursor-pointer transition">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Pilih / Tukar Gambar Fail</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = () => {
                                const dataUrl = reader.result as string;
                                handleUpdateStagedField(bit.id, 'imageUrl', dataUrl);
                                handleUpdateStagedField(bit.id, 'image3dUrl', dataUrl);
                                handleUpdateStagedField(bit.id, 'isCustomUploaded', true);
                                handleUpdateStagedField(bit.id, 'sourceFileName', f.name);
                              };
                              reader.readAsDataURL(f);
                            }
                          }}
                        />
                      </label>

                      <label className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold cursor-pointer transition">
                        <Camera className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Ambil Foto Rig (Kamera)</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = () => {
                                const dataUrl = reader.result as string;
                                handleUpdateStagedField(bit.id, 'imageUrl', dataUrl);
                                handleUpdateStagedField(bit.id, 'image3dUrl', dataUrl);
                                handleUpdateStagedField(bit.id, 'isCustomUploaded', true);
                              };
                              reader.readAsDataURL(f);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Right: Editable Specs Form */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    {/* Model */}
                    <div className="sm:col-span-2">
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Model Name</label>
                      <input
                        type="text"
                        value={bit.model}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'model', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      />
                    </div>

                    {/* Manufacturer */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={bit.manufacturer}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'manufacturer', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Diameter */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Bit Size (Inches)</label>
                      <input
                        type="number"
                        step="0.125"
                        value={bit.sizeInch}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'sizeInch', parseFloat(e.target.value) || 8.5)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Bit Type</label>
                      <select
                        value={bit.type}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'type', e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="PDC_STEEL">PDC Steel Body</option>
                        <option value="PDC_MATRIX">PDC Matrix Body</option>
                        <option value="ROLLER_CONE_TCI">Roller Cone TCI</option>
                        <option value="ROLLER_CONE_MILLED">Roller Cone Milled Tooth</option>
                        <option value="STAGE_HOLE_OPENER">Stage Hole Opener</option>
                      </select>
                    </div>

                    {/* IADC Code */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">IADC Code</label>
                      <input
                        type="text"
                        value={bit.iadcCode}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'iadcCode', e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                      />
                    </div>

                    {/* Blades */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Blades / Cones</label>
                      <input
                        type="number"
                        value={bit.bladeCount || 6}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'bladeCount', parseInt(e.target.value) || 6)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    {/* Cutter size */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Cutter Size (mm)</label>
                      <input
                        type="number"
                        value={bit.cutterSizeMm || 16}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'cutterSizeMm', parseInt(e.target.value) || 16)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    {/* Cost */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Cost (USD)</label>
                      <input
                        type="number"
                        value={bit.costUsd || 28000}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'costUsd', parseFloat(e.target.value) || 28000)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    {/* Recommended WOB Range */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">WOB Range (klbf)</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={bit.recommendedWobKlbf?.[0] || 16}
                          onChange={(e) => handleUpdateStagedField(bit.id, 'recommendedWobKlbf', [parseFloat(e.target.value) || 16, bit.recommendedWobKlbf?.[1] || 30])}
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={bit.recommendedWobKlbf?.[1] || 30}
                          onChange={(e) => handleUpdateStagedField(bit.id, 'recommendedWobKlbf', [bit.recommendedWobKlbf?.[0] || 16, parseFloat(e.target.value) || 30])}
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Recommended RPM Range */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">RPM Range</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={bit.recommendedRpm?.[0] || 110}
                          onChange={(e) => handleUpdateStagedField(bit.id, 'recommendedRpm', [parseFloat(e.target.value) || 110, bit.recommendedRpm?.[1] || 160])}
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={bit.recommendedRpm?.[1] || 160}
                          onChange={(e) => handleUpdateStagedField(bit.id, 'recommendedRpm', [bit.recommendedRpm?.[0] || 110, parseFloat(e.target.value) || 160])}
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Flow GPM Range */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Flow Range (GPM)</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={bit.recommendedFlowGpm?.[0] || 450}
                          onChange={(e) => handleUpdateStagedField(bit.id, 'recommendedFlowGpm', [parseFloat(e.target.value) || 450, bit.recommendedFlowGpm?.[1] || 600])}
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={bit.recommendedFlowGpm?.[1] || 600}
                          onChange={(e) => handleUpdateStagedField(bit.id, 'recommendedFlowGpm', [bit.recommendedFlowGpm?.[0] || 450, parseFloat(e.target.value) || 600])}
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-3">
                      <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Engineering Description / Notes</label>
                      <input
                        type="text"
                        value={bit.description}
                        onChange={(e) => handleUpdateStagedField(bit.id, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Confirm & Save Button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setStagedBits(prev => prev.filter(b => b.id !== bit.id))}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Discard
                  </button>

                  <button
                    onClick={() => handleConfirmBit(bit)}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-xl transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Add "{bit.model}" to Fleet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOADED DRILL BITS INVENTORY SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Drill Bit Fleet & Uploaded Models ({filteredCatalog.length})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage uploaded drill bit specifications, switch active bit, or launch engineering diagnostics.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              placeholder="Search by model, size, IADC..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500 w-48"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="ALL">All Bit Types</option>
              <option value="PDC_STEEL">PDC Steel</option>
              <option value="PDC_MATRIX">PDC Matrix</option>
              <option value="ROLLER_CONE_TCI">Roller Cone TCI</option>
              <option value="ROLLER_CONE_MILLED">Roller Cone Milled</option>
            </select>
          </div>
        </div>

        {/* Fleet Cards */}
        {filteredCatalog.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((bit) => {
              const isActive = activeBit?.id === bit.id;

              return (
                <div
                  key={bit.id}
                  className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between ${
                    isActive
                      ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/20 shadow-md ring-2 ring-sky-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                            {bit.model}
                          </h4>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500 text-white font-bold shrink-0">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {bit.manufacturer}
                        </div>
                      </div>

                      <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 shrink-0">
                        {bit.sizeInch}"
                      </span>
                    </div>

                    {/* Visualizer Thumbnail with File Image Badge & Change Action */}
                    <div className="w-full relative h-36 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/60 group">
                      <BitVisualizer bit={bit} compact showControls={false} />
                      {bit.imageUrl && (bit.imageUrl.startsWith('data:') || bit.isCustomUploaded) && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-bold shadow-xs flex items-center gap-1 backdrop-blur-xs">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Gambar Fail</span>
                        </div>
                      )}

                      {/* Hover action to replace image with another file */}
                      <label 
                        className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded bg-slate-900/85 hover:bg-sky-600 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-md backdrop-blur-xs opacity-90 hover:opacity-100"
                        title="Tukar gambar drill bit ini dengan gambar dari fail komputer anda"
                      >
                        <Camera className="w-3 h-3 text-emerald-400" />
                        <span>Tukar Gambar</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const dataUrl = reader.result as string;
                                const updated = { ...bit, imageUrl: dataUrl, image3dUrl: dataUrl, isCustomUploaded: true };
                                if (onUpdateBit) onUpdateBit(updated);
                                try {
                                  await fetch(`/api/bits/${bit.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ imageUrl: dataUrl, image3dUrl: dataUrl, isCustomUploaded: true })
                                  });
                                } catch (err) {
                                  console.warn('Backend update failed:', err);
                                }
                              };
                              reader.readAsDataURL(f);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* Key Specs Matrix */}
                    <div className="grid grid-cols-3 gap-1.5 text-[11px] bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">IADC</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{bit.iadcCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Structure</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{bit.bladeCount || 6}B / {bit.cutterSizeMm || 16}mm</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">WOB</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{bit.recommendedWobKlbf?.[0] || 16}-{bit.recommendedWobKlbf?.[1] || 30}k</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">RPM</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{bit.recommendedRpm?.[0] || 110}-{bit.recommendedRpm?.[1] || 160}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Flow</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">{bit.recommendedFlowGpm?.[0] || 450}-{bit.recommendedFlowGpm?.[1] || 600}g</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Cost</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${((bit.costUsd || 28000)/1000).toFixed(0)}k</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1.5 text-xs">
                    {!isActive ? (
                      <button
                        onClick={() => onSelectBit(bit)}
                        className="flex-1 px-3 py-1.5 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg font-semibold transition cursor-pointer text-center"
                      >
                        Set as Active
                      </button>
                    ) : (
                      <span className="flex-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Selected Active Bit
                      </span>
                    )}

                    {onNavigateToMse && (
                      <button
                        onClick={() => {
                          onSelectBit(bit);
                          onNavigateToMse(bit);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        title="Run MSE & Dynamics calculation with this bit"
                      >
                        <Activity className="w-4 h-4" />
                      </button>
                    )}

                    {onNavigateToHydraulics && (
                      <button
                        onClick={() => {
                          onSelectBit(bit);
                          onNavigateToHydraulics(bit);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                        title="Check Hydraulics & TFA with this bit"
                      >
                        <Droplets className="w-4 h-4" />
                      </button>
                    )}

                    {onDeleteBit && (
                      <button
                        onClick={() => onDeleteBit(bit.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                        title="Delete this drill bit from fleet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <UploadCloud className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Drill Bits in Fleet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
              Upload a drill bit file (CSV, JSON, PDF, photo) above or click one of the industry samples to populate your drilling tool suite.
            </p>
            <button
              onClick={() => handleLoadIndustrySample('UNICRON_PDC')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Apex Titan A616 (8.5" PDC)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
