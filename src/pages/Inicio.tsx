import { Link } from 'react-router-dom';
import { Cargando, ErrorDatos, FilaArea, Medidor, NivelBadge, PageHead, porcentaje } from '../components/ui';
import { useEvaluaciones, useIndicadores } from '../data/hooks';
import { accionIncompleta, calcularResultado, listaParaLanzamiento, NIVEL_INFO, planDeTrabajo } from '../domain/cumplimiento';
import { ETAPAS } from '../domain/evaluacionFactory';
import { alertasConsecutivas } from '../domain/indicadores';

export function Inicio() {
  const evs = useEvaluaciones();
  const inds = useIndicadores();

  if (evs.cargando) return <Cargando />;
  if (evs.error) return <ErrorDatos mensaje={evs.error} />;

  const ultima = evs.datos[0];
  const alertas = alertasConsecutivas(inds.datos);

  return (
    <>
      <PageHead
        titulo="Spa Visual · Panel de implementación"
        subtitulo="Verificación de las condiciones de la Clínica Preventiva Visual para ofrecer el servicio Spa Visual."
      >
        <Link className="btn" to="/evaluaciones">
          Nueva verificación
        </Link>
      </PageHead>

      {!ultima ? (
        <div className="card empty stack" style={{ alignItems: 'center' }}>
          <h2>Aún no hay verificaciones registradas</h2>
          <p>
            La verificación se realiza durante la preparación, de nuevo antes del lanzamiento y luego cada tres meses durante el primer año de
            operación.
          </p>
          <Link className="btn" to="/evaluaciones">
            Crear la primera verificación
          </Link>
        </div>
      ) : (
        <Resumen ev={ultima} />
      )}

      <div className="grid grid-2 section-gap">
        <div className="card">
          <div className="card-head">
            <h2>Indicadores de seguimiento</h2>
            <Link to="/indicadores" className="small">
              Ver indicadores →
            </Link>
          </div>
          {inds.datos.length === 0 ? (
            <p className="muted">Sin registros mensuales todavía. Se registran una vez que el spa inicia operación.</p>
          ) : alertas.length === 0 ? (
            <div className="notice ok">Ningún indicador lleva dos meses consecutivos fuera de su meta.</div>
          ) : (
            <div className="stack">
              {alertas.map((a) => (
                <div key={a.grupo} className="notice bad">
                  <strong>{a.titulo}</strong>: {a.indicadores.join(', ')} fuera de meta dos meses seguidos.
                  <div className="small">Acción: {a.acciones}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h2>Niveles de preparación</h2>
          <div className="stack section-gap small">
            {(['lista', 'ajustes', 'no_preparada'] as const).map((n) => (
              <div key={n} className="row">
                <NivelBadge nivel={n} />
                <span>
                  {n === 'lista' ? '80 % o más' : n === 'ajustes' ? '60 % a 79 %' : 'menos de 60 %'}: {NIVEL_INFO[n].descripcion}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Resumen({ ev }: { ev: ReturnType<typeof useEvaluaciones>['datos'][number] }) {
  const r = calcularResultado(ev.respuestas);
  const lanz = listaParaLanzamiento(ev.respuestas);
  const plan = planDeTrabajo(ev);
  const sinAccion = plan.filter((p) => accionIncompleta(p.accion)).length;

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="card-head">
          <div>
            <h2>Última verificación</h2>
            <p className="small muted">
              <Link to={`/evaluaciones/${ev.id}`}>{ev.nombre}</Link>
              {!ev.nombre.startsWith(ETAPAS[ev.etapa].nombre) && <> · {ETAPAS[ev.etapa].nombre} · {ev.fecha}</>}
            </p>
          </div>
          <NivelBadge nivel={r.nivel} />
        </div>
        <div className="row" style={{ gap: 24 }}>
          <Medidor valor={r.porcentaje} nivel={r.nivel} leyenda="general" />
          <div className="grid grid-3" style={{ flex: 1, minWidth: 200, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat">
              <b>{r.cumple}</b>
              <span>Cumplen</span>
            </div>
            <div className="stat">
              <b>{r.noCumple}</b>
              <span>No cumplen</span>
            </div>
            <div className="stat">
              <b>{r.pendiente}</b>
              <span>Pendientes</span>
            </div>
          </div>
        </div>
        <div className={`notice section-gap ${lanz.lista ? 'ok' : 'warn'}`}>
          {lanz.lista ? (
            <>Cumple la condición para avanzar al lanzamiento: 80 % o más en cada área y habilitación sanitaria aprobada.</>
          ) : (
            <>
              <strong>Aún no cumple la condición de lanzamiento.</strong>{' '}
              {lanz.areasPendientes.length > 0 && <>Áreas bajo 80 %: {lanz.areasPendientes.map((a) => a.area.nombre).join(', ')}. </>}
              {!lanz.habilitacion && <>Falta la habilitación sanitaria del Ministerio de Salud.</>}
            </>
          )}
        </div>
        {plan.length > 0 && (
          <p className="small section-gap">
            {plan.length} incumplimiento(s) en el plan de trabajo{sinAccion > 0 && <>, {sinAccion} sin acción correctiva completa</>}.{' '}
            <Link to="/plan-trabajo">Ver plan →</Link>
          </p>
        )}
      </div>
      <div className="card">
        <div className="card-head">
          <h2>Cumplimiento por área</h2>
          <span className="small muted">General: {porcentaje(r.porcentaje)}</span>
        </div>
        {r.areas.map((a) => (
          <FilaArea key={a.area.id} r={a} />
        ))}
      </div>
    </div>
  );
}
