import React, { useState } from 'react';
import { Layers, AlertTriangle, ShieldCheck, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { DullGradingResult } from '../types';

export const DullGradingTab: React.FC = () => {
  // 8-Point IADC Inputs
  const [innerCutters, setInnerCutters] = useState<number>(2);
  const [outerCutters, setOuterCutters] = useState<number>(3);
  const [dullCharPrimary, setDullCharPrimary] = useState<string>('CT');
  const [location, setLocation] = useState<string>('S');
  const [bearingSeals, setBearingSeals] = useState<string>('X');
  const [gaugeIn16ths, setGaugeIn16ths] = useState<number>(0);
  const [otherDullChar, setOtherDullChar] = useState<string>('WT');
  const [reasonPulled, setReasonPulled] = useState<string>('TD');

  // Dull Grading Analysis State
  const [analysis, setAnalysis] = useState<DullGradingResult>({
    codeString: '2-3-CT-S-X-I-WT-TD',
    severityLevel: 'MODERATE',
    wearMechanism: 'Moderate cyclic impact and thermal stress micro-fracturing on shoulder cutters.',
    rootCause: 'Hard chert/pyrite inclusions or excessive rotary speed inducing cutter tip temperature spikes >750°C during transitions.',
    recommendedMitigation: 'Limit maximum rotary speed to 120 RPM when passing interbedded stringers, ensure mud lubricity is maintained, and monitor real-time MSE.',
    nextBitModification: 'Specify Unicron UniMatrix M613 with chamfered dual-radius diamond cutters and thermally stable polycrystalline diamond (TSP).'
  });

  const runAnalysis = async () => {
    try {
      const response = await fetch('/api/advisory/dull-grading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          innerCutters,
          outerCutters,
          dullCharPrimary,
          location,
          bearingSeals,
          gaugeIn16ths,
          otherDullChar,
          reasonPulled
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.result);
      }
    } catch (err) {
      console.error('Failed to analyze dull grading:', err);
    }
  };

  const codeString = `${innerCutters}-${outerCutters}-${dullCharPrimary}-${location}-${bearingSeals}-${gaugeIn16ths === 0 ? 'I' : `${gaugeIn16ths}/16`}-${otherDullChar}-${reasonPulled}`;

  const setPresetGrade = (preset: 'normal' | 'broken' | 'ringout' | 'erosion') => {
    if (preset === 'normal') {
      setInnerCutters(1);
      setOuterCutters(1);
      setDullCharPrimary('WT');
      setLocation('M');
      setBearingSeals('X');
      setGaugeIn16ths(0);
      setOtherDullChar('NO');
      setReasonPulled('TD');
    } else if (preset === 'broken') {
      setInnerCutters(4);
      setOuterCutters(5);
      setDullCharPrimary('BT');
      setLocation('S');
      setBearingSeals('X');
      setGaugeIn16ths(1);
      setOtherDullChar('CT');
      setReasonPulled('PR');
    } else if (preset === 'ringout') {
      setInnerCutters(6);
      setOuterCutters(7);
      setDullCharPrimary('RO');
      setLocation('N');
      setBearingSeals('X');
      setGaugeIn16ths(3);
      setOtherDullChar('LT');
      setReasonPulled('PR');
    } else if (preset === 'erosion') {
      setInnerCutters(3);
      setOuterCutters(3);
      setDullCharPrimary('ER');
      setLocation('A');
      setBearingSeals('X');
      setGaugeIn16ths(0);
      setOtherDullChar('WT');
      setReasonPulled('HR');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700">
            <Layers className="w-4 h-4" />
            <span>IADC / SPE DRILL BIT DULL GRADING STANDARDS</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            IADC 8-Point Dull Grading & Failure Mode Analyzer
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Evaluate dull wear signatures of pulled bits to diagnose root causes (whirl, impact fracture, thermal breakdown, fluid erosion) and prescribe metallurgical & structural upgrades for subsequent runs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPresetGrade('normal')}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer font-medium"
          >
            Normal (1-1-WT)
          </button>
          <button
            onClick={() => setPresetGrade('broken')}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs cursor-pointer font-medium"
          >
            Shock Impact (BT)
          </button>
          <button
            onClick={() => setPresetGrade('ringout')}
            className="px-2.5 py-1.5 rounded-lg text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs cursor-pointer font-medium"
          >
            Ring Out (RO)
          </button>
        </div>
      </div>

      {/* Code Display Ribbon */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-500 block font-semibold">
            IADC 8-Character Dull Code:
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-sky-800 tracking-wider mt-0.5">
            {codeString}
          </div>
        </div>

        <button
          onClick={runAnalysis}
          className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          Analyze Wear & Recommend Mitigations
        </button>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 8 IADC Fields (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            IADC Standard Dull Matrix Parameters
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* 1. Inner Cutters */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                1. Inner Cutters (0 - 8):
              </label>
              <select
                value={innerCutters}
                onChange={(e) => setInnerCutters(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} - {n === 0 ? 'No wear' : n <= 2 ? 'Minor flat' : n <= 5 ? 'Moderate wear' : 'Severe wear'}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Outer Cutters */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                2. Outer Cutters (0 - 8):
              </label>
              <select
                value={outerCutters}
                onChange={(e) => setOuterCutters(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n} - {n === 0 ? 'No wear' : n <= 2 ? 'Minor flat' : n <= 5 ? 'Moderate wear' : 'Severe wear'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 3. Primary Dull Char */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                3. Primary Characteristic:
              </label>
              <select
                value={dullCharPrimary}
                onChange={(e) => setDullCharPrimary(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
              >
                <option value="WT">WT - Worn Teeth / Cutters (Normal)</option>
                <option value="BT">BT - Broken Teeth / Cutters (Impact)</option>
                <option value="CT">CT - Chipped Teeth / Cutters</option>
                <option value="ER">ER - Erosion (Fluid Velocity)</option>
                <option value="JD">JD - Junk Damage</option>
                <option value="RO">RO - Ring Out (Concentric Wear)</option>
                <option value="LT">LT - Lost Teeth / Pocket Failure</option>
                <option value="NO">NO - No Dull Characteristics</option>
              </select>
            </div>

            {/* 4. Location */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                4. Location on Bit:
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
              >
                <option value="S">S - Shoulder (High Tangential Speed)</option>
                <option value="N">N - Nose (High Compressive Zone)</option>
                <option value="M">M - Middle</option>
                <option value="G">G - Gauge (Outer Diameter)</option>
                <option value="C">C - Cone (Center Section)</option>
                <option value="A">A - All Areas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 5. Bearings / Seals */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                5. Bearings / Seals:
              </label>
              <select
                value={bearingSeals}
                onChange={(e) => setBearingSeals(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
              >
                <option value="X">X - Fixed Cutter (PDC Bit)</option>
                <option value="E">E - Sealed Bearing Effective</option>
                <option value="F">F - Sealed Bearing Failed</option>
              </select>
            </div>

            {/* 6. Gauge Wear */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                6. Gauge Wear (1/16th in):
              </label>
              <select
                value={gaugeIn16ths}
                onChange={(e) => setGaugeIn16ths(parseInt(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
              >
                <option value={0}>I - In Gauge (0/16")</option>
                <option value={1}>1/16" Under Gauge</option>
                <option value={2}>2/16" (1/8") Under Gauge</option>
                <option value={3}>3/16" Under Gauge</option>
                <option value={4}>4/16" (1/4") Under Gauge</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 7. Secondary Dull Char */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                7. Other Characteristic:
              </label>
              <select
                value={otherDullChar}
                onChange={(e) => setOtherDullChar(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
              >
                <option value="WT">WT - Worn Teeth</option>
                <option value="NO">NO - None</option>
                <option value="CT">CT - Chipped Teeth</option>
                <option value="ER">ER - Erosion</option>
                <option value="LT">LT - Lost Teeth</option>
              </select>
            </div>

            {/* 8. Reason Pulled */}
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                8. Reason Pulled:
              </label>
              <select
                value={reasonPulled}
                onChange={(e) => setReasonPulled(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none shadow-2xs"
              >
                <option value="TD">TD - Target Depth Reached</option>
                <option value="PR">PR - Penetration Rate Dropped</option>
                <option value="BHA">BHA - Change BHA / Motor Failure</option>
                <option value="HR">HR - Operating Hours Limit</option>
                <option value="DP">DP - Drill Pipe / String Washout</option>
                <option value="CM">CM - Condition Mud</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic & Actionable Advice (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Analysis Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Root Cause & Wear Diagnostic
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                analysis.severityLevel === 'MILD'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : analysis.severityLevel === 'MODERATE'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}>
                {analysis.severityLevel} WEAR SEVERITY
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold text-[10px] uppercase">
                  Identified Wear Mechanism:
                </span>
                <span className="text-slate-800 font-medium">
                  {analysis.wearMechanism}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-semibold text-[10px] uppercase">
                  Formation & Operational Root Cause:
                </span>
                <span className="text-slate-800 font-medium">
                  {analysis.rootCause}
                </span>
              </div>

              <div className="bg-sky-50 p-3 rounded-lg border border-sky-200">
                <span className="text-sky-800 block font-semibold text-[10px] uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Recommended Operational Mitigation:
                </span>
                <span className="text-sky-950 font-medium mt-0.5 block">
                  {analysis.recommendedMitigation}
                </span>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <span className="text-amber-800 block font-semibold text-[10px] uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Next Bit Design Modification:
                </span>
                <span className="text-amber-950 font-medium mt-0.5 block">
                  {analysis.nextBitModification}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
