import { useState } from 'react';

/** Colores validados (contraste y daltonismo) para dos series: azul = ingresos / positivo, naranja = costos / negativo. */
export const AZUL = '#2b6cc0';
export const NARANJA = '#c9752a';

export interface Serie {
  nombre: string;
  color: string;
  valores: number[];
}

interface Props {
  categorias: string[];
  series: Serie[];
  formato: (v: number) => string;
  /** Colorea cada barra según su signo (azul positivo, naranja negativo) en vez del color de la serie. */
  porSigno?: boolean;
  alto?: number;
  etiqueta: string;
}

/** Gráfico de barras en SVG: agrupadas por categoría, con eje en cero, valores visibles y tooltip al pasar el mouse. */
export function BarrasSvg({ categorias, series, formato, porSigno = false, alto = 230, etiqueta }: Props) {
  const [hover, setHover] = useState<{ x: number; y: number; texto: string } | null>(null);
  const ancho = 640;
  const todos = series.flatMap((s) => s.valores);
  const max = Math.max(0, ...todos);
  const min = Math.min(0, ...todos);
  // Con barras negativas se deja espacio debajo para su valor, sin chocar con el nombre de la categoría.
  const m = { top: 22, right: 12, bottom: min < 0 ? 52 : 34, left: 12 };
  const w = ancho - m.left - m.right;
  const h = alto - m.top - m.bottom;
  const rango = max - min || 1;
  const y = (v: number) => m.top + ((max - v) / rango) * h;
  const y0 = y(0);

  const anchoGrupo = w / categorias.length;
  const gap = 2;
  const anchoBarra = Math.min(56, (anchoGrupo * 0.62) / series.length);
  const anchoBloque = anchoBarra * series.length + gap * (series.length - 1);

  return (
    <div style={{ position: 'relative' }}>
      {series.length > 1 && (
        <div className="row small" style={{ gap: 16, marginBottom: 6 }}>
          {series.map((s) => (
            <span key={s.nombre} className="row" style={{ gap: 6 }}>
              <i style={{ width: 12, height: 12, borderRadius: 3, background: s.color, display: 'inline-block' }} />
              {s.nombre}
            </span>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${ancho} ${alto}`} width="100%" role="img" aria-label={etiqueta} onMouseLeave={() => setHover(null)}>
        {categorias.map((cat, ci) => {
          const x0 = m.left + ci * anchoGrupo + (anchoGrupo - anchoBloque) / 2;
          return (
            <g key={cat}>
              {series.map((s, si) => {
                const v = s.valores[ci];
                const x = x0 + si * (anchoBarra + gap);
                const top = Math.min(y(v), y0);
                const altoBarra = Math.max(1, Math.abs(y(v) - y0));
                const color = porSigno ? (v >= 0 ? AZUL : NARANJA) : s.color;
                const r = Math.min(4, altoBarra / 2, anchoBarra / 2);
                // Esquinas redondeadas solo en el extremo del dato (lejos del eje).
                const d =
                  v >= 0
                    ? `M${x},${y0} V${top + r} Q${x},${top} ${x + r},${top} H${x + anchoBarra - r} Q${x + anchoBarra},${top} ${x + anchoBarra},${top + r} V${y0} Z`
                    : `M${x},${y0} V${top + altoBarra - r} Q${x},${top + altoBarra} ${x + r},${top + altoBarra} H${x + anchoBarra - r} Q${x + anchoBarra},${top + altoBarra} ${x + anchoBarra},${top + altoBarra - r} V${y0} Z`;
                const texto = `${cat}${series.length > 1 ? ` · ${s.nombre}` : ''}: ${formato(v)}`;
                return (
                  <g key={s.nombre}>
                    <path d={d} fill={color} />
                    <text
                      x={x + anchoBarra / 2}
                      y={v >= 0 ? top - 5 : top + altoBarra + 12}
                      textAnchor="middle"
                      fontSize="10.5"
                      fill="var(--muted)"
                    >
                      {formato(v)}
                    </text>
                    {/* Zona de hover más grande que la barra */}
                    <rect
                      x={x - 3}
                      y={m.top}
                      width={anchoBarra + 6}
                      height={h}
                      fill="transparent"
                      onMouseMove={(e) => {
                        const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                        setHover({ x: e.clientX - box.left, y: e.clientY - box.top, texto });
                      }}
                    />
                  </g>
                );
              })}
              <text x={m.left + ci * anchoGrupo + anchoGrupo / 2} y={alto - 12} textAnchor="middle" fontSize="11.5" fill="var(--text)">
                {cat}
              </text>
            </g>
          );
        })}
        <line x1={m.left} x2={ancho - m.right} y1={y0} y2={y0} stroke="var(--muted)" strokeWidth={1} opacity={0.6} />
      </svg>
      {hover && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(hover.x + 12, 520),
            top: Math.max(0, hover.y - 34),
            background: 'var(--navy)',
            color: '#fff',
            fontSize: '0.8rem',
            padding: '4px 8px',
            borderRadius: 6,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {hover.texto}
        </div>
      )}
    </div>
  );
}
