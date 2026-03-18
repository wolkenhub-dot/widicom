/**
 * SearchBar.tsx
 * 
 * Componente minimalista de barra de busca com suporte a busca assíncrona.
 * Design: Minimalismo Moderno com acentos cibernéticos sutis.
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
            className="
              w-full px-4 py-3 pr-12
              bg-input border border-border rounded-md
              text-foreground placeholder-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              font-inter text-base
            "
          />
          
          {/* Ícone de busca ou loading */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Botão de busca */}
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="
            px-6 py-3
            bg-primary hover:bg-primary/90
            text-primary-foreground
            rounded-md font-medium
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
          "
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Buscando...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Buscar</span>
            </>
          )}
        </Button>
      </div>

      {/* Dica de teclado */}
      <div className="mt-3 text-xs text-muted-foreground">
        Pressione <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono">Enter</kbd> para buscar
      </div>
    </form>
  );
}
