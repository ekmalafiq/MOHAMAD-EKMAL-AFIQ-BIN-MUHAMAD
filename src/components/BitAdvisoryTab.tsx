import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  Gauge, 
  ArrowRight, 
  RotateCw, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  Sliders,
  DollarSign,
  Zap,
  Check,
  Copy,
  ChevronRight,
  Wrench,
  Clock,
  Compass,
  ShieldCheck,
  MapPin,
  X,
  Phone,
  Mail,
  SlidersHorizontal,
  Flame,
  Layers,
  UploadCloud,
  Box,
  Bot,
  FileText,
  FileSpreadsheet,
  Eye,
  FileCheck,
  RefreshCw,
  FileCode,
  File
} from 'lucide-react';
import { DrillBit, FormationPreset, AdvisoryRecommendation } from '../types';
import { BitVisualizer } from './BitVisualizer';
import { UnicronLogo } from './UnicronLogo';

interface BitAdvisoryTabProps {
  formationPresets: FormationPreset[];
  catalog: DrillBit[];
  isSimpleMode?: boolean;
  setIsSimpleMode?: (val: boolean) => void;
  onOpenUploadModal?: () => void;
  onNavigateToUpload?: () => void;
  onSelectBitForMse?: (bit: DrillBit, wob: number, rpm: number) => void;
  onNavigateToHydraulics?: () => void;
  onNavigateToAiChat?: () => void;
  activeBit?: DrillBit;
  onSetActiveBit?: (bit: DrillBit) => void;
  onAddBit?: (bit: DrillBit) => void;
}

