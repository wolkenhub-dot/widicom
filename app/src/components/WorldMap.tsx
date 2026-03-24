import { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3-geo';
import * as topojson from 'topojson-client';

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

interface Props {
  visitors: Visitor[];
}

function timeAgo(ms: number) {
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 60) return `${diff}s atrás`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
}

const W = 960;
const H = 480;

export default function WorldMap({ visitors }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [paths, setPaths] = useState<string[]>([]);
  const [borders, setBorders] = useState<string>('');
  const [tooltip, setTooltip] = useState<{
    visible: boolean; x: number; y: number; visitor: Visitor | null;
  }>({ visible: false, x: 0, y: 0, visitor: null });

  // d3 projection — Natural Earth
  const projection = useCallback(() =>
    d3.geoNaturalEarth1()
      .scale(153)
      .translate([W / 2, H / 2]),
  []);

  // Compute (lon, lat) => SVG (x, y)
  const project = useCallback((lon: number, lat: number): [number, number] => {
    const proj = projection();
    const pt = proj([lon, lat]);
    return pt ?? [0, 0];
  }, [projection]);

  // Load TopoJSON
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world: any) => {
        const proj = projection();
        const pathGen = d3.geoPath(proj);

        // Countries
        const countries = topojson.feature(world, world.objects.countries);
        const countryPaths = (countries as any).features.map((f: any) =>
          pathGen(f) || ''
        );
        setPaths(countryPaths);

        // Country borders (mesh)
        const mesh = topojson.mesh(
          world,
          world.objects.countries,
          (a: any, b: any) => a !== b
        );
        setBorders(pathGen(mesh) || '');
      })
      .catch(() => {/* silently fail */ });
  }, [projection]);

  const handleMarkerEnter = (
    e: React.MouseEvent<SVGCircleElement>,
    v: Visitor
  ) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visitor: v,
    });
  };

  return (
    <div className="relative w-full" style={{ userSelect: 'none' }}>
      {/* Tooltip */}
      {tooltip.visible && tooltip.visitor && (
        <div
          className="pointer-events-none absolute z-30 bg-[#0d1a0d]/95 backdrop-blur border border-emerald-500/30 rounded-xl px-3.5 py-2.5 shadow-2xl shadow-black/70 text-xs"
          style={{
            left: tooltip.x + 14,
            top: Math.max(8, tooltip.y - 56),
            minWidth: 160,
          }}
        >
          <p className="font-bold text-white leading-tight">
            {tooltip.visitor.city && tooltip.visitor.city !== 'undefined'
              ? `${tooltip.visitor.city}`
              : tooltip.visitor.country}
          </p>
          <p className="text-emerald-500 text-[10px]">{tooltip.visitor.country}</p>
          {tooltip.visitor.query && (
            <p className="text-emerald-400/80 text-[11px] mt-1 truncate italic">
              "{tooltip.visitor.query.slice(0, 30)}"
            </p>
          )}
          <p className="text-white/25 text-[10px] mt-1">{timeAgo(tooltip.visitor.lastSeen)}</p>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
      >
        {/* Ocean */}
        <rect x={0} y={0} width={W} height={H} fill="#050e05" rx={0} />

        {/* Globe outline */}
        <path
          d={d3.geoPath(projection())(
            { type: 'Sphere' } as any
          ) || ''}
          fill="#070f07"
          stroke="#1a2e1a"
          strokeWidth={0.8}
        />

        {/* Graticule (grid) */}
        <path
          d={d3.geoPath(projection())(d3.geoGraticule()() as any) || ''}
          fill="none"
          stroke="#0f1f0f"
          strokeWidth={0.35}
        />

        {/* Country fills */}
        {paths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="#0e2010"
            stroke="none"
          />
        ))}

        {/* Country borders */}
        <path
          d={borders}
          fill="none"
          stroke="#1f4020"
          strokeWidth={0.5}
        />

        {/* Visitor markers */}
        {visitors.map((v, i) => {
          const [x, y] = project(v.lon, v.lat);
          if (!x && !y) return null;
          const isRecent = Date.now() - v.lastSeen < 5 * 60 * 1000;

          return (
            <g key={i}>
              {/* Animated pulse for recent visitors */}
              {isRecent && (
                <>
                  <circle cx={x} cy={y} r={14} fill="none" stroke="#10b981" strokeWidth={1}>
                    <animate attributeName="r" values="5;20;5" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r={9} fill="none" stroke="#10b981" strokeWidth={0.7}>
                    <animate attributeName="r" values="5;13;5" dur="2.5s" begin="0.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" begin="0.6s" repeatCount="indefinite" />
                  </circle>
                </>
              )}

              {/* Glow halo */}
              <circle
                cx={x} cy={y}
                r={isRecent ? 10 : 7}
                fill={isRecent ? '#10b981' : '#16a34a'}
                opacity={0.15}
              />

              {/* Main dot */}
              <circle
                cx={x} cy={y}
                r={isRecent ? 5 : 3.5}
                fill={isRecent ? '#10b981' : '#22c55e'}
                style={{
                  cursor: 'pointer',
                  filter: isRecent
                    ? 'drop-shadow(0 0 6px #10b981) drop-shadow(0 0 12px #10b98188)'
                    : 'drop-shadow(0 0 4px #22c55e66)',
                }}
                onMouseEnter={(e) => handleMarkerEnter(e, v)}
                onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
              />

              {/* White core */}
              <circle cx={x} cy={y} r={1.6} fill="white" opacity={0.9} style={{ pointerEvents: 'none' }} />
            </g>
          );
        })}
      </svg>

      {/* Legend + info bar */}
      <div className="flex items-center gap-5 px-4 py-2 text-[11px] text-white/30 border-t border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px #10b981, 0 0 16px #10b98166' }} />
          <span>Online agora (&lt;5min)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-600 opacity-70" />
          <span>Recente (até 30min)</span>
        </div>
        <div className="ml-auto text-white/20 text-[10px]">
          {visitors.length} visitante{visitors.length !== 1 ? 's' : ''} registrado{visitors.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
