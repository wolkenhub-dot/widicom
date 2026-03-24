import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2, X, Upload, Gamepad2, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface ArcadeEmulatorModalProps {
  romUrl?: string; 
  onClose: () => void;
}

type ViewState = 'menu' | 'select_rom' | 'booting' | 'loading' | 'playing' | 'error';

interface ConsoleInfo {
  id: string;
  name: string;
  fullName: string;
  color: string;
  glow: string;
  icon: React.ReactNode;
  exts: string[];
  system: string; // EmulatorJS Core ID
}

const CONSOLES: ConsoleInfo[] = [
  { 
    id: 'snes', 
    name: 'SNES', 
    fullName: 'Super Nintendo', 
    color: 'bg-indigo-600', 
    glow: 'shadow-[0_0_35px_rgba(79,70,229,0.5)]',
    icon: <Gamepad2 className="w-12 h-12" />,
    exts: ['.sfc', '.smc', '.zip'],
    system: 'snes'
  },
  { 
    id: 'megadrive', 
    name: 'Mega Drive', 
    fullName: 'Sega Genesis', 
    color: 'bg-slate-900', 
    glow: 'shadow-[0_0_40px_rgba(30,64,175,0.6)]',
    icon: <Gamepad2 className="w-12 h-12" />,
    exts: ['.md', '.gen', '.bin', '.zip'],
    system: 'genesis_plus_gx'
  },
  { 
    id: 'nes', 
    name: 'NES', 
    fullName: 'Nintendo 8-Bit', 
    color: 'bg-rose-600', 
    glow: 'shadow-[0_0_35px_rgba(225,29,72,0.5)]',
    icon: <Gamepad2 className="w-12 h-12" />,
    exts: ['.nes', '.zip'],
    system: 'nes'
  },
  { 
    id: 'mastersystem', 
    name: 'Master System', 
    fullName: 'Sega 8-Bit', 
    color: 'bg-blue-600', 
    glow: 'shadow-[0_0_35px_rgba(37,99,235,0.6)]',
    icon: <Gamepad2 className="w-12 h-12" />,
    exts: ['.sms', '.zip'],
    system: 'smsplus'
  },
  { 
    id: 'atari', 
    name: 'Atari', 
    fullName: 'Atari 2600', 
    color: 'bg-orange-600', 
    glow: 'shadow-[0_0_35px_rgba(234,88,12,0.6)]',
    icon: <Gamepad2 className="w-12 h-12" />,
    exts: ['.a26', '.bin', '.zip'],
    system: 'stella2014'
  }
];

