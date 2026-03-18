/**
 * ResultCard.tsx
 * 
 * Componente para exibir um resultado individual de busca.
 * Design: 90s Retro - Beveled borders, neon colors, terminal aesthetic.
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

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Google Drive': { bg: '#000066', text: '#00FFFF', border: '#00FFFF' },
  'Mega.nz': { bg: '#440000', text: '#FF6666', border: '#FF0000' },
  'MediaFire': { bg: '#442200', text: '#FFAA00', border: '#FF6600' },
  'Dropbox': { bg: '#000044', text: '#6699FF', border: '#3366FF' },
  'Yandex Disk': { bg: '#220044', text: '#CC66FF', border: '#9933FF' },
  'Internet Archive': { bg: '#004400', text: '#66FF66', border: '#00FF00' },
  'Outra': { bg: '#222222', text: '#CCCCCC', border: '#808080' },
};

const STATUS_CONFIG = {
  'Ativo': {
    icon: CheckCircle2,
    color: '#00FF00',
    bg: '#003300',
    border: '#00FF00',
    label: 'ONLINE',
  },
  'Inativo': {
    icon: AlertCircle,
    color: '#FF0000',
    bg: '#330000',
    border: '#FF0000',
    label: 'OFFLINE',
  },
  'Desconhecido': {
    icon: AlertCircle,
    color: '#FFFF00',
    bg: '#333300',
    border: '#FFFF00',
    label: '???',
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
    <div
      className="group relative overflow-hidden flex flex-col gap-4 animate-border-pulse"
      style={{
        background: 'linear-gradient(180deg, #000066 0%, #000033 100%)',
        border: '3px ridge #808080',
        padding: '16px',
        boxShadow: '4px 4px 0px #000000, inset 1px 1px 0px rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '4px 4px 0px #000000, 0 0 15px rgba(255, 0, 255, 0.3), inset 1px 1px 0px rgba(255,255,255,0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = '4px 4px 0px #000000, inset 1px 1px 0px rgba(255,255,255,0.1)';
      }}
    >
      {/* Top decorative bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '20px',
        background: 'linear-gradient(90deg, #000080, #0000AA)',
        borderBottom: '2px solid #808080',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px',
      }}>
        <span style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: '0.35rem',
          color: '#FFFFFF',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          maxWidth: '70%',
        }}>
          {titulo || 'Sem titulo'}
        </span>
        <div style={{ display: 'flex', gap: '3px' }}>
          <span style={{ width: '10px', height: '10px', background: '#808080', border: '1px outset #C0C0C0', display: 'inline-block', fontSize: '6px', textAlign: 'center', lineHeight: '10px' }}>_</span>
          <span style={{ width: '10px', height: '10px', background: '#808080', border: '1px outset #C0C0C0', display: 'inline-block', fontSize: '6px', textAlign: 'center', lineHeight: '10px' }}>{'\u25A1'}</span>
          <span style={{ width: '10px', height: '10px', background: '#C04040', border: '1px outset #C0C0C0', display: 'inline-block', fontSize: '6px', textAlign: 'center', lineHeight: '10px', color: '#FFFFFF' }}>X</span>
        </div>
      </div>

      {/* Content area (with top padding for title bar) */}
      <div style={{ marginTop: '16px' }}>
        {/* Title and Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 style={{
              fontFamily: '"VT323", monospace',
              fontSize: '1.3rem',
              color: '#FFFF00',
              textShadow: '0 0 5px rgba(255, 255, 0, 0.3)',
              lineHeight: '1.3',
              wordBreak: 'break-word',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {'>'} {titulo || 'Sem titulo'}
            </h3>
          </div>
          
          {/* Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 8px',
            background: statusConfig.bg,
            border: `2px solid ${statusConfig.border}`,
            color: statusConfig.color,
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '0.4rem',
            flexShrink: 0,
            boxShadow: `0 0 5px ${statusConfig.color}40`,
          }}>
            <StatusIcon style={{ width: '12px', height: '12px' }} />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Platform */}
        <div className="flex items-center gap-2 mt-3">
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            background: platformColor.bg,
            border: `2px solid ${platformColor.border}`,
            color: platformColor.text,
            fontFamily: '"VT323", monospace',
            fontSize: '1rem',
            boxShadow: `0 0 5px ${platformColor.border}40`,
          }}>
            [{plataforma}]
          </span>
        </div>

        {/* Action Buttons - Retro style */}
        <div className="flex gap-3 pt-4 mt-auto">
          <Button
            variant="outline"
            size="default"
            onClick={() => window.open(url_original, '_blank')}
            style={{
              flex: 1,
              fontFamily: '"VT323", monospace',
              fontSize: '1rem',
              background: '#000044',
              color: '#00FFFF',
              border: '3px outset #808080',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              textShadow: '0 0 5px #00FFFF40',
              boxShadow: '2px 2px 0px #000000',
            }}
            className="hover:brightness-125 active:border-inset transition-all duration-100"
          >
            <ExternalLink style={{ width: '14px', height: '14px' }} />
            <span className="hidden sm:inline">Abrir Original</span>
            <span className="sm:hidden">Original</span>
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={() => window.open(url_download_direto || url_original, '_blank')}
            style={{
              flex: 1,
              fontFamily: '"VT323", monospace',
              fontSize: '1rem',
              background: '#FF00FF',
              color: '#FFFFFF',
              border: '3px outset #808080',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              textShadow: '1px 1px 0px #000000',
              boxShadow: '2px 2px 0px #000000, 0 0 10px rgba(255, 0, 255, 0.3)',
            }}
            className="hover:brightness-125 active:border-inset transition-all duration-100"
          >
            <Download style={{ width: '14px', height: '14px' }} />
            <span>Download</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
