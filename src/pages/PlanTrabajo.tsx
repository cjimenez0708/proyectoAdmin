import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cargando, ErrorDatos, PageHead } from '../components/ui';
import { useEvaluaciones } from '../data/hooks';
import { areaPorId } from '../domain/catalogo';
import { accionIncompleta, planDeTrabajo } from '../domain/cumplimiento';

export function PlanTrabajo() {
  const { datos, cargando, error } = useEvaluaciones();
  const [sel, setSel] = useState('');
  const [soloPendientes, setSoloPendientes] = useState(false);

  if (cargando) return <Cargando />;
  if (error) return <ErrorDatos mensaje={error} />;

  const ev = datos.find((d) => d.id === sel) ?? datos[0];
  const plan = ev ? planDeTrabajo(ev) : [];
  const visibles = soloPendientes ? plan.filter((p) => !p.accion?.completada) : plan;
  const hoy = new Date().toLocaleDateString('en-CA');

  return (
    <>
      <PageHead
        titulo="Plan de trabajo"
        subtitulo="Acciones correctivas para cada requisito que no se cumple, con responsable, recursos y fecha de cumplimiento."
      />
      {!ev ? (
        <div className="card empty">
          No hay verificaciones. <Link to="/evaluaciones">Cree una</Link> para generar el plan.
        </div>
      ) : (
        <div className="card">
          <div className="card-head">
            <label className="field" style={{ minWidth: 260 }}>
              Verificación
              <select className="input" value={ev.id} onChange={(e) => setSel(e.target.value)}>
                {datos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="row small">
              <input type="checkbox" checked={soloPendientes} onChange={(e) => setSoloPendientes(e.target.checked)} />
              Ocultar acciones completadas
            </label>
          </div>
          {visibles.length === 0 ? (
            <p className="empty">{plan.length === 0 ? 'No hay incumplimientos en esta verificación.' : 'Todas las acciones están completadas.'}</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Área</th>
                    <th>Requisito</th>
                    <th>Acción correctiva</th>
                    <th>Responsable</th>
                    <th>Recursos</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map(({ enunciado, accion }) => {
                    const vencida = accion?.fechaCumplimiento && !accion.completada && accion.fechaCumplimiento < hoy;
                    return (
                      <tr key={enunciado.id}>
                        <td className="small">{areaPorId(enunciado.area).nombre}</td>
                        <td style={{ minWidth: 240 }}>
                          <Link to={`/evaluaciones/${ev.id}`} className="small">
                            {enunciado.numero}. {enunciado.texto}
                          </Link>
                        </td>
                        <td>{accion?.descripcion || <span className="muted">—</span>}</td>
                        <td>{accion?.responsable || <span className="muted">—</span>}</td>
                        <td>{accion?.recursos || <span className="muted">—</span>}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{accion?.fechaCumplimiento || <span className="muted">—</span>}</td>
                        <td>
                          {accion?.completada ? (
                            <span className="badge ok">Completada</span>
                          ) : accionIncompleta(accion) ? (
                            <span className="badge warn">Falta definir</span>
                          ) : vencida ? (
                            <span className="badge bad">Vencida</span>
                          ) : (
                            <span className="badge neutral">En curso</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
