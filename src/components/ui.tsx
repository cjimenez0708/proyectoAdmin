import type { ReactNode } from 'react';
import { NIVEL_INFO } from '../domain/cumplimiento';
import type { Nivel, ResultadoArea } from '../domain/types';

export const colones = (n: number) =>
  '₡' + n.toLocaleString('es-CR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export const porcentaje = (n: number) => `${n.toLocaleString('es-CR', { maximumFractionDigits: 1 })} %`;

export function PageHead({ titulo, subtitulo, children }: { titulo: string; subtitulo?: ReactNode; children?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}

export function NivelBadge({ nivel }: { nivel: Nivel }) {
  return (
    <span className={`badge ${nivel}`} title={NIVEL_INFO[nivel].descripcion}>
      {NIVEL_INFO[nivel].etiqueta}
    </span>
  );
}

/** Medidor circular del porcentaje de cumplimiento. */
export function Medidor({ valor, nivel, tam = 132, leyenda = 'cumplimiento' }: { valor: number; nivel: Nivel; tam?: number; leyenda?: string }) {
  const r = tam / 2 - 10;
  const c = 2 * Math.PI * r;
  const color = nivel === 'lista' ? 'var(--ok)' : nivel === 'ajustes' ? '#e39a1c' : 'var(--bad)';
  return (
    <div className="gauge" role="img" aria-label={`${porcentaje(valor)} de ${leyenda}`}>
      <svg width={tam} height={tam}>
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="var(--neutral-bg)" strokeWidth={12} />
        <circle
          cx={tam / 2}
          cy={tam / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={`${(c * Math.min(valor, 100)) / 100} ${c}`}
        />
      </svg>
      <div className="val">
        <b>{porcentaje(valor)}</b>
        <span>{leyenda}</span>
      </div>
    </div>
  );
}

export function Barra({ valor, nivel, marca }: { valor: number; nivel?: Nivel; marca?: number }) {
  return (
    <div className={`bar ${nivel ?? ''}`}>
      <i style={{ width: `${Math.min(valor, 100)}%` }} />
      {marca !== undefined && <span className="mark" style={{ left: `${marca}%` }} title={`Meta ${marca} %`} />}
    </div>
  );
}

export function FilaArea({ r }: { r: ResultadoArea }) {
  return (
    <div className="area-row">
      <div>
        <strong>{r.area.nombre}</strong>
        <div className="small muted">
          {r.cumple} de {r.total} cumplen · {r.noCumple} no cumplen · {r.pendiente} pendientes
        </div>
      </div>
      <Barra valor={r.porcentaje} nivel={r.nivel} marca={80} />
      <div className="row">
        <span className="pct">{porcentaje(r.porcentaje)}</span>
        <NivelBadge nivel={r.nivel} />
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ items, activo, onChange }: { items: { id: T; label: ReactNode }[]; activo: T; onChange: (id: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {items.map((t) => (
        <button key={t.id} role="tab" aria-selected={t.id === activo} className={`tab ${t.id === activo ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return <div className="spinner">{texto}</div>;
}

export function ErrorDatos({ mensaje }: { mensaje: string }) {
  return <div className="notice bad">No se pudieron cargar los datos: {mensaje}</div>;
}

export function Lista({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export function GraficoBarras({ datos }: { datos: [string, number][] }) {
  return (
    <div>
      {datos.map(([k, v]) => (
        <div className="hbar" key={k}>
          <span>{k}</span>
          <Barra valor={v} />
          <b>{v.toLocaleString('es-CR', { maximumFractionDigits: 1 })}%</b>
        </div>
      ))}
    </div>
  );
}
