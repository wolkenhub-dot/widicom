import { Search, Loader2 } from 'lucide-react';

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto group">
      <div className="relative flex items-center transition-all duration-500 animate-slide-up group-hover:scale-[1.02]">
        <div className="absolute left-6 text-slate-400 dark:text-emerald-900/60">
          <Search className="w-6 h-6 transition-colors group-hover:text-indigo-600 dark:group-hover:text-emerald-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full py-5 pl-16 pr-16 text-xl tracking-tight rounded-full text-slate-900 dark:text-emerald-50 placeholder-slate-400 dark:placeholder-emerald-900/50 glass-input transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:bg-white dark:group-hover:bg-[#070b08] group-hover:shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:group-hover:shadow-[0_4px_30px_rgba(16,185,129,0.08)] focus:shadow-[0_8px_40px_rgba(99,102,241,0.15)] dark:focus:shadow-[0_8px_40px_rgba(16,185,129,0.2)] focus:scale-[1.01] border border-slate-200/50 dark:border-emerald-900/40"
        />
        
        {isLoading && (
          <div className="absolute right-6 text-indigo-400 dark:text-emerald-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

      </div>
    </form>
  );
}
