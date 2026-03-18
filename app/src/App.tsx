/**
 * Home.tsx
 * 
 * Página principal do Widicom - Metabuscador de Lost Media.
 * Design: Minimalismo Moderno com acentos cibernéticos.
 */

import { useState, useEffect } from 'react';
import { AlertCircle, Info, Filter } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ResultCard from '@/components/ResultCard';
import { searchLostMedia, checkAPIHealth } from '@/lib/api';
import type { SearchResponse } from '@/lib/api';
import { toast } from 'sonner';

export default function Home() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [lastQuery, setLastQuery] = useState('');
  const [activePlatformFilter, setActivePlatformFilter] = useState('all');

  // Verifica a disponibilidade da API ao carregar a página
  useEffect(() => {
    checkAPIHealth()
      .then(available => setApiAvailable(available))
      .catch(() => setApiAvailable(false));
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setLastQuery(query);
    setResults(null);
    setActivePlatformFilter('all');

    try {
      const data = await searchLostMedia(query);
      setResults(data);

      if (data.total_resultados === 0) {
        toast.info('Nenhum resultado encontrado para esta busca.');
      } else {
        toast.success(`${data.total_resultados} resultado(s) encontrado(s)!`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar';
      toast.error(errorMessage);
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Computes platforms uniquely present in the API search results
  const availablePlatforms = results 
    ? Array.from(new Set(results.resultados.map(r => r.plataforma))) 
    : [];

  // Filters results locally based on the clicked chip
  const filteredResults = results 
    ? (activePlatformFilter === 'all' 
        ? results.resultados 
        : results.resultados.filter(r => r.plataforma === activePlatformFilter))
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6 sm:py-8">
          <div className="flex flex-col gap-2 relative">
            <div className="flex items-end gap-3">
              <h1 
                className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter"
                style={{
                  background: 'linear-gradient(to bottom, #6ee7b7 0%, #10b981 45%, #ffffff 50%, #06b6d4 55%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0px 0px 10px rgba(16, 185, 129, 0.8)) drop-shadow(0px 5px 2px rgba(0,0,0,0.6))',
                  fontFamily: '"Arial Black", Impact, sans-serif'
                }}
              >
                WIDICOM
              </h1>
              <span className="mb-2 text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse uppercase tracking-widest">
                Term
              </span>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base font-medium tracking-widest uppercase mt-1">
              Metabuscador especializado em <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">Lost Media</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 sm:py-12">
        {/* Aviso de API não disponível */}
        {!apiAvailable && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900">API não disponível</h3>
              <p className="text-sm text-yellow-800 mt-1">
                A API de busca não está disponível. Certifique-se de que o servidor está rodando em{' '}
                <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                  {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Seção de Busca */}
        <div className="mb-12">
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Dicas de Busca */}
          {!results && !isLoading && (
            <div className="bg-secondary/50 border border-border rounded-md p-4 flex gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Dicas de Busca</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use termos específicos para melhores resultados</li>
                  <li>• Tente variações do nome do arquivo ou título</li>
                  <li>• A busca é executada em múltiplas plataformas simultaneamente</li>
                  <li>• Verifique o status de cada link antes de fazer download</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        {results && (
          <div className="space-y-6">
            {/* Resumo dos Resultados */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Resultados para "{lastQuery}"
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {results.total_resultados} resultado(s) encontrado(s)
                </p>
              </div>
              <button
                onClick={() => setResults(null)}
                className="text-sm text-primary hover:underline transition-colors"
              >
                Nova busca
              </button>
            </div>

            {/* Filtros em Tempo Real (Plataforma) */}
            {availablePlatforms.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2 pb-4">
                <Filter className="w-4 h-4 text-emerald-400 mr-1" />
                
                <button
                  onClick={() => setActivePlatformFilter('all')}
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border shadow-sm active:scale-95
                    ${activePlatformFilter === 'all' 
                      ? 'bg-emerald-500 text-white border-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' 
                      : 'bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground'
                    }
                  `}
                >
                  Todas as Plataformas
                </button>

                {availablePlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => setActivePlatformFilter(platform)}
                    className={`
                      px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border shadow-sm active:scale-95
                      ${activePlatformFilter === platform 
                        ? 'bg-emerald-500 text-white border-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' 
                        : 'bg-secondary/50 text-muted-foreground border-border/50 hover:bg-secondary hover:text-foreground'
                      }
                    `}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            )}

            {/* Grid de Resultados */}
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((result, index) => (
                  <div key={index} className="animate-fadeIn" style={{
                    animationDelay: `${index * 50}ms`
                  }}>
                    <ResultCard {...result} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum resultado de "{activePlatformFilter}" encontrado nesta busca.</p>
              </div>
            )}
          </div>
        )}

        {/* Estado de Carregamento */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mb-4"></div>
            <p className="text-muted-foreground">Buscando em múltiplas plataformas...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>
            Widicom © 2026 | Metabuscador de Lost Media e Arquivos Raros
          </p>
        </div>
      </footer>

      {/* Animação de Fade-in */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