export default function ArcadeEmulatorModal({ romUrl = '', onClose }: ArcadeEmulatorModalProps) {
  const [view, setView] = useState<ViewState>(romUrl ? 'booting' : 'menu');
  const [loadingMsg, setLoadingMsg] = useState('INICIANDO GABINETE...');
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedConsole, setSelectedConsole] = useState<ConsoleInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoize random particles for the background
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
  }, []);

  useEffect(() => {
    if (romUrl && view === 'booting') {
       startEmulator(romUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [romUrl]);

  const startEmulator = async (url: string, systemOverride?: string) => {
    const system = systemOverride || detectSystem(url);
    setView('booting');
    setLoadingMsg(`SISTEMA DETECTADO: ${system.toUpperCase()}...`);
    await new Promise(r => setTimeout(r, 600));
    
    setView('loading');
    setLoadingMsg('VIRTUALIZANDO CARTUCHO NA RAM...');
    
    try {
      let response;
      if (url.startsWith('blob:')) {
         response = await fetch(url);
      } else {
        try {
           response = await fetch(url);
           if (!response.ok || response.type === 'opaque') throw new Error('CORS');
        } catch {
           setLoadingMsg('ROTEANDO VIA WIDICOM PROXY Host...');
           response = await fetch(`${API_BASE_URL}/proxy?url=${encodeURIComponent(url)}`);
           if (!response.ok) throw new Error('Proxy fail');
        }
      }

      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 20));
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const htmlStr = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
            #game { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
          </style>
        </head>
        <body>
          <div id="game"></div>
          <script>
            window.EJS_player = '#game';
            window.EJS_core = '${system}';
            window.EJS_gameUrl = '${blobUrl}';
            window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
            window.EJS_color = '#10b981';
            window.EJS_startOnLoaded = true;
            window.EJS_language = 'pt-BR';
            window.EJS_AdUrl = '';
            window.EJS_settings = {
              "quality-scale": "2",
              "crt-filter": "true",
              "joy-type": "6button",
              "region": "ntsc",
              "vol": "0.8"
            };
          </script>
          <script src="https://cdn.emulatorjs.org/stable/data/loader.js"></script>
        </body>
        </html>
      `;

      const iframeBlob = new Blob([htmlStr], { type: 'text/html' });
      const internalUrl = URL.createObjectURL(iframeBlob);
      setIframeSrc(internalUrl);
      setView('playing');
    } catch (err) {
      setView('error');
      setLoadingMsg('FALHA NA VIRTUALIZAÇÃO: ' + (err as Error).message);
    }
  };

  const detectSystem = (url: string): string => {
    const fn = url.toLowerCase();
    if (fn.includes('.nes')) return 'nes';
    if (fn.includes('.smc') || fn.includes('.sfc')) return 'snes';
    if (fn.includes('.md') || fn.includes('.gen')) return 'genesis_plus_gx';
    if (fn.includes('.sms')) return 'smsplus';
    if (fn.includes('.a26') || fn.includes('.bin')) return 'stella2014';
    return selectedConsole?.system || 'nes';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      startEmulator(url, selectedConsole?.system);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] backdrop-blur-3xl flex items-center justify-center p-4 md:p-8 animate-fade-in font-display overflow-hidden">
      
      {/* HYPNOTIC ANIMATED BACKGROUND */}
      {(view === 'menu' || view === 'select_rom') && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           {/* Abstract Aura Orbs */}
           <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-hypnotic-1" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full animate-hypnotic-2" />
           <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-rose-500/10 blur-[100px] rounded-full animate-hypnotic-3" />
           
           {/* Moving Grid Overlay */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-grid-drift opacity-40" />
           
           {/* Floating Pixels */}
           {particles.map((p) => (
             <div 
               key={p.id}
               className="absolute bg-emerald-400/20 rounded-sm hover:bg-emerald-400 transition-colors"
               style={{
                 left: p.left,
                 top: p.top,
                 width: p.size,
                 height: p.size,
                 animation: `float ${p.duration}s infinite linear`,
                 animationDelay: `${p.delay}s`
               }}
             />
           ))}

           {/* Central Pulse Filter */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617] opacity-80" />
        </div>
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl h-full max-h-[90vh] bg-white/[0.01] backdrop-blur-2xl rounded-[3rem] overflow-hidden border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col translate-z-0">
        
        {/* Header HUD Bar */}
        <div className="h-20 flex items-center justify-between px-8 bg-white/[0.03] border-b border-white/5 backdrop-blur-xl z-50">
           <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/20 animate-pulse">
                 <Gamepad2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-black tracking-[0.5em] text-emerald-400 uppercase leading-none">WIDICOM ARCADE</span>
                 <span className="text-[0.65rem] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1.5 opacity-60">Kernel v2.0 // Emulação RETRO</span>
              </div>
           </div>
           
           <button 
             onClick={onClose}
             className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-rose-500/30 text-slate-400 hover:text-white transition-all border border-white/5 group"
           >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
           </button>
        </div>

        {/* Dynamic Viewport */}
        <div className="flex-1 relative overflow-hidden">
          
          {/* MENU VIEW */}
          {view === 'menu' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-fade-in">
               <div className="text-center mb-16 space-y-6 relative">
                  <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    Escolha a Máquina
                  </h2>
                  <div className="flex items-center justify-center gap-4">
                     <div className="h-px w-12 bg-emerald-500/40" />
                     <p className="text-emerald-400/80 text-xs tracking-[0.4em] font-black uppercase">Jogue seus jogos retro</p>
                     <div className="h-px w-12 bg-emerald-500/40" />
                  </div>
               </div>

               <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 w-full max-w-6xl">
                  {CONSOLES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedConsole(c);
                        setView('select_rom');
                      }}
                      className="relative group flex flex-col items-center gap-8 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-700 transform hover:-translate-y-8 hover:scale-105"
                    >
                       <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center transition-all duration-700 ${c.color} ${c.glow} group-hover:scale-125 group-hover:rotate-[15deg] group-hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]`}>
                          {React.cloneElement(c.icon as React.ReactElement<any>, { className: 'w-14 h-14' })}
                       </div>
                       <div className="text-center">
                          <h3 className="font-black text-2xl text-white group-hover:text-emerald-400 transition-all uppercase tracking-tight">{c.name}</h3>
                          <p className="text-[0.7rem] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 opacity-60 group-hover:opacity-100 transition-all">{c.fullName}</p>
                       </div>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {/* SELECT ROM VIEW */}
          {view === 'select_rom' && selectedConsole && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 animate-slide-up">
               <button 
                 onClick={() => setView('menu')}
                 className="absolute top-10 left-10 flex items-center gap-3 text-emerald-400/60 hover:text-emerald-400 transition-all group px-4 py-2 rounded-full bg-white/5 border border-white/5"
               >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em]">Retornar ao Seletor</span>
               </button>

               <div className="flex flex-col items-center gap-12 max-w-3xl w-full">
                  <div className="flex flex-col items-center text-center gap-8">
                     <div className={`w-40 h-40 rounded-[3.5rem] flex items-center justify-center ${selectedConsole.color} ${selectedConsole.glow} animate-bounce-slow border-4 border-white/10 shadow-[0_0_60px_rgba(255,255,255,0.2)]`}>
                        {React.cloneElement(selectedConsole.icon as React.ReactElement<any>, { className: 'w-20 h-20' })}
                     </div>
                     <div className="space-y-4">
                        <h2 className="text-7xl font-black text-white tracking-tighter uppercase">{selectedConsole.fullName}</h2>
                        <div className="flex items-center gap-3 justify-center">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                           <p className="text-emerald-400 text-xs font-black tracking-[0.5em] uppercase">SISTEMA PRONTO PARA INJEÇÃO</p>
                        </div>
                     </div>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full relative p-1.5 rounded-[4rem] bg-gradient-to-br from-emerald-500/60 via-cyan-400/40 to-indigo-500/60 group cursor-pointer shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
                  >
                     <div className="bg-[#050505] rounded-[3.9rem] p-16 flex flex-col items-center gap-8 transition-all duration-700 group-hover:bg-transparent border border-white/5">
                        <div className="relative">
                           <Upload className="w-16 h-16 text-emerald-400 group-hover:scale-110 group-hover:text-black transition-all duration-500" />
                           <div className="absolute inset-0 blur-3xl bg-emerald-400/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-center group">
                           <span className="block text-4xl font-black text-white tracking-tighter uppercase group-hover:text-black transition-all">Vincular ROM do PC</span>
                           <span className="block text-[0.7rem] text-slate-500 font-bold uppercase tracking-[0.4em] mt-5 group-hover:text-black/60">Suporta arquivos: {selectedConsole.exts.join(', ')}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* LOADING VIEW */}
          {(view === 'booting' || view === 'loading') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-12 animate-fade-in bg-black">
               <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(10,255,255,0.06))] [background-size:100%_4px,3px_100%]" />
               <div className="relative">
                  <div className="w-32 h-32 rounded-full border-t-4 border-emerald-500 animate-spin shadow-[0_0_30px_rgba(16,185,129,0.3)]" />
                  <Loader2 className="w-16 h-16 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-reverse" />
                  <div className="absolute inset-0 blur-3xl bg-emerald-500/40 animate-pulse" />
               </div>
               <div className="flex flex-col items-center gap-6 text-center">
                  <h3 className="text-4xl font-black text-emerald-400 tracking-[0.4em] animate-pulse uppercase">{loadingMsg}</h3>
                  <div className="w-[30rem] h-2 bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10">
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 shadow-[0_0_25px_#10b981] transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-[0.6rem] text-emerald-500/40 font-bold tracking-[0.6em] uppercase">Fragmentando Estrutura de Fluxo...</div>
               </div>
            </div>
          )}

          {/* PLAYING VIEW */}
          {view === 'playing' && iframeSrc && (
            <iframe 
               src={iframeSrc}
               className="w-full h-full border-none focus:outline-none"
               allow="gamepad; autoplay; fullscreen"
               title="Widicom Arcade Emulator"
               sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            />
          )}

          {/* ERROR VIEW */}
          {view === 'error' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black">
                <div className="w-32 h-32 rounded-full bg-rose-500/20 flex items-center justify-center mb-10 border border-rose-500/30 animate-pulse">
                   <X className="w-16 h-16 text-rose-500" />
                </div>
                <h2 className="text-6xl font-black text-rose-500 mb-6 tracking-tighter uppercase">FALHA SISTÊMICA</h2>
                <p className="text-slate-400 text-center max-w-2xl font-bold text-sm tracking-[0.2em] leading-relaxed uppercase">{loadingMsg}</p>
                <button 
                  onClick={() => setView('menu')}
                  className="mt-16 px-16 py-6 rounded-[3rem] bg-white/5 hover:bg-rose-500/30 text-white font-black tracking-[0.4em] uppercase transition-all border border-white/10 hover:border-rose-500/50"
                >
                  Reinicializar Kernel
                </button>
             </div>
          )}

        </div>

        {/* Hidden Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept={selectedConsole?.exts.join(',')}
        />
      </div>

      <style>{`
        @keyframes hypnotic-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, 50px) scale(1.2); }
          66% { transform: translate(-50px, 150px) scale(0.8); }
        }
        @keyframes hypnotic-2 {
          0%, 100% { transform: translate(0, 0) scale(1.1); }
          33% { transform: translate(-150px, -50px) scale(0.9); }
          66% { transform: translate(80px, -120px) scale(1.2); }
        }
        @keyframes hypnotic-3 {
          0%, 100% { transform: translate(0, 0) scale(0.9); }
          50% { transform: translate(200px, 200px) scale(1.3); }
        }
        @keyframes grid-drift {
          0% { background-position: 0 0; }
          100% { background-position: 4rem 4rem; }
        }
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(200px, -500px) rotate(360deg); opacity: 0; }
        }
        @keyframes spin-reverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        .animate-hypnotic-1 { animation: hypnotic-1 25s ease-in-out infinite; }
        .animate-hypnotic-2 { animation: hypnotic-2 30s ease-in-out infinite; }
        .animate-hypnotic-3 { animation: hypnotic-3 20s ease-in-out infinite; }
        .animate-grid-drift { animation: grid-drift 15s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 1.5s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 5s ease-in-out infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        .font-display { font-family: 'Outfit', 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
