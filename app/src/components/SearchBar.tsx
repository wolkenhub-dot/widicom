import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { getAutocomplete } from '@/lib/api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  query,
  onQueryChange,
  isLoading = false,
  placeholder = 'O que você está procurando?',
}: SearchBarProps) {
  
  const [suggestion, setSuggestion] = useState<string>('');
  const [sourcesFound, setSourcesFound] = useState(0);

  // Animate source counter while loading
  useEffect(() => {
    if (!isLoading) {
      setSourcesFound(0);
      return;
    }
    const interval = setInterval(() => {
      setSourcesFound(prev => prev < 12 ? prev + 1 : 12);
    }, 320);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Autocomplete suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setSuggestion('');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const sugs = await getAutocomplete(query);
        if (sugs && sugs.length > 0) {
          const match = sugs.find((s: string) => s.toLowerCase().startsWith(query.toLowerCase()));
          setSuggestion(match ? match.slice(query.length) : '');
        } else {
          setSuggestion('');
        }
      } catch {
        setSuggestion('');
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      setSuggestion('');
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion) {
      e.preventDefault();
      onQueryChange(query + suggestion);
      setSuggestion('');
    } else if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto group perspective-1000">
      <div className="relative flex flex-col items-center gap-4">

        {/* Outer Aura / Background Glow */}
        {isLoading && (
          <div className="absolute -inset-10 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 blur-[80px] rounded-full animate-aura-pulse pointer-events-none" />
        )}

        {/* Input Wrapper */}
        <div className={`relative w-full flex items-center transition-all duration-700 ${isLoading ? 'scale-[1.03] rotate-x-2' : 'group-hover:scale-[1.01]'}`}>

          {/* Futuristic Border System */}
          <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${isLoading ? 'opacity-100' : 'opacity-0'}`}>
             {/* Static Glow */}
             <div className="absolute inset-[-1px] rounded-full ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
          </div>

          {/* Tech Grid Background (Loading only) */}
          {isLoading && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] animate-grid-float" />
            </div>
          )}

          {/* Left icon area with orbiting particles */}
          <div className="absolute left-6 z-20 flex items-center justify-center">
            {isLoading && (
               <div className="absolute inset-0 scale-150">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute w-1 h-1 bg-emerald-400 rounded-full"
                      style={{ 
                        animation: `orbit ${2 + i * 0.5}s linear infinite`,
                        transformOrigin: '12px 12px'
                      }}
                    />
                  ))}
               </div>
            )}
            <div className={`transition-all duration-500 ${isLoading ? 'text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'text-slate-400 dark:text-emerald-900/60'}`}>
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin-slow" /> : <Search className="w-6 h-6" />}
            </div>
          </div>

          {/* Main input */}
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'QUANTUM TRACKING ACTIVE...' : placeholder}
            disabled={isLoading}
            className={`relative z-10 w-full py-5 pl-16 pr-6 text-xl tracking-widest font-light rounded-full bg-white/95 dark:bg-black/80 backdrop-blur-xl text-slate-900 dark:text-emerald-50 placeholder-slate-400/50 dark:placeholder-emerald-500/30 transition-all duration-700 border ${
              isLoading
                ? 'border-emerald-500/50 cursor-wait shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]'
                : 'border-slate-200/50 dark:border-white/5 focus:border-emerald-500/30'
            }`}
          />

          {/* Dual Layer Scanner */}
          {isLoading && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20" aria-hidden>
              {/* Primary fast scan */}
              <div className="absolute top-0 bottom-0 w-[20%] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-hyper-scan" />
              {/* Secondary slow sweep */}
              <div className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent animate-slow-sweep" />
              {/* Vertical line filament */}
              <div className="absolute top-0 bottom-0 w-[1px] bg-emerald-400 shadow-[0_0_15px_#10b981] animate-filament-scan" />
            </div>
          )}

          {/* Progress filament at bottom edge */}
          {isLoading && (
            <div className="absolute bottom-0 left-10 right-10 h-[2px] z-30 overflow-hidden rounded-full px-10">
               <div 
                 className="h-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent transition-all duration-300 shadow-[0_0_10px_#10b981]"
                 style={{ width: `${(sourcesFound / 12) * 100}%` }}
               />
            </div>
          )}

          {/* Autocomplete ghost text */}
          {!isLoading && suggestion && (
            <div className="absolute inset-0 z-10 pointer-events-none flex items-center px-16 overflow-hidden">
              <span className="text-xl tracking-widest font-light text-transparent whitespace-pre">{query}</span>
              <span className="text-xl tracking-widest font-light text-slate-400/40 dark:text-emerald-500/30 whitespace-pre">{suggestion}</span>
              <span className="ml-4 px-1.5 py-0.5 text-[0.6rem] font-bold tracking-[0.2em] text-emerald-500/60 border border-emerald-500/20 rounded backdrop-blur-sm">AUTO</span>
            </div>
          )}
        </div>

        {/* Status Hub Below */}
        {isLoading && (
          <div className="flex flex-col items-center gap-1 z-10">
            <div className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl border border-emerald-500/30 animate-fade-in shadow-2xl">
              <span className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"
                    style={{ animation: `pulse-glitch 1.5s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </span>
              <span className="text-xs uppercase tracking-[0.15em] font-black text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
                Rastreando Rede: {sourcesFound}/12 Entidades
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes hyper-scan {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(500%); }
        }
        @keyframes slow-sweep {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(300%); }
        }
        @keyframes filament-scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(1200px); }
        }
        @keyframes grid-float {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(14px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(14px) rotate(-360deg); }
        }
        @keyframes pulse-glitch {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes glitch-text {
          0%, 100% { text-shadow: none; }
          33% { text-shadow: 2px 0 #06b6d4, -2px 0 #10b981; }
          66% { text-shadow: -1px 0 #06b6d4, 1px 0 #10b981; }
        }
        .animate-hyper-scan {
          animation: hyper-scan 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-slow-sweep {
          animation: slow-sweep 3s ease-in-out infinite;
        }
        .animate-filament-scan {
          animation: filament-scan 2.4s linear infinite;
        }
        .animate-grid-float {
          animation: grid-float 10s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-x-2 {
          transform: rotateX(2deg);
        }
      `}</style>
    </form>
  );
}
