import { useEffect, useState } from 'react';
import { colones } from '../components/ui';
import { FINANCIERO } from '../content/documento';
import {
  calcularFinanzas,
  escenarios,
  ORIGEN,
  SUPUESTOS_DOCUMENTO,
  viabilidad,
  type SupuestosFinancieros,
} from '../domain/finanzas';

const CLAVE = 'spavisual.supuestosFinancieros';

/** Los supuestos se recuerdan en este navegador para no perderlos al cambiar de pestaña. */
function cargar(): SupuestosFinancieros {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) return { ...SUPUESTOS_DOCUMENTO, ...JSON.parse(raw) };
  } catch {
    /* sin almacenamiento disponible */
  }
  return structuredClone(SUPUESTOS_DOCUMENTO);
}

const fmtPct = (v: number | null, d = 1) => (v === null || !isFinite(v) ? '—' : `${v.toLocaleString('es-CR', { maximumFractionDigits: d })} %`);
const fmtNum = (v: number, d = 0) => (isFinite(v) ? v.toLocaleString('es-CR', { maximumFractionDigits: d }) : '—');
const millones = (v: number) => `${v < 0 ? '−' : ''}₡${(Math.abs(v) / 1_000_000).toLocaleString('es-CR', { maximumFractionDigits: 1 })} M`;
/** Monto en colones con signo "−" delante del símbolo cuando es negativo. */
const monto = (v: number) => (v < 0 ? `−${colones(Math.round(-v))}` : colones(Math.round(v)));

type CampoNum = Exclude<keyof SupuestosFinancieros, 'inversion' | 'incluirSalarios'>;

