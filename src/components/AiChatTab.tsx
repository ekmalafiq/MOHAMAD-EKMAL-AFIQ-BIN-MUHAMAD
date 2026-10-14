import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  RotateCcw, 
  Copy, 
  Check, 
  Sliders, 
  Wrench, 
  Cpu, 
  Compass, 
  ShieldCheck, 
  Zap, 
  Flame, 
  Droplets, 
  Activity, 
  BookOpen, 
  DollarSign, 
  HelpCircle,
  ChevronDown,
  Info,
  ArrowLeft
} from 'lucide-react';
import { DrillBit, FormationPreset } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  roleTitle?: string;
}

interface AiChatTabProps {
  catalog: DrillBit[];
  activeBit?: DrillBit;
  onSelectBit?: (bit: DrillBit) => void;
  rigType?: string;
  formationPresets?: FormationPreset[];
  isDrawerMode?: boolean;
  onCloseDrawer?: () => void;
  onNavigateToAdvisory?: () => void;
}

export const AiChatTab: React.FC<AiChatTabProps> = ({
  catalog,
  activeBit,
  onSelectBit,
  rigType = 'Jackup Rig (Offshore Malaysia)',
  formationPresets = [],
  isDrawerMode = false,
  onCloseDrawer,
  onNavigateToAdvisory
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `**Welcome to Normal AI Assistant.**\n\nI am your versatile AI assistant powered by Google Gemini. You can ask me anything — from general questions, technical calculations, math, coding, and problem solving, to specialized oil & gas drilling engineering, drill bit design, and hydraulics.\n\nHow can I help you today? Ask any question or choose one of the suggested prompts below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash',
      roleTitle: 'Normal AI Assistant'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<'general' | 'optimization' | 'metallurgy' | 'wellsite' | 'hydraulics'>('general');
  const [includeContext, setIncludeContext] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = [...messages, userMsg].map((m) => ({
        role: m.role,
        text: m.text
      }));

      const activeContext = includeContext
        ? {
            rigType,
            activeBit,
            holeSize: activeBit?.sizeInch || 8.5,
            formation: 'Baram Delta / Malay Basin Offshore'
          }
        : {};

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          model: selectedModel,
          systemRole: selectedRole,
          activeContext
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        const modelMsg: Message = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed,
          roleTitle: data.role
        };
        setMessages((prev) => [...prev, modelMsg]);
      } else {
        throw new Error(data.message || 'Failed to generate AI response');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `**Engineering Notice:** I encountered a temporary connection glitch (${err.message}). Using local petroleum heuristics: verify your WOB (15-28 klbf), RPM (110-150), and maintain bit hydraulic HSI above 3.5 to avoid cutter blinding.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'DETERMINISTIC_FALLBACK'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear the current conversation history?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: `**Conversation cleared.**\n\nI am ready for your next question. Feel free to ask anything!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
          roleTitle: selectedRole === 'general' ? 'Normal AI Assistant' : 'Specialist AI'
        }
      ]);
    }
  };

  const promptStarters = [
    {
      title: 'General Technical Inquiry',
      prompt: 'Explain the principles of Mechanical Specific Energy (MSE) and why reducing MSE improves drilling efficiency.',
      icon: Zap
    },
    {
      title: 'Recommend Bit for Formation',
      prompt: 'What drill bit design is recommended for 12-1/4" hole in abrasive sandstone interbedded with reactive shale?',
      icon: ShieldCheck
    },
    {
      title: 'Nozzle TFA Calculation',
      prompt: 'Calculate recommended nozzle configuration for 8-1/2" bit at 550 GPM mud flow to achieve 4.5 HSI hydraulic cleaning.',
      icon: Droplets
    },
    {
      title: 'Ask Any Question',
      prompt: 'Compare Tungsten Carbide Matrix body vs Steel body (UniSpeed S519) for interbedded sandstone with chert nodules.',
      icon: Activity
    }
  ];

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-all ${
      isDrawerMode ? 'h-[85vh]' : 'min-h-[750px] h-[80vh]'
    }`}>
      {/* Header Bar */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Normal AI Assistant
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by Google Gemini &bull; Intelligent Multi-Domain & Engineering AI
            </p>
          </div>
        </div>

        {/* Model & Persona Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {!isDrawerMode && onNavigateToAdvisory && (
            <button
              type="button"
              onClick={onNavigateToAdvisory}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Advisor</span>
            </button>
          )}

          {/* Persona Selector */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs">
            <Wrench className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="general">Normal AI (General & Engineering)</option>
              <option value="optimization">Lead Drilling Specialist</option>
              <option value="metallurgy">Bit Metallurgy & Design</option>
              <option value="wellsite">MSE & Vibration Diagnostics</option>
              <option value="hydraulics">Hydraulics & TFA Engineer</option>
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs">
            <Cpu className="w-3.5 h-3.5 text-sky-500 mr-1.5" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (General / SPE)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Fast)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoning)</option>
            </select>
          </div>

          {/* Clear History Button */}
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-600 transition cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Wellbore Context Ribbon */}
      <div className="bg-slate-100/70 dark:bg-slate-950/60 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium select-none">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
            />
            <span>Include Active Well Context</span>
          </label>
          {includeContext && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                Rig: <strong>{rigType}</strong>
              </span>
              {activeBit && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="font-mono text-sky-600 dark:text-sky-400">
                    Active Bit: <strong>{activeBit.model}</strong> ({activeBit.sizeInch}")
                  </span>
                </>
              )}
            </>
          )}
        </div>
        <span className="text-[10px] text-slate-400">
          Maintains multi-turn context
        </span>
      </div>

      {/* Message Thread (Scrollable) */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isUser ? 'You (Wellsite Engineer)' : msg.roleTitle || 'Unicron AI Advisor'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {msg.timestamp}
                </span>
                {msg.modelUsed && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {msg.modelUsed}
                  </span>
                )}
              </div>

              <div
                className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-xs'
                }`}
              >
                {/* Content formatted with basic markdown rendering */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text.split('\n\n').map((paragraph, pIdx) => {
                    // Render bolding and simple bullet formatting
                    const formatted = paragraph
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/• (.*?)(?=(\n|$))/g, '<li class="ml-3 list-disc">$1</li>');

                    return (
                      <div
                        key={pIdx}
                        dangerouslySetInnerHTML={{ __html: formatted }}
                      />
                    );
                  })}
                </div>

                {/* Quick copy button */}
                <button
                  type="button"
                  onClick={() => handleCopyText(msg.id, msg.text)}
                  className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg ${
                    isUser
                      ? 'bg-sky-700/80 hover:bg-sky-700 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                  title="Copy message"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start animate-in fade-in">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 px-1">
              Unicron AI Assistant is analyzing...
            </span>
            <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-xs flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                Running SPE petroleum engineering synthesis...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 3 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Suggested Technical Queries
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {promptStarters.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(item.prompt)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/70 hover:bg-sky-50 dark:hover:bg-slate-800 text-left transition cursor-pointer flex items-start gap-2.5 group"
                >
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-sky-600 dark:text-sky-400 group-hover:bg-sky-100 transition shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.prompt}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 shadow-xs transition">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Normal AI anything — general questions, calculations, bit selection, or drilling parameters..."
              rows={2}
              className="w-full p-3 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-hidden"
            />
            <div className="flex items-center justify-between px-3 pb-2 text-[10px] text-slate-400">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Shift+Enter</kbd> for newline</span>
              <span className="font-mono">{inputMessage.length} chars</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className={`p-3.5 rounded-2xl font-semibold flex items-center justify-center transition cursor-pointer shadow-md ${
              inputMessage.trim() && !isLoading
                ? 'bg-sky-600 hover:bg-sky-500 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
