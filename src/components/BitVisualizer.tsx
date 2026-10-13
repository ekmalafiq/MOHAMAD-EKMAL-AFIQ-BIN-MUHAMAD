import React, { useState } from 'react';
import { 
  Camera, 
  Maximize2, 
  Droplets, 
  Sparkles, 
  X, 
  Eye, 
  Download,
  Gauge,
  Layers,
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import { DrillBit } from '../types';

export const REAL_BIT_PHOTOS: Record<string, string> = {
  PDC_STEEL: '/assets/real_pdc_steel_bit.jpg',
  PDC_MATRIX: '/assets/real_pdc_matrix_bit.jpg',
  ROLLER_CONE_TCI: '/assets/real_roller_cone_bit.jpg',
  ROLLER_CONE_MILLED: '/assets/real_roller_cone_bit.jpg',
  STAGE_HOLE_OPENER: '/assets/real_pdc_matrix_bit.jpg',
};

export const BIT_3D_IMAGES = REAL_BIT_PHOTOS;

export const getBitRealPicture = (bit: DrillBit): string => {
  // If bit has an uploaded or custom imageUrl, prioritize it with 100% fidelity
  if (bit.imageUrl && (bit.imageUrl.startsWith('data:') || bit.imageUrl.startsWith('blob:') || bit.imageUrl.startsWith('http') || bit.isCustomUploaded)) {
    return bit.imageUrl;
  }
  if (bit.image3dUrl && (bit.image3dUrl.startsWith('data:') || bit.image3dUrl.startsWith('blob:') || bit.image3dUrl.startsWith('http') || bit.isCustomUploaded)) {
    return bit.image3dUrl;
  }
  if (bit.imageUrl && !bit.imageUrl.includes('3d_render')) return bit.imageUrl;
  if (bit.image3dUrl && !bit.image3dUrl.includes('3d_render')) return bit.image3dUrl;
  return REAL_BIT_PHOTOS[bit.type] || REAL_BIT_PHOTOS.PDC_STEEL;
};

export const getBit3DPicture = getBitRealPicture;

interface BitVisualizerProps {
  bit: DrillBit;
  className?: string;
  defaultView?: 'PHOTO' | '3D' | '2D';
  showControls?: boolean;
  showBadges?: boolean;
  compact?: boolean;
  onTakePhoto?: () => void;
  onReplaceImage?: (file: File) => void;
}

export const BitVisualizer: React.FC<BitVisualizerProps> = ({ 
  bit, 
  className = '',
  defaultView = 'PHOTO',
  showControls = true,
  showBadges = true,
  compact = false,
  onTakePhoto,
  onReplaceImage
}) => {
  // Pure real photograph view (default) or optional CAD schematic
  const [viewMode, setViewMode] = useState<'PHOTO' | '2D'>(defaultView === '2D' ? '2D' : 'PHOTO');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoSavedToast, setPhotoSavedToast] = useState(false);

  const realPhotoUrl = getBitRealPicture(bit);

  const isPdc = bit.type.includes('PDC');
  const isRollerCone = bit.type.includes('ROLLER_CONE');
  const isStageHoleOpener = bit.type === 'STAGE_HOLE_OPENER';
  const blades = bit.bladeCount || 6;
  const isMatrix = bit.bodyMaterial === 'TUNGSTEN_CARBIDE_MATRIX';

  // Check if bit uses an uploaded or custom image
  const isCustomUploadedPhoto = Boolean(
    bit.isCustomUploaded ||
    (bit.imageUrl && (bit.imageUrl.startsWith('data:') || bit.imageUrl.startsWith('blob:') || bit.sourceFileName)) ||
    (bit.image3dUrl && (bit.image3dUrl.startsWith('data:') || bit.image3dUrl.startsWith('blob:')))
  );

  // Total Flow Area (TFA) in square inches
  const tfaSqIn = Array.isArray(bit.nozzleSizes32nds) && bit.nozzleSizes32nds.length > 0
    ? bit.nozzleSizes32nds.reduce((sum, n) => sum + (Math.PI * Math.pow(n / 64, 2)), 0)
    : 0.65;

  const handleDownloadInspectionPhoto = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = document.createElement('a');
    link.href = realPhotoUrl;
    link.download = `${bit.model.replace(/\s+/g, '_')}_Photo_Inspection.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setPhotoSavedToast(true);
    setTimeout(() => setPhotoSavedToast(false), 3000);
  };

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all ${className}`}>
      
      {/* Top Header Bar with Real Photo Indicator & IADC Tag */}
      {showControls && (
        <div className="w-full flex justify-between items-center mb-2.5 px-1 gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('PHOTO')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition cursor-pointer ${
                viewMode === 'PHOTO'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Real Authentic Tool Photograph (Not 3D or 2D render)"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-500" />
              <span>Real Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2D')}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition cursor-pointer ${
                viewMode === '2D'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="2D CAD Technical Blueprint"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D CAD</span>
            </button>
          </div>

          {/* Real Photo Status Badges */}
          <div className="flex items-center gap-1.5">
            {isCustomUploadedPhoto ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1">
                <FileCheck2 className="w-3 h-3 text-sky-600" />
                <span>UPLOADED PHOTO</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>REAL PHOTO</span>
              </span>
            )}

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              {bit.iadcCode}
            </span>

            <button
              type="button"
              onClick={handleDownloadInspectionPhoto}
              className="p-1 rounded-md bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition cursor-pointer"
              title="Download drill bit photograph"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Real Photograph Showcase (Clean, unwarped, true photographic fidelity) */}
      {viewMode === 'PHOTO' ? (
        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative w-full aspect-square max-w-[280px] rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-800/90 shadow-md overflow-hidden cursor-pointer group"
          title="Click to view full uncropped photo inspection"
        >
          {/* Authentic Photograph: Object-contain with studio backdrop to prevent clipping */}
          <div className="w-full h-full p-2 flex items-center justify-center">
            <img 
              src={realPhotoUrl} 
              alt={`${bit.model} Real Physical Tool`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-2xl select-none transition-transform duration-300 group-hover:scale-102"
            />
          </div>

          {/* Top Left Photographic Authenticity Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-xs border border-white/15 text-white text-[10px] font-mono shadow-md">
            <Camera className="w-3 h-3 text-emerald-400" />
            <span>{isCustomUploadedPhoto ? 'UPLOADED PHOTO' : 'REAL PHOTO'}</span>
          </div>

          {/* Top Right Expand Icon */}
          <div className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-slate-950/85 hover:bg-sky-600 backdrop-blur-xs border border-white/15 text-white transition shadow-md">
            <Maximize2 className="w-3.5 h-3.5 text-slate-200" />
          </div>

          {/* Bottom Bar: Model and Physical Size */}
          <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-center justify-between text-white text-[11px]">
            <span className="font-semibold truncate pr-2 text-slate-100">
              {bit.model}
            </span>
            <span className="text-[10px] text-sky-400 font-mono font-bold shrink-0">
              {bit.sizeInch}"
            </span>
          </div>
        </div>
      ) : (
        /* Optional 2D CAD Top Engineering Blueprint View */
        <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center bg-slate-950 rounded-2xl p-2 border border-slate-800">
          <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`bitBody-${bit.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isMatrix ? '#475569' : '#0284c7'} />
                <stop offset="100%" stopColor={isMatrix ? '#1e293b' : '#0369a1'} />
              </linearGradient>
            </defs>

            {/* Outer Gauge Ring */}
            <circle cx="120" cy="120" r="105" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.6" />
            <circle cx="120" cy="120" r="96" fill={`url(#bitBody-${bit.id})`} stroke="#475569" strokeWidth="3" />

            {isPdc && (
              <>
                {Array.from({ length: blades }).map((_, i) => {
                  const angle = (i * 360) / blades;
                  return (
                    <g key={i} transform={`rotate(${angle}, 120, 120)`}>
                      <path
                        d="M 120 120 C 135 110, 160 100, 214 120 C 210 135, 175 145, 120 120 Z"
                        fill={isMatrix ? '#334155' : '#0369a1'}
                        stroke={isMatrix ? '#64748b' : '#38bdf8'}
                        strokeWidth="1.5"
                      />
                      <circle cx="150" cy="116" r="5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                      <circle cx="170" cy="118" r="5.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                      <circle cx="190" cy="120" r="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                      <circle cx="210" cy="122" r="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                    </g>
                  );
                })}
                <circle cx="120" cy="120" r="42" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <circle cx="120" cy="120" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              </>
            )}

            {isRollerCone && (
              <>
                {[0, 120, 240].map((coneAngle, i) => (
                  <g key={i} transform={`rotate(${coneAngle}, 120, 120)`}>
                    <path
                      d="M 120 120 L 175 60 C 190 85, 190 155, 175 180 Z"
                      fill="#475569"
                      stroke="#94a3b8"
                      strokeWidth="2"
                    />
                    <circle cx="155" cy="85" r="4" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                    <circle cx="170" cy="95" r="4" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                    <circle cx="180" cy="120" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                  </g>
                ))}
                <circle cx="120" cy="120" r="16" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              </>
            )}
          </svg>
        </div>
      )}

      {/* Quick Action Footer: Zoom inspection button */}
      {showControls && (
        <div className="w-full flex items-center justify-between mt-2.5 px-1 text-[11px]">
          <div className="flex items-center space-x-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
              {isCustomUploadedPhoto ? (bit.sourceFileName || 'Uploaded Photo') : 'Authentic Physical Tool'}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
            className="flex items-center space-x-1 text-sky-600 hover:text-sky-700 dark:text-sky-400 font-semibold cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Inspection</span>
          </button>
        </div>
      )}

      {/* Technical Spec Matrix Bar */}
      {!compact && (
        <div className="w-full mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="block text-slate-500 dark:text-slate-400 font-medium text-[10px]">Hole Size</span>
            <span className="font-bold text-slate-900 dark:text-white">{bit.sizeInch}"</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="block text-slate-500 dark:text-slate-400 font-medium text-[10px]">Junk Slot (JSA)</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{bit.junkSlotAreaPct}%</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="block text-slate-500 dark:text-slate-400 font-medium text-[10px]">Nozzles (TFA)</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">{bit.nozzleCount} jets ({tfaSqIn.toFixed(2)}"²)</span>
          </div>
        </div>
      )}

      {/* High-Resolution Photo Inspection Lightbox Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Tool View Header: Full clarity, 100% uncropped */}
            <div className="relative aspect-[16/10] bg-slate-950 flex items-center justify-center p-6">
              <img 
                src={realPhotoUrl} 
                alt={`${bit.model} Inspection`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-2xl select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadInspectionPhoto}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white transition border border-white/20 text-xs font-semibold cursor-pointer shadow-md"
                  title="Download full quality drill bit photo"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition border border-white/20 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      Real Tool Photograph
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      IADC {bit.iadcCode}
                    </span>
                    {isCustomUploadedPhoto && (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                        Uploaded File Photo
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {bit.model}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {bit.manufacturer} &bull; Ref: {bit.unicronCatalogRef}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Fleet List Value</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    ${(Number(bit?.costUsd) || 28000).toLocaleString()} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body: Technical Specifications */}
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Design & Metallurgy Overview
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {bit.description}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Body Metallurgy</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {bit.bodyMaterial ? String(bit.bodyMaterial).replace(/_/g, ' ') : 'STEEL'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Cutting Structure</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {isPdc ? `${blades} Blades · ${bit.cutterSizeMm}mm` : 'TCI Compacts'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Junk Slot Area (JSA)</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400 font-mono">
                    {bit.junkSlotAreaPct}% Open
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Nozzles & TFA</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">
                    {bit.nozzleCount} x #{bit.nozzleSizes32nds?.[0] ?? 14} ({tfaSqIn.toFixed(2)}"²)
                  </span>
                </div>
              </div>

              {/* Recommended Operational Window */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-sky-500" />
                  SPE Safe Operating Envelope
                </span>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Recommended WOB</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {bit.recommendedWobKlbf?.[0] ?? 15} - {bit.recommendedWobKlbf?.[1] ?? 30} klbf
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Recommended RPM</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {bit.recommendedRpm?.[0] ?? 110} - {bit.recommendedRpm?.[1] ?? 160} RPM
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Mud Flow (GPM)</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      {bit.recommendedFlowGpm?.[0] ?? 450} - {bit.recommendedFlowGpm?.[1] ?? 600} GPM
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  {onTakePhoto && (
                    <button
                      type="button"
                      onClick={() => { setIsModalOpen(false); onTakePhoto(); }}
                      className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take New Photo (Camera)</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
