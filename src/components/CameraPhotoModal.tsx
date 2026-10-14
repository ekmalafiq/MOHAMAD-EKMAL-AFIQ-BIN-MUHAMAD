import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RotateCw, 
  Download, 
  Check, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  Gauge, 
  Maximize2,
  RefreshCw,
  FileImage,
  Layers,
  Upload
} from 'lucide-react';
import { DrillBit } from '../types';

interface CameraPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CAMERA_CAPTURE' | 'TOOL_SNAPSHOT';
  targetBit?: DrillBit | null;
  photoUrl?: string | null;
  onPhotoUploaded?: (file: File) => void;
  onApplyPhotoToBit?: (bit: DrillBit, photoDataUrl: string) => void;
}

export const CameraPhotoModal: React.FC<CameraPhotoModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  targetBit,
  photoUrl: initialPhotoUrl,
  onPhotoUploaded,
  onApplyPhotoToBit
}) => {
  const [mode, setMode] = useState<'CAMERA_CAPTURE' | 'TOOL_SNAPSHOT'>(initialMode);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(initialPhotoUrl || null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
    if (initialPhotoUrl) {
      setCapturedPhoto(initialPhotoUrl);
    }
  }, [initialMode, initialPhotoUrl]);

  // Start webcam when modal opens in CAMERA_CAPTURE mode
  useEffect(() => {
    if (isOpen && mode === 'CAMERA_CAPTURE' && !capturedPhoto) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, mode, capturedPhoto, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment. You can take or choose a photo using the file picker below.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera access was declined. Click "Take Photo via Camera Input" or select an image file to proceed.'
          : (err.message || 'Unable to open camera stream. Use standard device camera input.')
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleSnapPhoto = () => {
    if (!videoRef.current) return;

    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleConfirmCapturedPhoto = () => {
    if (!capturedPhoto) return;

    // Convert dataUrl to File
    const arr = capturedPhoto.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], `DrillBit_Photo_${Date.now()}.jpg`, { type: mime });

    if (onPhotoUploaded) {
      onPhotoUploaded(file);
    }

    if (targetBit && onApplyPhotoToBit) {
      onApplyPhotoToBit(targetBit, capturedPhoto);
    }

    onClose();
  };

  const handleFallbackFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedPhoto(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPhoto = () => {
    const src = capturedPhoto || targetBit?.imageUrl || targetBit?.image3dUrl;
    if (!src) return;

    const link = document.createElement('a');
    link.href = src;
    link.download = `${(targetBit?.model || 'DrillBit').replace(/\s+/g, '_')}_Photo_Inspection.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (!isOpen) return null;

  const displayPhoto = capturedPhoto || targetBit?.imageUrl || targetBit?.image3dUrl || '/assets/real_pdc_steel_bit.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Shutter Flash Animation */}
        {isShutterFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity duration-200 opacity-90" />
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {mode === 'CAMERA_CAPTURE' 
                  ? (capturedPhoto ? 'Review Captured Photo' : 'Take Photo of Drill Bit')
                  : 'Drill Bit Photo & Inspection Snapshot'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {mode === 'CAMERA_CAPTURE'
                  ? 'High-resolution image ingestion for automated AI geometry extraction'
                  : `${targetBit?.model || 'Drill Bit Specimen'} · Crystal-clear specimen card`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {mode === 'TOOL_SNAPSHOT' && (
              <button
                type="button"
                onClick={() => {
                  setMode('CAMERA_CAPTURE');
                  setCapturedPhoto(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Take New Photo</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {mode === 'CAMERA_CAPTURE' && !capturedPhoto ? (
            /* Live Camera View */
            <div className="space-y-4">
              <div className="relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Reticle & Target Box */}
                    <div className="absolute inset-8 border-2 border-dashed border-sky-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-sky-300 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-xs w-fit">
                        <span>CENTER DRILL BIT IN FRAME</span>
                      </div>
                      <div className="self-end text-[10px] font-mono text-emerald-400 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-xs">
                        AUTO FOCUS · 1080P
                      </div>
                    </div>

                    {/* Crosshair Center */}
                    <div className="absolute w-8 h-8 pointer-events-none flex items-center justify-center opacity-70">
                      <div className="w-8 h-0.5 bg-sky-400/80 absolute" />
                      <div className="h-8 w-0.5 bg-sky-400/80 absolute" />
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <Camera className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                      {cameraError || 'Starting video camera stream...'}
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer shadow-xs transition"
                      >
                        Retry Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition flex items-center gap-1.5"
                      >
                        <FileImage className="w-3.5 h-3.5 text-sky-400" />
                        <span>Take Photo via Device Camera</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden Native Camera Input Fallback */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFallbackFileInput}
                className="hidden"
              />

              {/* Controls bar */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1.5 cursor-pointer transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Flip Camera</span>
                </button>

                {cameraActive && (
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md cursor-pointer transition transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-1.5 cursor-pointer transition"
                >
                  <Upload className="w-3.5 h-3.5 text-sky-600" />
                  <span>Pick File / Snapshot</span>
                </button>
              </div>
            </div>
          ) : (
            /* Review Photo / Tool Inspection Snapshot Mode */
            <div className="space-y-4">
              {/* Photo Frame Container */}
              <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-hidden flex flex-col items-center justify-center min-h-[320px] shadow-xl">
                
                {/* Header Watermark Badge */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-[11px] font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>UNICRON INSPECTION LAB &bull; VERIFIED</span>
                </div>

                {targetBit && (
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold">
                    IADC {targetBit.iadcCode}
                  </div>
                )}

                {/* The Photo itself: 100% crystal-clear, uncropped, full quality */}
                <div className="w-full max-h-[380px] flex items-center justify-center p-2">
                  <img
                    src={displayPhoto}
                    alt={targetBit?.model || 'Drill bit photo'}
                    className="max-h-[340px] w-auto max-w-full object-contain drop-shadow-2xl rounded-lg select-none"
                  />
                </div>

                {/* Bottom Spec Footer Overlay */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700 text-white text-xs">
                  <div>
                    <span className="font-bold text-sky-300 block">
                      {targetBit?.model || 'Custom Technical Drill Bit'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Size: {targetBit?.sizeInch || 8.5}" &bull; {targetBit?.bladeCount || 6} Blades &bull; {targetBit?.cutterSizeMm || 16}mm PDC
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[9px]">REC. WOB</span>
                      <span className="font-bold text-sky-400">
                        {targetBit?.recommendedWobKlbf?.[0] ?? 15}-{targetBit?.recommendedWobKlbf?.[1] ?? 30} klbf
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">REC. RPM</span>
                      <span className="font-bold text-sky-400">
                        {targetBit?.recommendedRpm?.[0] ?? 110}-{targetBit?.recommendedRpm?.[1] ?? 160} RPM
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for the Photo */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-2">
                  {mode === 'CAMERA_CAPTURE' && (
                    <button
                      type="button"
                      onClick={handleRetake}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Retake Photo</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleDownloadPhoto}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    title="Download high-resolution image"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Download Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintCertificate}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center space-x-1"
                    title="Print Inspection Certificate"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Spec</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {mode === 'CAMERA_CAPTURE' && (
                    <button
                      type="button"
                      onClick={handleConfirmCapturedPhoto}
                      className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Upload & Ingest Photo</span>
                    </button>
                  )}

                  {mode === 'TOOL_SNAPSHOT' && targetBit && onApplyPhotoToBit && capturedPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        onApplyPhotoToBit(targetBit, capturedPhoto);
                        onClose();
                      }}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Set as Tool Image</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
