import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BitAdvisoryTab } from './components/BitAdvisoryTab';
import { MseDiagnosticsTab } from './components/MseDiagnosticsTab';
import { HydraulicsTab } from './components/HydraulicsTab';
import { DullGradingTab } from './components/DullGradingTab';
import { LaravelTab } from './components/LaravelTab';
import { AiChatTab } from './components/AiChatTab';
import { CatalogTab } from './components/CatalogTab';
import { DrillBit, FormationPreset } from './types';
import { Flame, ShieldCheck, MapPin, Phone, Mail, Globe, CheckCircle2, X, Bot, Sparkles } from 'lucide-react';
import { UnicronLogo } from './components/UnicronLogo';
import { UploadBitModal } from './components/UploadBitModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('advisory');
  const [rigType, setRigType] = useState<string>('Offshore Jack-Up ($140k/d)');
  const [catalog, setCatalog] = useState<DrillBit[]>([]);
  const [formationPresets, setFormationPresets] = useState<FormationPreset[]>([]);
  const [activeBit, setActiveBit] = useState<DrillBit | undefined>(undefined);
  const [mseWob, setMseWob] = useState<number>(22);
  const [mseRpm, setMseRpm] = useState<number>(135);

  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadToast, setUploadToast] = useState<{ message: string; sub?: string } | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isCatalogTabVisible, setIsCatalogTabVisible] = useState<boolean>(false);

  // Normal (Light) vs Dark Mode Background State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unicron-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('unicron-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('unicron-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Fetch bits
    fetch('/api/bits')
      .then((res) => res.json())
      .then((data) => {
        if (data.bits) {
          setCatalog(data.bits);
          if (data.bits.length > 0) {
            setActiveBit(data.bits[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load bit catalog:', err));

    // Fetch formations
    fetch('/api/formations')
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) {
          setFormationPresets(data.presets);
        }
      })
      .catch((err) => console.error('Failed to load formation presets:', err));
  }, []);

  const handleSelectBitForMse = (bit: DrillBit, wob: number, rpm: number) => {
    setActiveBit(bit);
    setMseWob(wob);
    setMseRpm(rpm);
    setActiveTab('mse');
  };

  const handleSelectBitFromCatalog = (bit: DrillBit) => {
    setActiveBit(bit);
    setActiveTab('advisory');
  };

  const handleUpdateBit = async (updatedBit: DrillBit) => {
    // 1. Immediately update local state optimistically so UI reflects the change with zero delay
    setCatalog((prev) => {
      const exists = prev.some((b) => b.id === updatedBit.id);
      if (exists) {
        return prev.map((b) => (b.id === updatedBit.id ? updatedBit : b));
      }
      return [updatedBit, ...prev];
    });
    if (activeBit?.id === updatedBit.id) {
      setActiveBit(updatedBit);
    }
    setUploadToast({
      message: 'Drill Bit Specifications Updated',
      sub: `"${updatedBit.model}" (${updatedBit.sizeInch}") changes saved to catalog.`
    });
    setTimeout(() => setUploadToast(null), 4000);

    // 2. Persist to server API
    try {
      const exists = catalog.some((b) => b.id === updatedBit.id);
      if (exists) {
        await fetch(`/api/bits/${updatedBit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBit)
        });
      } else {
        await fetch('/api/bits/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBit)
        });
      }
    } catch (e) {
      console.warn('Backend update persisted in client cache:', e);
    }
  };

  const handleDeleteBit = async (id: string) => {
    try {
      const res = await fetch(`/api/bits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const deletedBit = catalog.find((b) => b.id === id);
        const remaining = catalog.filter((b) => b.id !== id);
        setCatalog(remaining);
        if (activeBit?.id === id) {
          if (remaining.length > 0) setActiveBit(remaining[0]);
          else setActiveBit(undefined);
        }
        setUploadToast({
          message: 'Drill Bit Removed from Catalog',
          sub: `"${deletedBit?.model || id}" has been deleted.`
        });
        setTimeout(() => setUploadToast(null), 3000);
      }
    } catch (e) {
      console.error('Failed to delete drill bit:', e);
    }
  };

  const handleBitUploaded = (newBits: DrillBit[]) => {
    setCatalog((prev) => {
      const incomingIds = new Set(newBits.map(b => b.id));
      const remaining = prev.filter(b => !incomingIds.has(b.id));
      return [...newBits, ...remaining];
    });

    if (newBits.length > 0) {
      setActiveBit(newBits[0]);
      setUploadToast({
        message: `Imported ${newBits.length} Drill Bit Specification${newBits.length > 1 ? 's' : ''}`,
        sub: `"${newBits[0].model}" (${newBits[0].sizeInch}") is now active in the analysis suite.`
      });
      setTimeout(() => setUploadToast(null), 5000);
    }
  };

  const handleResetCatalog = async () => {
    try {
      const res = await fetch('/api/bits/reset', { method: 'POST' });
      const data = await res.json();
      if (data.bits) {
        setCatalog(data.bits);
        if (data.bits.length > 0) {
          setActiveBit(data.bits[0]);
        }
        setUploadToast({
          message: 'Catalog reset to factory specifications',
          sub: 'Factory Unicron tooling restored.'
        });
        setTimeout(() => setUploadToast(null), 4000);
      }
    } catch (e) {
      console.error('Failed to reset catalog:', e);
    }
  };

  const handleRemoveAllBits = async () => {
    try {
      const res = await fetch('/api/bits', { method: 'DELETE' });
      if (res.ok) {
        setCatalog([]);
        setActiveBit(undefined);
        setUploadToast({
          message: 'All Bit Catalog Components Deleted',
          sub: 'The catalog fleet has been cleared (0 items). You can upload custom drill bits anytime.'
        });
        setTimeout(() => setUploadToast(null), 4000);
      }
    } catch (e) {
      console.error('Failed to clear catalog:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060910] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white relative transition-colors duration-200">
      {/* Toast Notification */}
      {uploadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl border border-sky-500/40 flex items-start space-x-3 max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-2">
            <h5 className="text-xs font-bold text-white">{uploadToast.message}</h5>
            {uploadToast.sub && <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{uploadToast.sub}</p>}
          </div>
          <button 
            onClick={() => setUploadToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Bit Modal */}
      <UploadBitModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onBitUploaded={handleBitUploaded}
      />

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        rigType={rigType}
        setRigType={setRigType}
        isSimpleMode={isSimpleMode}
        setIsSimpleMode={setIsSimpleMode}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={(val) => {
          setIsDarkMode(prev => (val !== undefined ? val : !prev));
        }}
        isCatalogVisible={isCatalogTabVisible}
        onToggleCatalogVisible={() => {
          setIsCatalogTabVisible(prev => {
            const next = !prev;
            if (!next && activeTab === 'catalog') {
              setActiveTab('advisory');
            } else if (next) {
              setActiveTab('catalog');
            }
            return next;
          });
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'advisory' && (
          <BitAdvisoryTab
            catalog={catalog}
            formationPresets={formationPresets}
            isSimpleMode={isSimpleMode}
            setIsSimpleMode={setIsSimpleMode}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onSelectBitForMse={handleSelectBitForMse}
            onNavigateToHydraulics={() => setActiveTab('hydraulics')}
            onNavigateToAiChat={() => setActiveTab('ai-chat')}
            onNavigateToCatalog={() => {
              setIsCatalogTabVisible(true);
              setActiveTab('catalog');
            }}
            activeBit={activeBit}
            onSetActiveBit={(bit) => setActiveBit(bit)}
            onAddBit={(bit) => handleBitUploaded([bit])}
          />
        )}

        {activeTab === 'ai-chat' && (
          <AiChatTab
            catalog={catalog}
            activeBit={activeBit}
            onSelectBit={handleSelectBitFromCatalog}
            rigType={rigType}
            formationPresets={formationPresets}
          />
        )}

        {activeTab === 'mse' && (
          <MseDiagnosticsTab
            activeBit={activeBit}
            initialWob={mseWob}
            initialRpm={mseRpm}
          />
        )}

        {activeTab === 'hydraulics' && (
          <HydraulicsTab activeBit={activeBit} />
        )}

        {activeTab === 'dull' && (
          <DullGradingTab />
        )}

        {activeTab === 'catalog' && (
          <CatalogTab
            catalog={catalog}
            activeBit={activeBit}
            onSelectBit={handleSelectBitFromCatalog}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onResetCatalog={handleResetCatalog}
            onDeleteBit={handleDeleteBit}
            onRemoveAllBits={handleRemoveAllBits}
            onUpdateBit={handleUpdateBit}
            onAddBit={(bit) => handleBitUploaded([bit])}
            onNavigateToAdvisory={() => setActiveTab('advisory')}
            onCloseCatalog={() => {
              setIsCatalogTabVisible(false);
              setActiveTab('advisory');
              setUploadToast({
                message: 'Bit Catalog Component Closed',
                sub: 'You can restore or show the Bit Catalog anytime from the top bar.'
              });
              setTimeout(() => setUploadToast(null), 4000);
            }}
          />
        )}

        {activeTab === 'laravel' && (
          <LaravelTab />
        )}
      </main>

      {/* Floating Normal AI Trigger (Available on all tabs) */}
      {activeTab !== 'ai-chat' && (
        <aside aria-label="Normal AI Quick Launcher" className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-sky-600 via-sky-500 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-semibold text-xs shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer border border-white/20 group"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span>Ask Normal AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </aside>
      )}

      {/* Floating Normal AI Drawer Modal */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:items-end p-2 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative">
            <div className="absolute top-4 right-4 z-20">
              <button
                type="button"
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Close Normal AI Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AiChatTab
              catalog={catalog}
              activeBit={activeBit}
              onSelectBit={handleSelectBitFromCatalog}
              rigType={rigType}
              formationPresets={formationPresets}
              isDrawerMode={true}
              onCloseDrawer={() => setIsAiDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Corporate Petroleum Footer */}
      <footer className="bg-slate-50 dark:bg-[#070b16] border-t border-slate-200 dark:border-slate-800/80 mt-12 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <UnicronLogo variant="horizontal" size="sm" />
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Unicron Holdings Sdn Bhd is a licensed Malaysian upstream drilling technology provider, engineering premium PDC matrix & steel drill bits, stage hole openers (SHO), and downhole cutting structures for offshore oil & gas operators.
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-900/50">
              <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Certified PETRONAS Vendor &bull; API Spec 7-1 Licensed</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              Downhole Engineering Bases
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Kemaman Supply Base (KSB), Terengganu &bull; Peninsular Hub</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Asian Supply Base (ASB), Labuan &bull; Sabah/Sarawak Base</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Corporate HQ &bull; Solaris Dutamas, Kuala Lumpur</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              Petroleum Technical Suite
            </h4>
            <ul className="space-y-1 text-[11px] text-slate-600">
              <li>&bull; Gemini 3.8 Flash SPE Rationale Synthesis</li>
              <li>&bull; Real-Time Mechanical Specific Energy (Teale 1965)</li>
              <li>&bull; IADC Dull Grading Failure Root Cause Analysis</li>
              <li>&bull; Jet Nozzle Hydraulics & Total Flow Area (TFA)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
              Commercial Contact
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>+60 9-863 2244 (KSB 24/7 Operations Desk)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>engineering@unicron.com.my</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>www.unicron.com.my</span>
              </li>
            </ul>
            <div className="mt-3 text-[10px] text-slate-400">
              &copy; {new Date().getFullYear()} Unicron Holdings Sdn Bhd (1087459-T). All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
