import { useState, useEffect } from 'react';
import { AlertCircle, Filter, ChevronLeft, ChevronRight, Search as SearchIcon, Layers, Home as HomeIcon, Zap, Database } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ResultCard from '@/components/ResultCard';
import SourcesPanel from '@/components/SourcesPanel';
import SearchLoading from '@/components/SearchLoading';
import { searchLostMedia, checkAPIHealth } from '@/lib/api';
import type { SearchResponse } from '@/lib/api';
import { toast } from 'sonner';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function Home() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [lastQuery, setLastQuery] = useState('');
  const [activePlatformFilter, setActivePlatformFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentRoute, setCurrentRoute] = useState<'home' | 'fontes'>('home');
  const [searchMode, setSearchMode] = useState<'quick' | 'deep'>('deep');
  const [currentQuery, setCurrentQuery] = useState('');
  const [initParticles, setInitParticles] = useState(false);

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth()
      .then(available => setApiAvailable(available))
      .catch(() => setApiAvailable(false));
      
    // Init tsParticles once
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInitParticles(true);
    });
  }, []);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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

    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black relative selection:bg-indigo-500/20 dark:selection:bg-emerald-500/30 text-slate-800 dark:text-emerald-50 transition-colors duration-500">
      
      {/* Background Particles (Dark Mode Only) */}
      {theme === 'dark' && initParticles && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0 pointer-events-none"
          options={{
            background: {
              color: 'transparent',
            },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: 'repulse',
                },
              },
              modes: {
                repulse: {
                  distance: 100,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: ['#10b981', '#34d399', '#059669'], // Emerald hues
              },
              links: {
                color: '#10b981',
                distance: 150,
                enable: true,
                opacity: 0.1,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: {
                  default: 'bounce',
                },
                random: true,
                speed: 0.8,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                },
                value: 60,
              },
              opacity: {
                value: 0.3,
                animation: {
                  enable: true,
                  speed: 0.5,
                  minimumValue: 0.1,
                }
              },
              shape: {
                type: 'circle',
              },
              size: {
                value: { min: 1, max: 4 },
                animation: {
                  enable: true,
                  speed: 2,
                  minimumValue: 1,
                }
              },
            },
            detectRetina: true,
          }}
        />
      )}

      {/* Navbar Minimalista (State Router) */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-black/60 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/5 py-4 px-4 sm:px-8 flex justify-between items-center animate-fade-in shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.8)] transition-colors duration-500">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentRoute('home')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 dark:from-emerald-400 dark:to-cyan-500 p-[1px] shadow-sm shadow-indigo-500/20 dark:shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-500">
            <div className="w-full h-full bg-white dark:bg-black backdrop-blur-sm rounded-[11px] flex items-center justify-center">
              <SearchIcon className="w-4 h-4 text-indigo-600 dark:text-emerald-400" />
            </div>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-emerald-50">Widicom</span>
        </div>
        <div className="flex gap-4 sm:gap-6 items-center">
          <button 
            onClick={() => setCurrentRoute('home')}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 ${currentRoute === 'home' ? 'text-indigo-600 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-emerald-200'}`}
          >
            <HomeIcon className="w-4 h-4" /> <span className="hidden sm:inline">Buscar</span>
          </button>
          <button 
            onClick={() => setCurrentRoute('fontes')}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors duration-300 border-slate-200 dark:border-white/10 pr-0 sm:pr-2 ${currentRoute === 'fontes' ? 'text-indigo-600 dark:text-emerald-400 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-emerald-200'}`}
          >
            <Layers className="w-4 h-4" /> <span className="hidden sm:inline">Diagnóstico</span>
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
          
          <button
            onClick={toggleTheme}
            className="p-1 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition-colors"
            title="Alternar Tema"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            )}
          </button>
        </div>
      </nav>
      
      {!apiAvailable && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="glass-card bg-rose-50 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-rose-500/10 border border-rose-100">
            <AlertCircle className="w-6 h-6 text-rose-500 animate-pulse" />
            <div>
              <p className="text-sm font-bold text-rose-900 tracking-wide uppercase">Downtime Detectado</p>
              <p className="text-xs text-rose-600 mt-0.5">O motor central de extração não responde.</p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24" />

      {currentRoute === 'home' ? (
        <main className={`container mx-auto px-4 sm:px-6 flex flex-col transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${!results && !isLoading ? 'min-h-[75vh] justify-center pb-24' : 'pt-8 pb-32'}`}>
        
        {/* Header & Main Search Region */}
        <div className={`w-full max-w-4xl mx-auto flex flex-col items-center transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${results || isLoading ? 'mb-12 scale-[0.98] opacity-90' : 'mb-0 scale-100 opacity-100'}`}>
          <div className="flex flex-col items-center gap-6 mb-12 animate-fade-in group">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-200 dark:bg-emerald-500 blur-2xl opacity-40 dark:opacity-20 group-hover:opacity-70 dark:group-hover:opacity-40 transition-opacity duration-700 rounded-full"></div>
              <div className="w-20 h-20 rounded-3xl premium-border bg-white dark:bg-[#050505] flex items-center justify-center shadow-xl shadow-indigo-100 dark:shadow-[0_0_30px_rgba(16,185,129,0.15)] group-hover:-translate-y-1 transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] relative z-10 border border-slate-100 dark:border-white/5">
                <SearchIcon className="w-10 h-10 text-indigo-500 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter text-slate-900 dark:text-emerald-50 select-none drop-shadow-sm">
                Widicom
              </h1>
              <p className="text-slate-500 dark:text-slate-300 font-medium text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
                Descubra <span className="text-indigo-600 dark:text-emerald-400 font-semibold drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">softwares perdidos, mídias e arquivos obscuros</span> fragmentados pela rede.
              </p>
            </div>
          </div>
          
          <div className="w-full animate-slide-up" style={{ animationDelay: '50ms' }}>
            <SearchBar 
              query={currentQuery}
              onQueryChange={setCurrentQuery}
              onSearch={(q) => handleSearch(q, 1)} 
              isLoading={isLoading} 
            />
          </div>

          <div className="flex justify-center mt-3 mb-4 space-x-3 sm:space-x-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
             <button 
                 type="button"
                 onClick={() => { setSearchMode('quick'); if (currentQuery.trim()) handleSearch(currentQuery.trim(), 1, 'quick'); }}
                 className={`flex items-center gap-2 cursor-pointer px-4 pt-2.5 pb-2 rounded-full border transition-all duration-300 select-none focus:outline-none ${searchMode === 'quick' ? 'bg-indigo-50/80 dark:bg-emerald-500/10 border-indigo-200 dark:border-emerald-500/50 text-indigo-700 dark:text-emerald-300 shadow-sm' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}
             >
                 <Zap className={`w-4 h-4 ${searchMode === 'quick' ? 'text-amber-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                 <span className="font-semibold text-sm drop-shadow-sm">Busca Rápida (5s)</span>
             </button>
             <button 
                 type="button"
                 onClick={() => { setSearchMode('deep'); if (currentQuery.trim()) handleSearch(currentQuery.trim(), 1, 'deep'); }}
                 className={`flex items-center gap-2 cursor-pointer px-4 pt-2.5 pb-2 rounded-full border transition-all duration-300 select-none focus:outline-none ${searchMode === 'deep' ? 'bg-rose-50/80 dark:bg-emerald-500/10 border-rose-200 dark:border-emerald-500/50 text-rose-700 dark:text-emerald-300 shadow-sm' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}
             >
                 <Database className={`w-4 h-4 ${searchMode === 'deep' ? 'text-rose-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                 <span className="font-semibold text-sm drop-shadow-sm">Avaliação Profunda (60s)</span>
             </button>
          </div>
        </div>

        {/* Animated 10s Search Loader */}
        {isLoading && <SearchLoading mode={searchMode} />}

        {/* Results Body */}
        {results && (
          <div className="w-full max-w-6xl mx-auto animate-slide-up space-y-8" style={{ animationDelay: '150ms' }}>
            
            {/* Header / Filter row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-emerald-50 tracking-tight">
                  Resultados para <span className="text-indigo-600 dark:text-emerald-400">"{lastQuery}"</span>
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {results.total_resultados_nesta_pagina} registros ordenados. Página {results.pagina_atual}.
                </p>
              </div>

              {/* Dynamic Chips Filtering */}
              {availablePlatforms.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 mr-2">
                    <Filter className="w-4 h-4 mr-1.5" />
                    Fontes
                  </span>
                  
                  <button
                    onClick={() => setActivePlatformFilter('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      activePlatformFilter === 'all' 
                        ? 'bg-indigo-600 dark:bg-emerald-600 text-white shadow-md shadow-indigo-600/20 dark:shadow-emerald-600/20' 
                        : 'bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
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
                          ? 'bg-indigo-600 dark:bg-emerald-600 text-white shadow-md shadow-indigo-600/20 dark:shadow-emerald-600/20' 
                          : 'bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
                      }`}
                    >
                      {platform} <span className="opacity-60 font-medium ml-1">({getPlatformDescription(platform)})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid */}
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((result, index) => (
                  <div key={index} className="animate-slide-up opacity-0" style={{ animationDelay: `${(index * 30) + 150}ms` }}>
                    <ResultCard {...result} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in bg-white/50 dark:bg-black/40 rounded-3xl border border-slate-200/50 dark:border-white/5 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                  <SearchIcon className="w-8 h-8 text-slate-400 dark:text-white/40" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-emerald-50">Nenhuma mídia encontrada na aba selecionada.</h3>
                <p className="text-slate-500 dark:text-white/40 mt-2 font-medium">Altere o filtro ou tente novos termos de busca.</p>
              </div>
            )}
            
            {/* Minimalist Pagination */}
            {(currentPage > 1 || results.total_resultados_nesta_pagina > 0) && (
              <div className="flex items-center justify-center gap-4 pt-12">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || isLoading}
                  className="p-3 rounded-2xl bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:shadow-md hover:bg-slate-50 dark:hover:bg-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-emerald-400 transition-all cursor-pointer"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <span className="text-sm font-semibold text-slate-700 dark:text-emerald-400 bg-white dark:bg-[#050505] shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.8)] px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10">
                  Página {currentPage}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={results.total_resultados_nesta_pagina === 0 || isLoading}
                  className="p-3 rounded-2xl bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:shadow-md hover:bg-slate-50 dark:hover:bg-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 dark:text-emerald-400 transition-all cursor-pointer"
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
