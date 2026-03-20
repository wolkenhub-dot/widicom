import { Download, ExternalLink, Activity, HardDrive, ShieldAlert, Cpu } from 'lucide-react';

interface ResultCardProps {
  titulo: string;
  plataforma: string;
  url_original: string;
  url_download_direto: string | null;
  status: 'Ativo' | 'Inativo' | 'Desconhecido';
}

const STATUS_CONFIG = {
  'Ativo': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Online' },
  'Inativo': { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', label: 'Offline' },
  'Desconhecido': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'Instável' }
};

export default function ResultCard({
  titulo,
  plataforma,
  url_original,
  url_download_direto,
  status
}: ResultCardProps) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG['Desconhecido'];
  const isTorrent = titulo.includes('Seeds:') || url_original.startsWith('magnet:');

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col h-full hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 group">
      
      {/* Platform & Status Row */}
      <div className="flex justify-between items-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10 group-hover:border-indigo-500/30 transition-colors">
          {isTorrent ? <HardDrive className="w-3 h-3 text-indigo-400" /> : <Cpu className="w-3 h-3 text-indigo-400" />}
          {plataforma}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${conf.bg} ${conf.color} ${conf.border}`}>
          <Activity className="w-3 h-3" />
          {conf.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-100 leading-snug mb-5 line-clamp-3 group-hover:text-indigo-300 transition-colors">
        {titulo || 'Midia não identificada'}
      </h3>

      {/* Actions */}
      <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
        <button
          onClick={() => window.open(url_original, '_blank')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Fonte</span>
        </button>

        <button
          onClick={() => window.open(url_download_direto || url_original, '_blank')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-indigo-500"
        >
          {isTorrent ? (
            <HardDrive className="w-4 h-4" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{isTorrent ? 'Magnet' : 'Baixar'}</span>
        </button>
      </div>

    </div>
  );
}
