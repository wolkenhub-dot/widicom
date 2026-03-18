/**
 * SearchBar.tsx
 * 
 * Componente de barra de busca com visual retro 90s.
 * Design: Terminal/BBS aesthetic with neon accents.
 */

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';



interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function SearchBar({ 
  onSearch, 
  isLoading = false,
  placeholder = 'Buscar Lost Media, arquivos raros...'
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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-2">
        {/* Campo de entrada */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 48px 12px 16px',
              background: '#000000',
              border: '3px inset #808080',
              color: '#00FF00',
              fontFamily: '"VT323", monospace',
              fontSize: '1.3rem',
              outline: 'none',
              caretColor: '#00FF00',
              letterSpacing: '0.05em',
              boxShadow: 'inset 0 0 20px rgba(0, 255, 0, 0.05)',
            }}
            className="
              focus:shadow-[0_0_15px_rgba(0,255,0,0.3)]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              placeholder:text-[#006600]
            "
          />
          
          {/* Icone de busca ou loading */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#00FF00' }}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Botao de busca - retro button style */}
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          style={{
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '0.6rem',
            padding: '14px 20px',
            background: isLoading ? '#333333' : '#FF00FF',
            color: '#FFFFFF',
            border: '3px outset #808080',
            cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
            textShadow: '1px 1px 0px #000000',
            boxShadow: '2px 2px 0px #000000',
            letterSpacing: '0.05em',
          }}
          className="
            hover:brightness-110
            active:border-[3px] active:border-inset
            disabled:opacity-50
            transition-all duration-100
          "
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">WAIT...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">SEARCH</span>
            </span>
          )}
        </Button>
      </div>

      {/* Dica de teclado - retro style */}
      <div className="mt-3" style={{
        fontFamily: '"VT323", monospace',
        fontSize: '1rem',
        color: '#808080',
      }}>
        {'>'} Pressione{' '}
        <kbd style={{
          padding: '2px 8px',
          background: '#000044',
          border: '2px outset #808080',
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '0.5rem',
          color: '#00FFFF',
        }}>
          ENTER
        </kbd>
        {' '}para buscar | <span className="animate-retro-blink" style={{ color: '#00FF00' }}>_</span>
      </div>
    </form>
  );
}
