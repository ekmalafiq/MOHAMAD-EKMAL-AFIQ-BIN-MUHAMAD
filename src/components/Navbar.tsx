import React from 'react';
import { 
  Compass, 
  Activity, 
  Droplets, 
  Layers, 
  Code2, 
  ShieldCheck, 
  Zap,
  SlidersHorizontal,
  ChevronRight,
  UploadCloud,
  BookOpen,
  Sun,
  Moon,
  Bot,
  Sparkles
} from 'lucide-react';
import { UnicronLogo } from './UnicronLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  rigType?: string;
  setRigType?: (val: string) => void;
  isSimpleMode: boolean;
  setIsSimpleMode: (val: boolean) => void;
  onOpenUploadModal?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: (val?: boolean) => void;
  isCatalogVisible?: boolean;
  onToggleCatalogVisible?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  rigType,
  setRigType,
  isSimpleMode,
  setIsSimpleMode,
  onOpenUploadModal,
  isDarkMode = false,
  onToggleDarkMode,
  isCatalogVisible = true,
  onToggleCatalogVisible,
}) => {
  const engineeringTabs = [
    { id: 'advisory', label: 'AI Bit Advisor', icon: Compass },
    { id: 'ai-chat', label: 'Normal AI', icon: Bot, isAi: true },
    { id: 'mse', label: 'MSE & Dynamics', icon: Activity },
    { id: 'hydraulics', label: 'Hydraulics & TFA', icon: Droplets },
    { id: 'dull', label: 'IADC Dull Grading', icon: Layers },
    { id: 'catalog', label: 'Bit Catalog', icon: BookOpen },
    { id: 'laravel', label: 'Laravel Framework', icon: Code2 },
  ];

  const simpleTabs = [
    { id: 'advisory', label: 'Quick Bit Advisor', icon: Zap },
    { id: 'ai-chat', label: 'Normal AI', icon: Bot, isAi: true },
    { id: 'catalog', label: 'Bit Catalog', icon: BookOpen },
  ];

  const currentTabs = (isSimpleMode ? simpleTabs : engineeringTabs).filter(tab => {
    if (tab.id === 'catalog' && !isCatalogVisible) return false;
    return true;
  });

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-50 shadow-xs">
      {/* Top Corporate Status Bar */}
      <div className="bg-slate-50 px-4 py-1.5 border-b border-slate-200 text-xs flex flex-wrap justify-between items-center text-slate-600 gap-2">
        <div className="flex items-center space-x-3">
          <UnicronLogo variant="horizontal" size="sm" />
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline flex items-center gap-1 text-slate-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
            PETRONAS License Vendor (Malaysia)
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => {
                setIsSimpleMode(true);
                if (['mse', 'hydraulics', 'dull', 'laravel'].includes(activeTab)) {
                  setActiveTab('advisory');
                }
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
                isSimpleMode
                  ? 'bg-white text-emerald-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              title="Easy 3-step bit selection"
            >
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Simple Mode</span>
            </button>

            <button
              onClick={() => setIsSimpleMode(false)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs transition cursor-pointer ${
                !isSimpleMode
                  ? 'bg-white text-sky-800 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
              title="Full SPE rock mechanics and hydraulics formulas"
            >
              <SlidersHorizontal className="w-3 h-3 text-sky-600" />
              <span>Expert Mode</span>
            </button>
          </div>

          {/* Normal (Light) vs Dark Mode Background Switcher */}
          {onToggleDarkMode && (
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                onClick={() => onToggleDarkMode(false)}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] transition cursor-pointer ${
                  !isDarkMode
                    ? 'bg-white text-amber-800 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Switch to Normal (Clean Light) background"
              >
                <Sun className={`w-3 h-3 ${!isDarkMode ? 'text-amber-500 fill-amber-400' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">Normal</span>
              </button>
              <button
                onClick={() => onToggleDarkMode(true)}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] transition cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-900 text-sky-300 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Switch to Dark Mode (Petroleum Night) background"
              >
                <Moon className={`w-3 h-3 ${isDarkMode ? 'text-sky-400 fill-sky-400' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">Dark</span>
              </button>
            </div>
          )}

          {onOpenUploadModal && (
            <button
              onClick={onOpenUploadModal}
              className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Upload drill bit specifications (CSV, JSON, PDF, image, spec sheet)"
            >
              <UploadCloud className="w-3.5 h-3.5 text-white" />
              <span>Upload Bit File</span>
            </button>
          )}

          {!isCatalogVisible && onToggleCatalogVisible && (
            <button
              onClick={onToggleCatalogVisible}
              className="flex items-center space-x-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer"
              title="Show Bit Catalog component"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Show Bit Catalog</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Brand & Navigation Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-white p-1 shadow-xs border border-slate-200 flex items-center justify-center shrink-0">
            <UnicronLogo variant="emblem" size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Unicron DrillBit AI Advisor
              </h1>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                isSimpleMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                {isSimpleMode ? 'Simple View' : 'v2.6 SPE Suite'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isSimpleMode
                ? 'Quick 1-Click Drill Bit Recommendations for Oil & Gas Wells'
                : 'Downhole Rock Mechanics, Bit Selection & Operational Envelope Optimization'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center overflow-x-auto space-x-1.5 pb-1 md:pb-0 scrollbar-thin">
          {currentTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs font-semibold'
                    : (tab as any).isAi
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100/80 border border-emerald-200/60 dark:border-emerald-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : (tab as any).isAi ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {(tab as any).isAi && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isActive ? 'bg-white/20 text-white' : 'bg-emerald-200/70 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300'
                  }`}>
                    Gemini
                  </span>
                )}
              </button>
            );
          })}

          {isSimpleMode && (
            <button
              onClick={() => setIsSimpleMode(false)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-sky-700 hover:bg-sky-50 hover:text-sky-900 border border-dashed border-sky-300 transition-colors cursor-pointer"
              title="Show MSE, Hydraulics, Dull Grading & Laravel Code"
            >
              <span>+ More Tools</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
