import React, { useState } from 'react';
import { Droplets, CheckCircle, AlertTriangle, ShieldAlert, Plus, Trash2, RotateCcw } from 'lucide-react';
import { DrillBit } from '../types';

interface HydraulicsTabProps {
  activeBit?: DrillBit;
}

export const HydraulicsTab: React.FC<HydraulicsTabProps> = ({ activeBit }) => {
  // Hydraulics inputs
  const [flowRateGpm, setFlowRateGpm] = useState<number>(550);
  const [mudWeightPpg, setMudWeightPpg] = useState<number>(10.5);
  const [bitDiameterInch, setBitDiameterInch] = useState<number>(activeBit?.sizeInch || 8.5);
  const [nozzles, setNozzles] = useState<number[]>(
    activeBit?.nozzleSizes32nds || [12, 12, 12, 14, 14, 14]
  );

  // Calculations
  const sumDsquared = nozzles.reduce((acc, curr) => acc + curr * curr, 0);
  const tfa = nozzles.length > 0 ? sumDsquared / 1303.8 : 0;
  
  const nozzleVelocity = tfa > 0 ? (0.32086 * flowRateGpm) / tfa : 0;
  const bitPressureDrop = tfa > 0 ? (mudWeightPpg * Math.pow(flowRateGpm, 2)) / (10858 * Math.pow(tfa, 2)) : 0;
  const hhp = (bitPressureDrop * flowRateGpm) / 1714;
  const bitArea = Math.PI * Math.pow(bitDiameterInch / 2, 2);
  const hsi = bitArea > 0 ? hhp / bitArea : 0;
  const jetImpactForce = 0.000516 * mudWeightPpg * flowRateGpm * nozzleVelocity;

  // Status check
  let status: 'SUB_OPTIMAL' | 'OPTIMUM' | 'EXCESSIVE_EROSION' = 'OPTIMUM';
  let statusMsg = 'Optimal Hydraulic Cleaning: Sufficient cuttings turbulence without excessive nozzle or blade erosion.';

  if (hsi < 2.2) {
    status = 'SUB_OPTIMAL';
    statusMsg = 'Sub-optimal Bottomhole Cleaning: HSI below 2.5 HHP/in² risks cuttings accumulation, regrinding, and bit face balling in sticky shale formations.';
  } else if (hsi > 6.0 || nozzleVelocity > 450) {
    status = 'EXCESSIVE_EROSION';
    statusMsg = 'High Fluid Erosion Warning: Jet velocity exceeds 450 ft/s. Severe risk of nozzle retention ring washout and body pocket erosion.';
  }

  // Update a single nozzle size
  const updateNozzle = (index: number, size: number) => {
    const updated = [...nozzles];
    updated[index] = size;
    setNozzles(updated);
  };

  const addNozzle = () => {
    if (nozzles.length < 8) {
      setNozzles([...nozzles, 12]);
    }
  };

  const removeNozzle = (index: number) => {
    if (nozzles.length > 3) {
      setNozzles(nozzles.filter((_, i) => i !== index));
    }
  };

  const resetPreset = (preset: 'standard' | 'highFlow' | 'lowFlow') => {
    if (preset === 'standard') {
      setNozzles([12, 12, 12, 14, 14, 14]);
      setFlowRateGpm(550);
      setMudWeightPpg(10.5);
    } else if (preset === 'highFlow') {
      setNozzles([14, 14, 14, 16, 16, 16, 18]);
      setFlowRateGpm(850);
      setMudWeightPpg(11.2);
    } else if (preset === 'lowFlow') {
      setNozzles([10, 10, 11, 11, 12]);
      setFlowRateGpm(380);
      setMudWeightPpg(9.5);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-700">
            <Droplets className="w-4 h-4" />
            <span>DOWNHOLE HYDRAULICS & NOZZLE SIZING ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Drill Bit Hydraulics & Total Flow Area (TFA)
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Size interchangeable ceramic/carbide nozzles to balance standpipe pressure, Hydraulic Horsepower (HSI), and Jet Impact Force (JIF) for high-rate cuttings evacuation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => resetPreset('standard')}
            className="px-3 py-1.5 rounded-lg text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer font-medium"
          >
            8.5" Standard
          </button>
          <button
            onClick={() => resetPreset('highFlow')}
            className="px-3 py-1.5 rounded-lg text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer font-medium"
          >
            12.25" High Flow
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Flow & Nozzle Bank (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Rig Hydraulic Parameters
          </h3>

          {/* Mud Flow Rate */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Rig Mud Pump Flow Rate:</span>
              <span className="font-mono font-bold text-sky-700">{flowRateGpm} GPM</span>
            </div>
            <input
              type="range"
              min="200"
              max="1100"
              step="10"
              value={flowRateGpm}
              onChange={(e) => setFlowRateGpm(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* Mud Weight */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Drilling Fluid Density (MW):</span>
              <span className="font-mono font-bold text-amber-700">{mudWeightPpg} ppg</span>
            </div>
            <input
              type="range"
              min="8.4"
              max="16.5"
              step="0.1"
              value={mudWeightPpg}
              onChange={(e) => setMudWeightPpg(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Bit Diameter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Bit Outer Diameter:</span>
              <span className="font-mono font-bold text-slate-800">{bitDiameterInch} inches</span>
            </div>
            <input
              type="range"
              min="5.875"
              max="17.5"
              step="0.125"
              value={bitDiameterInch}
              onChange={(e) => setBitDiameterInch(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
          </div>

          {/* Nozzles Configuration */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Nozzle Configuration (in 1/32"):
              </span>
              <button
                onClick={addNozzle}
                disabled={nozzles.length >= 8}
                className="text-[11px] text-sky-600 hover:text-sky-800 flex items-center gap-1 disabled:opacity-40 cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" /> Add Nozzle
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {nozzles.map((nz, idx) => (
                <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">N#{idx + 1}</span>
                    <select
                      value={nz}
                      onChange={(e) => updateNozzle(idx, parseInt(e.target.value))}
                      className="bg-white text-sky-800 text-xs font-bold font-mono rounded px-1.5 py-0.5 border border-slate-300 focus:outline-none shadow-2xs"
                    >
                      {[9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22].map((s) => (
                        <option key={s} value={s}>
                          #{s} ({s}/32")
                        </option>
                      ))}
                    </select>
                  </div>
                  {nozzles.length > 3 && (
                    <button
                      onClick={() => removeNozzle(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Output Metrics & Performance Meters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Output Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Total Flow Area (TFA)</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {tfa.toFixed(3)}
              </div>
              <span className="text-[10px] text-slate-500">sq inches</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Nozzle Velocity (Vn)</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                nozzleVelocity > 450 ? 'text-rose-700' : 'text-sky-700'
              }`}>
                {Math.round(nozzleVelocity)}
              </div>
              <span className="text-[10px] text-slate-500">ft / sec (max 450)</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Bit Pressure Drop (ΔPb)</span>
              <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
                {Math.round(bitPressureDrop)}
              </div>
              <span className="text-[10px] text-slate-500">psi</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Hydraulic HSI</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                hsi >= 2.5 && hsi <= 5.5 ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {hsi.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500">HHP / in² (2.5 - 5.5 opt)</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Jet Impact Force (JIF)</span>
              <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
                {Math.round(jetImpactForce)}
              </div>
              <span className="text-[10px] text-slate-500">lbf (Rock crossflow)</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Hydraulic HP (HHP)</span>
              <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
                {Math.round(hhp)}
              </div>
              <span className="text-[10px] text-slate-500">HP at bit face</span>
            </div>
          </div>

          {/* Status Box */}
          <div className={`rounded-xl p-4 border shadow-xs ${
            status === 'OPTIMUM'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : status === 'SUB_OPTIMAL'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center space-x-2">
              {status === 'OPTIMUM' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : status === 'SUB_OPTIMAL' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              )}
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {status.replace('_', ' ')}
              </h4>
            </div>
            <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
              {statusMsg}
            </p>
          </div>

          {/* HSI Target Meter */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-800">HSI Cleaning Efficiency Range:</span>
              <span className="font-mono font-bold text-sky-700">{hsi.toFixed(2)} HHP/in²</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full relative overflow-hidden flex border border-slate-200">
              <div className="w-[30%] bg-amber-400/40 h-full border-r border-slate-300" title="Sub-optimal (<2.5)"></div>
              <div className="w-[45%] bg-emerald-500/50 h-full border-r border-slate-300" title="Optimum (2.5 - 5.5)"></div>
              <div className="w-[25%] bg-rose-500/40 h-full" title="Excessive (>5.5)"></div>
              {/* Indicator needle */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-slate-900 shadow-md transition-all duration-300 rounded"
                style={{ left: `${Math.min(98, Math.max(2, (hsi / 7.5) * 100))}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (Balling risk)</span>
              <span>2.5 Optimum</span>
              <span>5.5</span>
              <span>7.5+ (Erosion risk)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
