import React, { useState, useEffect, useRef } from 'react';
import { searchLostMediaStream, getAutocomplete } from '@/lib/api';

interface TerminalWidicomProps {
  onClose: () => void;
}

interface HistoryLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: React.ReactNode;
}

const ASCII_ART = `
██╗    ██╗██╗██████╗ ██╗ ██████╗ ██████╗ ███╗   ███╗
██║    ██║██║██╔══██╗██║██╔════╝██╔═══██╗████╗ ████║
██║ █╗ ██║██║██║  ██║██║██║     ██║   ██║██╔████╔██║
██║███╗██║██║██║  ██║██║██║     ██║   ██║██║╚██╔╝██║
╚███╔███╔╝██║██████╔╝██║╚██████╗╚██████╔╝██║ ╚═╝ ██║
 ╚══╝╚══╝ ╚═╝╚═════╝ ╚═╝ ╚═════╝ ╚═════╝ ╚═╝     ╚═╝
 
 Widicom OS v1.0.9 (Terminal Widicom)
 Digite 'ajuda' para ver os comandos disponíveis.
`;

export default function TerminalWidicom({ onClose }: TerminalWidicomProps) {
  const [history, setHistory] = useState<HistoryLine[]>([
    { id: 'boot-1', type: 'system', content: ASCII_ART }
  ]);
  const [input, setInput] = useState('');
  const [themeColor, setThemeColor] = useState<'green' | 'amber' | 'white'>('green');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Force focus to invisible input smoothly
  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
      }
    }, 500);
    return () => clearInterval(focusInterval);
  }, []);

  // DuckDuckGo Autocomplete Proxy
  useEffect(() => {
    if (!input.toLowerCase().startsWith('search ') || input.trim().length <= 6) {
      setSuggestion('');
      return;
    }

    const queryPart = input.slice(7);
    if (!queryPart.trim()) {
      setSuggestion('');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const sugs = await getAutocomplete(queryPart);
        if (sugs && sugs.length > 0) {
          const match = sugs.find((s: string) => s.toLowerCase().startsWith(queryPart.toLowerCase()));
          if (match) {
            setSuggestion(match.slice(queryPart.length));
          } else {
            setSuggestion('');
          }
        } else {
          setSuggestion('');
        }
      } catch {
        setSuggestion('');
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [input]);

  // Scroll to bottom after DOM paint to ensure cursor visibility
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
    }, 50);
    return () => clearTimeout(scrollTimer);
  }, [history, loadingProgress, loadingMessage, isProcessing, input]);

  const addHistory = (type: HistoryLine['type'], content: React.ReactNode) => {
    setHistory(prev => [...prev, { id: Math.random().toString(36).substring(7), type, content }]);
  };

  const parseCommand = async (cmdString: string) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;

    addHistory('input', `widicom@user:~$ ${trimmed}`);
    const args = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    if (args.length === 0 || !args[0]) return;

    const command = args[0].toLowerCase();

    switch (command) {
      case 'exit':
        onClose();
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'ajuda':
      case 'help':
        addHistory('output', (
          <div className="space-y-4">
            <div><span className="text-current font-bold">WIDICOM CLI - MANUAL DE OPERAÇÕES DO TERMINAL v1.0</span></div>

            <div className="space-y-1">
              <div><span className="font-bold underline">COMANDOS DISPONÍVEIS</span></div>
              <div>  <span className="opacity-80">search [termo] [flags]</span>   Busca por mídias e arquivos na rede.</div>
              <div>  <span className="opacity-80">theme --color [cor]</span>      Esquemas: green (padrão), amber, white.</div>
              <div>  <span className="opacity-80">clear</span>                    Limpeza de buffer do terminal.</div>
              <div>  <span className="opacity-80">exit</span>                     Retornar à interface visual moderna.</div>
            </div>

            <div className="space-y-1">
              <div><span className="font-bold underline">PARÂMETROS DE BUSCA (REFINAMENTO)</span></div>
              <div>  <span className="opacity-80">--filetype [ext]</span>   Filtra por extensão (ex: zip, iso, rar, mp3).</div>
              <div>  <span className="opacity-80">--engine [nome]</span>    Busca em motor específico (ex: google, bing, archive).</div>
            </div>

            <div className="space-y-1">
              <div><span className="font-bold underline">DICAS DE REFINAMENTO DE LINKS</span></div>
              <div>  • <span className="italic">Busca Localizada:</span> Use <span className="text-current/80">"Mario World"</span> entre aspas para frases exatas.</div>
              <div>  • <span className="italic">Remoção de Ruído:</span> Use <span className="text-current/80">-virus -fake</span> para excluir resultados indesejados.</div>
              <div>  • <span className="italic">Arquivos Diretos:</span> Tente <span className="text-current/80">"index of" Mario</span> para encontrar pastas abertas.</div>
            </div>

            <div className="space-y-1">
              <div><span className="font-bold underline">EXEMPLOS PRÁTICOS</span></div>
              <div>  <span className="text-current/60">search "Sonic CD" --filetype iso</span></div>
              <div>  <span className="text-current/60">search "Titanic Documentaries" --engine internetarchive</span></div>
              <div>  <span className="text-current/60">theme --color amber</span></div>
            </div>

            <div className="text-xs opacity-50 border-t border-current/20 pt-2">
              Sistema de extração Widicom v1.0.9 - Todos os direitos reservados.
            </div>
          </div>
        ));
        break;

      case 'theme':
        if (args.length >= 3 && args[1] === '--color' && args[2] && ['green', 'amber', 'white'].includes(args[2])) {
          setThemeColor(args[2] as 'green' | 'amber' | 'white');
          addHistory('output', `Esquema de cores alterado para ${args[2]}.`);
        } else {
          addHistory('error', 'Uso: theme --color [green|amber|white]');
        }
        break;

      case 'search': {
        setIsProcessing(true);
        try {
          // Parse flags manually
          let queryStr = "";
          let filetype = "";
          let engine = "";
          let searchMode: 'quick' | 'deep' = 'quick';

          for (let i = 1; i < args.length; i++) {
            if (args[i] === '--filetype' && args[i + 1]) {
              filetype = args[i + 1].replace(/"/g, '');
              i++;
            } else if (args[i] === '--engine' && args[i + 1]) {
              engine = args[i + 1].replace(/"/g, '');
              i++;
            } else {
              queryStr += args[i] + " ";
            }
          }

          queryStr = queryStr.trim().replace(/^"|"$/g, ''); // Remove outer quotes if exists

          if (!queryStr) {
            addHistory('error', 'Erro: A busca requer um termo. Tente: search "Lost Media"');
            break;
          }

          addHistory('system', `> Iniciando Protocolo de Busca... Modo: ${searchMode.toUpperCase()}, Motor: ${engine || 'AUTO'}, Ext: ${filetype || 'TODAS'}`);

          // Map flags to searx syntax inside the query
          let finalQuery = queryStr;
          if (filetype) finalQuery += ` ext:${filetype}`;
          if (engine) finalQuery += ` !${engine}`;

          addHistory('system', `> Compilando pacote: [${finalQuery}]`);

          setLoadingProgress(0);
          setLoadingMessage('DISCANDO PARA NÓ SEGURO...');

          // Start the API call concurrently with a 9.5s hard timeout to guarantee max 10s total runtime
          // Start the API call leveraging our new stream logic but wrapping in a promise for terminal
          const searchPromise = new Promise((resolve, reject) => {
            let acc: any[] = [];
            searchLostMediaStream(finalQuery, 1, searchMode,
              (data) => { acc.push(...data.resultados); },
              () => { resolve({ resultados: acc }); },
              (err) => { reject(err); }
            );
          });
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 9500));

          let fetchCompleted = false;
          let results: any = null;
          let fetchError: any = null;

          // Run the search in background
          Promise.race([searchPromise, timeoutPromise])
            .then(res => { results = res; fetchCompleted = true; })
            .catch(err => { fetchError = err; fetchCompleted = true; });

          // Cinematic 80s Loading Animation (Max ~8.5s)
          for (let i = 0; i <= 100; i += 2) {
            // If fetch finishes early, we can speed up the rest of the animation
            await new Promise(r => setTimeout(r, fetchCompleted ? 15 : 150));
            setLoadingProgress(i);
            if (i === 10) setLoadingMessage('HANDSHAKE ACEITO...');
            if (i === 30) setLoadingMessage('BYPASSING FIREWALLS...');
            if (i === 60) setLoadingMessage('DECRIPTANDO ARQUIVOS...');
            if (i === 80) setLoadingMessage('MONTANDO PACOTES DE DADOS...');
            if (i === 96) setLoadingMessage('FINALIZANDO...');
          }

          setLoadingProgress(null);

          if (fetchError) {
            throw fetchError;
          }

          if (!results || !results.resultados || results.resultados.length === 0) {
            addHistory('output', 'Nenhum resultado encontrado para os seus critérios.');
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const outNodes = results.resultados.map((res: any, idx: number) => (
              <div key={idx} className="mb-4">
                <div className="font-bold">[{res.plataforma || 'Web'}] {res.titulo}</div>
                <div>Status: {res.status}</div>
                <div><a href={res.url_original} target="_blank" rel="noreferrer" className="underline hover:brightness-150">-{'>'} {res.url_original}</a></div>
              </div>
            ));
            addHistory('output', <div className="mt-2">{outNodes}</div>);
          }

        } catch (err) {
          if (err instanceof Error && err.message === 'TIMEOUT_EXCEEDED') {
            addHistory('error', `Tempo Esgotado: O servidor SearXNG está demorando muito para responder (> 10s).`);
          } else {
            addHistory('error', `Erro de Conexão: ${err}`);
          }
        } finally {
          setIsProcessing(false);
          setLoadingProgress(null);
        }
        break;
      }

      default:
        addHistory('error', `Comando não encontrado: ${command}. Digite 'ajuda' para a lista de comandos.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || e.key === 'ArrowRight') {
      if (suggestion) {
        e.preventDefault();
        setInput(input + suggestion);
        setSuggestion('');
      }
    } else if (e.key === 'Enter') {
      const val = input;
      setInput('');
      setSuggestion('');
      parseCommand(val);
    }
  };

  const themeClasses = {
    green: 'text-emerald-500 text-shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    amber: 'text-amber-500 text-shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    white: 'text-slate-200 text-shadow-[0_0_8px_rgba(226,232,240,0.8)]',
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-black crt-scanlines crt-flicker crt-turn-on crt-overlay font-mono overflow-auto p-4 md:p-8 ${themeClasses[themeColor]}`}>
      <div className="max-w-6xl mx-auto flex flex-col min-h-full">
        <div className="flex-1 whitespace-pre-wrap break-words">
          {history.map(item => (
            <div key={item.id} className={`mb-2 ${item.type === 'error' ? 'text-rose-500 text-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : ''}`}>
              {item.type === 'input' && <span className="opacity-70">{item.content}</span>}
              {item.type !== 'input' && item.content}
            </div>
          ))}

          {/* Prompt Line */}
          {!isProcessing && (
            <div className="flex items-center mt-4 relative">
              <span className="mr-2">widicom@user:~$</span>
              <span className="relative">
                {input}
                {suggestion && <span className="opacity-40">{suggestion}</span>}
              </span>
              <span className="w-2 h-5 bg-current animate-pulse ml-1 opacity-80" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="absolute inset-0 opacity-0 cursor-text bg-transparent text-transparent w-full h-full border-none outline-none"
                autoComplete="off"
                spellCheck="false"
                disabled={isProcessing}
                autoFocus
              />
            </div>
          )}

          {/* Processing Blinker or Loading Bar */}
          {isProcessing && loadingProgress !== null ? (
            <div className="mt-4 flex flex-col font-bold">
              <div className="mb-1 text-sm">{loadingMessage}</div>
              <div className="flex items-center">
                <span>{`[${'█'.repeat(Math.round(loadingProgress / 5))}${'▒'.repeat(20 - Math.round(loadingProgress / 5))}]`}</span>
                <span className="ml-3 w-10 text-right">{loadingProgress}%</span>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="mt-4 flex animate-pulse">
              <span className="w-2 h-5 bg-current" />
            </div>
          ) : null}

          <div ref={bottomRef} className="h-16" />
        </div>
      </div>
    </div>
  );
}
