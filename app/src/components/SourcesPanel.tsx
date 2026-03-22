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
    <div className="w-full max-w-7xl mx-auto py-12 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-400 w-8 h-8" />
            Checar fontes Onlines
          </h2>
          <p className="text-slate-400 mt-2 font-medium">
            Verifique o tempo de resposta e a integridade de todas as bibliotecas e repositórios arquivistas.
          </p>
        </div>
        <button
          onClick={handleTestSources}
          disabled={isTesting}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25"
        >
          <RefreshCw className={`w-5 h-5 ${isTesting ? 'animate-spin' : ''}`} />
          {isTesting ? 'Testando Protocolos...' : 'Executar Diagnóstico'}
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-fade-in">
          {/* Total Pesquisas */}
          <div className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Database className="w-16 h-16 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-indigo-400 mb-1 uppercase tracking-wider">Total de Pesquisas</p>
            <h3 className="text-4xl font-black text-white">{stats.totalSearches.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-1">Consultas globais no sistema</p>
          </div>
          
          {/* Total Fontes */}
          <div className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers className="w-16 h-16 text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-violet-400 mb-1 uppercase tracking-wider">Fontes de Dados</p>
            <h3 className="text-4xl font-black text-white">{stats.totalSources}</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-1">Repositórios integrados</p>
          </div>

          {/* Cobertura */}
          <div className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              {stats.verificationStatus ? <ShieldCheck className="w-16 h-16 text-sky-400" /> : <ShieldAlert className="w-16 h-16 text-amber-400" />}
            </div>
            <p className={`text-sm font-semibold mb-1 uppercase tracking-wider ${stats.verificationStatus ? 'text-sky-400' : 'text-amber-400'}`}>
              Cobertura Base
            </p>
            <h3 className="text-4xl font-black text-white">{stats.verificationStatus ? '100%' : 'Alerta'}</h3>
            <p className="text-xs text-slate-500 mt-2 font-medium line-clamp-1">
              {stats.verificationStatus ? 'Todas APIs mapeadas' : 'Fontes não testadas'}
            </p>
          </div>

          {/* Saúde da Rede (Live % Online) */}
          <div className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 className="w-16 h-16 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-400 mb-1 uppercase tracking-wider">Rede Ativa</p>
            {hasTested ? (
              <>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-white">{onlinePerc}% <span className="text-sm text-slate-400">({onlineCount})</span></h3>
                  <span className="text-xs font-bold text-emerald-400 uppercase">On</span>
                  <span className="text-slate-500 mx-1">|</span>
                  <h3 className="text-lg font-bold text-slate-300">{offlinePerc}% <span className="text-sm text-slate-400">({offlineCount})</span></h3>
                  <span className="text-xs font-bold text-rose-400 uppercase">Off</span>
                </div>
                <div className="w-full h-1.5 bg-rose-500 rounded-full mt-3 flex shadow-inner overflow-hidden">
                  <div className="bg-emerald-500 h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${onlinePerc}%` }} />
                </div>
              </>
            ) : (
              <>
                <h3 className="text-4xl font-black text-slate-400">?</h3>
                <p className="text-xs text-slate-500 mt-2 font-medium">Execute para calcular</p>
              </>
            )}
          </div>
        </div>
      )}

      {!hasTested && !isTesting && (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-slate-700/50">
          <Zap className="w-12 h-12 text-indigo-400/50 mb-4" />
          <h3 className="text-xl text-slate-300 font-semibold">Nenhuma checagem rodou ainda</h3>
          <p className="text-slate-500 mt-2">Clique no botão acima para testar todos os endpoints em tempo real.</p>
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
                className="glass-card rounded-2xl p-6 flex flex-col animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-slate-100">{source.name}</h4>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    isBlocked ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {isOnline ? <Activity className="w-3 h-3" /> : <ServerCrash className="w-3 h-3" />}
                    {source.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="mt-auto flex justify-between items-end border-t border-white/5 pt-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Objetos Extraídos</p>
                    <p className="text-xl font-bold text-white mt-1">{source.count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Ping / Latência</p>
                    <p className={`text-lg font-bold mt-1 ${source.timeMs > 5000 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {source.timeMs} <span className="text-sm text-slate-500">ms</span>
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
