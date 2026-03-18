/**
 * Home.tsx
 * 
 * Pagina principal do Widicom - Metabuscador de Lost Media.
 * Design: 90s Retro Internet - Nostalgic Web 1.0 aesthetic.
 */

import { useState, useEffect } from 'react';
import { AlertCircle, Info, Filter } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ResultCard from '@/components/ResultCard';
import { searchLostMedia, checkAPIHealth } from '@/lib/api';
import type { SearchResponse } from '@/lib/api';
import { toast } from 'sonner';

/** Animated star that twinkles in the background */
function Star({ style }: { style: React.CSSProperties }) {
  return (
    <span
      className="animate-twinkle absolute text-xs select-none pointer-events-none"
      style={{
        ...style,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${1.5 + Math.random() * 2}s`,
      }}
    >
      {Math.random() > 0.5 ? '\u2726' : '\u2605'}
    </span>
  );
}

/** Visitor counter badge - classic 90s element */
function VisitorCounter() {
  const [count] = useState(() => Math.floor(Math.random() * 99000) + 1337);
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 font-mono text-xs"
      style={{
        background: '#000000',
        color: '#00FF00',
        border: '2px inset #808080',
        fontFamily: '"VT323", monospace',
        fontSize: '1rem',
      }}
    >
      <span className="animate-retro-blink" style={{ color: '#FF0000' }}>{'\u25CF'}</span>
      {' '}Visitors: {count.toLocaleString()}
    </div>
  );
}

/** Under construction banner */
function UnderConstructionBanner() {
  return (
    <div className="flex items-center justify-center gap-2 py-1 px-4 text-xs font-bold"
      style={{
        background: 'repeating-linear-gradient(45deg, #FFFF00 0px, #FFFF00 10px, #000000 10px, #000000 20px)',
        color: '#000000',
      }}
    >
      <span style={{
        background: '#000000',
        color: '#FFFF00',
        padding: '2px 8px',
        fontFamily: '"Press Start 2P", cursive',
        fontSize: '0.6rem',
      }}>
        {'\u26A0'} UNDER CONSTRUCTION {'\u26A0'}
      </span>
    </div>
  );
}

/** Scrolling marquee text */
function RetroMarquee({ text }: { text: string }) {
  return (
    <div className="overflow-hidden whitespace-nowrap py-1"
      style={{
        background: '#000000',
        borderTop: '2px solid #00FFFF',
        borderBottom: '2px solid #00FFFF',
      }}
    >
      <div className="animate-marquee inline-block"
        style={{
          fontFamily: '"VT323", monospace',
          fontSize: '1.2rem',
          color: '#FFFF00',
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** Animated separator with retro ASCII art */
function RetroSeparator() {
  return (
    <div className="text-center py-2 select-none" style={{ color: '#00FFFF', fontFamily: '"VT323", monospace', fontSize: '1rem' }}>
      {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'} - {'\u2605'}
    </div>
  );
}

/** Webring navigation - classic 90s feature */
function WebRing() {
  return (
    <div className="flex items-center justify-center gap-3 py-2"
      style={{
        background: '#000044',
        border: '2px ridge #808080',
        fontFamily: '"VT323", monospace',
        fontSize: '1rem',
      }}
    >
      <span style={{ color: '#00FFFF' }}>[</span>
      <span className="animate-rainbow" style={{ cursor: 'pointer' }}>{'\u25C4'} Prev</span>
      <span style={{ color: '#FFFF00' }}>|</span>
      <span style={{ color: '#FF00FF', fontFamily: '"Press Start 2P", cursive', fontSize: '0.5rem' }}>Lost Media WebRing</span>
      <span style={{ color: '#FFFF00' }}>|</span>
      <span className="animate-rainbow" style={{ cursor: 'pointer', animationDelay: '1.5s' }}>Next {'\u25BA'}</span>
      <span style={{ color: '#00FFFF' }}>]</span>
    </div>
  );
}

export default function Home() {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [lastQuery, setLastQuery] = useState('');
  const [activePlatformFilter, setActivePlatformFilter] = useState('all');
  const [stars] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      color: ['#FFFF00', '#FFFFFF', '#00FFFF', '#FF00FF', '#00FF00'][Math.floor(Math.random() * 5)],
    }))
  );

  // Verifica a disponibilidade da API ao carregar a pagina
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
    <div className="min-h-screen crt-overlay stars-bg" style={{ background: '#000080' }}>
      {/* Twinkling stars background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {stars.map(star => (
          <Star key={star.id} style={{ top: star.top, left: star.left, color: star.color }} />
        ))}
      </div>

      {/* Under Construction Banner */}
      <UnderConstructionBanner />

      {/* Marquee */}
      <RetroMarquee text={'\u2605 \u2605 \u2605  Welcome to WIDICOM -- The #1 Lost Media Metasearch Engine on the World Wide Web!!!  \u2605 \u2605 \u2605  Best viewed in Netscape Navigator 4.0 at 800x600  \u2605 \u2605 \u2605  Sign our Guestbook!  \u2605 \u2605 \u2605'} />

      {/* Header */}
      <header className="relative z-10" style={{
        borderBottom: '3px double #00FFFF',
        background: 'linear-gradient(180deg, #000066 0%, #000033 100%)',
      }}>
        <div className="container py-6 sm:py-8">
          <div className="flex flex-col gap-2 relative">
            {/* Main title with retro styling */}
            <div className="flex items-end gap-3 flex-wrap">
              <h1 
                className="animate-neon"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: 'clamp(1.5rem, 5vw, 3rem)',
                  color: '#FF00FF',
                  textShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 40px #FF00FF, 3px 3px 0px #000000',
                  letterSpacing: '0.1em',
                  lineHeight: '1.5',
                }}
              >
                {'\u2605'} WIDICOM {'\u2605'}
              </h1>
              <span className="mb-2 text-xs font-bold px-2 py-0.5 animate-construction"
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '0.5rem',
                  border: '2px solid #FFFF00',
                }}
              >
                v0.1 BETA
              </span>
            </div>

            {/* Subtitle */}
            <p style={{
              fontFamily: '"VT323", monospace',
              fontSize: '1.3rem',
              color: '#00FFFF',
              textShadow: '0 0 5px #00FFFF',
              letterSpacing: '0.15em',
            }}>
              {'>'} Metabuscador especializado em{' '}
              <span className="animate-rainbow" style={{ fontWeight: 'bold' }}>Lost Media</span>
              {' '}<span className="animate-retro-blink">_</span>
            </p>

            {/* Visitor counter & extras */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <VisitorCounter />
              <span style={{
                fontFamily: '"VT323", monospace',
                fontSize: '0.9rem',
                color: '#808080',
              }}>
                Last updated: {new Date().toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <RetroSeparator />

      {/* Main Content */}
      <main className="container py-8 sm:py-12 relative z-10">
        {/* Aviso de API nao disponivel */}
        {!apiAvailable && (
          <div className="mb-6 p-4 flex gap-3 animate-pixel-fade"
            style={{
              background: '#440000',
              border: '3px double #FF0000',
              color: '#FF6666',
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FF0000' }} />
            <div>
              <h3 style={{
                fontFamily: '"Press Start 2P", cursive',
                fontSize: '0.7rem',
                color: '#FF0000',
                marginBottom: '8px',
              }}>
                !!! ERROR 503 - API OFFLINE !!!
              </h3>
              <p style={{
                fontFamily: '"VT323", monospace',
                fontSize: '1.1rem',
                color: '#FF6666',
              }}>
                A API de busca nao esta disponivel. Certifique-se de que o servidor esta rodando em{' '}
                <code style={{
                  background: '#220000',
                  color: '#FF0000',
                  padding: '2px 6px',
                  border: '1px solid #FF0000',
                  fontFamily: '"VT323", monospace',
                }}>
                  {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Secao de Busca */}
        <div className="mb-12">
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Dicas de Busca */}
          {!results && !isLoading && (
            <div className="p-4 flex gap-3 animate-pixel-fade"
              style={{
                background: '#000044',
                border: '3px ridge #808080',
                boxShadow: '4px 4px 0px #000000',
              }}
            >
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00FFFF' }} />
              <div>
                <h3 style={{
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '0.65rem',
                  color: '#FFFF00',
                  marginBottom: '12px',
                  textShadow: '0 0 5px #FFFF00',
                }}>
                  {'\u2605'} DICAS DE BUSCA {'\u2605'}
                </h3>
                <ul style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: '1.1rem',
                  color: '#00FF00',
                  listStyle: 'none',
                  padding: 0,
                }}>
                  <li style={{ marginBottom: '4px' }}>{'\u25BA'} Use termos especificos para melhores resultados</li>
                  <li style={{ marginBottom: '4px' }}>{'\u25BA'} Tente variacoes do nome do arquivo ou titulo</li>
                  <li style={{ marginBottom: '4px' }}>{'\u25BA'} A busca e executada em multiplas plataformas simultaneamente</li>
                  <li>{'\u25BA'} Verifique o status de cada link antes de fazer download</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        {results && (
          <div className="space-y-6 animate-pixel-fade">
            {/* Resumo dos Resultados */}
            <div className="flex items-center justify-between flex-wrap gap-4"
              style={{
                borderBottom: '2px dashed #00FFFF',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h2 style={{
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '0.7rem',
                  color: '#FFFF00',
                  textShadow: '0 0 5px #FFFF00',
                  lineHeight: '2',
                }}>
                  Resultados para &quot;{lastQuery}&quot;
                </h2>
                <p style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: '1.1rem',
                  color: '#00FF00',
                  marginTop: '4px',
                }}>
                  {'>'} {results.total_resultados} resultado(s) encontrado(s)
                </p>
              </div>
              <button
                onClick={() => setResults(null)}
                style={{
                  fontFamily: '"Press Start 2P", cursive',
                  fontSize: '0.55rem',
                  color: '#00FFFF',
                  background: '#000044',
                  border: '2px outset #808080',
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#000066';
                  e.currentTarget.style.color = '#FFFF00';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#000044';
                  e.currentTarget.style.color = '#00FFFF';
                }}
              >
                [{'\u00AB'} Nova busca]
              </button>
            </div>

            {/* Filtros em Tempo Real (Plataforma) */}
            {availablePlatforms.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2 pb-4">
                <Filter className="w-4 h-4 mr-1" style={{ color: '#FF00FF' }} />
                
                <button
                  onClick={() => setActivePlatformFilter('all')}
                  style={{
                    fontFamily: '"VT323", monospace',
                    fontSize: '1rem',
                    padding: '4px 12px',
                    border: activePlatformFilter === 'all' ? '2px inset #808080' : '2px outset #808080',
                    background: activePlatformFilter === 'all' ? '#FF00FF' : '#000044',
                    color: activePlatformFilter === 'all' ? '#FFFFFF' : '#00FFFF',
                    cursor: 'pointer',
                    boxShadow: activePlatformFilter === 'all' ? '0 0 10px #FF00FF' : 'none',
                  }}
                >
                  [*] Todas
                </button>

                {availablePlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => setActivePlatformFilter(platform)}
                    style={{
                      fontFamily: '"VT323", monospace',
                      fontSize: '1rem',
                      padding: '4px 12px',
                      border: activePlatformFilter === platform ? '2px inset #808080' : '2px outset #808080',
                      background: activePlatformFilter === platform ? '#FF00FF' : '#000044',
                      color: activePlatformFilter === platform ? '#FFFFFF' : '#00FFFF',
                      cursor: 'pointer',
                      boxShadow: activePlatformFilter === platform ? '0 0 10px #FF00FF' : 'none',
                    }}
                  >
                    [{platform}]
                  </button>
                ))}
              </div>
            )}

            {/* Grid de Resultados */}
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((result, index) => (
                  <div key={index} className="animate-pixel-fade" style={{
                    animationDelay: `${index * 100}ms`
                  }}>
                    <ResultCard {...result} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p style={{
                  fontFamily: '"VT323", monospace',
                  fontSize: '1.2rem',
                  color: '#FFFF00',
                }}>
                  {'>'} Nenhum resultado de &quot;{activePlatformFilter}&quot; encontrado nesta busca.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Estado de Carregamento */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            {/* Retro loading animation */}
            <div style={{
              fontFamily: '"Press Start 2P", cursive',
              fontSize: '0.7rem',
              color: '#00FF00',
              textShadow: '0 0 10px #00FF00',
              marginBottom: '16px',
            }}>
              <span className="animate-retro-blink">{'\u2588\u2588\u2588'}</span>
            </div>
            <div style={{
              fontFamily: '"VT323", monospace',
              fontSize: '1.3rem',
              color: '#00FFFF',
            }}>
              {'>'} Conectando a multiplas BBS...
            </div>
            <div className="mt-4 flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pixel-fade"
                  style={{
                    width: '12px',
                    height: '12px',
                    background: i < 5 ? '#00FF00' : '#003300',
                    border: '1px solid #00FF00',
                    animationDelay: `${i * 200}ms`,
                    animationDuration: '2s',
                    animationIterationCount: 'infinite',
                  }}
                />
              ))}
            </div>
            <p className="mt-4" style={{
              fontFamily: '"VT323", monospace',
              fontSize: '1rem',
              color: '#808080',
            }}>
              Buscando em multiplas plataformas...
            </p>
          </div>
        )}
      </main>

      <RetroSeparator />

      {/* WebRing */}
      <WebRing />

      {/* Footer */}
      <footer className="relative z-10 mt-4" style={{
        borderTop: '3px double #00FFFF',
        background: '#000033',
      }}>
        <div className="container py-6 text-center" style={{
          fontFamily: '"VT323", monospace',
          fontSize: '1rem',
        }}>
          <div className="retro-hr mb-4" />
          <p style={{ color: '#00FFFF', marginBottom: '8px' }}>
            {'\u2605'} Widicom {'\u00A9'} 2026 | Metabuscador de Lost Media e Arquivos Raros {'\u2605'}
          </p>
          <p style={{ color: '#808080', fontSize: '0.9rem' }}>
            Made with {'<3'} in a 56k modem | Best viewed in 800x600
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 flex-wrap">
            <span className="animate-rainbow" style={{ fontSize: '1.1rem' }}>{'\u2605'} GeoCities Certified {'\u2605'}</span>
            <span style={{ color: '#FF00FF' }}>|</span>
            <span style={{ color: '#00FF00' }}>HTML 3.2 Valid</span>
            <span style={{ color: '#FF00FF' }}>|</span>
            <span style={{ color: '#FFFF00' }}>Netscape Now!</span>
          </div>
          <div className="mt-2" style={{ color: '#444444', fontSize: '0.8rem' }}>
            You are visitor #{Math.floor(Math.random() * 99999).toLocaleString()} since 01/01/1997
          </div>
        </div>
      </footer>

      {/* Global retro styles */}
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

        /* Selection color */
        ::selection {
          background: #FF00FF;
          color: #FFFFFF;
        }

        /* Link styles */
        a {
          color: #00FFFF;
          text-decoration: underline;
        }
        a:visited {
          color: #FF00FF;
        }
        a:hover {
          color: #FFFF00;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
