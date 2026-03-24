import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity, BarChart2, Clock, Cpu, Database, Globe2, Hash, Lock,
  LogOut, RefreshCw, Server, TrendingUp, Users, Zap, Search, Eye, EyeOff, Terminal, MapPin
} from 'lucide-react';
import WorldMap from './WorldMap';

const API_BASE = 'http://localhost:3000';
const ADMIN_TOKEN = 'widicom2026';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SearchEntry {
  query: string;
  mode: string;
  resultsCount: number;
  durationMs: number;
  timestamp: string;
}

interface TopQuery { query: string; count: number; }

interface HourBucket { hour: string; count: number; }

interface MemoryInfo {
  heapUsed: number; heapTotal: number; rss: number;
  systemTotal: number; systemFree: number; systemUsed: number;
}

interface Metrics {
  uptime: number;
  memory: MemoryInfo;
  cpu: { count: number; model: string };
  platform: string;
  hostname: string;
  nodeVersion: string;
}

interface Visitor {
  ip: string;
  lat: number;
  lon: number;
  country: string;
  city: string;
  countryCode: string;
  lastSeen: number;
  query: string;
}

interface LiveData {
  metrics: Metrics;
  totalSearches: number;
  lastSearch: SearchEntry | null;
  searchesByHour: HourBucket[];
  topQueries: TopQuery[];
  activeClients: number;
  activeVisitors: Visitor[];
  serverTime: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtBytes(b: number) {
  if (b > 1073741824) return `${(b / 1073741824).toFixed(1)} GB`;
  if (b > 1048576) return `${(b / 1048576).toFixed(1)} MB`;
  return `${(b / 1024).toFixed(1)} KB`;
}

function fmtUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  return `${h}h ${m}m ${ss}s`;
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="relative bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-white/40 uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function MemoryBar({ label, used, total, color }: { label: string; used: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-white/50 mb-1.5">
        <span>{label}</span>
        <span>{fmtBytes(used)} / {fmtBytes(total)} <span className="text-white/30">({pct.toFixed(1)}%)</span></span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Login Gate ───────────────────────────────────────────────────────────────
function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [input, setInput] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_TOKEN) {
      sessionStorage.setItem('widicom_admin_auth', '1');
      onAuth();
    } else {
      setErr(true);
      setShake(true);
      setTimeout(() => { setShake(false); setErr(false); }, 600);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
          <p className="text-white/40 text-sm mt-1">Painel Admin — Widicom</p>
        </div>

        <form onSubmit={handleSubmit} className={`space-y-4 ${shake ? 'animate-[wiggle_0.3s_ease-in-out]' : ''}`}>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Token de acesso..."
              className={`w-full bg-white/5 border ${err ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-3 pr-11 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/60 transition-colors text-sm`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {err && <p className="text-red-400 text-xs text-center">Token inválido.</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors"
          >
            Acessar Painel
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('widicom_admin_auth') === '1');
  const [live, setLive] = useState<LiveData | null>(null);
  const [history, setHistory] = useState<SearchEntry[]>([]);
  const [histSearch, setHistSearch] = useState('');
  const [connected, setConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const evtRef = useRef<EventSource | null>(null);

  const connectSSE = useCallback(() => {
    if (evtRef.current) evtRef.current.close();
    const es = new EventSource(`${API_BASE}/admin/stream`, {});
    // We need to inject auth — use fetch for initial load and EventSource for stream
    evtRef.current = es;

    es.addEventListener('update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as LiveData;
        setLive(data);
        setConnected(true);
        setLastRefresh(new Date());
      } catch (_) {}
    });

    es.onerror = () => setConnected(false);
    return es;
  }, []);

  // Fetch initial full data (history) via REST
  const fetchFull = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      const json = await res.json();
      if (json.success) {
        setHistory(json.data.searchHistory || []);
        setLive(prev => prev ? { ...prev, ...json.data } : json.data);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchFull();

    // SSE stream with token via URL (EventSource doesn't support headers natively)
    // We'll poll /admin/stats every 2s as fallback for the live panel
    const iv = setInterval(fetchFull, 4000);
    return () => clearInterval(iv);
  }, [authed, fetchFull, connectSSE]);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  const maxHour = Math.max(1, ...(live?.searchesByHour?.map(h => h.count) || [1]));
  const filteredHistory = history.filter(e =>
    !histSearch || e.query.toLowerCase().includes(histSearch.toLowerCase())
  );

  const handleLogout = () => {
    sessionStorage.removeItem('widicom_admin_auth');
    onExit();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-bold text-sm tracking-tight">Widicom <span className="text-emerald-400">Admin</span></span>
          <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'Live' : 'Offline'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-white/20">
              Atualizado {timeAgo(lastRefresh.toISOString())}
            </span>
          )}
          <button onClick={fetchFull} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-emerald-400 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </div>

      <div className="pt-16 px-4 md:px-6 pb-12 max-w-[1400px] mx-auto space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <KpiCard
            icon={Search}
            label="Total de Buscas"
            value={(live?.totalSearches ?? '—').toLocaleString()}
            sub="desde o início"
            color="from-emerald-500/5 to-transparent"
          />
          <KpiCard
            icon={Clock}
            label="Uptime"
            value={live ? fmtUptime(live.metrics.uptime) : '—'}
            sub="tempo de atividade"
            color="from-blue-500/5 to-transparent"
          />
          <KpiCard
            icon={Cpu}
            label="Memória Heap"
            value={live ? fmtBytes(live.metrics.memory.heapUsed) : '—'}
            sub={live ? `de ${fmtBytes(live.metrics.memory.heapTotal)}` : ''}
            color="from-purple-500/5 to-transparent"
          />
          <KpiCard
            icon={MapPin}
            label="Visitantes Ativos"
            value={live?.activeVisitors?.length ?? '—'}
            sub="nos últimos 30 min"
            color="from-rose-500/5 to-transparent"
          />
        </div>

        {/* ── World Map ── */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/70">Mapa de Visitantes em Tempo Real</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${(live?.activeVisitors?.length ?? 0) > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
              <span className="text-xs text-white/30">
                {(live?.activeVisitors?.length ?? 0)} visitante{(live?.activeVisitors?.length ?? 0) !== 1 ? 's' : ''} rastreado{(live?.activeVisitors?.length ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/[0.04] bg-[#060f06]">
            <WorldMap visitors={live?.activeVisitors ?? []} />
          </div>
          {(live?.activeVisitors?.length ?? 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {live!.activeVisitors.slice(0, 8).map((v, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-[11px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${Date.now() - v.lastSeen < 300000 ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-700'}`} />
                  <span className="text-white/60">{v.city}, {v.country}</span>
                </div>
              ))}
              {live!.activeVisitors.length > 8 && (
                <div className="flex items-center text-[11px] text-white/20 px-2">+{live!.activeVisitors.length - 8} mais</div>
              )}
            </div>
          )}
        </div>

        {/* ── Activity Chart + Resources ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Buscas por Hora */}
          <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/70">Atividade — Últimas 24h</h3>
            </div>
            <div className="flex items-end gap-1 h-32">
              {(live?.searchesByHour || Array(24).fill({ hour: '00:00', count: 0 })).map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-emerald-500/20 group-hover:bg-emerald-500/50 rounded-t-sm transition-all duration-300 relative"
                    style={{ height: `${maxHour > 0 ? Math.max(4, (b.count / maxHour) * 100) : 4}%` }}
                  >
                    {b.count > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {b.count}
                      </span>
                    )}
                  </div>
                  {i % 6 === 0 && (
                    <span className="text-[9px] text-white/20">{b.hour}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/70">Recursos do Sistema</h3>
            </div>
            {live ? (
              <>
                <MemoryBar label="Heap JS" used={live.metrics.memory.heapUsed} total={live.metrics.memory.heapTotal} color="bg-emerald-500" />
                <MemoryBar label="RSS (Processo)" used={live.metrics.memory.rss} total={live.metrics.memory.heapTotal * 2} color="bg-blue-500" />
                <MemoryBar label="RAM do Sistema" used={live.metrics.memory.systemUsed} total={live.metrics.memory.systemTotal} color="bg-purple-500" />
                <div className="pt-2 space-y-1.5 text-xs text-white/30">
                  <div className="flex justify-between"><span>Plataforma</span><span className="text-white/50">{live.metrics.platform}</span></div>
                  <div className="flex justify-between"><span>Node.js</span><span className="text-white/50">{live.metrics.nodeVersion}</span></div>
                  <div className="flex justify-between"><span>CPUs</span><span className="text-white/50">{live.metrics.cpu.count}x cores</span></div>
                  <div className="flex justify-between"><span>Hostname</span><span className="text-white/50">{live.metrics.hostname}</span></div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32 text-white/20 text-sm">Carregando...</div>
            )}
          </div>
        </div>

        {/* ── Top Queries + Last Search Info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Queries */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/70">Top 10 Pesquisas</h3>
            </div>
            <div className="space-y-2.5">
              {(live?.topQueries || []).length === 0 ? (
                <p className="text-white/20 text-xs text-center py-6">Sem dados ainda.</p>
              ) : (live?.topQueries || []).map((q, i) => {
                const maxCount = live?.topQueries?.[0]?.count || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-white/20 w-4 text-right shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70 truncate">{q.query}</span>
                        <span className="text-emerald-400 font-semibold shrink-0 ml-2">{q.count}x</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500/60 rounded-full transition-all duration-700"
                          style={{ width: `${(q.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats + Last Search Info */}
          <div className="space-y-4">
            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white/70">Última Busca Registrada</h3>
              </div>
              {live?.lastSearch ? (
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2 items-start">
                    <Hash className="w-3 h-3 text-white/30 mt-0.5 shrink-0" />
                    <span className="text-white/80 font-mono break-all">{live.lastSearch.query}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-emerald-400 font-bold text-base">{live.lastSearch.resultsCount}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">Resultados</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-blue-400 font-bold text-base">{(live.lastSearch.durationMs / 1000).toFixed(1)}s</p>
                      <p className="text-white/30 text-[10px] mt-0.5">Duração</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 text-center">
                      <p className="text-purple-400 font-bold text-base capitalize">{live.lastSearch.mode}</p>
                      <p className="text-white/30 text-[10px] mt-0.5">Modo</p>
                    </div>
                  </div>
                  <p className="text-white/20 text-right">{timeAgo(live.lastSearch.timestamp)}</p>
                </div>
              ) : (
                <p className="text-white/20 text-xs text-center py-4">Nenhuma busca registrada.</p>
              )}
            </div>

            <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white/70">Status do Servidor</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <p className="text-white/80 font-semibold">{live?.activeClients ?? 0} SSE</p>
                    <p className="text-white/30 text-[10px]">Clientes ativos</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <div>
                    <p className="text-white/80 font-semibold">{live ? fmtBytes(live.metrics.memory.rss) : '—'}</p>
                    <p className="text-white/30 text-[10px]">RSS total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search History Table ── */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/70">Histórico de Buscas</h3>
              <span className="text-xs text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{history.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Filtrar histórico..."
                value={histSearch}
                onChange={e => setHistSearch(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/40 w-48 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/30 border-b border-white/5">
                  <th className="text-left pb-3 font-semibold w-1/2">Query</th>
                  <th className="text-center pb-3 font-semibold">Modo</th>
                  <th className="text-right pb-3 font-semibold">Resultados</th>
                  <th className="text-right pb-3 font-semibold">Duração</th>
                  <th className="text-right pb-3 font-semibold">Quando</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.slice(0, 100).map((entry, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-2.5 pr-4">
                      <span className="text-white/70 font-mono truncate block max-w-xs group-hover:text-white transition-colors">
                        {entry.query}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        entry.mode === 'deep'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {entry.mode}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-emerald-400 font-semibold">{entry.resultsCount}</td>
                    <td className="py-2.5 text-right text-blue-400">{(entry.durationMs / 1000).toFixed(2)}s</td>
                    <td className="py-2.5 text-right text-white/25">{timeAgo(entry.timestamp)}</td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-white/20">
                      Nenhuma busca encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
