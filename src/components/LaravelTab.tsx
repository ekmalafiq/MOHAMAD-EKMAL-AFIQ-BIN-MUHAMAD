import React, { useState, useEffect } from 'react';
import { Code2, Download, Copy, Check, FileCode, Folder, Terminal, Sparkles, Server } from 'lucide-react';

interface LaravelFile {
  path: string;
  name: string;
  type: string;
  code: string;
}

export const LaravelTab: React.FC = () => {
  const [files, setFiles] = useState<LaravelFile[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('app/Http/Controllers/DrillBitAdvisoryController.php');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/laravel-export')
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setFiles(data.files);
          if (data.files.length > 0) {
            setSelectedFilePath(data.files[0].path);
          }
        }
      })
      .catch((err) => console.error('Failed to load Laravel export:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeFile = files.find((f) => f.path === selectedFilePath) || files[0];

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadZip = () => {
    window.open('/api/laravel-export/download', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-600">
            <Code2 className="w-4 h-4" />
            <span>LARAVEL 11 FRAMEWORK BACKEND ARCHITECTURE</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Production Laravel 11 Oil & Gas Advisory Package
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Complete PHP 8.3 / Laravel 11 drop-in architecture containing controllers, Eloquent models, database migrations, SPE engineering calculation services, and Gemini AI service integration.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadZip}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Laravel 11 ZIP</span>
          </button>
        </div>
      </div>

      {/* Deployment & Architecture Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start space-x-2.5">
          <div className="w-7 h-7 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Framework Stack</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              PHP 8.3 &bull; Laravel 11.x &bull; Eloquent ORM &bull; MySQL / PostgreSQL
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2.5">
          <div className="w-7 h-7 rounded bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Gemini AI Service</div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              <code className="text-sky-700 font-mono font-medium">google-gemini-php/client</code> with fallback SPE heuristics
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2.5">
          <div className="w-7 h-7 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">CLI Setup Command</div>
            <div className="text-slate-600 text-[11px] mt-0.5 font-mono">
              composer require google-gemini-php/client
            </div>
          </div>
        </div>
      </div>

      {/* Code Browser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Left Column: File Tree (4 cols) */}
        <div className="lg:col-span-4 bg-slate-50 p-4 border-r border-slate-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-200">
            <Folder className="w-4 h-4 text-amber-600" />
            <span>Laravel Architecture Files</span>
          </div>

          <div className="space-y-1 overflow-y-auto max-h-[580px] scrollbar-thin">
            {files.map((file) => {
              const isSelected = selectedFilePath === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center space-x-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-white text-rose-700 border border-slate-300 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                  <div className="truncate">
                    <div className="truncate font-mono font-medium">{file.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[650px] bg-slate-950">
          {/* Top Bar */}
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-200">
                {activeFile?.path || 'No file selected'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                PHP / Laravel
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition cursor-pointer border border-slate-700 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <div className="p-4 flex-1 overflow-auto bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin">
            <pre>
              <code>{activeFile?.code || '// Select a file from the left to view contents'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
