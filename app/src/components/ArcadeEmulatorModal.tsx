import { useState, useEffect, useRef } from 'react';
import { Loader2, X, MonitorPlay } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface ArcadeEmulatorModalProps {
  romUrl: string;
  onClose: () => void;
}

export default function ArcadeEmulatorModal({ romUrl, onClose }: ArcadeEmulatorModalProps) {
  const [loadingState, setLoadingState] = useState<'booting' | 'downloading' | 'ready' | 'error'>('booting');
  const [loadingMsg, setLoadingMsg] = useState('INICIANDO GABINETE...');
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    const bootSequence = async () => {
      // Fake arcade boot sequence for aesthetics
      await new Promise(r => setTimeout(r, 800));
      if (!active) return;
      setLoadingState('downloading');
      setLoadingMsg('ESTABELECENDO HANDSHAKE COM O SERVIDOR DE ARQUIVOS...');
      await new Promise(r => setTimeout(r, 600));
      if (!active) return;

      try {
        setLoadingMsg('BAIXANDO ROM PARA A MEMÓRIA RAM (EVITANDO DISCO LOCAL)...');
        
        // 1. Attempt direct fetch (Fast, avoids our server bandwidth)
        let response = await fetch(romUrl);
        
        // 2. If CORS blocks or fails, fallback to Widicom secure Proxy
        if (!response.ok || response.type === 'opaque') {
           setLoadingMsg('BLOQUEIO CORS DETECTADO. ROTEANDO VIA WIDICOM PROXY SECURE...');
           response = await fetch(`${API_BASE_URL}/proxy?url=${encodeURIComponent(romUrl)}`);
           if (!response.ok) throw new Error('Proxy HTTP Erro ' + response.status);
        }

        // Add a pseudo-download progress simulator since real fetch progress requires Streams API
        for (let i = 0; i <= 95; i += 5) {
            setProgress(i);
            await new Promise(r => setTimeout(r, 50));
        }

        const blob = await response.blob();
        if (!active) return;

        setProgress(100);
        setLoadingMsg('INJETANDO ROM NA MÁQUINA VIRTUAL...');
        const blobUrl = URL.createObjectURL(blob);

        // Build the isolated iframe HTML for EmulatorJS
        const htmlStr = `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
          html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
          #game { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        </style>
        </head>
        <body>
        <div id="game"></div>
        <script>
            window.EJS_player = '#game';
            window.EJS_gameUrl = '${blobUrl}';
            window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
            window.EJS_color = '#10b981'; // Emerald 500
        </script>
        <script src="https://cdn.emulatorjs.org/stable/data/loader.js"></script>
        </body>
        </html>
        `;

        const iframeBlob = new Blob([htmlStr], { type: 'text/html' });
        const iframeInternalUrl = URL.createObjectURL(iframeBlob);
        
        await new Promise(r => setTimeout(r, 500));
        if (!active) return;

        setIframeSrc(iframeInternalUrl);
        setLoadingState('ready');

      } catch (err) {
        if (!active) return;
        setLoadingState('error');
        setLoadingMsg('FALHA CRÍTICA AO CARREGAR A ROM: ' + (err as Error).message);
      }
    };

    bootSequence();

    return () => {
      active = false;
      // Cleanup Object URLs to prevent memory leaks when Arcade closes
      if (iframeSrc) URL.revokeObjectURL(iframeSrc);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [romUrl]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-fade-in text-emerald-500 font-mono">
      {/* Arcade Cabinet Container */}
      <div 
        ref={containerRef}
        className="relative w-full max-w-6xl h-full max-h-[85vh] bg-black border-[3px] border-emerald-500 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)] crt-scanlines crt-flicker flex flex-col"
      >
        
        {/* Arcade Header Marquee */}
        <div className="h-12 border-b-2 border-emerald-500/50 bg-[#052e16] flex items-center justify-between px-4 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <MonitorPlay className="w-5 h-5 animate-pulse text-emerald-400" />
            <span className="font-bold tracking-widest uppercase text-emerald-400 text-shadow-[0_0_8px_rgba(52,211,153,0.8)]">
              WIDICOM ARCADE ENGINE v1.0
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-300 rounded transition-colors"
            title="Desligar Máquina"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Console Viewport */}
        <div className="flex-1 relative bg-[#020617] flex items-center justify-center overflow-hidden">
          
          {loadingState !== 'ready' && (
            <div className="text-center p-8 max-w-lg w-full">
              {loadingState === 'error' ? (
                 <div className="text-rose-500 text-shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-pulse">
                   <h2 className="text-2xl font-bold mb-4">FATAL ERROR</h2>
                   <p>{loadingMsg}</p>
                   <button 
                     onClick={onClose}
                     className="mt-8 px-6 py-2 border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded uppercase"
                   >
                     Encerrar Sessão
                   </button>
                 </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-12 h-12 animate-spin mb-6 text-emerald-400" />
                  <div className="text-lg font-bold mb-2 uppercase text-emerald-400 text-shadow-[0_0_10px_rgba(52,211,153,0.8)]">
                    {loadingMsg}
                  </div>
                  {(loadingState === 'downloading' || progress > 0) && (
                    <div className="w-full h-4 border border-emerald-500/50 mt-4 rounded overflow-hidden p-0.5">
                       <div 
                         className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-200"
                         style={{ width: `${progress}%` }}
                       />
                    </div>
                  )}
                  <div className="text-xs text-emerald-600/60 mt-8">
                    AVISO: O JOGO RESIDE APENAS NA MEMÓRIA VOLÁTIL (RAM). 
                    AO FECHAR ESTA ABA, OS DADOS SERÃO DESTRUÍDOS.
                  </div>
                </div>
              )}
            </div>
          )}

          {loadingState === 'ready' && iframeSrc && (
            <iframe 
               src={iframeSrc}
               className="w-full h-full border-none focus:outline-none"
               allow="gamepad; autoplay; fullscreen"
               title="Widicom Arcade Emulator"
            />
          )}

        </div>

        {/* Arcade Footer Insert Coin */}
        <div className="h-8 border-t border-emerald-500/30 bg-[#052e16] flex items-center justify-center animate-pulse">
          <span className="text-xs tracking-widest text-emerald-500/70 uppercase">
             {loadingState === 'ready' ? 'PRESS START TO PLAY' : 'INSERT COIN / AWAITING DOWNLOAD'}
          </span>
        </div>
      </div>
    </div>
  );
}
