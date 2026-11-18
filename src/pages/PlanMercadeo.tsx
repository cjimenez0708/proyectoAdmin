import { PageHead } from '../components/ui';
import { PLAN_MERCADEO } from '../content/documento';

export function PlanMercadeo() {
  return (
    <>
      <PageHead titulo="Plan de mercadeo e implementación" subtitulo="Acciones para la introducción de Spa Visual (apartado 18) y etapas de implementación (apartado 19.1)." />
      <div className="card table-wrap">
        <h2>Etapas de implementación</h2>
        <table className="section-gap">
          <thead>
            <tr>
              <th>Etapa</th>
              <th>Duración</th>
              <th>Actividades principales</th>
              <th>Condición para avanzar</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_MERCADEO.etapas.map(([e, d, a, c]) => (
              <tr key={e}>
                <td>
                  <strong>{e}</strong>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>{d}</td>
                <td className="small">{a}</td>
                <td className="small">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-2 section-gap">
        <div className="card stack">
          <h2>Cartera de servicios</h2>
          {PLAN_MERCADEO.servicios.map(([n, d]) => (
            <div key={n}>
              <strong className="small">{n}</strong>
              <p className="small muted">{d}</p>
            </div>
          ))}
        </div>
        <div className="card">
          <h2>Precios propuestos</h2>
          <div className="grid grid-2 section-gap">
            {PLAN_MERCADEO.precios.map((p) => (
              <div className="stat" key={p.etiqueta}>
                <b>{p.valor}</b>
                <span>{p.etiqueta}</span>
              </div>
            ))}
          </div>
          <p className="small muted section-gap">Precios fijos el primer año, revisados cada seis meses según demanda, costos y competencia.</p>
        </div>
      </div>
      <div className="card table-wrap section-gap">
        <h2>Cronograma y presupuesto de las acciones</h2>
        <table className="section-gap">
          <thead>
            <tr>
              <th>Acción</th>
              <th>Responsable</th>
              <th>Momento</th>
              <th>Costo estimado</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_MERCADEO.acciones.map(([a, r, m, c]) => (
              <tr key={a}>
                <td>{a}</td>
                <td>{r}</td>
                <td className="small">{m}</td>
                <td className="small">{c}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total de desembolsos estimados</td>
              <td>{PLAN_MERCADEO.totalDesembolsos}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
