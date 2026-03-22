import { useState, useEffect } from 'react';
import { AlertCircle, Filter, ChevronLeft, ChevronRight, Search as SearchIcon, Layers, Home as HomeIcon, Zap, Database } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ResultCard from '@/components/ResultCard';
import SourcesPanel from '@/components/SourcesPanel';
import SearchLoading from '@/components/SearchLoading';
import { searchLostMedia, checkAPIHealth } from '@/lib/api';
import type { SearchResponse } from '@/lib/api';
import { toast } from 'sonner';

export default function Home() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [lastQuery, setLastQuery] = useState('');
  const [activePlatformFilter, setActivePlatformFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'fontes'>('home');
  const [searchMode, setSearchMode] = useState<'quick' | 'deep'>('deep');
  const [currentQuery, setCurrentQuery] = useState('');

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth()
      .then(available => setApiAvailable(available))
      .catch(() => setApiAvailable(false));
  }, []);

  const handleSearch = async (query: string, page: number = 1, modeOverride?: 'quick' | 'deep') => {
    setIsLoading(true);
    setLastQuery(query);
    setCurrentPage(page);
    setActivePlatformFilter('all');
    setResults(null); // Clear previous results to trigger transition

    try {
      const data = await searchLostMedia(query, page, modeOverride || searchMode);
      setResults(data);

      if (data.total_resultados_nesta_pagina === 0) {
        toast.info(page === 1 ? 'Nenhum resultado encontrado para esta busca.' : 'Fim dos resultados.');
      } else {
        if (page === 1) toast.success(`${data.total_resultados_nesta_pagina} resultados de múltiplas fontes integrados com sucesso.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar';
      toast.error(errorMessage);
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (results && results.total_resultados_nesta_pagina > 0 && !isLoading) {
      handleSearch(lastQuery, currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && !isLoading) {
      handleSearch(lastQuery, currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const availablePlatforms = results
    ? Array.from(new Set(results.resultados.map(r => r.plataforma)))
    : [];

  const getPlatformDescription = (platform: string) => {
    const desc: Record<string, string> = {
      'Internet Archive': 'Acervo Global',
      'Google Drive': 'Nuvem Pessoal',
      'Mega.nz': 'Nuvem',
      'MediaFire': 'Nuvem',
      'Dropbox': 'Nuvem',
      'GitHub': 'Códigos/Releases',
      'GitLab': 'Códigos',
      'CDRomance': 'ISOs e Traduções',
      'Retro-eXo': 'MS-DOS e PCs Antigos',
      'Hidden Palace': 'Protótipos e Betas',
      'TCRF': 'Conteúdo Cortado',
      'Hugging Face Datasets': 'Datasets Gigantes',
      'NoPayStation': 'Arquivos PSN .pkg',
      'WinWorld': 'Abandonware PC/Windows',
      'Macintosh Garden': 'Abandonware Apple',
      'Open Directory': 'Servidores Abertos',
      'Torrent (Magnet)': 'Rede P2P',
      'GameBanana': 'Mods de Jogos',
      "Vimm's Lair": 'ROMs Clássicas Seguras',
      'YTS': 'Filmes Torrent',
      'Nyaa.si': 'Animes e Mangás',
      "Anna's Archive": 'Livros e Artigos',
      'OpenLibrary (Manuais/Livros)': 'Livros Digitais',
      
      // Fontes de Elite
      'BetaArchive': 'Softwares Beta e Leaks',
      'Tokyo Toshokan': 'Mídias Asiáticas Obscuras',
      'OldGamesDownload': 'Jogos Clássicos/Abandonware',
      'GOG-Games': 'Jogos DRM-Free',
      'RuTracker': 'Fórum/Torrents Russos',
      'ModDB': 'Mods e Indie Antigos',
      'Ziperto': 'Roms Portáteis 3DS/Vita',
      'RomUlation': 'ISOs Consolidadas',
      'APKMirror': 'Apps Android Antigos',
      'Abandonia': 'Clássicos MS-DOS'
    };
    return desc[platform] || 'Fonte Externa';
  };

  const filteredResults = results
    ? (activePlatformFilter === 'all'
      ? results.resultados
      : results.resultados.filter(r => r.plataforma === activePlatformFilter))
    : [];

  return (
    <div className="min-h-screen bg-transparent relative selection:bg-indigo-500/30 font-sans overflow-x-hidden text-slate-100">
      
      {/* Navbar Minimalista (State Router) */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/5 py-4 px-4 sm:px-8 flex justify-between items-center animate-fade-in shadow-xl">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentRoute('home')}>
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <SearchIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Widicom</span>
        </div>
        <div className="flex gap-6">
          <button 
            onClick={() => setCurrentRoute('home')}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${currentRoute === 'home' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            <HomeIcon className="w-4 h-4" /> <span className="hidden sm:inline">Buscar</span>
          </button>
          <button 
            onClick={() => setCurrentRoute('fontes')}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${currentRoute === 'fontes' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
          >
            <Layers className="w-4 h-4" /> <span className="hidden sm:inline">Checar fontes Onlines</span>
          </button>
        </div>
      </nav>

      {/* Decorative gradient orbs in background */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />
      
      {!apiAvailable && (
        <div className="fixed top-6 right-6 z-50 animate-slide-up">
          <div className="glass-card bg-rose-500/10 border-rose-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-2xl">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <div>
              <p className="text-sm font-semibold text-rose-100">API Offline</p>
              <p className="text-xs text-rose-300">O backend local não está respondendo.</p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-20" />

      {currentRoute === 'home' ? (
        <main className={`container mx-auto px-4 sm:px-6 flex flex-col transition-all duration-700 ease-in-out ${!results && !isLoading ? 'min-h-[80vh] justify-center pb-24' : 'pt-8 pb-24'}`}>
        
        {/* Header & Main Search Region */}
        <div className={`w-full max-w-4xl mx-auto flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${results || isLoading ? 'mb-12 scale-95' : 'mb-0 scale-100'}`}>
          <div className="flex flex-col items-center gap-6 mb-10 animate-fade-in group">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:-translate-y-2 transition-all duration-300">
              <SearchIcon className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-3">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-100 to-indigo-400 select-none">
                Widicom
              </h1>
              <p className="text-slate-400 font-medium text-lg max-w-lg mx-auto">
                O buscador definitivo focado em encontrar <span className="text-indigo-400">arquivos, mídias e conteúdos raros</span> escondidos pela internet.
              </p>
            </div>
          </div>
          
          <div className="w-full animate-slide-up" style={{ animationDelay: '100ms' }}>
            <SearchBar 
              query={currentQuery}
              onQueryChange={setCurrentQuery}
              onSearch={(q) => handleSearch(q, 1)} 
              isLoading={isLoading} 
            />
          </div>

          <div className="flex justify-center mt-2 mb-4 space-x-3 sm:space-x-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
             <button 
                 type="button"
                 onClick={() => { setSearchMode('quick'); if (currentQuery.trim()) handleSearch(currentQuery.trim(), 1, 'quick'); }}
                 className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border shadow-sm transition-all select-none focus:outline-none ${searchMode === 'quick' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-400'}`}
             >
                 <Zap className={`w-4 h-4 ${searchMode === 'quick' ? 'text-amber-400' : 'text-slate-400'}`} />
                 <span className="font-semibold text-sm drop-shadow-md">Busca Rápida (5s)</span>
             </button>
             <button 
                 type="button"
                 onClick={() => { setSearchMode('deep'); if (currentQuery.trim()) handleSearch(currentQuery.trim(), 1, 'deep'); }}
                 className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full border shadow-sm transition-all select-none focus:outline-none ${searchMode === 'deep' ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-indigo-400'}`}
             >
                 <Database className={`w-4 h-4 ${searchMode === 'deep' ? 'text-rose-400' : 'text-slate-400'}`} />
                 <span className="font-semibold text-sm drop-shadow-md">Avaliação Profunda (60s)</span>
             </button>
          </div>
        </div>

        {/* Animated 10s Search Loader */}
        {isLoading && <SearchLoading mode={searchMode} />}

        {/* Results Body */}
        {results && (
          <div className="w-full max-w-6xl mx-auto animate-slide-up space-y-8" style={{ animationDelay: '200ms' }}>
            
            {/* Header / Filter row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Resultados para <span className="text-indigo-400">"{lastQuery}"</span>
                </h2>
                <p className="text-sm text-slate-400 mt-2 font-medium">
                  {results.total_resultados_nesta_pagina} registros ordenados via IA. Página {results.pagina_atual}.
                </p>
              </div>

              {/* Dynamic Chips Filtering */}
              {availablePlatforms.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center text-sm font-medium text-slate-400 mr-2">
                    <Filter className="w-4 h-4 mr-1.5" />
                    Fontes
                  </span>
                  
                  <button
                    onClick={() => setActivePlatformFilter('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activePlatformFilter === 'all' 
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Global
                  </button>

                  {availablePlatforms.map(platform => (
                    <button
                      key={platform}
                      onClick={() => setActivePlatformFilter(platform)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        activePlatformFilter === platform 
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {platform} <span className="opacity-70 font-normal ml-1">({getPlatformDescription(platform)})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid */}
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((result, index) => (
                  <div key={index} className="animate-slide-up opacity-0" style={{ animationDelay: `${(index * 50) + 300}ms` }}>
                    <ResultCard {...result} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <SearchIcon className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-xl font-medium text-slate-300">Nenhuma mídia encontrada na aba selecionada.</h3>
                <p className="text-slate-500 mt-2">Altere o filtro ou tente novos termos de busca.</p>
              </div>
            )}
            
            {/* Minimalist Pagination */}
            {(currentPage > 1 || results.total_resultados_nesta_pagina > 0) && (
              <div className="flex items-center justify-center gap-4 pt-12">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || isLoading}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 disabled:cursor-not-allowed text-white transition-all"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-sm font-medium text-slate-400 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                  Página {currentPage}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={results.total_resultados_nesta_pagina === 0 || isLoading}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 disabled:cursor-not-allowed text-white transition-all"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

          </div>
        )}
        </main>
      ) : (
        <SourcesPanel />
      )}

    </div>
  );
}