export function EstudioFinanciero() {
  const [s, setS] = useState<SupuestosFinancieros>(cargar);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(s));
    } catch {
      /* sin almacenamiento disponible */
    }
  }, [s]);

  const r = calcularFinanzas(s);
  const via = viabilidad(r, s);
  const esc = escenarios(s);

  const campo = (k: CampoNum, label: string, step = 1, nota?: string) => (
    <label className="field" key={k}>
      <span>
        {label}{' '}
        <span className={`badge ${ORIGEN[k] === 'documento' ? 'neutral' : 'warn'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
          {ORIGEN[k] === 'documento' ? 'documento' : 'supuesto'}
        </span>
      </span>
      <input
        className="input"
        type="number"
        step={step}
        value={s[k]}
        onChange={(e) => setS({ ...s, [k]: Number(e.target.value) })}
      />
      {nota && <span className="small">{nota}</span>}
    </label>
  );

  let acumulado = -r.inversionTotal;

  return (
    <>
      <div className="notice" style={{ marginBottom: 16 }}>
        Modifique cualquier valor y los resultados se recalculan al instante. Los valores marcados como <b>documento</b> provienen de los estudios del
        proyecto; los marcados como <b>supuesto</b> no están definidos en el estudio preliminar y pueden ajustarse.
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(min(320px, 100%), 380px) 1fr', alignItems: 'start' }}>
        {/* ---------- Supuestos ---------- */}
        <div className="stack">
          <div className="card" style={{ margin: 0 }}>
            <div className="card-head" style={{ marginBottom: 8 }}>
              <h3>Supuestos</h3>
              <button className="btn secondary" style={{ padding: '4px 10px' }} onClick={() => setS(structuredClone(SUPUESTOS_DOCUMENTO))}>
                Restablecer valores del documento
              </button>
            </div>
            <h3 className="small" style={{ marginBottom: 6 }}>Inversión inicial (₡)</h3>
            {s.inversion.map((i, idx) => (
              <div className="row" key={i.concepto} style={{ flexWrap: 'nowrap', marginBottom: 6 }}>
                <span className="small" style={{ flex: 1 }}>
                  {i.concepto}
                </span>
                <input
                  className="input"
                  type="number"
                  step={1000}
                  style={{ width: 130 }}
                  value={i.monto}
                  onChange={(e) => {
                    const inversion = s.inversion.map((x, j) => (j === idx ? { ...x, monto: Number(e.target.value) } : x));
                    setS({ ...s, inversion });
                  }}
                />
              </div>
            ))}
            <div className="grid grid-2 section-gap" style={{ gap: 10 }}>
              {campo('imprevistosPct', 'Imprevistos (%)')}
            </div>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ marginBottom: 8 }}>Capacidad y demanda</h3>
            <div className="grid grid-2" style={{ gap: 10 }}>
              {campo('horasDia', 'Horas diarias del spa')}
              {campo('duracionSesion', 'Duración de sesión (min)')}
              {campo('diasMes', 'Días hábiles al mes')}
              {campo('ocupacionAnio1', 'Ocupación año 1 (%)')}
              {campo('ocupacionDesdeAnio2', 'Ocupación desde año 2 (%)')}
            </div>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ marginBottom: 8 }}>Precios</h3>
            <div className="grid grid-2" style={{ gap: 10 }}>
              {campo('precioCuidado', 'Sesión de cuidado ocular (₡)', 500, 'Rango propuesto: ₡15 000 a ₡20 000')}
              {campo('precioIPL', 'Sesión con IPL (₡)', 500)}
              {campo('mezclaIPL', 'Sesiones con IPL (%)')}
              {campo('descuentoPromedio', 'Descuento promedio (%)', 0.5, 'Paquetes 10 % y promociones 20 %')}
            </div>
          </div>

          <div className="card" style={{ margin: 0 }}>
            <h3 style={{ marginBottom: 8 }}>Costos y evaluación</h3>
            <div className="grid grid-2" style={{ gap: 10 }}>
              {campo('costoVariablePct', 'Costo variable (% de ventas)')}
              {campo('gastosFijosMes', 'Gastos fijos asignados (₡/mes)', 1000)}
              {campo('salariosMes', 'Salarios asignados 50 % (₡/mes)', 1000)}
              {campo('depreciacionAnual', 'Depreciación anual (₡)', 1000)}
              {campo('tasaDescuento', 'Tasa de descuento (%)', 0.5)}
              {campo('horizonteAnios', 'Horizonte (años)')}
            </div>
            <label className="row small section-gap" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', cursor: 'pointer' }}>
              <input type="checkbox" checked={s.incluirSalarios} onChange={(e) => setS({ ...s, incluirSalarios: e.target.checked })} style={{ marginTop: 3 }} />
              <span>
                <b>Incluir los salarios asignados en el flujo.</b> Sin marcar, solo se consideran los costos nuevos del spa, porque el personal ya
                existe y la clínica lo paga con o sin el servicio.
              </span>
            </label>
          </div>
        </div>

        {/* ---------- Resultados ---------- */}
        <div className="stack">
          <div className="grid grid-3" style={{ gap: 12 }}>
            <div className="stat">
              <b>{millones(r.inversionTotal)}</b>
              <span>Inversión inicial total</span>
            </div>
            <div className="stat">
              <b>{colones(Math.round(r.precioNeto))}</b>
              <span>Precio promedio neto por sesión</span>
            </div>
            <div className="stat">
              <b>{isFinite(r.puntoEquilibrio) ? `${fmtNum(Math.ceil(r.puntoEquilibrio))} ses/mes` : '—'}</b>
              <span>
                Punto de equilibrio ({fmtPct(r.puntoEquilibrioOcupacion, 0)} de {r.capacidadMes})
              </span>
            </div>
            <div className="stat">
              <b style={{ color: r.van >= 0 ? 'var(--ok)' : 'var(--bad)' }}>{millones(r.van)}</b>
              <span>
                VAN ({Math.round(s.horizonteAnios)} años, {fmtPct(s.tasaDescuento)})
              </span>
            </div>
            <div className="stat">
              <b>{fmtPct(r.tir)}</b>
              <span>TIR</span>
            </div>
            <div className="stat">
              <b>{r.recuperacion === null ? 'No recupera' : `${fmtNum(r.recuperacion, 1)} años`}</b>
              <span>Recuperación de la inversión</span>
            </div>
          </div>

          <div className={`notice ${via.nivel === 'ok' ? 'ok' : via.nivel === 'warn' ? 'warn' : 'bad'}`}>
            <strong>{via.texto}.</strong>
            <ul style={{ marginTop: 6, listStyle: 'none', paddingLeft: 0 }}>
              {via.checks.map((c) => (
                <li key={c.texto}>
                  {c.ok ? '✔' : '✘'} {c.texto}
                </li>
              ))}
            </ul>
          </div>

          <div className="card table-wrap" style={{ margin: 0 }}>
            <h3 style={{ marginBottom: 8 }}>Resultado mensual</h3>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th className="num">Año 1 ({fmtPct(s.ocupacionAnio1, 0)})</th>
                  <th className="num">Desde año 2 ({fmtPct(s.ocupacionDesdeAnio2, 0)})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sesiones al mes</td>
                  <td className="num">{fmtNum(r.anio1.sesiones)}</td>
                  <td className="num">{fmtNum(r.desdeAnio2.sesiones)}</td>
                </tr>
                <tr>
                  <td>Ingresos</td>
                  <td className="num">{colones(Math.round(r.anio1.ingresos))}</td>
                  <td className="num">{colones(Math.round(r.desdeAnio2.ingresos))}</td>
                </tr>
                <tr>
                  <td>Costos variables ({fmtPct(s.costoVariablePct, 0)})</td>
                  <td className="num">−{colones(Math.round(r.anio1.costosVariables))}</td>
                  <td className="num">−{colones(Math.round(r.desdeAnio2.costosVariables))}</td>
                </tr>
                <tr>
                  <td>Costos fijos{s.incluirSalarios ? ' y salarios' : ''}</td>
                  <td className="num">−{colones(Math.round(r.costosFijosMes))}</td>
                  <td className="num">−{colones(Math.round(r.costosFijosMes))}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>Flujo mensual</td>
                  <td className="num" style={{ color: r.anio1.flujo >= 0 ? 'var(--ok)' : 'var(--bad)' }}>
                    {monto(r.anio1.flujo)}
                  </td>
                  <td className="num" style={{ color: r.desdeAnio2.flujo >= 0 ? 'var(--ok)' : 'var(--bad)' }}>
                    {monto(r.desdeAnio2.flujo)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="card table-wrap" style={{ margin: 0 }}>
            <h3 style={{ marginBottom: 8 }}>Flujo de caja proyectado</h3>
            <table>
              <thead>
                <tr>
                  <th>Año</th>
                  <th className="num">Flujo</th>
                  <th className="num">Depreciación</th>
                  <th className="num">Utilidad contable</th>
                  <th className="num">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>0</td>
                  <td className="num">−{colones(Math.round(r.inversionTotal))}</td>
                  <td></td>
                  <td></td>
                  <td className="num" style={{ color: 'var(--bad)' }}>
                    −{colones(Math.round(r.inversionTotal))}
                  </td>
                </tr>
                {r.flujosAnuales.map((f, i) => {
                  acumulado += f;
                  return (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="num">{monto(f)}</td>
                      <td className="num">{monto(-s.depreciacionAnual)}</td>
                      <td className="num">{monto(f - s.depreciacionAnual)}</td>
                      <td className="num" style={{ color: acumulado >= 0 ? 'var(--ok)' : 'var(--bad)' }}>
                        {monto(acumulado)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="small muted section-gap">Montos antes de impuestos. La depreciación no es una salida de efectivo; se muestra para la utilidad contable.</p>
          </div>

          <div className="card table-wrap" style={{ margin: 0 }}>
            <h3 style={{ marginBottom: 8 }}>Escenarios</h3>
            <table>
              <thead>
                <tr>
                  <th>Escenario</th>
                  <th className="num">Ocupación</th>
                  <th className="num">Flujo mensual año 1</th>
                  <th className="num">VAN</th>
                  <th className="num">TIR</th>
                  <th className="num">Recuperación</th>
                </tr>
              </thead>
              <tbody>
                {esc.map((e) => (
                  <tr key={e.nombre}>
                    <td>
                      <strong>{e.nombre}</strong>
                    </td>
                    <td className="num">
                      {e.o1} % / {e.o2} %
                    </td>
                    <td className="num">{monto(e.r.anio1.flujo)}</td>
                    <td className="num" style={{ color: e.r.van >= 0 ? 'var(--ok)' : 'var(--bad)' }}>
                      {millones(e.r.van)}
                    </td>
                    <td className="num">{fmtPct(e.r.tir)}</td>
                    <td className="num">{e.r.recuperacion === null ? 'No' : `${fmtNum(e.r.recuperacion, 1)} años`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card table-wrap" style={{ margin: 0 }}>
            <h3 style={{ marginBottom: 8 }}>Costos variables por sesión (referencia del estudio)</h3>
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th className="num">Insumos</th>
                  <th className="num">Otros</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {FINANCIERO.costosVariables.map(([n, i, o, t]) => (
                  <tr key={n}>
                    <td>{n}</td>
                    <td className="num">{colones(i)}</td>
                    <td className="num">{colones(o)}</td>
                    <td className="num">{colones(t)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
