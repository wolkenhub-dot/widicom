import { useState, useEffect } from 'react';
import { Activity, ServerCrash, Zap, RefreshCw, Layers, Database, ShieldCheck, ShieldAlert, BarChart3 } from 'lucide-react';
import { checkSourcesHealth, getSystemStats } from '@/lib/api';
import type { SourceHealth, SystemStats } from '@/lib/api';
import { toast } from 'sonner';

export default function SourcesPanel() {
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [hasTested, setHasTested] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    getSystemStats().then(setStats);
  }, []);

  const handleTestSources = async () => {
    setIsTesting(true);
    setSources([]);
    toast.info('Iniciando benchmark de fontes Múltiplas...');

    try {
      const results = await checkSourcesHealth();
      setSources(results);
      setHasTested(true);
      
      const onlineCount = results.filter(r => r.status === 'Online').length;
      toast.success(`${onlineCount} de ${results.length} fontes estão online e operacionais.`);
    } catch (error) {
      toast.error('Gargalo ou Erro ao tentar atingir a API central de testes.');
    } finally {
      setIsTesting(false);
    }
  };

  const onlineCount = sources.filter(r => r.status.startsWith('Online')).length;
  const offlineCount = hasTested ? sources.length - onlineCount : 0;
  const onlinePerc = hasTested && sources.length > 0 ? Math.round((onlineCount / sources.length) * 100) : 0;
  const offlinePerc = hasTested && sources.length > 0 ? 100 - onlinePerc : 0;

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 animate-fade-in text-slate-800 dark:text-emerald-50">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-emerald-400 tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-600 dark:text-emerald-500 w-8 h-8" />
            Checar fontes Onlines
          </h2>
          <p className="text-slate-500 dark:text-emerald-900/70 mt-2 font-medium">
            Verifique o tempo de resposta e a integridade de todas as bibliotecas e repositórios arquivistas.
          </p>
        </div>
        <button
          onClick={handleTestSources}
          disabled={isTesting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 dark:bg-emerald-600 hover:bg-indigo-700 dark:hover:bg-emerald-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 dark:shadow-[0_4px_30px_rgba(16,185,129,0.3)]"
        >
          <RefreshCw className={`w-5 h-5 ${isTesting ? 'animate-spin' : ''}`} />
          {isTesting ? 'Testando Protocolos...' : 'Executar Diagnóstico'}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in">
          {/* Total Pesquisas */}
          <div className="glass-card premium-border rounded-[24px] p-8 flex flex-col relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-white dark:bg-[#050505]">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 dark:group-hover:opacity-15 group-hover:scale-110 transition-all duration-700">
              <Database className="w-24 h-24 text-indigo-600 dark:text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-indigo-600 dark:text-emerald-400 mb-2 uppercase tracking-widest">Total de Pesquisas</p>
            <h3 className="text-5xl font-display font-black text-slate-900 dark:text-emerald-50 tracking-tighter drop-shadow-sm">{stats.totalSearches.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 dark:text-white/40 mt-4 font-semibold line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-emerald-300 transition-colors">Consultas globais no sistema</p>
          </div>
          
          {/* Total Fontes */}
          <div className="glass-card premium-border rounded-[24px] p-8 flex flex-col relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-white dark:bg-[#050505]">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 dark:group-hover:opacity-15 group-hover:scale-110 transition-all duration-700">
              <Layers className="w-24 h-24 text-violet-600 dark:text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-2 uppercase tracking-widest">Fontes de Dados</p>
            <h3 className="text-5xl font-display font-black text-slate-900 dark:text-emerald-50 tracking-tighter drop-shadow-sm">{stats.totalSources}</h3>
            <p className="text-xs text-slate-500 dark:text-white/40 mt-4 font-semibold line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">Repositórios integrados</p>
          </div>

          {/* Cobertura */}
          <div className="glass-card premium-border rounded-[24px] p-8 flex flex-col relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-white dark:bg-[#050505]">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 dark:group-hover:opacity-15 group-hover:scale-110 transition-all duration-700">
              {stats.verificationStatus ? <ShieldCheck className="w-24 h-24 text-sky-500 dark:text-emerald-400" /> : <ShieldAlert className="w-24 h-24 text-amber-500" />}
            </div>
            <p className={`text-xs font-bold mb-2 uppercase tracking-widest ${stats.verificationStatus ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-500'}`}>
              Cobertura Base
            </p>
            <h3 className="text-5xl font-display font-black text-slate-900 dark:text-emerald-50 tracking-tighter drop-shadow-sm">{stats.verificationStatus ? '100%' : 'Alerta'}</h3>
            <p className="text-xs text-slate-500 dark:text-white/40 mt-4 font-semibold line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
              {stats.verificationStatus ? 'Todas APIs mapeadas' : 'Fontes não testadas'}
            </p>
          </div>

          {/* Saúde da Rede (Live % Online) */}
          <div className="glass-card premium-border rounded-[24px] p-8 flex flex-col relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-white dark:bg-[#050505]">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 dark:group-hover:opacity-15 group-hover:scale-110 transition-all duration-700">
              <BarChart3 className="w-24 h-24 text-emerald-500" />
            </div>
            <p className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-widest">Rede Ativa</p>
            {hasTested ? (
              <>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-display font-black text-slate-900 dark:text-emerald-50 tracking-tighter drop-shadow-sm">{onlinePerc}% <span className="text-lg text-slate-500 dark:text-emerald-900/50">({onlineCount})</span></h3>
                  <span className="text-xs font-bold text-emerald-600 uppercase">On</span>
                </div>
                <div className="w-full h-1.5 bg-rose-100 dark:bg-rose-950/40 rounded-full mt-4 flex shadow-inner overflow-hidden">
                  <div className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${onlinePerc}%` }} />
                </div>
              </>
            ) : (
              <>
                <h3 className="text-5xl font-display font-black text-slate-300 dark:text-emerald-900/30 drop-shadow-sm">?</h3>
                <p className="text-xs text-slate-500 dark:text-emerald-900/50 mt-4 font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">Execute para calcular</p>
              </>
            )}
          </div>
        </div>
      )}

      {!hasTested && !isTesting && (
        <div className="glass-card bg-white/50 dark:bg-black/40 rounded-[32px] p-16 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-300 dark:border-white/10">
          <Zap className="w-16 h-16 text-indigo-200 dark:text-white/20 mb-6" />
          <h3 className="text-2xl text-slate-800 dark:text-emerald-50 font-bold">Nenhuma checagem rodou ainda</h3>
          <p className="text-slate-500 dark:text-white/40 mt-3 font-medium">Clique no botão acima para testar todos os endpoints em tempo real.</p>
        </div>
      )}

      {isTesting && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl skeleton-loading" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
      )}

      {hasTested && !isTesting && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((source, index) => {
            const isOnline = source.status.startsWith('Online');
            const isBlocked = source.status === 'Vazio/Bloqueado' || source.status === 'Timeout';
            
            return (
              <div 
                key={index} 
                className="bg-white dark:bg-[#050505] rounded-[24px] p-6 flex flex-col animate-slide-up opacity-0 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.15)] border border-slate-200/60 dark:border-white/5 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-emerald-50 group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors">{source.name}</h4>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                    isOnline ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' :
                    isBlocked ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' :
                    'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
                  }`}>
                    {isOnline ? <Activity className="w-3.5 h-3.5" /> : <ServerCrash className="w-3.5 h-3.5" />}
                    {source.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="mt-auto flex justify-between items-end border-t border-slate-100 dark:border-white/5 pt-5">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-widest font-black">Objetos Extraídos</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-emerald-50 mt-1">{source.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-widest font-black">Ping / Latência</p>
                    <p className={`text-xl font-bold mt-1 ${source.timeMs > 5000 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                      {source.timeMs} <span className="text-sm text-slate-400 dark:text-white/40">ms</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
