import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  isLoading = false,
  placeholder = 'O que você está procurando?',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

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
        <div className="absolute left-6 text-slate-400">
          <Search className="w-5 h-5 transition-colors group-hover:text-indigo-400" />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full py-4 pl-14 pr-16 text-lg tracking-wide rounded-full text-white placeholder-slate-400 glass-input transition-shadow duration-300 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
        />
        
        {isLoading && (
          <div className="absolute right-6 text-indigo-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}

      </div>
    </form>
  );
}
