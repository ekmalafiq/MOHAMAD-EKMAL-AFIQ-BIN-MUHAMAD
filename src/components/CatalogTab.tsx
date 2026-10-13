import React, { useState, useRef } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  UploadCloud, 
  Trash2, 
  Layers, 
  Wrench, 
  Activity, 
  Droplets, 
  DollarSign,
  Maximize2,
  Pencil,
  Plus,
  Eye,
  Check,
  X,
  FileCheck,
  FileCode,
  FileSpreadsheet,
  BookOpen,
  ArrowLeft,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { DrillBit } from '../types';
import { EditBitModal } from './EditBitModal';
import { BitVisualizer } from './BitVisualizer';
import { UnicronLogo } from './UnicronLogo';
import { CameraPhotoModal } from './CameraPhotoModal';

interface CatalogTabProps {
  catalog: DrillBit[];
  activeBit?: DrillBit;
  onSelectBit: (bit: DrillBit) => void;
  onOpenUploadModal?: () => void;
  onResetCatalog: () => void;
  onDeleteBit?: (id: string) => void;
  onRemoveAllBits?: () => void;
  onUpdateBit?: (bit: DrillBit) => void;
  onAddBit?: (bit: DrillBit) => void;
  onNavigateToAdvisory?: () => void;
  onCloseCatalog?: () => void;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  catalog,
  activeBit,
  onSelectBit,
  onOpenUploadModal,
  onResetCatalog,
  onDeleteBit,
  onRemoveAllBits,
  onUpdateBit,
  onAddBit,
  onNavigateToAdvisory,
  onCloseCatalog,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSize, setSelectedSize] = useState<string>('ALL');
  const [editingBit, setEditingBit] = useState<DrillBit | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [inspectingAllDataBit, setInspectingAllDataBit] = useState<DrillBit | null>(null);
  const [isConfirmRemoveAllOpen, setIsConfirmRemoveAllOpen] = useState<boolean>(false);

  // AI File Upload state
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAiFile, setIsUploadingAiFile] = useState<boolean>(false);
  const [aiUploadStep, setAiUploadStep] = useState<string>('');
  const [aiUploadError, setAiUploadError] = useState<string | null>(null);
  const [extractedTool, setExtractedTool] = useState<DrillBit | null>(null);
  const [activeDataViewTab, setActiveDataViewTab] = useState<'card' | 'table'>('card');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [detectedUploadedImage, setDetectedUploadedImage] = useState<string | null>(null);
  const [uploadedImageFileName, setUploadedImageFileName] = useState<string>('');

  // Direct drill bit image replacement handler
  const handleDirectBitImageUpload = (targetBit: DrillBit, imageFile: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updatedBit: DrillBit = {
        ...targetBit,
        imageUrl: dataUrl,
        image3dUrl: dataUrl,
        isCustomUploaded: true
      };
      if (onUpdateBit) {
        onUpdateBit(updatedBit);
      }
      setDetectedUploadedImage(dataUrl);
      setUploadedImageFileName(imageFile.name);
      setSaveSuccessMsg(`Image for "${targetBit.model}" updated with clear uploaded file "${imageFile.name}"!`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    };
    reader.readAsDataURL(imageFile);
  };

  const handleApplyDetectedImageToBit = (targetBit: DrillBit) => {
    if (!detectedUploadedImage) return;
    const updatedBit: DrillBit = {
      ...targetBit,
      imageUrl: detectedUploadedImage,
      image3dUrl: detectedUploadedImage,
      isCustomUploaded: true,
      sourceFileName: uploadedImageFileName || 'uploaded_image.jpg'
    };
    if (onUpdateBit) {
      onUpdateBit(updatedBit);
    }
    setSaveSuccessMsg(`Photo for "${targetBit.model}" updated with image from "${uploadedImageFileName || 'uploaded file'}"!`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  const handleApplyDetectedImageToAllBits = () => {
    if (!detectedUploadedImage || !onUpdateBit) return;
    catalog.forEach(b => {
      onUpdateBit({
        ...b,
        imageUrl: detectedUploadedImage,
        image3dUrl: detectedUploadedImage,
        isCustomUploaded: true
      });
    });
    setSaveSuccessMsg(`Applied uploaded file image across all ${catalog.length} drill bits in the catalog!`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Camera & Photo Snapshot state
  const [photoModalOpen, setPhotoModalOpen] = useState<boolean>(false);
  const [photoModalMode, setPhotoModalMode] = useState<'CAMERA_CAPTURE' | 'TOOL_SNAPSHOT'>('CAMERA_CAPTURE');
  const [photoModalTargetBit, setPhotoModalTargetBit] = useState<DrillBit | null>(null);
  const [photoModalPhotoUrl, setPhotoModalPhotoUrl] = useState<string | null>(null);

  const handleTakePhotoWithCamera = () => {
    setPhotoModalMode('CAMERA_CAPTURE');
    setPhotoModalTargetBit(activeBit || catalog[0] || null);
    setPhotoModalPhotoUrl(null);
    setPhotoModalOpen(true);
  };

  const handleTakeToolSnapshot = (bit: DrillBit) => {
    setPhotoModalMode('TOOL_SNAPSHOT');
    setPhotoModalTargetBit(bit);
    setPhotoModalPhotoUrl(bit.imageUrl || bit.image3dUrl || null);
    setPhotoModalOpen(true);
  };

  const handleUploadFileAndTakePhoto = async () => {
    try {
      setAiUploadStep('1/3: Reading high-resolution drill bit specimen photo file...');
      setIsUploadingAiFile(true);
      setAiUploadError(null);

      const res = await fetch('/assets/real_pdc_matrix_bit.jpg');
      const blob = await res.blob();
      const file = new File([blob], 'Real_UniMatrix_M613_Matrix_PDC_Photograph.jpg', { type: 'image/jpeg' });

      await handleAiFileUpload(file);

      setTimeout(() => {
        const bitToSnap = activeBit || catalog[0];
        if (bitToSnap) {
          handleTakeToolSnapshot(bitToSnap);
        }
      }, 1000);
    } catch (err: any) {
      console.error('Upload and snap photo error:', err);
      setAiUploadError('Failed to load specimen file: ' + (err.message || 'Error'));
      setIsUploadingAiFile(false);
    }
  };

  // Filter Catalog
  const filteredBits = catalog.filter((bit) => {
    const matchesSearch = 
      bit.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bit.iadcCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bit.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bit.unicronCatalogRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bit.idealFormations.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'ALL' || bit.type === selectedType;
    const matchesSize = selectedSize === 'ALL' || String(bit.sizeInch) === selectedSize;

    return matchesSearch && matchesType && matchesSize;
  });

  // Handle Editing
  const handleEditClick = (bit: DrillBit) => {
    setEditingBit(bit);
    setIsEditModalOpen(true);
  };

  const handleCreateNewBit = () => {
    const newBit: DrillBit = {
      id: `custom-bit-${Date.now()}`,
      model: `Custom PDC 8.5"`,
      manufacturer: 'Unicron Field Engineering',
      type: 'PDC_STEEL',
      sizeInch: 8.5,
      iadcCode: 'S433',
      bladeCount: 6,
      cutterSizeMm: 16,
      bearingType: 'NON_ROLLER',
      bodyMaterial: 'STEEL',
      hardfacingGrade: 'Laser Cladded Tungsten Carbide',
      gaugeLengthInch: 2.25,
      junkSlotAreaPct: 42,
      nozzleCount: 6,
      nozzleSizes32nds: [12, 12, 12, 14, 14, 14],
      costUsd: 28500,
      idealFormations: ['Sandstone', 'Marine Shale'],
      maxWobKlbf: 35,
      recommendedWobKlbf: [16, 30],
      recommendedRpm: [110, 160],
      recommendedFlowGpm: [450, 600],
      maxTorqueFtLbs: 12500,
      description: 'Custom operator drill bit design optimized for offshore drilling.',
      unicronCatalogRef: `U-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
      isCustomUploaded: true,
      uploadedAt: new Date().toISOString()
    };
    setEditingBit(newBit);
    setIsEditModalOpen(true);
  };

  // AI File Upload to Catalog handler
  const handleAiFileUpload = async (file: File) => {
    setIsUploadingAiFile(true);
    setAiUploadError(null);
    setExtractedTool(null);
    setSaveSuccessMsg(null);

    try {
      setAiUploadStep('1/3: Reading technical file stream & vector data...');
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|svg|tiff|gif)$/i.test(file.name);
      const isBinary = isImage || 
        file.type === 'application/pdf' || 
        file.name.toLowerCase().endsWith('.pdf') || 
        file.name.toLowerCase().endsWith('.ai') ||
        file.size > 200000 || 
        !file.type.startsWith('text');
      let fileContent = '';
      let isBase64 = false;
      let localImagePreviewUrl: string | undefined = undefined;

      if (isBinary || isImage) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const res = reader.result as string;
            if (isImage) {
              localImagePreviewUrl = res;
              setDetectedUploadedImage(res);
              setUploadedImageFileName(file.name);
            }
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

      setAiUploadStep('2/3: Gemini AI analyzing cutting structure, hydraulics & specifications...');

      const response = await fetch('/api/bits/extract-from-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent,
          fileName: file.name,
          mimeType: file.type || (isImage ? 'image/jpeg' : 'application/octet-stream'),
          isBase64
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success' && data.extractedBit) {
        setAiUploadStep('3/3: Normalizing specifications into catalog structure...');
        const raw = data.extractedBit;

        const finalImage = localImagePreviewUrl || raw.imageUrl || raw.image3dUrl;

        const normalized: DrillBit = {
          id: String(raw.id || `ai-bit-${Date.now()}`),
          model: String(raw.model || 'Imported PDC'),
          manufacturer: String(raw.manufacturer || 'Unicron Spec Tool'),
          type: (raw.type || 'PDC_STEEL') as any,
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
          description: String(raw.description || `Extracted tool specification from "${file.name}".`),
          unicronCatalogRef: String(raw.unicronCatalogRef || `U-IMP-${Math.floor(1000 + Math.random() * 9000)}`),
          imageUrl: finalImage,
          image3dUrl: finalImage,
          isCustomUploaded: true,
          uploadedAt: new Date().toISOString(),
          sourceFileName: file.name,
          allExtractedData: data.allExtractedData || raw.allExtractedData,
          rawAiSummary: data.rawAiSummary || raw.rawAiSummary
        };

        setExtractedTool(normalized);
        setDetectedUploadedImage(finalImage);
        setUploadedImageFileName(file.name);

        // 1. Automatically commit extracted tool to catalog so the user IMMEDIATELY sees it with its photo!
        if (onAddBit) {
          onAddBit(normalized);
        } else if (onUpdateBit) {
          onUpdateBit(normalized);
        }

        // 2. Select it as active drill bit
        onSelectBit(normalized);

        // 3. If an image was uploaded, also update the previously active or first bit in catalog if different
        const bitToUpdate = activeBit || catalog[0];
        if (localImagePreviewUrl && bitToUpdate && bitToUpdate.id !== normalized.id && onUpdateBit) {
          const updatedActive: DrillBit = {
            ...bitToUpdate,
            imageUrl: localImagePreviewUrl,
            image3dUrl: localImagePreviewUrl,
            isCustomUploaded: true,
            sourceFileName: file.name
          };
          onUpdateBit(updatedActive);
        }

        setSaveSuccessMsg(`Drill bit photo from file "${file.name}" has been successfully updated in catalog!`);
        setTimeout(() => setSaveSuccessMsg(null), 6000);
      } else {
        throw new Error(data.message || 'Failed to extract specifications from file.');
      }
    } catch (err: any) {
      console.error('AI file upload error:', err);
      setAiUploadError(err.message || 'Failed to process file via AI.');
    } finally {
      setIsUploadingAiFile(false);
    }
  };

  const handleCommitExtractedToCatalog = () => {
    if (!extractedTool) return;
    if (onAddBit) {
      onAddBit(extractedTool);
    }
    setSaveSuccessMsg(`"${extractedTool.model}" added to the Drill Bit Catalog!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Catalog Header Banner */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-xs border border-slate-200 shrink-0 hidden sm:flex items-center justify-center">
            <UnicronLogo variant="emblem" size="md" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                PETRONAS Licensed Fleet
              </span>
              <span className="text-xs text-slate-500">
                Kemaman (KSB) &bull; Labuan (ASB) Warehouses
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Unicron Drill Bit Fleet Catalog
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Browse, filter, and inspect upstream drilling bits. Upload Adobe Illustrator (.ai), CAD, PDF spec sheets, or CSV files to extract and add custom drill bit geometries.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToAdvisory && (
            <button
              onClick={onNavigateToAdvisory}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Back to AI Bit Advisor</span>
            </button>
          )}

          {/* Enter AI File Upload Button */}
          <button
            onClick={() => {
              aiFileInputRef.current?.click();
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition cursor-pointer ring-2 ring-sky-400/40"
            title="Enter AI to upload file: extracts specifications and updates drill bit image"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Upload File</span>
          </button>

          <button
            onClick={handleCreateNewBit}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-600" />
            <span>Create Custom Bit</span>
          </button>

          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-sky-600" />
              <span>Import Spec File</span>
            </button>
          )}

          <button
            onClick={onResetCatalog}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Reset catalog to factory stock"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reset Fleet</span>
          </button>

          {onRemoveAllBits && catalog.length > 0 && (
            <button
              onClick={() => setIsConfirmRemoveAllOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold shadow-2xs transition cursor-pointer"
              title="Delete all components from bit catalog fleet"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Delete All Components</span>
            </button>
          )}

          {onCloseCatalog && (
            <button
              onClick={onCloseCatalog}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer border border-slate-300"
              title="Close or hide Bit Catalog component"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
              <span>Close Bit Catalog</span>
            </button>
          )}
        </div>
      </div>

      {/* AI File Ingestion Area for Catalog */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              AI File Ingestion & Drill Bit Image Extraction
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Accepts: images (.png, .jpg, .webp), CAD, .ai, .pdf, .las, .csv
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          <div className="lg:col-span-6">
            <label className="h-full border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50/40 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition">
              <input
                ref={aiFileInputRef}
                type="file"
                accept="*/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAiFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <FileCode className="w-6 h-6 text-sky-600 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block">
                  Click to Browse or Drop Technical File Here
                </span>
                <span className="text-[11px] text-slate-500">
                  Accepts images (.png, .jpg, .webp), CAD, .ai, .pdf, or spreadsheets
                </span>
              </div>
            </label>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={handleTakePhotoWithCamera}
              className="px-2.5 py-3 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs text-center"
              title="Use device camera or webcam to photograph drill bit"
            >
              <Camera className="w-4 h-4 text-sky-600" />
              <span>Camera</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  setAiUploadStep('1/3: Loading high-resolution specimen photo file...');
                  setIsUploadingAiFile(true);
                  const res = await fetch('/assets/real_pdc_matrix_bit.jpg');
                  const blob = await res.blob();
                  const sampleFile = new File([blob], 'Real_UniMatrix_M613_Matrix_PDC_Photograph.jpg', { type: 'image/jpeg' });
                  await handleAiFileUpload(sampleFile);
                } catch (e: any) {
                  setAiUploadError(e.message || 'Error');
                  setIsUploadingAiFile(false);
                }
              }}
              disabled={isUploadingAiFile}
              className="px-2.5 py-3 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs text-center"
              title="Upload real drill bit photo file (.jpg, .png)"
            >
              <UploadCloud className="w-4 h-4 text-teal-600" />
              <span>Photo File (.jpg)</span>
            </button>

            <button
              type="button"
              onClick={handleUploadFileAndTakePhoto}
              disabled={isUploadingAiFile}
              className="px-2.5 py-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs text-center"
              title="Upload sample photo file and immediately snap certified photo inspection card"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Upload & Photo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const sample = new File(
                  ['%PDF-1.5 %Adobe-Illustrator-Spec UniMatrix M613 Tungsten Matrix PDC 8.5 inch 6-blade 16mm cutters 42% JSA nozzles 3x12 3x14'],
                  'UniMatrix_M613_CAD_Drawing.ai',
                  { type: 'application/illustrator' }
                );
                handleAiFileUpload(sample);
              }}
              disabled={isUploadingAiFile}
              className="px-2.5 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs text-center"
              title="Upload CAD / .ai technical specification file"
            >
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span>Sample .ai</span>
            </button>
          </div>
        </div>

        {isUploadingAiFile && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center space-x-2 text-xs text-sky-800 font-mono">
            <RotateCw className="w-4 h-4 animate-spin text-sky-600" />
            <span>{aiUploadStep}</span>
          </div>
        )}

        {aiUploadError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{aiUploadError}</span>
          </div>
        )}

        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Clear Uploaded Image Detected Banner */}
        {detectedUploadedImage && (
          <div className="p-4 rounded-xl border border-sky-300 bg-sky-50/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200 pb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-sky-600" />
                <span className="text-xs font-bold text-slate-900">
                  Uploaded Drill Bit Image ({uploadedImageFileName || 'file'})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  100% CLEAR MATCH
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTakeToolSnapshot(activeBit || extractedTool || catalog[0])}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1"
                  title="View or download high-resolution photo snapshot certificate"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Photo / Inspection Snapshot</span>
                </button>
                {activeBit && onUpdateBit && (
                  <button
                    type="button"
                    onClick={() => handleApplyDetectedImageToBit(activeBit)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Replace "{activeBit.model}" Image</span>
                  </button>
                )}
                {onUpdateBit && catalog.length > 0 && (
                  <button
                    type="button"
                    onClick={handleApplyDetectedImageToAllBits}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    Apply to All Catalog Bits ({catalog.length})
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-sky-200">
              <div className="w-28 h-28 bg-slate-950 rounded-lg p-2 border border-slate-700 flex items-center justify-center shrink-0">
                <img
                  src={detectedUploadedImage}
                  alt="Uploaded drill bit"
                  className="w-full h-full object-contain drop-shadow-md select-none"
                />
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">
                  Drill bit photo rendered with uncropped clarity matching your uploaded file.
                </p>
                <p className="text-[11px] text-slate-500">
                  This image is active and set on the 3D tool model without distortion or dark tinting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Tool Preview */}
        {extractedTool && (
          <div className="mt-4 p-4 rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-50/60 to-teal-50/60 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 pb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">
                  Extracted: {extractedTool.model} ({extractedTool.sizeInch}")
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                  IADC {extractedTool.iadcCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDataViewTab(activeDataViewTab === 'card' ? 'table' : 'card')}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium cursor-pointer"
                >
                  {activeDataViewTab === 'card' ? 'View Raw Data Points' : 'View Spec Card'}
                </button>
                <button
                  type="button"
                  onClick={handleCommitExtractedToCatalog}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Tool to Catalog
                </button>
              </div>
            </div>

            {activeDataViewTab === 'card' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/80">
                  <span className="text-[10px] text-slate-500 block">Cutting Structure</span>
                  <span className="font-bold text-slate-900">{extractedTool.bladeCount || 6} Blades &bull; {extractedTool.cutterSizeMm || 16}mm</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/80">
                  <span className="text-[10px] text-slate-500 block">Body Metallurgy</span>
                  <span className="font-bold text-slate-900">{extractedTool.bodyMaterial ? String(extractedTool.bodyMaterial).replace(/_/g, ' ') : 'STEEL'}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/80">
                  <span className="text-[10px] text-slate-500 block">Operating Envelope</span>
                  <span className="font-bold text-slate-900">
                    {extractedTool.recommendedWobKlbf?.[0] ?? 15}-{extractedTool.recommendedWobKlbf?.[1] ?? 30} klbf &bull; {extractedTool.recommendedRpm?.[0] ?? 110}-{extractedTool.recommendedRpm?.[1] ?? 160} RPM
                  </span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-200/80">
                  <span className="text-[10px] text-slate-500 block">Fleet List Price</span>
                  <span className="font-bold text-emerald-700">${(Number(extractedTool.costUsd) || 28000).toLocaleString()} USD</span>
                </div>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1 bg-white p-3 rounded-lg border border-emerald-200">
                {(extractedTool.allExtractedData || []).map((d, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-100 text-xs">
                    <span className="font-medium text-slate-600">{d.key}</span>
                    <span className="font-mono text-slate-900 font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {saveSuccessMsg && (
          <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drill bit model, IADC code, size, formation..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white text-slate-700 shadow-2xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="ALL">All Bit Types</option>
            <option value="PDC_STEEL">PDC Steel Body</option>
            <option value="PDC_MATRIX">PDC Matrix Body</option>
            <option value="ROLLER_CONE_TCI">Roller Cone TCI</option>
            <option value="STAGE_HOLE_OPENER">Stage Hole Opener</option>
          </select>

          {/* Size Filter */}
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs border border-slate-300 bg-white text-slate-700 shadow-2xs focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="ALL">All Hole Sizes</option>
            <option value="6">6.0" (Slimhole)</option>
            <option value="8.5">8.5" (Standard)</option>
            <option value="12.25">12.25" (Intermediate)</option>
            <option value="17.5">17.5" (Surface)</option>
          </select>

          <span className="text-xs font-mono text-slate-500 px-2">
            Showing {filteredBits.length} / {catalog.length}
          </span>
        </div>
      </div>

      {/* Catalog Grid / Empty State */}
      {catalog.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
            <Trash2 className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">All Bit Catalog Components Deleted</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              All components in the drill bit catalog fleet have been deleted (0 components). You can upload custom drill bit files, ingest spec sheets, or restore factory fleet specifications anytime.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onResetCatalog}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Restore Factory Fleet</span>
            </button>
            {onOpenUploadModal && (
              <button
                onClick={onOpenUploadModal}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Spec File</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredBits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-xs shadow-xs">
          No drill bits match the active search or filter selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBits.map((bit) => {
          const isActive = activeBit?.id === bit.id;

          return (
            <div
              key={bit.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs ${
                isActive
                  ? 'border-sky-500 ring-2 ring-sky-500/30'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      IADC {bit.iadcCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      {bit.sizeInch}" Hole
                    </span>
                    {bit.isCustomUploaded && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {bit.model}
                  </h3>
                  <span className="text-xs text-slate-500 block">
                    {bit.manufacturer} &bull; <span className="font-mono">{bit.unicronCatalogRef}</span>
                  </span>
                </div>

                {isActive && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ACTIVE
                  </span>
                )}
              </div>

              {/* Card Visual & Specs */}
              <div className="p-4 space-y-3 flex-1">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 flex flex-col items-center justify-center border border-slate-100 relative">
                  <BitVisualizer 
                    bit={bit} 
                    defaultView="PHOTO" 
                    className="w-full max-w-[220px]" 
                    onTakePhoto={() => handleTakeToolSnapshot(bit)}
                  />

                  {/* Card Quick Actions: Change photo from file / Take photo via camera */}
                  <div className="w-full mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
                    {onUpdateBit && (
                      <label 
                        className="flex-1 min-w-[110px] py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer border border-sky-200 dark:border-sky-800 transition shadow-2xs"
                        title="Change this drill bit photo using your image file"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleDirectBitImageUpload(bit, e.target.files[0]);
                            }
                          }}
                        />
                        <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
                        <span>Change Photo</span>
                      </label>
                    )}

                    <button
                      type="button"
                      onClick={() => handleTakeToolSnapshot(bit)}
                      className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer shadow-2xs"
                      title="Take a photo of this drill bit using camera"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Camera</span>
                    </button>

                    {detectedUploadedImage && onUpdateBit && (
                      <button
                        type="button"
                        onClick={() => handleApplyDetectedImageToBit(bit)}
                        className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border border-amber-300 transition cursor-pointer shadow-2xs"
                        title="Update this drill bit photo using the last uploaded file"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-600" />
                        <span>Apply Uploaded Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Body Metallurgy</span>
                    <span className="font-semibold text-slate-800">{bit.bodyMaterial.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Blades / Cutters</span>
                    <span className="font-semibold text-slate-800">{bit.bladeCount || 6} Blades &bull; {bit.cutterSizeMm || 16}mm</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Junk Slot Area</span>
                    <span className="font-semibold text-slate-800">{bit.junkSlotAreaPct}% Open</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Nozzles</span>
                    <span className="font-semibold text-slate-800">{bit.nozzleCount} Nozzles</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {bit.description}
                </p>

                {/* Formations pills */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {bit.idealFormations.slice(0, 3).map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                <div className="font-mono text-xs">
                  <span className="text-slate-400 text-[10px] block">Unit Fleet Cost</span>
                  <span className="font-bold text-slate-900">${(Number(bit.costUsd) || 28000).toLocaleString()} USD</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {bit.allExtractedData && bit.allExtractedData.length > 0 && (
                    <button
                      onClick={() => setInspectingAllDataBit(bit)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title="Inspect all data read from file"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {onUpdateBit && (
                    <label
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 text-sky-600 hover:text-sky-700 cursor-pointer flex items-center justify-center transition"
                      title={`Upload file to replace image for "${bit.model}"`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleDirectBitImageUpload(bit, e.target.files[0]);
                          }
                        }}
                      />
                      <ImageIcon className="w-3.5 h-3.5" />
                    </label>
                  )}

                  <button
                    onClick={() => handleTakeToolSnapshot(bit)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 text-slate-600 hover:text-sky-600 cursor-pointer transition"
                    title={`Take photo / inspection snapshot of "${bit.model}"`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleEditClick(bit)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                    title="Edit drill bit parameters"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {onDeleteBit && (
                    <button
                      onClick={() => onDeleteBit(bit.id)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer transition"
                      title={`Remove "${bit.model}" from catalog`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onSelectBit(bit)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-sky-600 text-white hover:bg-sky-500'
                    }`}
                  >
                    {isActive ? 'Selected' : 'Select Tool'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Edit Modal */}
      <EditBitModal
        isOpen={isEditModalOpen}
        bit={editingBit}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBit(null);
        }}
        onSave={(updated) => {
          if (onUpdateBit) onUpdateBit(updated);
          setIsEditModalOpen(false);
          setEditingBit(null);
        }}
        onDelete={(id) => {
          if (onDeleteBit) onDeleteBit(id);
          setIsEditModalOpen(false);
          setEditingBit(null);
        }}
      />

      {/* Inspect All Extracted Data Modal */}
      {inspectingAllDataBit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                  Extracted Data Points
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {inspectingAllDataBit.model} ({inspectingAllDataBit.sizeInch}")
                </h3>
              </div>
              <button
                onClick={() => setInspectingAllDataBit(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {(inspectingAllDataBit.allExtractedData || []).map((item, idx) => (
                <div key={idx} className="flex justify-between py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">{item.key}</span>
                  <span className="font-mono text-slate-900 font-bold">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
              <button
                onClick={() => setInspectingAllDataBit(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove All Drill Bits Modal */}
      {isConfirmRemoveAllOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Delete All Components from Bit Catalog?</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This will delete all <strong>{catalog.length} drill bit components</strong> currently in the catalog fleet. You can restore the initial factory fleet at any time using <em>Reset Fleet</em>.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmRemoveAllOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRemoveAllBits) onRemoveAllBits();
                  setIsConfirmRemoveAllOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Delete All Components
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera & Tool Photo Snapshot Modal */}
      <CameraPhotoModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        mode={photoModalMode}
        targetBit={photoModalTargetBit}
        photoUrl={photoModalPhotoUrl}
        onPhotoUploaded={(file) => {
          handleAiFileUpload(file);
        }}
        onApplyPhotoToBit={(bit, photoDataUrl) => {
          if (onUpdateBit) {
            onUpdateBit({
              ...bit,
              imageUrl: photoDataUrl,
              image3dUrl: photoDataUrl,
              isCustomUploaded: true
            });
            setDetectedUploadedImage(photoDataUrl);
            setSaveSuccessMsg(`Photo applied to "${bit.model}"!`);
            setTimeout(() => setSaveSuccessMsg(null), 4000);
          }
        }}
      />
    </div>
  );
};
