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
          if (match) {
            setSuggestion(match.slice(query.length));
          } else {
            setSuggestion('');
          }
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
    if (query.trim()) {
      setSuggestion('');
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (suggestion) {
        e.preventDefault();
        onQueryChange(query + suggestion);
        setSuggestion('');
      }
    } else if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto group">
      <div className="relative flex items-center transition-all duration-500 animate-slide-up group-hover:scale-[1.02]">
        <div className="absolute left-6 text-slate-400 dark:text-emerald-900/60">
          <Search className="w-6 h-6 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full py-5 pl-16 pr-16 text-xl tracking-tight rounded-full text-slate-900 dark:text-emerald-50 placeholder-slate-400 dark:placeholder-white/40 glass-input transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:bg-white dark:group-hover:bg-black group-hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:group-hover:shadow-[0_4px_30px_rgba(16,185,129,0.15)] focus:shadow-[0_8px_40px_rgba(16,185,129,0.15)] dark:focus:shadow-[0_8px_40px_rgba(16,185,129,0.25)] focus:scale-[1.01] border border-slate-200/50 dark:border-white/10"
        />
        
        {/* Prediction Ghost Text Overlay */}
        {!isLoading && suggestion && (
          <div className="absolute inset-0 pointer-events-none flex items-center px-16 overflow-hidden">
             <span className="text-xl tracking-tight text-transparent whitespace-pre">
               {query}
             </span>
             <span className="text-xl tracking-tight text-slate-400/60 dark:text-emerald-500/50 whitespace-pre">
               {suggestion}
             </span>
             <span className="ml-3 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-slate-400/80 dark:text-emerald-500/80 border border-slate-300/50 dark:border-emerald-500/30 rounded-md">
                TAB
             </span>
          </div>
        )}

        {isLoading && (
          <div className="absolute right-6 text-emerald-600 dark:text-emerald-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

      </div>
    </form>
  );
}
