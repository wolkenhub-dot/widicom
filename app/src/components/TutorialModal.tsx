import { useState } from 'react';
import { X, Moon, Sun, Gamepad2, Terminal, ChevronRight, CheckCircle2, Monitor } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Novo Widicom',
    description: 'Sua plataforma definitiva para busca e preservação de Lost Media e cultura retro.',
    icon: <Monitor className="w-12 h-12 text-emerald-500" />,
    color: 'emerald'
  },
  {
    id: 'theme',
    title: 'Estilo Adaptável',
    description: 'Alterne entre os modos Claro e Escuro para uma visualização confortável em qualquer ambiente. O modo escuro realça as cores neon clássicas.',
    icon: <Moon className="w-12 h-12 text-indigo-500" />,
    color: 'indigo',
    action: true
  },
  {
    id: 'arcade',
    title: 'Fliperama Widicom',
    description: 'Jogue consoles clássicos (SNES, Mega Drive, NES, Atari) diretamente no seu navegador. Com suporte a arquivos locais do seu computador.',
    icon: <Gamepad2 className="w-12 h-12 text-rose-500" />,
    color: 'rose'
  },
  {
    id: 'terminal',
    title: 'Kernel e Terminal',
    description: 'Acesse o Terminal Widicom para visualizar estatísticas de diagnóstico e interagir com o sistema em um nível baixo.',
    icon: <Terminal className="w-12 h-12 text-cyan-500" />,
    color: 'cyan'
  }
];

export default function TutorialModal({ onClose, toggleTheme, theme }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem('widicom_tutorial_completed', 'true');
    }
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const current = STEPS[currentStep];

  return (
    <div className={`fixed inset-0 z-[300] flex items-center justify-center p-4 transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {/* Immersive Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleFinish} />

      {/* Tutorial Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0a0a0b] rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col font-display">
        
        {/* Animated Background Glow */}
        <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b opacity-20 pointer-events-none transition-colors duration-700
          ${current.color === 'emerald' ? 'from-emerald-500' : ''}
          ${current.color === 'indigo' ? 'from-indigo-500' : ''}
          ${current.color === 'rose' ? 'from-rose-500' : ''}
          ${current.color === 'cyan' ? 'from-cyan-500' : ''}
        `} />

        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-8 z-10">
           <div className="flex gap-1.5">
             {STEPS.map((_, idx) => (
               <div 
                 key={idx} 
                 className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200 dark:bg-white/10'}`} 
               />
             ))}
           </div>
           <button onClick={handleFinish} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 px-8 pt-6 pb-10 flex flex-col items-center text-center z-10">
           <div className={`mb-8 p-6 rounded-[2rem] bg-white dark:bg-black/40 border border-slate-100 dark:border-white/5 shadow-sm transform transition-all duration-700 ${isClosing ? 'scale-0 rotate-180' : 'scale-100 rotate-0'}`}>
              {current.icon}
           </div>

           <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
             {current.title}
           </h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
             {current.description}
           </p>

           {/* Interactive Feature: Theme Toggle inside tutorial */}
           {current.id === 'theme' && (
              <button 
                onClick={toggleTheme}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-sm transition-all hover:scale-105 active:scale-95 mb-6 shadow-lg"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Testar Modo {theme === 'light' ? 'Escuro' : 'Claro'}
              </button>
           )}

           {/* Special Arcade visual in tutorial */}
           {current.id === 'arcade' && (
              <div className="grid grid-cols-4 gap-2 mb-6">
                 {['SNES', 'NES', 'MD', '2600'].map(sys => (
                   <span key={sys} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[0.6rem] font-black rounded-lg border border-emerald-500/20">{sys}</span>
                 ))}
              </div>
           )}
        </div>

        {/* Footer */}
        <div className="px-8 py-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex flex-col gap-6 z-10">
           <div className="flex items-center justify-between w-full">
              <label className="flex items-center gap-3 cursor-pointer group">
                 <div className="relative">
                    <input 
                      type="checkbox" 
                      className="peer hidden" 
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-white/20 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all" />
                    <CheckCircle2 className="absolute inset-0 w-5 h-5 text-white scale-0 peer-checked:scale-100 transition-transform" />
                 </div>
                 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Não mostrar novamente</span>
              </label>

              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-500/30"
              >
                {currentStep === STEPS.length - 1 ? 'Começar' : 'Próximo'}
                <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      <style>{`
        .font-display { font-family: 'Outfit', 'Inter', sans-serif; }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.5s ease-out; }
      `}</style>
    </div>
  );
}
