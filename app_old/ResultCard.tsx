/**
 * ResultCard.tsx
 * 
 * Componente para exibir um resultado individual de busca.
 * Design: Cards minimalistas com bordas sutis e sem sombras pesadas.
 */

import { Copy, Download, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  const [copied, setCopied] = useState(false);
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;
  const platformColor = PLATFORM_COLORS[plataforma] || PLATFORM_COLORS['Outra'];

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="
      border border-border rounded-md p-4
      bg-card hover:bg-secondary/50
      transition-colors duration-200
      flex flex-col gap-3
    ">
      {/* Cabeçalho: Título e Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="
            text-base font-semibold text-foreground
            line-clamp-2 break-words
          ">
            {titulo || 'Sem título'}
          </h3>
        </div>
        
        {/* Badge de Status */}
        <div className={`
          flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
          ${statusConfig.bg} ${statusConfig.color}
          flex-shrink-0
        `}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      {/* Plataforma */}
      <div className="flex items-center gap-2">
        <span className={`
          inline-block px-2 py-1 rounded text-xs font-medium
          border ${platformColor}
        `}>
          {plataforma}
        </span>
      </div>

      {/* URLs */}
      <div className="space-y-2">
        {/* URL Original */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Original:</span>
          <a
            href={url_original}
            target="_blank"
            rel="noopener noreferrer"
            className="
              text-xs text-primary hover:underline
              truncate flex-1
            "
            title={url_original}
          >
            {url_original}
          </a>
          <button
            onClick={() => handleCopyLink(url_original)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="Copiar URL original"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* URL de Download Direto (se disponível) */}
        {url_download_direto && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Download:</span>
            <a
              href={url_download_direto}
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-xs text-accent hover:underline
                truncate flex-1
              "
              title={url_download_direto}
            >
              {url_download_direto}
            </a>
            <button
              onClick={() => handleCopyLink(url_download_direto)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Copiar URL de download"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url_original, '_blank')}
          className="flex-1 gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">Abrir Original</span>
          <span className="sm:hidden">Abrir</span>
        </Button>

        {url_download_direto && (
          <Button
            variant="default"
            size="sm"
            onClick={() => window.open(url_download_direto, '_blank')}
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
            <span className="sm:hidden">DL</span>
          </Button>
        )}
      </div>
    </div>
  );
}
