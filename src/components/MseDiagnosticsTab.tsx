import React, { useState, useEffect } from 'react';
import { Activity, AlertOctagon, CheckCircle, Zap, Shield, Play, Pause, RefreshCw, ArrowLeft } from 'lucide-react';
import { DrillBit } from '../types';

interface MseDiagnosticsTabProps {
  activeBit?: DrillBit;
  initialWob?: number;
  initialRpm?: number;
  onNavigateToAdvisory?: () => void;
}

export const MseDiagnosticsTab: React.FC<MseDiagnosticsTabProps> = ({
  activeBit,
  initialWob = 22,
  initialRpm = 135,
  onNavigateToAdvisory
}) => {
  // Telemetry Inputs
  const [wobKlbf, setWobKlbf] = useState<number>(initialWob);
  const [torqueFtLbs, setTorqueFtLbs] = useState<number>(6800);
  const [rpm, setRpm] = useState<number>(initialRpm);
  const [ropFtPerHour, setRopFtPerHour] = useState<number>(75);
  const [ucsMpa, setUcsMpa] = useState<number>(55);
  const [bitDiameterInch, setBitDiameterInch] = useState<number>(activeBit?.sizeInch || 8.5);

  // Live Auto-Telemetry Simulation
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Calculate live MSE & Efficiency
  const bitArea = Math.PI * Math.pow(bitDiameterInch / 2, 2);
  const wobLbs = wobKlbf * 1000;
  const axialMse = bitArea > 0 ? wobLbs / bitArea : 0;
  const rotaryMse = (bitArea > 0 && ropFtPerHour > 0) 
    ? (120 * Math.PI * rpm * torqueFtLbs) / (bitArea * ropFtPerHour)
    : 0;
  const totalMsePsi = Math.round(axialMse + rotaryMse);

  // UCS in psi
  const ucsPsi = Math.round(ucsMpa * 145.038);
  const efficiencyPct = Math.min(100, Math.max(5, Math.round((ucsPsi / totalMsePsi) * 1000) / 10));

  // Diagnostic logic
  let diagnosis: 'EFFICIENT' | 'STICK_SLIP' | 'BIT_BALLING' | 'WHIRL' = 'EFFICIENT';
  let diagTitle = 'Optimal Rock Destruction';
  let diagDesc = 'Drilling mechanics within standard efficiency boundary. Mechanical energy is directly translating to rock fragmentation with minimal vibration loss.';
  let recommendedAction = 'Maintain current rotary parameters. Continue surveying directional inclination.';

  if (efficiencyPct < 22) {
    if (torqueFtLbs > 8200 && rpm < 115) {
      diagnosis = 'STICK_SLIP';
      diagTitle = 'Torsional Stick-Slip Detected';
      diagDesc = 'Severe torque variance and rotary stalling detected. High rotary energy dissipation without penetration progress indicates torsional wind-up.';
      recommendedAction = 'Increase RPM by 15-20 RPM immediately to break cyclic friction. Temporarily bleed off 3-5 klbf WOB, then reapply smoothly.';
    } else if (ropFtPerHour < 25 && wobKlbf > 26) {
      diagnosis = 'BIT_BALLING';
      diagTitle = 'Bit Face Balling Detected';
      diagDesc = 'ROP is severely suppressed despite heavy WOB. Crushed rock flour and hydratable clay cuttings are packing the junk slots and cushioning cutter contact.';
      recommendedAction = 'Pick up off bottom, circulate at maximum pump flow rate (GPM), rotate at 160 RPM to centrifuge cuttings, and verify mud lubricity/shale inhibitor.';
    } else {
      diagnosis = 'WHIRL';
      diagTitle = 'Lateral Bit Whirl / Micro-Chipping';
      diagDesc = 'Excessive off-center lateral oscillation. Cutter impact energy exceeds steady shearing limit, risking diamond table delamination.';
      recommendedAction = 'Reduce rotary speed by 20 RPM to exit the resonant frequency window. Verify BHA stabilizer gauge clearance.';
    }
  }

  // Simulation tick
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Random subtle telemetry flutter
      setWobKlbf(prev => +(Math.max(10, Math.min(35, prev + (Math.random() - 0.48) * 1.2))).toFixed(1));
      setTorqueFtLbs(prev => Math.round(Math.max(3500, Math.min(10500, prev + (Math.random() - 0.48) * 250))));
      setRopFtPerHour(prev => Math.round(Math.max(15, Math.min(130, prev + (Math.random() - 0.48) * 4))));
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Preset dysfunction scenario buttons
  const triggerScenario = (scenario: 'normal' | 'stickslip' | 'balling' | 'whirl') => {
    setIsSimulating(false);
    if (scenario === 'normal') {
      setWobKlbf(20);
      setTorqueFtLbs(5800);
      setRpm(130);
      setRopFtPerHour(85);
    } else if (scenario === 'stickslip') {
      setWobKlbf(32);
      setTorqueFtLbs(9600);
      setRpm(85);
      setRopFtPerHour(28);
    } else if (scenario === 'balling') {
      setWobKlbf(30);
      setTorqueFtLbs(4200);
      setRpm(140);
      setRopFtPerHour(18);
    } else if (scenario === 'whirl') {
      setWobKlbf(14);
      setTorqueFtLbs(7200);
      setRpm(175);
      setRopFtPerHour(32);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700">
            <Activity className="w-4 h-4" />
            <span>TEALE (1965) MECHANICAL SPECIFIC ENERGY & DYNAMICS</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Real-Time MSE Optimization & Vibration Diagnoser
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Detect downhole dysfunctions (stick-slip, bit whirl, and bit balling) by evaluating the ratio between rock compressive strength and mechanical energy consumed at the bit face.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onNavigateToAdvisory && (
            <button
              onClick={onNavigateToAdvisory}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Advisor</span>
            </button>
          )}

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer shadow-xs ${
              isSimulating
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-700" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isSimulating ? 'Pause Stream' : 'Live Rig Stream'}</span>
          </button>
        </div>
      </div>

      {/* Scenario Triggers */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Test Operational Conditions:</span>
        <button
          onClick={() => triggerScenario('normal')}
          className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs cursor-pointer font-medium"
        >
          Optimal Shearing
        </button>
        <button
          onClick={() => triggerScenario('stickslip')}
          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs cursor-pointer font-medium"
        >
          Stick-Slip Scenario
        </button>
        <button
          onClick={() => triggerScenario('balling')}
          className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs cursor-pointer font-medium"
        >
          Bit Balling Scenario
        </button>
        <button
          onClick={() => triggerScenario('whirl')}
          className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 shadow-2xs cursor-pointer font-medium"
        >
          Bit Whirl Scenario
        </button>
      </div>

      {/* Main Grid: Telemetry Controls vs Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Telemetry Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Active Drilling Telemetry Inputs
          </h3>

          {/* WOB */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Weight on Bit (WOB):</span>
              <span className="font-mono font-bold text-sky-700">{wobKlbf} klbf</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="0.5"
              value={wobKlbf}
              onChange={(e) => setWobKlbf(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          {/* RPM */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Rotary Speed (RPM):</span>
              <span className="font-mono font-bold text-amber-700">{rpm} RPM</span>
            </div>
            <input
              type="range"
              min="40"
              max="220"
              step="5"
              value={rpm}
              onChange={(e) => setRpm(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Torque */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Top Drive Torque:</span>
              <span className="font-mono font-bold text-emerald-700">{torqueFtLbs.toLocaleString()} ft-lbs</span>
            </div>
            <input
              type="range"
              min="2000"
              max="15000"
              step="200"
              value={torqueFtLbs}
              onChange={(e) => setTorqueFtLbs(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* ROP */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Instantaneous ROP:</span>
              <span className="font-mono font-bold text-purple-700">{ropFtPerHour} ft/hr</span>
            </div>
            <input
              type="range"
              min="5"
              max="160"
              step="1"
              value={ropFtPerHour}
              onChange={(e) => setRopFtPerHour(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          {/* Rock UCS */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-700 font-medium">Formation UCS:</span>
              <span className="font-mono font-bold text-slate-800">{ucsMpa} MPa ({ucsPsi} psi)</span>
            </div>
            <input
              type="range"
              min="15"
              max="180"
              step="5"
              value={ucsMpa}
              onChange={(e) => setUcsMpa(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
            />
          </div>

          {/* Bit Diameter */}
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Bit Outer Diameter:</span>
            <span className="font-mono font-semibold text-slate-800">{bitDiameterInch}" Hole</span>
          </div>
        </div>

        {/* Live Gauges & Diagnostic Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Metric Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Calculated MSE</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {totalMsePsi.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">psi (Teale)</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Rock UCS Baseline</span>
              <div className="text-2xl font-bold font-mono text-sky-700 mt-1">
                {ucsPsi.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">psi baseline</span>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Drilling Efficiency</span>
              <div className={`text-2xl font-bold font-mono mt-1 ${
                efficiencyPct >= 35 ? 'text-emerald-700' : efficiencyPct >= 20 ? 'text-amber-700' : 'text-rose-700'
              }`}>
                {efficiencyPct}%
              </div>
              <span className="text-[10px] text-slate-500">UCS / MSE</span>
            </div>
          </div>

          {/* Diagnostic Status Card */}
          <div className={`rounded-xl p-5 border shadow-xs ${
            diagnosis === 'EFFICIENT'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : diagnosis === 'STICK_SLIP'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : diagnosis === 'BIT_BALLING'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-purple-50 border-purple-300 text-purple-950'
          }`}>
            <div className="flex items-center space-x-2">
              {diagnosis === 'EFFICIENT' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-600" />
              )}
              <h3 className="text-base font-bold tracking-tight">
                {diagTitle}
              </h3>
            </div>

            <p className="text-xs mt-2 text-slate-700 leading-relaxed">
              {diagDesc}
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200/80 bg-white/80 p-3 rounded-lg">
              <div className="flex items-center space-x-2 text-xs font-semibold text-sky-800 mb-1">
                <Zap className="w-3.5 h-3.5 text-sky-600" />
                <span>Driller Intervention Protocol:</span>
              </div>
              <p className="text-xs text-slate-800">
                {recommendedAction}
              </p>
            </div>
          </div>

          {/* Energy Component Breakdown (Axial vs Rotary) */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              MSE Energy Partitioning
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Axial Energy (WOB Component):</span>
                  <span className="font-mono font-medium">{Math.round(axialMse).toLocaleString()} psi ({Math.round((axialMse / totalMsePsi) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.round((axialMse / totalMsePsi) * 100))}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Rotary Energy (Torque & RPM Component):</span>
                  <span className="font-mono font-medium">{Math.round(rotaryMse).toLocaleString()} psi ({Math.round((rotaryMse / totalMsePsi) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.round((rotaryMse / totalMsePsi) * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              * Note: In typical PDC drilling, rotary shear torque represents 85-95% of total rock destruction energy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
