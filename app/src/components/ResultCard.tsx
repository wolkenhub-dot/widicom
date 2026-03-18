/**
 * ResultCard.tsx
 * 
 * Componente para exibir um resultado individual de busca.
 * Design: Cards minimalistas com bordas sutis e sem sombras pesadas.
 */

import { Download, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultCardProps {
  titulo: string;
  plataforma: string;
  url_original: string;
  url_download_direto: string | null;
  status: 'Ativo' | 'Inativo' | 'Desconhecido';
}

const PLATFORM_COLORS: Record<string, string> = {
  'Google Drive': 'bg-blue-50 text-blue-700 border-blue-200',
  'Mega.nz': 'bg-red-50 text-red-700 border-red-200',
  'MediaFire': 'bg-orange-50 text-orange-700 border-orange-200',
  'Dropbox': 'bg-sky-50 text-sky-700 border-sky-200',
  'Yandex Disk': 'bg-purple-50 text-purple-700 border-purple-200',
  'Internet Archive': 'bg-green-50 text-green-700 border-green-200',
  'Outra': 'bg-gray-50 text-gray-700 border-gray-200',
};

const STATUS_CONFIG = {
  'Ativo': {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'Ativo'
  },
  'Inativo': {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Inativo'
  },
  'Desconhecido': {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    label: 'Desconhecido'
  }
};

export default function ResultCard({
  titulo,
  plataforma,
  url_original,
  url_download_direto,
  status
}: ResultCardProps) {
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG['Desconhecido'];
  const StatusIcon = statusConfig.icon;
  const platformColor = PLATFORM_COLORS[plataforma] || PLATFORM_COLORS['Outra'];

  return (
    <div className="
      group relative overflow-hidden
      border border-border/40 rounded-xl p-5
      bg-gradient-to-b from-card to-background
      hover:from-secondary/20 hover:to-background
      shadow-sm hover:shadow-lg hover:border-border/80
      transform hover:-translate-y-1
      transition-all duration-300 ease-out
      flex flex-col gap-4
    ">
      {/* Luz de destaque superior sutil no hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Cabeçalho: Título e Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="
            text-lg font-bold text-foreground tracking-tight leading-tight
            line-clamp-2 break-words group-hover:text-primary transition-colors
          ">
            {titulo || 'Sem título'}
          </h3>
        </div>
        
        {/* Badge de Status */}
        <div className={`
          flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm
          ${statusConfig.bg} ${statusConfig.color} border border-current/10
          flex-shrink-0
        `}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Plataforma */}
      <div className="flex items-center gap-2">
        <span className={`
          inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm
          border ${platformColor}
        `}>
          {plataforma}
        </span>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-3 pt-3 mt-auto">
        <Button
          variant="outline"
          size="default"
          onClick={() => window.open(url_original, '_blank')}
          className="flex-1 gap-2 font-semibold shadow-sm hover:shadow-md transition-all duration-200 rounded-lg bg-background/50 hover:bg-background border-border/50"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Abrir Original</span>
          <span className="sm:hidden">Original</span>
        </Button>

        <Button
          variant="default"
          size="default"
          onClick={() => window.open(url_download_direto || url_original, '_blank')}
          className="flex-1 gap-2 font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 rounded-lg"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </Button>
      </div>
    </div>
  );
}
