import { Download, ExternalLink, Activity, HardDrive, Cpu } from 'lucide-react';

interface ResultCardProps {
  titulo: string;
  plataforma: string;
  url_original: string;
  url_download_direto: string | null;
  status: 'Ativo' | 'Inativo' | 'Desconhecido';
  imageUrl?: string;
}

const STATUS_CONFIG = {
  'Ativo': { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20', label: 'Online' },
  'Inativo': { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20', label: 'Offline' },
  'Desconhecido': { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20', label: 'Instável' }
};

export default function ResultCard({
  titulo,
  plataforma,
  url_original,
  url_download_direto,
  status,
  imageUrl
}: ResultCardProps) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG['Desconhecido'];
  const isTorrent = titulo.includes('Seeds:') || url_original.startsWith('magnet:');

  return (
    <div className="bg-white dark:bg-[#050505] rounded-[24px] p-6 flex flex-col h-full hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.15)] border border-slate-200/60 dark:border-white/5 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group overflow-hidden relative">
      
      {imageUrl && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center z-0 opacity-30 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700" 
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-[#020617]/20 z-0 pointer-events-none" />
        </>
      )}

      {/* Platform & Status Row */}
      <div className="relative z-10 flex justify-between items-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/70 border border-slate-200/80 dark:border-white/10 group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors">
          {isTorrent ? <HardDrive className="w-3.5 h-3.5 text-indigo-500 dark:text-emerald-400" /> : <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-emerald-400" />}
          {plataforma}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-black border ${conf.bg} ${conf.color} ${conf.border}`}>
          <Activity className="w-3 h-3" />
          {conf.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="relative z-10 text-lg md:text-xl font-display font-bold text-slate-900 dark:text-emerald-50 leading-snug mb-6 line-clamp-3 group-hover:text-indigo-600 dark:group-hover:text-emerald-400 transition-colors">
        {titulo || 'Midia não identificada'}
      </h3>

      {/* Actions */}
      <div className="relative z-10 mt-auto flex gap-3 pt-5 border-t border-slate-100 dark:border-white/5">
        <button
          onClick={() => window.open(url_original, '_blank')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs uppercase tracking-wider font-bold bg-slate-50 dark:bg-black hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-emerald-500 border border-slate-200 dark:border-white/10 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Diretório</span>
        </button>

        <button
          onClick={() => window.open(url_download_direto || url_original, '_blank')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs uppercase tracking-wider font-bold bg-indigo-600 dark:bg-emerald-600 text-white hover:bg-indigo-700 dark:hover:bg-emerald-500 shadow-md shadow-indigo-600/20 dark:shadow-emerald-600/20 hover:shadow-indigo-600/40 dark:hover:shadow-emerald-600/40 transition-all duration-500 ease-out outline-none"
        >
          {isTorrent ? (
            <HardDrive className="w-3.5 h-3.5" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{isTorrent ? 'Magnet' : 'Obter'}</span>
        </button>
      </div>

    </div>
  );
}