export const BitAdvisoryTab: React.FC<BitAdvisoryTabProps> = ({
  formationPresets,
  catalog,
  isSimpleMode = true,
  setIsSimpleMode,
  onOpenUploadModal,
  onNavigateToUpload,
  onSelectBitForMse,
  onNavigateToHydraulics,
  onNavigateToAiChat,
  activeBit,
  onSetActiveBit,
  onAddBit
}) => {
  // Helper to ensure advice or rationales are always string primitives (handles unexpected objects)
  const formatAdvice = (content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (typeof content === 'object') {
      return Object.entries(content)
        .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').trim()}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(' | ');
    }
    return String(content);
  };

  // Simple Mode State
  const [simpleHoleSize, setSimpleHoleSize] = useState<number>(8.5);
  const [simpleFormation, setSimpleFormation] = useState<'shale' | 'sandstone' | 'carbonate'>('sandstone');
  const [simpleObjective, setSimpleObjective] = useState<'speed' | 'durability' | 'directional'>('speed');
  const [copiedRecipe, setCopiedRecipe] = useState<boolean>(false);
  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);

  // Expert Mode Form State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('malay-basin-baram');
  const [formationName, setFormationName] = useState<string>('Baram Delta Formation (Offshore Sarawak)');
  const [depthInterval, setDepthInterval] = useState<string>('1,800m - 2,950m TVD');
  const [bitSizeInch, setBitSizeInch] = useState<number>(8.5);
  const [lithology, setLithology] = useState<string>('Interbedded Sandstone, Siltstone & Marine Shales');
  const [ucsMpa, setUcsMpa] = useState<number>(55);
  const [abrasiveness, setAbrasiveness] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'>('MEDIUM');
  const [shalePlasticity, setShalePlasticity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'GUMBO'>('HIGH');
  const [wellTrajectory, setWellTrajectory] = useState<'VERTICAL' | 'DIRECTIONAL_MOTOR' | 'ROTARY_STEERABLE_RSS'>('ROTARY_STEERABLE_RSS');
  const [mudType, setMudType] = useState<'WBM' | 'OBM' | 'SOBM'>('OBM');
  const [targetRopFtPerHour, setTargetRopFtPerHour] = useState<number>(75);

  // Advisory State
  const [loading, setLoading] = useState<boolean>(false);
  const [advisoryResult, setAdvisoryResult] = useState<AdvisoryRecommendation | null>(null);
  const [engineMode, setEngineMode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File Upload & AI Selection State
  const [recommendationSource, setRecommendationSource] = useState<'file' | 'manual'>('file');
  const [uploadedFile, setUploadedFile] = useState<{
    file?: File;
    name: string;
    size: number;
    type: string;
    content?: string;
    isBase64?: boolean;
  } | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [fileAnalysisSuccess, setFileAnalysisSuccess] = useState<boolean>(false);
  const [showAllExtractedParamsModal, setShowAllExtractedParamsModal] = useState<boolean>(false);
  const [useUploadFileForAll, setUseUploadFileForAll] = useState<boolean>(true);
  const [fileAppliedToast, setFileAppliedToast] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Preset selection
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = formationPresets.find(item => item.id === presetId);
    if (p) {
      setFormationName(p.name);
      setDepthInterval(p.depthInterval);
      setLithology(p.lithology);
      setUcsMpa(Math.round((p.ucsRangeMpa[0] + p.ucsRangeMpa[1]) / 2));
      setAbrasiveness(p.abrasiveness);
      setShalePlasticity(p.shalePlasticity);
    }
  };

  // Run AI Recommendation
  const runAdvisoryAnalysis = async (overrides?: {
    size?: number;
    formation?: 'shale' | 'sandstone' | 'carbonate';
    objective?: 'speed' | 'durability' | 'directional';
  }) => {
    setLoading(true);
    setErrorMsg(null);

    const activeSize = overrides?.size ?? bitSizeInch;
    const activeFormType = overrides?.formation ?? simpleFormation;
    const activeObj = overrides?.objective ?? simpleObjective;

    let targetLithology = lithology;
    let targetUcs = ucsMpa;
    let targetAbrasiveness = abrasiveness;
    let targetPlasticity = shalePlasticity;
    let targetTrajectory = wellTrajectory;
    let targetRop = targetRopFtPerHour;

    if (overrides) {
      if (activeFormType === 'shale') {
        targetLithology = 'Soft Gumbo Shale & Reactive Marine Clay';
        targetUcs = 35;
        targetPlasticity = 'GUMBO';
        targetAbrasiveness = 'LOW';
      } else if (activeFormType === 'sandstone') {
        targetLithology = 'Interbedded Quartz Sandstone & Siltstone';
        targetUcs = 60;
        targetPlasticity = 'MEDIUM';
        targetAbrasiveness = 'MEDIUM';
      } else if (activeFormType === 'carbonate') {
        targetLithology = 'Dense Carbonate Limestone & Dolomite';
        targetUcs = 115;
        targetPlasticity = 'LOW';
        targetAbrasiveness = 'HIGH';
      }

      if (activeObj === 'speed') {
        targetRop = 95;
      } else if (activeObj === 'durability') {
        targetRop = 60;
      } else if (activeObj === 'directional') {
        targetTrajectory = 'ROTARY_STEERABLE_RSS';
        targetRop = 75;
      }
    }

    try {
      const response = await fetch('/api/advisory/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formationName: overrides ? `Simple Selection (${activeFormType.toUpperCase()})` : formationName,
          depthInterval,
          bitSizeInch: activeSize,
          lithology: targetLithology,
          ucsMpa: targetUcs,
          abrasiveness: targetAbrasiveness,
          shalePlasticity: targetPlasticity,
          wellTrajectory: targetTrajectory,
          mudType,
          targetRopFtPerHour: targetRop
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        const rec = data.recommendation;
        if (rec) {
          rec.aiRationale = formatAdvice(rec.aiRationale);
          rec.engineeringAdvice = formatAdvice(rec.engineeringAdvice);
          if (Array.isArray(rec.drillingRisks)) {
            rec.drillingRisks = rec.drillingRisks.map((r: any) => formatAdvice(r));
          }
        }
        setAdvisoryResult(rec);
        setEngineMode(data.engineMode);
      } else {
        throw new Error(data.message || 'Failed to process recommendation');
      }
    } catch (err: any) {
      console.warn('API error, using local fallback:', err);
      setErrorMsg('Connected to deterministic petroleum heuristics (offline mode).');
      
      // Fallback local resolution
      const defaultFallbackBit: DrillBit = {
        id: 'unicron-pdc-s519',
        model: 'UniSpeed S519 Aggressive Steel PDC',
        manufacturer: 'Unicron Holdings',
        type: 'PDC_STEEL',
        sizeInch: activeSize || 12.25,
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
        description: 'Large 19mm cutters with deep junk slots designed to maximize instantaneous ROP.',
        unicronCatalogRef: 'UCH-PDC-1225-S519'
      };

      const matched = catalog.find(b => Math.abs(b.sizeInch - activeSize) < 0.25) || catalog[0] || defaultFallbackBit;
      const contingency = catalog.find(b => b.id !== matched.id) || catalog[1] || matched;

      setAdvisoryResult({
        primaryBit: matched,
        contingencyBit: contingency,
        operatingEnvelope: {
          wobRangeKlbf: (Array.isArray(matched.recommendedWobKlbf) && matched.recommendedWobKlbf.length >= 2) ? matched.recommendedWobKlbf : [15, 30],
          rpmRange: (Array.isArray(matched.recommendedRpm) && matched.recommendedRpm.length >= 2) ? matched.recommendedRpm : [110, 160],
          targetHsi: targetPlasticity === 'GUMBO' ? 4.5 : 3.2,
          recommendedFlowGpm: (Array.isArray(matched.recommendedFlowGpm) && matched.recommendedFlowGpm.length >= 2) ? matched.recommendedFlowGpm : [450, 600],
          maxTorqueFtLbs: matched.maxTorqueFtLbs || 12500
        },
        aiRationale: `Based on rock compressive strength of ${targetUcs} MPa and ${targetAbrasiveness} abrasiveness, ${matched.model} delivers optimal durability and high ROP. Its ${matched.bodyMaterial === 'STEEL' ? 'steel body delivers high junk slot area (JSA) to prevent bit balling in sticky shale' : 'tungsten carbide matrix resists erosion in abrasive sands'}.`,
        drillingRisks: [
          targetPlasticity === 'GUMBO' ? 'Bit balling in reactive claystone' : 'Abrasive diamond table cutter wear',
          targetTrajectory === 'ROTARY_STEERABLE_RSS' ? 'Lateral bit whirl at elevated RPM' : 'Torsional stick-slip vibration',
          'Thermal fatigue from high circulating bottom-hole temperatures'
        ],
        engineeringAdvice: `Tag bottom with ${matched.recommendedWobKlbf?.[0] ?? 15} klbf WOB and ramp rotation to ${matched.recommendedRpm?.[0] ?? 110} RPM. Keep flow rate at ${matched.recommendedFlowGpm?.[0] ?? 450}-${matched.recommendedFlowGpm?.[1] ?? 600} GPM to maintain borehole hygiene and avoid cuttings accumulation.`,
        costAnalysis: {
          costPerFoot: 185.50,
          totalRunCost: 333900,
          rotatingCost: 260400,
          tripCost: 45000,
          breakEvenRopFtPerHour: 48.2,
          averageRopFtPerHour: targetRop
        }
      });
      setEngineMode('DETERMINISTIC_ENGINE');
    } finally {
      setLoading(false);
    }
  };

  // Process Uploaded File to Recommended Drill Bit
  const processUploadedFileForRecommendation = async (fileToProcess?: {
    file?: File;
    name: string;
    size: number;
    type: string;
    content?: string;
    isBase64?: boolean;
  }) => {
    const target = fileToProcess || uploadedFile;
    if (!target) return;

    setIsProcessingFile(true);
    setLoading(true);
    setErrorMsg(null);
    setFileAnalysisSuccess(false);

    try {
      setProcessingStep('1/4: Ingesting file & decoding data streams...');
      await new Promise(r => setTimeout(r, 200));

      let fileContent = target.content || '';
      let isBase64 = target.isBase64 ?? false;
      let effectiveMime = target.type || 'application/octet-stream';

      let uploadedImageDataUrl: string | undefined = undefined;

      if (target.file && !fileContent) {
        const file = target.file;
        const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|svg)$/i.test(file.name);
        const isBinary = isImage || 
          file.type === 'application/pdf' || 
          file.name.toLowerCase().endsWith('.pdf') || 
          file.name.toLowerCase().endsWith('.ai') ||
          file.size > 200000 || 
          !file.type.startsWith('text');

        if (isBinary) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              if (isImage) uploadedImageDataUrl = res;
              resolve(res.split(',')[1] || res);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          fileContent = base64;
          isBase64 = true;
        } else {
          fileContent = await file.text();
        }
      }

      setProcessingStep('2/4: Extracting downhole rock mechanics, hole dimensions & stratigraphy...');
      await new Promise(r => setTimeout(r, 250));

      setProcessingStep('3/4: Matching against Unicron drill bit fleet & optimizing cutter layout...');

      const response = await fetch('/api/advisory/process-file-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent,
          fileName: target.name,
          mimeType: effectiveMime,
          isBase64
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' && data.recommendation) {
        setProcessingStep('4/4: Formulating SPE operating envelope & risk mitigations...');
        await new Promise(r => setTimeout(r, 200));

        const rec = data.recommendation;
        if (rec) {
          rec.aiRationale = formatAdvice(rec.aiRationale);
          rec.engineeringAdvice = formatAdvice(rec.engineeringAdvice);
          if (Array.isArray(rec.drillingRisks)) {
            rec.drillingRisks = rec.drillingRisks.map((r: any) => formatAdvice(r));
          }
          if (rec.primaryBit && uploadedImageDataUrl) {
            rec.primaryBit.imageUrl = uploadedImageDataUrl;
            rec.primaryBit.image3dUrl = uploadedImageDataUrl;
            rec.primaryBit.isCustomUploaded = true;
          }
        }

        setAdvisoryResult(rec);
        setEngineMode(data.engineMode || 'GEMINI_AI');
        setFileAnalysisSuccess(true);
        setUseUploadFileForAll(true);

        if (data.wellParameters) {
          setBitSizeInch(data.wellParameters.bitSizeInch || 8.5);
          setFormationName(data.wellParameters.formationName || formationName);
          setDepthInterval(data.wellParameters.depthInterval || depthInterval);
          setLithology(data.wellParameters.lithology || lithology);
          setUcsMpa(data.wellParameters.ucsMpa || ucsMpa);
          setAbrasiveness(data.wellParameters.abrasiveness || abrasiveness);
          setShalePlasticity(data.wellParameters.shalePlasticity || shalePlasticity);
          setWellTrajectory(data.wellParameters.wellTrajectory || wellTrajectory);
          setMudType(data.wellParameters.mudType || mudType);
          setTargetRopFtPerHour(data.wellParameters.targetRopFtPerHour || targetRopFtPerHour);
        }

        if (onSetActiveBit && rec.primaryBit) {
          onSetActiveBit(rec.primaryBit);
        }

        setFileAppliedToast(true);
        setTimeout(() => setFileAppliedToast(false), 5000);
      } else {
        throw new Error(data.message || 'Failed to process file recommendation.');
      }
    } catch (err: any) {
      console.error('File recommendation failed:', err);
      setErrorMsg(err.message || 'Error processing file. Connecting to petroleum heuristic models.');
    } finally {
      setIsProcessingFile(false);
      setLoading(false);
    }
  };

  const handleLoadSampleFile = (type: 'baram_pdf' | 'luconia_las' | 'unimatrix_ai' | 'sabah_csv') => {
    let sample: { name: string; size: number; type: string; content: string; isBase64: boolean };

    if (type === 'baram_pdf') {
      sample = {
        name: 'Baram_Delta_Well_Offset_Record.pdf',
        size: 245000,
        type: 'application/pdf',
        content: 'Baram Delta Deltaic Clastics Formation\nDepth: 1850m - 2900m TVD\nHole Size: 8.5 inch\nLithology: Interbedded Quartz Sandstone, Siltstone & Marine Shales\nUCS: 55 MPa\nAbrasiveness: MEDIUM\nShale Plasticity: HIGH GUMBO\nTrajectory: ROTARY_STEERABLE_RSS\nMud: OBM\nTarget ROP: 75 ft/hr\nOffset Dull: 1-1-WT-A-X-I-NO-TD',
        isBase64: false
      };
    } else if (type === 'luconia_las') {
      sample = {
        name: 'Central_Luconia_Carbonate_Mud_Log.las',
        size: 512000,
        type: 'text/plain',
        content: '~WELL INFORMATION\nWELL. Central Luconia Platform C-08\nSEC. 12.25 inch Hole Section\nSTRAT. Central Luconia Carbonate Reef Platform\nLITH. Dense Carbonate Limestone, Dolomite & Hard Chert Nodules\nUCS. 115 MPa\nABR. HIGH\nTRAJ. DIRECTIONAL_MOTOR\nMUD. SOBM\nROP_TARGET. 50 ft/hr',
        isBase64: false
      };
    } else if (type === 'unimatrix_ai') {
      sample = {
        name: 'UniSpeed_S519_CAD_Blueprint.ai',
        size: 1840000,
        type: 'application/illustrator',
        content: '%PDF-1.5 %Adobe-Illustrator-Spec: UniSpeed S519 Aggressive Steel PDC 12.25 inch 5-blade spiral cutter layout 19mm polished cutters 52% JSA nozzles 3x14 3x16 1x18/32 inch for high ROP in shale and sand',
        isBase64: false
      };
    } else {
      sample = {
        name: 'Deepwater_Sabah_Turbidite_Offset.csv',
        size: 84000,
        type: 'text/csv',
        content: 'section,hole_size,formation,lithology,ucs_mpa,abrasiveness,plasticity,trajectory,mud,target_rop\n12.25,12.25,Deepwater Sabah Turbidite,Massive Marine Claystone & Turbidite Sands,45,LOW,GUMBO,ROTARY_STEERABLE_RSS,OBM,85',
        isBase64: false
      };
    }

    setUploadedFile(sample);
    processUploadedFileForRecommendation(sample);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const target = {
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream'
      };
      setUploadedFile(target);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const target = {
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream'
      };
      setUploadedFile(target);
    }
  };

  // Do not automatically run mock advisory on initial mount to keep the screen clean until user requests it
  useEffect(() => {
    // Keep empty on initial mount so user can initiate AI analysis or upload files cleanly
  }, []);

  // Handle Simple Selection updates
  const handleSimpleSizeSelect = (size: number) => {
    setSimpleHoleSize(size);
    setBitSizeInch(size);
    runAdvisoryAnalysis({ size, formation: simpleFormation, objective: simpleObjective });
  };

  const handleSimpleFormationSelect = (formation: 'shale' | 'sandstone' | 'carbonate') => {
    setSimpleFormation(formation);
    runAdvisoryAnalysis({ size: simpleHoleSize, formation, objective: simpleObjective });
  };

  const handleSimpleObjectiveSelect = (objective: 'speed' | 'durability' | 'directional') => {
    setSimpleObjective(objective);
    runAdvisoryAnalysis({ size: simpleHoleSize, formation: simpleFormation, objective });
  };

  const handleCopyRecipe = () => {
    if (!advisoryResult) return;
    const text = `Unicron DrillBit Recommendation:
Bit: ${advisoryResult.primaryBit.model} (${advisoryResult.primaryBit.sizeInch}")
IADC: ${advisoryResult.primaryBit.iadcCode}
Weight on Bit (WOB): ${advisoryResult.operatingEnvelope.wobRangeKlbf[0]} - ${advisoryResult.operatingEnvelope.wobRangeKlbf[1]} klbf
Rotary Speed: ${advisoryResult.operatingEnvelope.rpmRange[0]} - ${advisoryResult.operatingEnvelope.rpmRange[1]} RPM
Mud Flow: ${advisoryResult.operatingEnvelope.recommendedFlowGpm[0]} - ${advisoryResult.operatingEnvelope.recommendedFlowGpm[1]} GPM
Ref: ${advisoryResult.primaryBit.unicronCatalogRef}
PETRONAS Licensed Tooling - Unicron Holdings KSB/ASB`;

    navigator.clipboard.writeText(text);
    setCopiedRecipe(true);
    setTimeout(() => setCopiedRecipe(false), 2500);
  };

  // Generate ROP vs WOB sensitivity curve data points for SVG chart
  const wobValues = [10, 15, 20, 25, 30, 35, 40];
  const sensitivityCurve = wobValues.map(wob => {
    const baseRop = Math.min(160, Math.max(15, (Math.pow(wob / bitSizeInch, 1.25) * Math.pow(120, 0.6) * 18) / (ucsMpa * 0.35)));
    return {
      wob,
      ropLowRpm: Math.round(baseRop * 0.75),
      ropOptimumRpm: Math.round(baseRop),
      ropHighRpm: Math.round(baseRop * 1.25)
    };
  });

  return (
    <div className="space-y-6">
      {/* Intro Banner with Mode Switcher */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-xs border border-slate-200 shrink-0 hidden sm:flex items-center justify-center">
            <UnicronLogo variant="emblem" size="md" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                PETRONAS Licensed Technology
              </span>
              <span className="text-xs text-slate-500">
                {isSimpleMode ? 'Simple 1-Click Bit Selector' : 'Downhole Rock Mechanics & SPE Formulation'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {isSimpleMode ? 'Quick Drill Bit Recommendation' : 'AI Drill Bit Selection & Operating Envelope Optimization'}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              {isSimpleMode
                ? 'Select hole size, rock type, and your drilling objective below. Unicron AI instantly calculates the ideal drill bit and operating recipe for your well.'
                : 'Input formation stratigraphy, UCS rock compressive strength, and BHA mechanics to evaluate Unicron matrix/steel PDC and TCI roller cones.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-start lg:self-auto shrink-0">
          {/* Upload Drill Bit File button */}
          {(onNavigateToUpload || onOpenUploadModal) && (
            <button
              onClick={() => {
                if (onNavigateToUpload) {
                  onNavigateToUpload();
                } else if (onOpenUploadModal) {
                  onOpenUploadModal();
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Upload custom drill bit file"
            >
              <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
              <span>Upload Bit File</span>
            </button>
          )}

          {/* Quick toggle button */}
          {setIsSimpleMode && (
            <button
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              {isSimpleMode ? (
                <>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
                  <span>Switch to Expert Mode</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Switch to Simple Mode</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => runAdvisoryAnalysis(isSimpleMode ? { size: simpleHoleSize, formation: simpleFormation, objective: simpleObjective } : undefined)}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSimpleMode ? 'Refresh Bit' : 'Run AI Selection'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMPLE MODE VIEW (CLEAN, 3-STEP INTUITIVE EXPERIENCE)                     */}
      {/* ========================================================================= */}
      {isSimpleMode ? (
        <div className="space-y-6">
          {/* Selection Source Hub: [ Upload File All & Run AI Selection ] vs [ Manual 3-Step Wizard ] */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRecommendationSource('file')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  recommendationSource === 'file'
                    ? 'bg-white text-sky-800 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-sky-600" />
                <span>Upload File All & Run AI Selection</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 text-sky-700">NEW</span>
              </button>

              <button
                type="button"
                onClick={() => setRecommendationSource('manual')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  recommendationSource === 'manual'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <span>Manual 3-Step Wizard</span>
              </button>
            </div>

            {/* If a file has been processed, show quick active badge */}
            {fileAnalysisSuccess && uploadedFile && (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-900 font-medium truncate max-w-xs sm:max-w-md">
                  Recommendation active from: <strong className="font-semibold">{uploadedFile.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllExtractedParamsModal(true)}
                  className="ml-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  View Data
                </button>
              </div>
            )}
          </div>

          {/* File Ingestion & Selection Studio */}
          {recommendationSource === 'file' && (
            <div className="space-y-4">
              {/* Dropzone Card */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 transition-all text-center ${
                  dragActive 
                    ? 'border-sky-500 bg-sky-50/70 scale-[0.99]' 
                    : uploadedFile
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="*/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="max-w-xl mx-auto space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-7 h-7 text-sky-600" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Upload File All & Run AI Selection
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Drag & drop or browse <strong>any file</strong>: Adobe Illustrator (<span className="font-mono text-sky-700 font-semibold">.ai</span>), 
                      Well Logs (<span className="font-mono text-sky-700 font-semibold">.las/.txt</span>), Mud Logs, PDF Reports, CSV/Excel Spreadsheets, CAD Drawings, or Images.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    {['.AI Vector Specs', '.PDF Well Reports', '.LAS Logs', '.CSV / Excel', 'CAD Drawings', 'Images & Specs'].map((fmt, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {fmt}
                      </span>
                    ))}
                  </div>

                  {/* Selected File Badge */}
                  {uploadedFile ? (
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="truncate max-w-xs sm:max-w-md">
                          <div className="text-xs font-bold text-slate-900 truncate">{uploadedFile.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {(uploadedFile.size / 1024).toFixed(1)} KB &bull; {uploadedFile.type || 'Technical Document'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFile(null);
                            setFileAnalysisSuccess(false);
                          }}
                          className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                        >
                          Change File
                        </button>
                        <button
                          type="button"
                          onClick={() => processUploadedFileForRecommendation()}
                          disabled={isProcessingFile}
                          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                          {isProcessingFile ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Process to Recommended File</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition flex items-center space-x-2 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Browse Device Files</span>
                      </button>
                    </div>
                  )}

                  {/* Quick-load Sample Files */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Or Test With 1-Click Example Files:
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadSampleFile('baram_pdf')}
                        disabled={isProcessingFile}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-rose-500" />
                        <span>Baram Delta Well Offset (.pdf)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleFile('luconia_las')}
                        disabled={isProcessingFile}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Central Luconia Mud Log (.las)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleFile('unimatrix_ai')}
                        disabled={isProcessingFile}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <FileCode className="w-3.5 h-3.5 text-amber-600" />
                        <span>UniSpeed S519 CAD Spec (.ai)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadSampleFile('sabah_csv')}
                        disabled={isProcessingFile}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        <span>Deepwater Sabah Turbidite (.csv)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Indicator */}
              {isProcessingFile && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-sky-900 font-bold text-xs">
                    <RotateCw className="w-4 h-4 animate-spin text-sky-600" />
                    <span>AI Reading & Processing File to Drill Bit Recommendation...</span>
                  </div>
                  <p className="text-xs text-sky-700 font-mono">{processingStep}</p>
                </div>
              )}

              {/* File Processed Transparency & Parameters Banner */}
              {fileAnalysisSuccess && advisoryResult && (
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border border-emerald-200 p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            FILE ANALYSIS COMPLETE
                          </span>
                          <span className="text-xs text-slate-600 font-mono">
                            Source: {uploadedFile?.name || advisoryResult.sourceFileName}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          Recommended Drill Bit Formulated From File Data
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAllExtractedParamsModal(true)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Inspect All Data ({advisoryResult.extractedFileParameters?.length || 10})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSetActiveBit && advisoryResult.primaryBit) {
                            onSetActiveBit(advisoryResult.primaryBit);
                            setFileAppliedToast(true);
                            setTimeout(() => setFileAppliedToast(false), 4000);
                          }
                        }}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Apply As Active Well Bit</span>
                      </button>
                    </div>
                  </div>

                  {/* Extracted Rock Mechanics & Section Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Hole Section</span>
                      <span className="text-sm font-black text-slate-900 font-mono">{bitSizeInch}"</span>
                      <span className="text-[10px] text-slate-400 block">{(bitSizeInch * 25.4).toFixed(1)} mm</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Rock UCS</span>
                      <span className="text-sm font-black text-amber-700 font-mono">{ucsMpa} MPa</span>
                      <span className="text-[10px] text-slate-400 block">{Math.round(ucsMpa * 145.038)} psi</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Abrasiveness</span>
                      <span className="text-xs font-bold text-slate-900">{abrasiveness}</span>
                      <span className="text-[10px] text-slate-400 block">Quartz index</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Shale Plasticity</span>
                      <span className="text-xs font-bold text-slate-900">{shalePlasticity}</span>
                      <span className="text-[10px] text-slate-400 block">Clay reactivity</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Mud System</span>
                      <span className="text-xs font-bold text-sky-800">{mudType}</span>
                      <span className="text-[10px] text-slate-400 block">Hydraulic base</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Trajectory</span>
                      <span className="text-xs font-bold text-slate-900 truncate block">{wellTrajectory.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400 block">BHA assembly</span>
                    </div>
                  </div>

                  {/* AI Summary note */}
                  {advisoryResult.fileSummary && (
                    <div className="text-xs text-emerald-950 bg-white/70 p-3 rounded-xl border border-emerald-200/70 italic flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{advisoryResult.fileSummary}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual 3-Step Wizard View */}
          {recommendationSource === 'manual' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Hole Size */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-700 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">1</span>
                  Hole Size (Diameter)
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-700">{simpleHoleSize}"</span>
              </div>
              <p className="text-xs text-slate-500">Select the hole diameter for this drilling section:</p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { size: 8.5, label: '8-1/2"', desc: 'Production Hole (Standard)' },
                  { size: 12.25, label: '12-1/4"', desc: 'Intermediate Section' },
                  { size: 6.0, label: '6"', desc: 'Slimhole / Lateral' },
                  { size: 17.5, label: '17-1/2"', desc: 'Surface / Hole Opener' },
                ].map((item) => (
                  <button
                    key={item.size}
                    type="button"
                    onClick={() => handleSimpleSizeSelect(item.size)}
                    className={`p-2.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      simpleHoleSize === item.size
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 text-slate-900 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold block">{item.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Rock Formation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-700 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">2</span>
                  Rock Formation
                </span>
                <span className="text-[11px] font-semibold text-slate-700 capitalize">{simpleFormation}</span>
              </div>
              <p className="text-xs text-slate-500">What type of rock are you penetrating?</p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'shale', name: 'Soft Clay & Gumbo Shale', detail: 'Baram/Bokor basins · Anti-balling priority' },
                  { id: 'sandstone', name: 'Interbedded Sandstone', detail: 'Malay Basin sands · High ROP potential' },
                  { id: 'carbonate', name: 'Hard Carbonate & Limestone', detail: 'Luconia platform · Wear resistant' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSimpleFormationSelect(item.id as any)}
                    className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                      simpleFormation === item.id
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-slate-900 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.detail}</div>
                    </div>
                    {simpleFormation === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Drilling Objective */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
                  Drilling Objective
                </span>
                <span className="text-[11px] font-semibold text-slate-700 capitalize">{simpleObjective}</span>
              </div>
              <p className="text-xs text-slate-500">What is your main priority for this run?</p>

              <div className="space-y-2 pt-1">
                {[
                  { id: 'speed', name: 'Maximum Speed (High ROP)', detail: 'Fast penetration · aggressive PDC cutters' },
                  { id: 'durability', name: 'Longest Bit Life & Durability', detail: 'Finish run to TD without tripping' },
                  { id: 'directional', name: 'Steerable Motor / RSS Assembly', detail: 'Low vibration · high build rate control' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSimpleObjectiveSelect(item.id as any)}
                    className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer flex items-center justify-between ${
                      simpleObjective === item.id
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500">{item.detail}</div>
                    </div>
                    {simpleObjective === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Simple Result Card */}
          {advisoryResult && (
            <div className="bg-white dark:bg-[#0c1220] rounded-2xl border-2 border-emerald-500/50 shadow-md p-6 space-y-6 transition-colors">
              {/* Header result banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Recommended Bit Match (3D Picture)
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        In Stock at Kemaman Supply Base (KSB) & Labuan (ASB)
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {advisoryResult.primaryBit.model}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyRecipe}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedRecipe ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Recipe Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        <span>Copy Recipe</span>
                      </>
                    )}
                  </button>

                  {onNavigateToAiChat && (
                    <button
                      onClick={onNavigateToAiChat}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask Normal AI</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowQuoteModal(true)}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-white" />
                    <span>Request Quotation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdvisoryResult(null);
                      setFileAnalysisSuccess(false);
                      setUploadedFile(null);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 text-xs font-semibold transition cursor-pointer"
                    title="Remove and dismiss this recommendation card"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              {/* Bit Overview & 3-Number Recipe */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* 3D Visualizer */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Box className="w-3.5 h-3.5 text-sky-500" />
                      Matched 3D Tool Model
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Hover to tilt in 3D
                    </span>
                  </div>
                  <BitVisualizer bit={advisoryResult.primaryBit} className="w-full max-w-[280px]" defaultView="3D" />
                  <div className="mt-2 text-center">
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      IADC Code: {advisoryResult.primaryBit.iadcCode}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Ref: {advisoryResult.primaryBit.unicronCatalogRef} &bull; ${(Number(advisoryResult?.primaryBit?.costUsd) || 28000).toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {/* 3 Key Operational Recipe Gauges */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-sky-600" />
                    <span>Recommended Drilling Recipe (Safe Operating Window)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* WOB */}
                    <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-200 text-center">
                      <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
                        Weight on Bit (WOB)
                      </span>
                      <div className="text-2xl font-black text-sky-950 font-mono my-1">
                        {advisoryResult.operatingEnvelope.wobRangeKlbf[0]} - {advisoryResult.operatingEnvelope.wobRangeKlbf[1]}
                      </div>
                      <span className="text-xs font-medium text-sky-700">
                        klbf (Optimal: {Math.round((advisoryResult.operatingEnvelope.wobRangeKlbf[0] + advisoryResult.operatingEnvelope.wobRangeKlbf[1]) / 2)} klbf)
                      </span>
                      <div className="w-full bg-sky-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-sky-600 h-full w-3/4 mx-auto rounded-full"></div>
                      </div>
                    </div>

                    {/* RPM */}
                    <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-center">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                        Rotary Speed (RPM)
                      </span>
                      <div className="text-2xl font-black text-amber-950 font-mono my-1">
                        {advisoryResult.operatingEnvelope.rpmRange[0]} - {advisoryResult.operatingEnvelope.rpmRange[1]}
                      </div>
                      <span className="text-xs font-medium text-amber-700">
                        RPM (Optimal: {Math.round((advisoryResult.operatingEnvelope.rpmRange[0] + advisoryResult.operatingEnvelope.rpmRange[1]) / 2)} RPM)
                      </span>
                      <div className="w-full bg-amber-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-amber-600 h-full w-2/3 mx-auto rounded-full"></div>
                      </div>
                    </div>

                    {/* Mud Flow */}
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-center">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Mud Pump Flow
                      </span>
                      <div className="text-2xl font-black text-emerald-950 font-mono my-1">
                        {advisoryResult.operatingEnvelope.recommendedFlowGpm[0]} - {advisoryResult.operatingEnvelope.recommendedFlowGpm[1]}
                      </div>
                      <span className="text-xs font-medium text-emerald-700">
                        GPM (Hole Cleaning)
                      </span>
                      <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-600 h-full w-4/5 mx-auto rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Why this bit wins - Plain English */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      <span>Why This Bit is Selected for Your Well:</span>
                    </div>
                    <ul className="text-xs text-slate-700 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold text-sm leading-none">&bull;</span>
                        <span><strong>Cuttings Evacuation:</strong> {advisoryResult.primaryBit.junkSlotAreaPct}% Junk Slot Area flushes away rock chips efficiently to prevent bit balling in {simpleFormation === 'shale' ? 'gumbo shales' : 'dense formations'}.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold text-sm leading-none">&bull;</span>
                        <span><strong>Cutter Durability:</strong> Premium {advisoryResult.primaryBit.cutterSizeMm || 16}mm PDC diamond tables provide high penetration rate while resisting thermal fatigue.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold text-sm leading-none">&bull;</span>
                        <span><strong>Vibration Suppression:</strong> Balanced spiral blade layout minimizes stick-slip vibration and smooths torque output on directional BHAs.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Financial Savings Highlight */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-emerald-700" />
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          Estimated Financial Impact
                        </div>
                        <div className="text-[11px] text-emerald-700">
                          Drill to Total Depth in 1 run &bull; Eliminate 1 bit trip &bull; 30% faster penetration
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-emerald-800 font-medium">Estimated Rig Savings:</span>
                      <div className="text-base font-bold font-mono text-emerald-900">
                        ~$135,000 USD (1.4 Rig Days)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Navigation Links */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Certified to API Spec 7-1 & PETRONAS Technical Standard (PTS)</span>
                </div>

                <div className="flex items-center space-x-3">
                  {setIsSimpleMode && (
                    <button
                      onClick={() => setIsSimpleMode(false)}
                      className="text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
                    >
                      View full engineering graphs & SPE equations &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* EXPERT MODE VIEW (FULL SPE 119420 ENGINEERING SUITE)                      */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Well & Rock Parameter Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Preset Formation Selector */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-600" />
                  Select Basin / Formation Preset:
                </label>
                <span className="text-[11px] text-slate-500">4 presets available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {formationPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-2.5 rounded-lg text-left border transition-all text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-xs ring-1 ring-sky-400/50'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-semibold text-slate-900 truncate">{preset.name.split('(')[0]}</div>
                      <div className="text-[10px] text-slate-500 truncate">{preset.basin}</div>
                      <div className="mt-1 flex items-center justify-between text-[10px]">
                        <span className="text-amber-700 font-mono font-medium">UCS: {preset.ucsRangeMpa[0]}-{preset.ucsRangeMpa[1]} MPa</span>
                        <span className="text-slate-500">{preset.abrasiveness} Abr.</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Input Parameters Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Wellbore & Formation Parameters
              </h3>

              {/* Bit Hole Size & Interval */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Bit Hole Size
                  </label>
                  <select
                    value={bitSizeInch}
                    onChange={(e) => setBitSizeInch(parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
                  >
                    <option value={8.5}>8-1/2" (8.500 in) - Production Hole</option>
                    <option value={12.25}>12-1/4" (12.250 in) - Intermediate</option>
                    <option value={17.5}>17-1/2" (17.500 in) - Surface / SHO</option>
                    <option value={6.0}>6" (6.000 in) - Slimhole / Lateral</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Depth Interval
                  </label>
                  <input
                    type="text"
                    value={depthInterval}
                    onChange={(e) => setDepthInterval(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Formation Name & Lithology */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Formation Name / Well Target
                </label>
                <input
                  type="text"
                  value={formationName}
                  onChange={(e) => setFormationName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Lithology Description
                </label>
                <input
                  type="text"
                  value={lithology}
                  onChange={(e) => setLithology(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
                />
              </div>

              {/* UCS Rock Compressive Strength Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-700 font-medium">Unconfined Compressive Strength (UCS):</span>
                  <span className="font-mono font-bold text-sky-700">{ucsMpa} MPa (~{Math.round(ucsMpa * 145.038)} psi)</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="220"
                  step="5"
                  value={ucsMpa}
                  onChange={(e) => setUcsMpa(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Soft Clays (&lt;30 MPa)</span>
                  <span>Medium (50-80 MPa)</span>
                  <span>Hard Carbonate (&gt;120 MPa)</span>
                </div>
              </div>

              {/* Abrasiveness & Plasticity Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Rock Abrasiveness
                  </label>
                  <select
                    value={abrasiveness}
                    onChange={(e) => setAbrasiveness(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
                  >
                    <option value="LOW">Low (Pure Shale / Mudstone)</option>
                    <option value="MEDIUM">Medium (Silty Sandstone)</option>
                    <option value="HIGH">High (Abrasive Quartz Sand)</option>
                    <option value="EXTREME">Extreme (Chert / Pyrite Stringers)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Shale Plasticity (Balling)
                  </label>
                  <select
                    value={shalePlasticity}
                    onChange={(e) => setShalePlasticity(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
                  >
                    <option value="LOW">Low (Brittle / Low Swelling)</option>
                    <option value="MEDIUM">Medium (Moderate Smectite)</option>
                    <option value="HIGH">High (Active Marine Clay)</option>
                    <option value="GUMBO">GUMBO (Severe Balling Risk)</option>
                  </select>
                </div>
              </div>

              {/* Trajectory & Mud Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    BHA Trajectory
                  </label>
                  <select
                    value={wellTrajectory}
                    onChange={(e) => setWellTrajectory(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
                  >
                    <option value="VERTICAL">Vertical Hole</option>
                    <option value="DIRECTIONAL_MOTOR">Directional Mud Motor</option>
                    <option value="ROTARY_STEERABLE_RSS">Rotary Steerable System (RSS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Drilling Fluid (Mud)
                  </label>
                  <select
                    value={mudType}
                    onChange={(e) => setMudType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
                  >
                    <option value="OBM">Oil-Based Mud (OBM)</option>
                    <option value="WBM">Water-Based Mud (WBM)</option>
                    <option value="SOBM">Synthetic OBM (SOBM)</option>
                  </select>
                </div>
              </div>

              {/* Target ROP */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-700 font-medium">Target Penetration Rate (ROP):</span>
                  <span className="font-mono font-bold text-amber-700">{targetRopFtPerHour} ft/hr</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  step="5"
                  value={targetRopFtPerHour}
                  onChange={(e) => setTargetRopFtPerHour(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Right Column: AI Advisory Output & Recommendations (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {!advisoryResult ? (
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 text-sky-600 shadow-xs">
                  <Sparkles className="w-8 h-8 animate-pulse text-sky-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Advisory Engine Ready</h3>
                <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                  Click "Run AI Bit Selection" to evaluate Unicron's drill bit portfolio against rock strength, abrasiveness, and hydraulics.
                </p>
                <button
                  onClick={() => runAdvisoryAnalysis()}
                  className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all"
                >
                  Analyze Formation Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Primary Bit Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-sky-300 dark:border-sky-800 shadow-xs relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-sky-600 to-sky-700 px-4 py-1 text-[11px] font-bold text-white rounded-bl-lg flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" />
                    PRIMARY 3D BIT RECOMMENDATION
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-2">
                    <div className="md:col-span-5 flex justify-center">
                      <BitVisualizer bit={advisoryResult.primaryBit} className="w-full max-w-[280px]" defaultView="3D" />
                    </div>

                    <div className="md:col-span-7 space-y-2.5">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wide text-sky-600 dark:text-sky-400 font-semibold">
                          {advisoryResult.primaryBit.manufacturer}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {advisoryResult.primaryBit.model}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                          {advisoryResult.primaryBit.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Body Material</span>
                          <span className="font-semibold text-slate-800">
                            {advisoryResult.primaryBit.bodyMaterial.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">IADC Code</span>
                          <span className="font-semibold text-amber-700 font-mono">
                            {advisoryResult.primaryBit.iadcCode}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Blade & Cutter Spec</span>
                          <span className="font-semibold text-slate-800">
                            {advisoryResult.primaryBit.bladeCount || 0} Blades &bull; {advisoryResult.primaryBit.cutterSizeMm || 0}mm Cutters
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Junk Slot Area (JSA)</span>
                          <span className="font-semibold text-sky-700 font-mono">
                            {advisoryResult.primaryBit.junkSlotAreaPct}% Open
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-500 font-mono text-[11px]">
                          Ref: {advisoryResult.primaryBit.unicronCatalogRef}
                        </span>
                        <span className="font-semibold text-emerald-700 font-mono text-sm">
                          ${(Number(advisoryResult?.primaryBit?.costUsd) || 28000).toLocaleString()} USD
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Parameter Envelope */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-sky-600" />
                      Recommended Operating Envelope
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Engine: {engineMode === 'GEMINI_AI' ? 'Gemini 3.8 Flash' : 'SPE Heuristic'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block">Weight on Bit (WOB)</span>
                      <span className="text-base font-bold text-sky-700 font-mono">
                        {advisoryResult.operatingEnvelope.wobRangeKlbf[0]}-{advisoryResult.operatingEnvelope.wobRangeKlbf[1]}
                      </span>
                      <span className="text-[10px] text-slate-500 block">klbf</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block">Rotary Speed (RPM)</span>
                      <span className="text-base font-bold text-amber-700 font-mono">
                        {advisoryResult.operatingEnvelope.rpmRange[0]}-{advisoryResult.operatingEnvelope.rpmRange[1]}
                      </span>
                      <span className="text-[10px] text-slate-500 block">RPM</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block">Flow Rate</span>
                      <span className="text-base font-bold text-emerald-700 font-mono">
                        {advisoryResult.operatingEnvelope.recommendedFlowGpm[0]}-{advisoryResult.operatingEnvelope.recommendedFlowGpm[1]}
                      </span>
                      <span className="text-[10px] text-slate-500 block">GPM</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 block">Target HSI</span>
                      <span className="text-base font-bold text-purple-700 font-mono">
                        {advisoryResult.operatingEnvelope.targetHsi}
                      </span>
                      <span className="text-[10px] text-slate-500 block">HP/sq.in</span>
                    </div>
                  </div>
                </div>

                {/* AI Rationale & SPE Formulation */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Petroleum Engineering Rationale</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {formatAdvice(advisoryResult.aiRationale)}
                  </p>
                  <p className="text-xs text-slate-600 bg-sky-50/60 p-3 rounded-lg border border-sky-200">
                    <strong>Operational Advice:</strong> {formatAdvice(advisoryResult.engineeringAdvice)}
                  </p>
                </div>

                {/* ROP vs WOB Sensitivity Curve (SVG Chart) */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Penetration Rate (ROP) Sensitivity vs WOB
                    </h4>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1 text-slate-500">
                        <span className="w-2.5 h-0.5 bg-slate-400 inline-block"></span> 90 RPM
                      </span>
                      <span className="flex items-center gap-1 text-sky-600 font-medium">
                        <span className="w-2.5 h-0.5 bg-sky-500 inline-block"></span> 120 RPM (Optimum)
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <span className="w-2.5 h-0.5 bg-amber-500 inline-block"></span> 150 RPM
                      </span>
                    </div>
                  </div>

                  <div className="h-44 w-full relative pt-2">
                    <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                      <line x1="40" y1="120" x2="480" y2="120" stroke="#cbd5e1" strokeWidth="1" />
                      <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="40" y1="40" x2="480" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="40" y1="10" x2="480" y2="10" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                      <text x="32" y="123" fill="#64748b" fontSize="9" textAnchor="end">0</text>
                      <text x="32" y="83" fill="#64748b" fontSize="9" textAnchor="end">50</text>
                      <text x="32" y="43" fill="#64748b" fontSize="9" textAnchor="end">100</text>
                      <text x="32" y="13" fill="#64748b" fontSize="9" textAnchor="end">150</text>

                      <polyline
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        points={sensitivityCurve.map((pt, i) => `${40 + i * (440 / 6)},${120 - (pt.ropLowRpm / 150) * 110}`).join(' ')}
                      />
                      <polyline
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                        points={sensitivityCurve.map((pt, i) => `${40 + i * (440 / 6)},${120 - (pt.ropOptimumRpm / 150) * 110}`).join(' ')}
                      />
                      <polyline
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="1.5"
                        points={sensitivityCurve.map((pt, i) => `${40 + i * (440 / 6)},${120 - (pt.ropHighRpm / 150) * 110}`).join(' ')}
                      />

                      {sensitivityCurve.map((pt, i) => {
                        const x = 40 + i * (440 / 6);
                        const y = 120 - (pt.ropOptimumRpm / 150) * 110;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                            <text x={x} y="135" fill="#64748b" fontSize="9" textAnchor="middle">
                              {pt.wob}k
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="text-center text-[10px] text-slate-500">
                    Weight on Bit (klbf) vs Penetration Rate (ft/hr)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commercial Quotation Modal */}
      {showQuoteModal && advisoryResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <UnicronLogo variant="emblem" size="sm" />
                <h3 className="text-base font-bold text-slate-900">
                  Request Commercial Quotation
                </h3>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="font-bold text-slate-900">Tooling Selected: {advisoryResult.primaryBit.model}</div>
              <div className="text-slate-600">Size: {advisoryResult.primaryBit.sizeInch}" &bull; Ref: {advisoryResult.primaryBit.unicronCatalogRef}</div>
              <div className="text-emerald-700 font-semibold">Standard Unit Price: ${(Number(advisoryResult?.primaryBit?.costUsd) || 28000).toLocaleString()} USD</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Company / Operator</label>
                <input
                  type="text"
                  placeholder="e.g. PETRONAS Carigali / PTTEP / Hibiscus"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  defaultValue="PETRONAS Carigali Sdn Bhd"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Deployment Supply Base</label>
                <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900">
                  <option>Kemaman Supply Base (KSB, Terengganu) - Peninsular</option>
                  <option>Asian Supply Base (ASB Labuan) - Sabah/Sarawak</option>
                  <option>Kuala Lumpur Corporate Head Office</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Contact Email / Phone</label>
                <input
                  type="text"
                  placeholder="name@petronas.com.my"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowQuoteModal(false);
                  setFileAppliedToast(true);
                  setTimeout(() => setFileAppliedToast(false), 4000);
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Submit Quotation Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inspect All Extracted Parameters From Uploaded File */}
      {showAllExtractedParamsModal && advisoryResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                    AI Data Extraction
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {uploadedFile?.name || advisoryResult.sourceFileName || 'Uploaded Technical File'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  All Parameters Read from File ({advisoryResult.extractedFileParameters?.length || 10} Data Points)
                </h3>
              </div>
              <button
                onClick={() => setShowAllExtractedParamsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              <p className="text-xs text-slate-600">
                The AI examined the uploaded file and extracted these exact wellbore rock mechanics, hole dimensions, and drilling parameters to determine the optimal drill bit:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(advisoryResult.extractedFileParameters || [
                  { parameter: "Source Document", value: uploadedFile?.name || advisoryResult.sourceFileName || "Uploaded File", category: "DOCUMENT" },
                  { parameter: "Hole Section", value: `${bitSizeInch}" (${(bitSizeInch * 25.4).toFixed(1)} mm)`, category: "WELLBORE" },
                  { parameter: "Target Formation", value: formationName, category: "STRATIGRAPHY" },
                  { parameter: "Depth Interval", value: depthInterval, category: "STRATIGRAPHY" },
                  { parameter: "Dominant Lithology", value: lithology, category: "GEOLOGY" },
                  { parameter: "Rock UCS Strength", value: `${ucsMpa} MPa (${Math.round(ucsMpa * 145.038)} psi)`, category: "GEOLOGY" },
                  { parameter: "Abrasiveness Index", value: abrasiveness, category: "GEOLOGY" },
                  { parameter: "Shale Plasticity", value: shalePlasticity, category: "GEOLOGY" },
                  { parameter: "Mud System", value: mudType, category: "DRILLING_FLUID" },
                  { parameter: "Well Trajectory", value: wellTrajectory, category: "BHA_DIRECTIONAL" },
                  { parameter: "Primary Recommended Bit", value: `${advisoryResult.primaryBit.model} (${advisoryResult.primaryBit.iadcCode})`, category: "RECOMMENDATION" }
                ]).map((param, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">{param.category || 'GENERAL'}</span>
                      <span className="font-mono text-slate-400">#{idx + 1}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900">{param.parameter}</div>
                    <div className="text-xs text-sky-800 font-medium font-mono mt-0.5">{param.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
              <span className="text-slate-500">
                Matched against Unicron Drill Bit Catalog fleet
              </span>
              <button
                onClick={() => setShowAllExtractedParamsModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition cursor-pointer"
              >
                Close Data View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {fileAppliedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-500/40 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-white">Active Drill Bit Synced</div>
            <div className="text-slate-300">"{advisoryResult?.primaryBit?.model}" updated across all engineering tabs.</div>
          </div>
        </div>
      )}
    </div>
  );
};
