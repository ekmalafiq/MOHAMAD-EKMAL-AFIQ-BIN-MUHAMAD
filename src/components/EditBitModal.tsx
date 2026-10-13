import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Wrench, 
  DollarSign, 
  Layers, 
  Droplets, 
  Activity, 
  Check, 
  AlertCircle,
  Image as ImageIcon,
  ImageOff,
  CheckCircle2,
  UploadCloud
} from 'lucide-react';
import { DrillBit } from '../types';

interface EditBitModalProps {
  isOpen: boolean;
  bit: DrillBit | null;
  onClose: () => void;
  onSave: (updatedBit: DrillBit) => void;
  onDelete?: (id: string) => void;
}

const PRESET_IMAGE_OPTIONS = [
  { label: 'PDC Matrix Body (Dark Tungsten)', url: '/src/assets/images/pdc_matrix_bit_1791181649542.jpg' },
  { label: 'PDC Steel Body (Machined Gold/Steel)', url: '/src/assets/images/pdc_steel_bit_1791181662147.jpg' },
  { label: 'Roller Cone TCI / Milled (Tri-Cone)', url: '/src/assets/images/roller_cone_bit_1791181672595.jpg' },
];

export const EditBitModal: React.FC<EditBitModalProps> = ({
  isOpen,
  bit,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<DrillBit>>({});
  const [nozzleString, setNozzleString] = useState<string>('');
  const [formationsString, setFormationsString] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (bit) {
      setFormData({ ...bit });
      setNozzleString(bit.nozzleSizes32nds?.join(', ') || '12, 12, 14, 14');
      setFormationsString(bit.idealFormations?.join(', ') || 'Shale, Sandstone');
      setConfirmDelete(false);
    }
  }, [bit, isOpen]);

  if (!isOpen || !bit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse nozzle sizes
    const nozzles = nozzleString
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0);

    // Parse formations
    const formations = formationsString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updated: DrillBit = {
      ...bit,
      ...formData,
      model: formData.model || bit.model,
      manufacturer: formData.manufacturer || bit.manufacturer,
      sizeInch: Number(formData.sizeInch) || bit.sizeInch,
      iadcCode: formData.iadcCode || bit.iadcCode,
      type: formData.type || bit.type,
      costUsd: Number(formData.costUsd) || bit.costUsd,
      bodyMaterial: formData.bodyMaterial || bit.bodyMaterial,
      bladeCount: formData.bladeCount !== undefined ? Number(formData.bladeCount) : bit.bladeCount,
      cutterSizeMm: formData.cutterSizeMm !== undefined ? Number(formData.cutterSizeMm) : bit.cutterSizeMm,
      junkSlotAreaPct: Number(formData.junkSlotAreaPct) || bit.junkSlotAreaPct,
      nozzleCount: nozzles.length > 0 ? nozzles.length : (formData.nozzleCount || bit.nozzleCount),
      nozzleSizes32nds: nozzles.length > 0 ? nozzles : bit.nozzleSizes32nds,
      idealFormations: formations.length > 0 ? formations : bit.idealFormations,
      description: formData.description || bit.description,
      imageUrl: formData.imageUrl && formData.imageUrl.trim() ? formData.imageUrl.trim() : undefined,
      image3dUrl: formData.imageUrl && formData.imageUrl.trim() ? formData.imageUrl.trim() : (formData.image3dUrl || bit.image3dUrl),
      recommendedWobKlbf: formData.recommendedWobKlbf || bit.recommendedWobKlbf,
      recommendedRpm: formData.recommendedRpm || bit.recommendedRpm,
      recommendedFlowGpm: formData.recommendedFlowGpm || bit.recommendedFlowGpm
    };

    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && bit.id) {
      onDelete(bit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Edit Drill Bit Specifications</h3>
              <p className="text-xs text-slate-400">
                Update technical metrics, cutting structure, operational envelope, and catalog records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Basic Identifiers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Tool Identification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.model || ''}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Manufacturer *
                </label>
                <input
                  type="text"
                  required
                  value={formData.manufacturer || ''}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Bit Body Type *
                </label>
                <select
                  value={formData.type || 'PDC_MATRIX'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="PDC_MATRIX">PDC Matrix Body</option>
                  <option value="PDC_STEEL">PDC Steel Body</option>
                  <option value="ROLLER_CONE_TCI">Roller Cone TCI</option>
                  <option value="ROLLER_CONE_MILLED">Roller Cone Milled</option>
                  <option value="STAGE_HOLE_OPENER">Stage Hole Opener (SHO)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Outer Diameter (Inches) *
                </label>
                <input
                  type="number"
                  step="0.125"
                  required
                  value={formData.sizeInch || 8.5}
                  onChange={(e) => setFormData({ ...formData, sizeInch: parseFloat(e.target.value) || 8.5 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  IADC Classification Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.iadcCode || ''}
                  onChange={(e) => setFormData({ ...formData, iadcCode: e.target.value })}
                  placeholder="e.g. M423, S433, 537"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Unit Cost ($ USD) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.costUsd || 0}
                  onChange={(e) => setFormData({ ...formData, costUsd: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Cutting Structure & Hydraulics */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Cutting Structure & Hydraulics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Blade / Cone Count
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={formData.bladeCount !== undefined ? formData.bladeCount : 6}
                  onChange={(e) => setFormData({ ...formData, bladeCount: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Cutter Diameter (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.cutterSizeMm !== undefined ? formData.cutterSizeMm : 16}
                  onChange={(e) => setFormData({ ...formData, cutterSizeMm: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Junk Slot Area (JSA %)
                </label>
                <input
                  type="number"
                  min="10"
                  max="70"
                  value={formData.junkSlotAreaPct || 40}
                  onChange={(e) => setFormData({ ...formData, junkSlotAreaPct: parseInt(e.target.value, 10) || 40 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Nozzle Sizes (32nds of an inch, comma-separated)
              </label>
              <input
                type="text"
                value={nozzleString}
                onChange={(e) => setNozzleString(e.target.value)}
                placeholder="e.g. 12, 12, 14, 14, 16"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Total Nozzle Count: {nozzleString.split(',').filter(s => s.trim().length > 0).length} jets
              </span>
            </div>
          </div>

          {/* Operational Envelope */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              SPE Operating Envelope
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Recommended WOB Range (klbf)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.recommendedWobKlbf?.[0] || 15}
                    onChange={(e) => {
                      const min = parseFloat(e.target.value) || 10;
                      const max = formData.recommendedWobKlbf?.[1] || 30;
                      setFormData({ ...formData, recommendedWobKlbf: [min, max] });
                    }}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    value={formData.recommendedWobKlbf?.[1] || 30}
                    onChange={(e) => {
                      const min = formData.recommendedWobKlbf?.[0] || 15;
                      const max = parseFloat(e.target.value) || 30;
                      setFormData({ ...formData, recommendedWobKlbf: [min, max] });
                    }}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Recommended RPM Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={formData.recommendedRpm?.[0] || 90}
                    onChange={(e) => {
                      const min = parseInt(e.target.value, 10) || 80;
                      const max = formData.recommendedRpm?.[1] || 160;
                      setFormData({ ...formData, recommendedRpm: [min, max] });
                    }}
                    placeholder="Min"
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="number"
                    value={formData.recommendedRpm?.[1] || 160}
                    onChange={(e) => {
                      const min = formData.recommendedRpm?.[0] || 90;
                      const max = parseInt(e.target.value, 10) || 160;
                      setFormData({ ...formData, recommendedRpm: [min, max] });
                    }}
                    placeholder="Max"
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image & Photo Selection */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Drill Bit Image</span>
              </h4>
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                  title="Clear this drill bit picture"
                >
                  <ImageOff className="w-3 h-3" />
                  <span>Clear Picture</span>
                </button>
              )}
            </div>

            {/* Active Image Status & Preview */}
            {formData.imageUrl ? (
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-white">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden border border-slate-700 shrink-0 flex items-center justify-center p-0.5">
                    <img
                      src={formData.imageUrl}
                      alt={formData.model || 'Bit image'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Active Drill Bit Picture</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {formData.imageUrl.startsWith('data:') ? 'Uploaded High-Clarity File Photo' : formData.imageUrl}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  Clear Picture
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageOff className="w-4 h-4 text-slate-400" />
                  <span>No picture assigned &bull; Uses standard CAD blueprint schematic</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-600 block">
                Select Photo Preset or Enter URL
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESET_IMAGE_OPTIONS.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: opt.url })}
                    className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer flex flex-col justify-between h-20 overflow-hidden relative ${
                      formData.imageUrl === opt.url
                        ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold text-slate-800 text-[11px] leading-tight z-10">
                      {opt.label}
                    </span>
                    <span className="text-[10px] text-sky-600 z-10">
                      {formData.imageUrl === opt.url ? '✓ Active Image' : 'Select'}
                    </span>
                    <div className="absolute right-0 bottom-0 w-12 h-12 opacity-30 pointer-events-none">
                      <img src={opt.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <label className="flex-1 px-3 py-2 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition shadow-2xs">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = () => {
                          const res = reader.result as string;
                          setFormData(prev => ({ ...prev, imageUrl: res, image3dUrl: res }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <UploadCloud className="w-3.5 h-3.5 text-sky-600" />
                  <span>Upload Image File from Device (Clear 1:1)</span>
                </label>
              </div>

              <input
                type="text"
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value, image3dUrl: e.target.value })}
                placeholder="Or custom image URL / data URI..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Description & Target Formations */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Target Formations (comma-separated)
              </label>
              <input
                type="text"
                value={formationsString}
                onChange={(e) => setFormationsString(e.target.value)}
                placeholder="e.g. Abrasive Sandstone, Carbonates, Interbedded Shales"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                Description / Application Notes
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Delete Danger Zone */}
          {onDelete && (
            <div className="pt-3 border-t border-red-100 bg-red-50/50 p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Remove Tool from Catalog
                </span>
                <p className="text-[11px] text-red-600/80">
                  Permanently deletes this item from the active inventory catalog.
                </p>
              </div>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Delete Item
                </button>
              ) : (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-semibold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition shadow-md shadow-sky-600/20 cursor-pointer flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
