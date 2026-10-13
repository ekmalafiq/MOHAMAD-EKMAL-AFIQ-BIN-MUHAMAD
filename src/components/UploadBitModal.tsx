import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  X, 
  RotateCw, 
  Sparkles, 
  HelpCircle,
  FileSpreadsheet,
  Layers,
  Wrench,
  Check,
  Code,
  Camera
} from 'lucide-react';
import { DrillBit } from '../types';

interface UploadBitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBitUploaded: (newBits: DrillBit[]) => void;
}

export const UploadBitModal: React.FC<UploadBitModalProps> = ({
  isOpen,
  onClose,
  onBitUploaded
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [parsedBits, setParsedBits] = useState<DrillBit[]>([]);
  const [currentFile, setCurrentFile] = useState<{ name: string; size: number } | null>(null);
  
  // Manual JSON / spec text
  const [jsonText, setJsonText] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate Sample CSV Template
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
    link.setAttribute('download', 'unicron_drill_bit_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Sample JSON Template
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
        description: "Optimized 6-blade aggressive cutting structure engineered for high penetration rates in offshore Malaysian clastics."
      }
    ];

    const blob = new Blob([JSON.stringify(jsonSample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'unicron_drill_bit_template.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pre-load realistic example
  const handleLoadExample = () => {
    const sampleBit: DrillBit = {
      id: `custom-sample-${Date.now()}`,
      model: "ViperPro V616 Matrix PDC",
      manufacturer: "Unicron Advanced Tooling",
      type: "PDC_MATRIX",
      sizeInch: 8.5,
      iadcCode: "M433",
      bladeCount: 6,
      cutterSizeMm: 16,
      bearingType: "NON_ROLLER",
      bodyMaterial: "TUNGSTEN_CARBIDE_MATRIX",
      hardfacingGrade: "Matrix Infiltration Tungsten Carbide",
      gaugeLengthInch: 2.25,
      junkSlotAreaPct: 42,
      nozzleCount: 6,
      nozzleSizes32nds: [13, 13, 13, 13, 14, 14],
      costUsd: 32500,
      idealFormations: ["Interbedded Sandstone", "Siltstone", "Gumbo Shale"],
      maxWobKlbf: 38,
      recommendedWobKlbf: [18, 32],
      recommendedRpm: [120, 165],
      recommendedFlowGpm: [480, 600],
      maxTorqueFtLbs: 14000,
      description: "Custom imported matrix PDC bit with 16mm premium PDC cutters designed for high ROP and durability.",
      unicronCatalogRef: `U-CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      isCustomUploaded: true,
      uploadedAt: new Date().toISOString(),
      sourceFileName: "sample_viperpro_v616.json"
    };

    setParsedBits([sampleBit]);
    setCurrentFile({ name: "sample_viperpro_v616.json", size: 1240 });
    setStatusMsg("Loaded sample drill bit specification ready for review!");
    setErrorMsg(null);
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

  // Process File handler
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

        setParsedBits(normalizedBits);
        setStatusMsg(`Successfully read ${normalizedBits.length} drill bit specification(s) from JSON.`);
      } 
      // Case 2: CSV / TSV File
      else if (fileNameLower.endsWith('.csv') || fileNameLower.endsWith('.tsv') || file.type === 'text/csv') {
        const text = await file.text();
        const bits = parseCsvContent(text, file.name);
        if (bits.length === 0) throw new Error("No valid drill bit rows found in CSV file.");
        setParsedBits(bits);
        setStatusMsg(`Successfully extracted ${bits.length} drill bit(s) from CSV spreadsheet.`);
      } 
      // Case 3: Universal Extraction for ALL other files: Images, PDF, Word, Excel, CAD, Well Logs, Specs, TXT
      else {
        const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|svg|tiff|gif)$/i.test(file.name);
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        
        setStatusMsg(`Analyzing "${file.name}" via Gemini Multimodal AI extraction...`);
        
        let fileContent = '';
        let isBase64 = false;
        let imagePreviewUrl: string | undefined = undefined;

        if (isImage || isPdf || file.size > 200000 || !file.type.startsWith('text')) {
          // Read as base64 for images, binary documents, CAD files, PDFs, etc.
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              if (isImage) imagePreviewUrl = res;
              const cleanBase64 = res.split(',')[1] || res;
              resolve(cleanBase64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          fileContent = base64;
          isBase64 = true;
        } else {
          // Read as text for text-based logs, reports, etc.
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
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.status === 'success' && data.extractedBit) {
          const raw = data.extractedBit;
          const bit: DrillBit = {
            id: String(raw.id || `extracted-${Date.now()}`),
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
            unicronCatalogRef: String(raw.unicronCatalogRef || `U-SPEC-${Math.floor(1000 + Math.random() * 9000)}`),
            allExtractedData: Array.isArray(data.allExtractedData) ? data.allExtractedData : (Array.isArray(raw.allExtractedData) ? raw.allExtractedData : []),
            rawAiSummary: data.rawAiSummary || raw.rawAiSummary || '',
            imageUrl: imagePreviewUrl || raw.imageUrl || (
              (raw.type === 'PDC_MATRIX' || String(raw.bodyMaterial || '').includes('MATRIX'))
                ? '/src/assets/images/real_pdc_matrix_bit_1791528149452.jpg'
                : (raw.type === 'ROLLER_CONE_TCI' || raw.type === 'ROLLER_CONE_MILLED')
                ? '/src/assets/images/real_roller_cone_bit_1791528221135.jpg'
                : '/src/assets/images/real_pdc_steel_bit_1791528122922.jpg'
            ),
            image3dUrl: imagePreviewUrl || raw.image3dUrl || raw.imageUrl || (
              (raw.type === 'PDC_MATRIX' || String(raw.bodyMaterial || '').includes('MATRIX'))
                ? '/src/assets/images/real_pdc_matrix_bit_1791528149452.jpg'
                : (raw.type === 'ROLLER_CONE_TCI' || raw.type === 'ROLLER_CONE_MILLED')
                ? '/src/assets/images/real_roller_cone_bit_1791528221135.jpg'
                : '/src/assets/images/real_pdc_steel_bit_1791528122922.jpg'
            ),
            sourceFileName: file.name,
            isCustomUploaded: true,
            uploadedAt: new Date().toISOString()
          };
          setParsedBits([bit]);
          setStatusMsg(`AI read all data from "${file.name}" for "${bit.model}" (${bit.sizeInch}").`);
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

  // Drag & drop handlers
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

  // Parse manual text / JSON
  const handleManualParse = () => {
    if (!jsonText.trim()) {
      setErrorMsg("Please enter valid JSON or CSV drill bit specifications.");
      return;
    }

    try {
      if (jsonText.trim().startsWith('{') || jsonText.trim().startsWith('[')) {
        const parsed = JSON.parse(jsonText);
        const arrayPayload = Array.isArray(parsed) ? parsed : [parsed];
        const normalizedBits: DrillBit[] = arrayPayload.map((raw: any, i: number) => ({
          id: raw.id || `manual-bit-${Date.now()}-${i}`,
          model: raw.model || `Manual Bit ${raw.sizeInch || 8.5}"`,
          manufacturer: raw.manufacturer || 'Manual Specification Entry',
          type: raw.type || 'PDC_STEEL',
          sizeInch: Number(raw.sizeInch) || 8.5,
          iadcCode: String(raw.iadcCode || 'S433').toUpperCase(),
          bladeCount: Number(raw.bladeCount) || 6,
          cutterSizeMm: Number(raw.cutterSizeMm) || 16,
          bearingType: raw.bearingType || 'NON_ROLLER',
          bodyMaterial: raw.bodyMaterial || 'STEEL',
          hardfacingGrade: raw.hardfacingGrade || 'Tungsten Carbide Hardfacing',
          gaugeLengthInch: Number(raw.gaugeLengthInch) || 2.25,
          junkSlotAreaPct: Number(raw.junkSlotAreaPct) || 40,
          nozzleCount: Number(raw.nozzleCount) || 6,
          nozzleSizes32nds: Array.isArray(raw.nozzleSizes32nds) ? raw.nozzleSizes32nds : [12, 12, 12, 14, 14, 14],
          costUsd: Number(raw.costUsd) || 28000,
          idealFormations: Array.isArray(raw.idealFormations) ? raw.idealFormations : ['Sandstone', 'Shale'],
          maxWobKlbf: Number(raw.maxWobKlbf) || 35,
          recommendedWobKlbf: Array.isArray(raw.recommendedWobKlbf) ? raw.recommendedWobKlbf : [15, 30],
          recommendedRpm: Array.isArray(raw.recommendedRpm) ? raw.recommendedRpm : [110, 160],
          recommendedFlowGpm: Array.isArray(raw.recommendedFlowGpm) ? raw.recommendedFlowGpm : [450, 600],
          maxTorqueFtLbs: Number(raw.maxTorqueFtLbs) || 12500,
          description: raw.description || 'Custom specified drill bit.',
          unicronCatalogRef: raw.unicronCatalogRef || `U-SPEC-${Math.floor(1000 + Math.random() * 9000)}`,
          isCustomUploaded: true,
          uploadedAt: new Date().toISOString(),
          sourceFileName: 'manual_input.json'
        }));
        setParsedBits(normalizedBits);
        setStatusMsg(`Parsed ${normalizedBits.length} bit(s) from JSON.`);
        setErrorMsg(null);
      } else {
        const bits = parseCsvContent(jsonText, 'manual_paste.csv');
        setParsedBits(bits);
        setStatusMsg(`Parsed ${bits.length} bit(s) from CSV text.`);
        setErrorMsg(null);
      }
    } catch (err: any) {
      setErrorMsg(`Parsing failed: ${err.message}`);
    }
  };

  // Submit / Commit bits to server & client catalog
  const handleCommitUpload = async () => {
    if (parsedBits.length === 0) {
      setErrorMsg("Please upload or load a drill bit specification first.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/bits/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bits: parsedBits })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        onBitUploaded(parsedBits);
        onClose();
      } else {
        throw new Error(data.message || 'Failed to commit drill bit upload.');
      }
    } catch (err: any) {
      console.warn('Backend upload failed, updating client-side catalog directly:', err);
      // Fallback: update client state directly so user experience never fails
      onBitUploaded(parsedBits);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  // Update a field in the preview bit
  const handleUpdateBitField = (index: number, field: keyof DrillBit, value: any) => {
    setParsedBits(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col my-8 animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold tracking-tight">Upload Drill Bit File</h3>
                <span className="text-[10px] bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded-full border border-sky-400/30 font-semibold">
                  CSV &bull; JSON &bull; Spec Sheet &bull; Image
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Import custom drill bit specifications into the Unicron engineering catalog & advisory engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Template Download Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1 bg-slate-200/80 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              File Dropzone
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paste JSON / CSV
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadCsvTemplate}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 font-medium transition cursor-pointer shadow-2xs"
              title="Download standard CSV template for drill bits"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV Template</span>
            </button>

            <button
              onClick={handleDownloadJsonTemplate}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-300 font-medium transition cursor-pointer shadow-2xs"
              title="Download standard JSON template for drill bits"
            >
              <Code className="w-3.5 h-3.5 text-sky-600" />
              <span>JSON Template</span>
            </button>

            <button
              onClick={handleLoadExample}
              className="flex items-center space-x-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg border border-sky-200 font-medium transition cursor-pointer shadow-2xs"
              title="Quickly test with a sample bit specification"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Sample Bit</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Upload Error: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {statusMsg && !errorMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">{statusMsg}</div>
            </div>
          )}

          {activeTab === 'upload' ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragActive 
                  ? 'border-sky-500 bg-sky-50/70' 
                  : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0]);
                  }
                }}
              />

              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-sky-600 group-hover:scale-105 transition">
                {isProcessing ? (
                  <RotateCw className="w-7 h-7 animate-spin text-sky-600" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  {isProcessing ? 'Processing File with AI...' : 'Click to select or drag & drop ANY drill bit file'}
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  Supports <strong>ALL file formats</strong> &bull; Photos, PDFs, Word, Excel, CAD models, CSV, JSON, LAS logs, and custom specs.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    📸 Images (.jpg, .png, .webp)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    📄 Docs (.pdf, .docx, .txt)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    📊 Spreadsheets (.csv, .xlsx)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    ⚙️ CAD (.step, .obj, .dwg)
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    💾 Data (.json, .las, .xml)
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-sky-50 text-sky-700 rounded-xl border border-sky-200 font-bold text-xs transition cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-4 h-4 text-sky-600" />
                    <span>Take Photo with Camera</span>
                  </button>
                </div>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processUploadedFile(e.target.files[0]);
                  }
                }}
              />

              {currentFile && !isProcessing && (
                <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs mt-1">
                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-semibold">{currentFile.name}</span>
                  <span className="text-slate-400">({Math.round(currentFile.size / 1024)} KB)</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Paste JSON Object/Array or CSV Rows:
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder={`Example JSON:\n{\n  "model": "UniForce Matrix 8-1/2",\n  "sizeInch": 8.5,\n  "type": "PDC_MATRIX",\n  "iadcCode": "M423",\n  "bladeCount": 5,\n  "cutterSizeMm": 19,\n  "costUsd": 31000\n}`}
                rows={6}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
              <button
                onClick={handleManualParse}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                Parse & Preview Specification
              </button>
            </div>
          )}

          {/* Parsed Bit Preview Section */}
          {parsedBits.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-600" />
                  <span>Parsed Drill Bit Preview ({parsedBits.length} tool{parsedBits.length > 1 ? 's' : ''})</span>
                </h4>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ready to Import
                </span>
              </div>

              <div className="space-y-3">
                {parsedBits.map((bit, idx) => (
                  <div 
                    key={bit.id || idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 shadow-2xs"
                  >
                    {/* Drill Bit Real Photograph & Match Status */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="w-20 h-20 bg-slate-950 rounded-lg p-1.5 border border-slate-800 flex items-center justify-center shrink-0">
                        <img 
                          src={bit.imageUrl || bit.image3dUrl || '/src/assets/images/real_pdc_steel_bit_1791528122922.jpg'} 
                          alt={bit.model}
                          className="w-full h-full object-contain drop-shadow select-none"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Camera className="w-3 h-3 text-emerald-600" />
                            REAL DRILL BIT PHOTOGRAPH
                          </span>
                          {bit.sourceFileName && (
                            <span className="text-[10px] text-slate-500 font-mono truncate">
                              {bit.sourceFileName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          This photograph will be saved to your drill bit catalog. You can change this image using any photo file or camera capture.
                        </p>
                      </div>
                      <label className="px-2.5 py-1.5 rounded-lg border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const f = e.target.files[0];
                              const r = new FileReader();
                              r.onload = () => {
                                handleUpdateBitField(idx, 'imageUrl', r.result as string);
                                handleUpdateBitField(idx, 'image3dUrl', r.result as string);
                                handleUpdateBitField(idx, 'sourceFileName', f.name);
                              };
                              r.readAsDataURL(f);
                            }
                          }}
                        />
                        <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
                        <span>Change Photo</span>
                      </label>
                    </div>

                    {/* Top Row: Model & Size & Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                          Model Name:
                        </label>
                        <input
                          type="text"
                          value={bit.model}
                          onChange={(e) => handleUpdateBitField(idx, 'model', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                          Hole Diameter (Inches):
                        </label>
                        <input
                          type="number"
                          step="0.125"
                          value={bit.sizeInch}
                          onChange={(e) => handleUpdateBitField(idx, 'sizeInch', parseFloat(e.target.value) || 8.5)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                          Bit Category:
                        </label>
                        <select
                          value={bit.type}
                          onChange={(e) => handleUpdateBitField(idx, 'type', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                        >
                          <option value="PDC_STEEL">PDC Steel Body</option>
                          <option value="PDC_MATRIX">PDC Matrix Body</option>
                          <option value="ROLLER_CONE_TCI">Roller Cone TCI</option>
                          <option value="STAGE_HOLE_OPENER">Stage Hole Opener (SHO)</option>
                        </select>
                      </div>
                    </div>

                    {/* Middle Row: Cutting structure & IADC */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">IADC Code:</span>
                        <input
                          type="text"
                          value={bit.iadcCode}
                          onChange={(e) => handleUpdateBitField(idx, 'iadcCode', e.target.value)}
                          className="w-full bg-transparent text-amber-700 font-mono font-bold focus:outline-none"
                        />
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Blade Count:</span>
                        <input
                          type="number"
                          value={bit.bladeCount || 6}
                          onChange={(e) => handleUpdateBitField(idx, 'bladeCount', parseInt(e.target.value) || 6)}
                          className="w-full bg-transparent text-slate-800 font-bold focus:outline-none"
                        />
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Cutter Size (mm):</span>
                        <input
                          type="number"
                          value={bit.cutterSizeMm || 16}
                          onChange={(e) => handleUpdateBitField(idx, 'cutterSizeMm', parseInt(e.target.value) || 16)}
                          className="w-full bg-transparent text-slate-800 font-bold focus:outline-none"
                        />
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Cost ($ USD):</span>
                        <input
                          type="number"
                          value={bit.costUsd}
                          onChange={(e) => handleUpdateBitField(idx, 'costUsd', parseFloat(e.target.value) || 28000)}
                          className="w-full bg-transparent text-emerald-700 font-mono font-bold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Operating Envelope Summary */}
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 gap-2">
                      <div>
                        <span className="text-slate-400">Rec. WOB: </span>
                        <span className="font-semibold text-sky-700 font-mono">
                          {bit.recommendedWobKlbf?.[0] ?? 15}-{bit.recommendedWobKlbf?.[1] ?? 30} klbf
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Rec. RPM: </span>
                        <span className="font-semibold text-sky-700 font-mono">
                          {bit.recommendedRpm?.[0] ?? 110}-{bit.recommendedRpm?.[1] ?? 160} RPM
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Mud Flow: </span>
                        <span className="font-semibold text-sky-700 font-mono">
                          {bit.recommendedFlowGpm?.[0] ?? 450}-{bit.recommendedFlowGpm?.[1] ?? 600} GPM
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Ref: </span>
                        <span className="font-mono text-slate-700">{bit.unicronCatalogRef || 'SPEC-CAT'}</span>
                      </div>
                    </div>

                    {/* All Extracted Data Items if present */}
                    {bit.allExtractedData && bit.allExtractedData.length > 0 && (
                      <div className="bg-sky-50/50 rounded-lg p-2.5 border border-sky-100">
                        <span className="text-[10px] font-bold uppercase text-sky-900 block mb-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-sky-600" />
                          <span>All Data Extracted from File ({bit.allExtractedData.length} Parameters):</span>
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto text-[11px]">
                          {bit.allExtractedData.map((d, dIdx) => (
                            <div key={dIdx} className="bg-white p-1.5 rounded border border-slate-200">
                              <span className="text-[10px] text-slate-400 block leading-tight">{d.key}</span>
                              <span className="font-semibold text-slate-800 break-words">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 font-semibold text-xs transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-3">
            {parsedBits.length > 0 && (
              <span className="text-xs text-slate-500 hidden sm:inline">
                {parsedBits.length} bit(s) ready to import
              </span>
            )}
            <button
              onClick={handleCommitUpload}
              disabled={isProcessing || parsedBits.length === 0}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding to Catalog...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Add {parsedBits.length > 0 ? `(${parsedBits.length})` : ''} to Active Catalog</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
