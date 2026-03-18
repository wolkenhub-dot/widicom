/**
 * Home.tsx
 * 
 * Página principal do Widicom - Metabuscador de Lost Media.
 * Design: Minimalismo Moderno com acentos cibernéticos.
 */

import { useState, useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ResultCard from '@/components/ResultCard';
import { searchLostMedia, checkAPIHealth, SearchResponse } from '@/lib/api';
import { toast } from 'sonner';

export default function Home() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [lastQuery, setLastQuery] = useState('');

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-6 sm:py-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Widicom
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Metabuscador especializado em Lost Media e arquivos raros
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

            {/* Grid de Resultados */}
            {results.total_resultados > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.resultados.map((result, index) => (
                  <div key={index} className="animate-fadeIn" style={{
                    animationDelay: `${index * 50}ms`
                  }}>
                    <ResultCard {...result} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
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
