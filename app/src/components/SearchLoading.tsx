import { useState, useEffect } from 'react';
import { Search, Server, Globe, Cpu, Loader2 } from 'lucide-react';

const getLoadingSteps = (mode: 'quick' | 'deep') => [
  { message: mode === 'quick' ? 'Iniciando varredura ágil (5s)...' : 'Iniciando varredura global profunda (60s)...', icon: Globe, time: 0 },
  { message: 'Consultando CDNs primárias...', icon: Server, time: mode === 'quick' ? 1.5 : 10 },
  { message: 'Descriptografando repositórios abertos...', icon: Search, time: mode === 'quick' ? 3 : 30 },
  { message: 'Filtrando links inativos via IA...', icon: Cpu, time: mode === 'quick' ? 4 : 45 }
];

export default function SearchLoading({ mode = 'deep' }: { mode?: 'quick' | 'deep' }) {
  const totalTime = mode === 'quick' ? 5 : 60;
  const steps = getLoadingSteps(mode);
  
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(totalTime);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // A cada 100ms, atualiza a barra
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (totalTime * 10)); // Crescimento exato
      });
      
      setTimeRemaining((prevTime) => {
        const newTime = Math.max(0, prevTime - 0.1);
        const elapsed = totalTime - newTime;
        const nextStepIndex = steps.findIndex(s => s.time > elapsed) - 1;
        
        if (nextStepIndex >= 0 && nextStepIndex < steps.length) {
            setCurrentStep(nextStepIndex);
        } else if (nextStepIndex === -2) {
            setCurrentStep(steps.length - 1);
        }

        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="w-full max-w-4xl mx-auto my-16 p-8 relative rounded-3xl glass-card border border-indigo-500/20 shadow-2xl overflow-hidden animate-fade-in">
      
      {/* Background Glows */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-[80px]" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px]" />

      <div className="flex flex-col items-center justify-center space-y-8 relative z-10">
        
        {/* Animated Icon Ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin w-20 h-20 -ml-2 -mt-2 opacity-50" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-0 rounded-full border-b-2 border-purple-500 animate-spin flex-row-reverse w-24 h-24 -ml-4 -mt-4 opacity-50" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          
          <div className="bg-indigo-600/20 p-4 rounded-full backdrop-blur-md border border-indigo-500/30 text-indigo-300 shadow-inner">
            <StepIcon className="w-8 h-8 animate-pulse" />
          </div>
        </div>

        {/* Dynamic Text */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {steps[currentStep].message}
          </h3>
          <p className="text-slate-400 font-medium flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            Esta pesquisa profunda leva cerca de {Math.ceil(timeRemaining)} segundos
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full max-w-xl mx-auto space-y-3">
          <div className="flex justify-between items-end text-sm font-semibold">
            <span className="text-indigo-300">{Math.floor(progress)}% Escaneado</span>
            <span className="text-white font-mono text-lg">{timeRemaining.toFixed(1)}s restantes</span>
          </div>
          
          <div className="w-full h-3 bg-slate-800/80 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-white/5 relative">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
            
            {/* Dynamic Fill */}
            <div 
              className="h-full rounded-full transition-all duration-100 ease-linear flex relative overflow-hidden"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #4f46e5 0%, #8b5cf6 100%)',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
              }}
            >
              {/* Particle highlight in the progress bar */}
              <div className="w-10 h-full bg-white/30 absolute right-0 blur-sm" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
