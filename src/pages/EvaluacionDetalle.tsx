import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Cargando, ErrorDatos, FilaArea, Medidor, NivelBadge, PageHead, porcentaje, Tabs } from '../components/ui';
import { useEvaluacion } from '../data/hooks';
import { useRepositorios } from '../data/RepositoriosContext';
import { AREAS, enunciadosDeArea } from '../domain/catalogo';
import { calcularResultado } from '../domain/cumplimiento';
import { ETAPAS, respuestaVacia } from '../domain/evaluacionFactory';
import type { AccionCorrectiva, AreaId, Enunciado, Estado, Respuesta } from '../domain/types';

const ESTADOS: { id: Estado; label: string }[] = [
  { id: 'cumple', label: 'Cumple' },
  { id: 'no_cumple', label: 'No cumple' },
  { id: 'pendiente', label: 'Pendiente' },
];

const accionVacia = (): AccionCorrectiva => ({ descripcion: '', responsable: '', recursos: '', fechaCumplimiento: '', completada: false });

export function EvaluacionDetalle() {
  const { id } = useParams();
  const { datos: ev, cargando, error } = useEvaluacion(id);
  const { evaluaciones } = useRepositorios();
  const { nombre } = useAuth();
  const navigate = useNavigate();
  const [area, setArea] = useState<AreaId | 'resumen'>('resumen');
  const [errorGuardar, setErrorGuardar] = useState('');

  if (cargando) return <Cargando />;
  if (error) return <ErrorDatos mensaje={error} />;
  if (!ev) return <div className="card empty">La verificación no existe o fue eliminada.</div>;

  const r = calcularResultado(ev.respuestas);

  const guardar = async (enunciadoId: string, resp: Respuesta) => {
    setErrorGuardar('');
    try {
      await evaluaciones.actualizarRespuesta(ev.id, enunciadoId, resp, nombre);
    } catch (e) {
      setErrorGuardar((e as Error).message);
    }
  };

  const eliminar = async () => {
    if (!window.confirm(`¿Eliminar «${ev.nombre}»? Esta acción no se puede deshacer.`)) return;
    await evaluaciones.eliminar(ev.id);
    navigate('/evaluaciones');
  };

  return (
    <>
      <PageHead titulo={ev.nombre} subtitulo={`${ETAPAS[ev.etapa].nombre} · ${ev.fecha} · creada por ${ev.creadoPor}`}>
        <button className="btn danger" onClick={eliminar}>
          Eliminar
        </button>
      </PageHead>
      {errorGuardar && <div className="notice bad" style={{ marginBottom: 12 }}>No se guardó el cambio: {errorGuardar}</div>}

      <Tabs
        activo={area}
        onChange={setArea}
        items={[
          { id: 'resumen' as const, label: 'Resumen' },
          ...r.areas.map((a) => ({
            id: a.area.id,
            label: (
              <>
                {a.area.nombre} <span className={`badge ${a.nivel}`}>{porcentaje(a.porcentaje)}</span>
              </>
            ),
          })),
        ]}
      />

      {area === 'resumen' ? (
        <div className="grid grid-2">
          <div className="card row" style={{ gap: 24 }}>
            <Medidor valor={r.porcentaje} nivel={r.nivel} leyenda="general" tam={150} />
            <div className="stack">
              <NivelBadge nivel={r.nivel} />
              <p>
                <strong>{r.cumple}</strong> de {r.total} enunciados cumplen.
              </p>
              <p className="small muted">
                {r.noCumple} no cumplen y {r.pendiente} siguen pendientes de confirmar. Los pendientes cuentan en el total, pero no como cumplidos.
              </p>
            </div>
          </div>
          <div className="card">
            {r.areas.map((a) => (
              <FilaArea key={a.area.id} r={a} />
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-head">
            <div>
              <h2>{AREAS.find((a) => a.id === area)!.nombre}</h2>
              <p className="small muted">Apartado {AREAS.find((a) => a.id === area)!.apartado} · califique con base en evidencia (documentos, cotizaciones, permisos, registros u observación directa).</p>
            </div>
          </div>
          {enunciadosDeArea(area).map((e) => (
            <ItemEnunciado key={e.id} enunciado={e} respuesta={ev.respuestas[e.id] ?? respuestaVacia()} onGuardar={(resp) => guardar(e.id, resp)} />
          ))}
        </div>
      )}
    </>
  );
}

function ItemEnunciado({ enunciado, respuesta, onGuardar }: { enunciado: Enunciado; respuesta: Respuesta; onGuardar: (r: Respuesta) => void }) {
  const [evidencia, setEvidencia] = useState(respuesta.evidencia);
  const [accion, setAccion] = useState<AccionCorrectiva>(respuesta.accion ?? accionVacia());

  // Sincroniza con cambios remotos (otra persona editando en tiempo real).
  useEffect(() => setEvidencia(respuesta.evidencia), [respuesta.evidencia]);
  useEffect(() => setAccion(respuesta.accion ?? accionVacia()), [respuesta.accion]);

  const cambiarEstado = (estado: Estado) =>
    onGuardar({
      estado,
      evidencia,
      ...(estado === 'no_cumple' ? { accion: respuesta.accion ?? accionVacia() } : {}),
    });

  const guardarEvidencia = () => {
    if (evidencia !== respuesta.evidencia) onGuardar({ ...respuesta, evidencia });
  };

  const guardarAccion = (a: AccionCorrectiva) => {
    if (JSON.stringify(a) !== JSON.stringify(respuesta.accion ?? accionVacia())) onGuardar({ ...respuesta, accion: a });
  };

  const campo = (k: keyof AccionCorrectiva) => ({
    value: accion[k] as string,
    onChange: (e: { target: { value: string } }) => setAccion({ ...accion, [k]: e.target.value }),
    onBlur: () => guardarAccion(accion),
  });

  return (
    <div className={`item ${respuesta.estado}`}>
      <div className="item-top">
        <p>
          <span className="item-num">{enunciado.numero}.</span>
          {enunciado.texto}
        </p>
        <div className="seg" role="radiogroup" aria-label="Calificación">
          {ESTADOS.map((s) => (
            <button
              key={s.id}
              role="radio"
              aria-checked={respuesta.estado === s.id}
              className={`${s.id} ${respuesta.estado === s.id ? 'on' : ''}`}
              onClick={() => respuesta.estado !== s.id && cambiarEstado(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="item-body">
        <label className="field">
          Evidencia
          <textarea
            className="input"
            rows={2}
            placeholder="Documento, cotización, permiso, registro u observación que respalda la calificación"
            value={evidencia}
            onChange={(e) => setEvidencia(e.target.value)}
            onBlur={guardarEvidencia}
          />
        </label>
        {respuesta.estado === 'no_cumple' && (
          <div className="accion">
            <label className="field full">
              Acción correctiva
              <textarea className="input" rows={2} {...campo('descripcion')} />
            </label>
            <label className="field">
              Responsable
              <input className="input" {...campo('responsable')} />
            </label>
            <label className="field">
              Recursos necesarios
              <input className="input" {...campo('recursos')} />
            </label>
            <label className="field">
              Fecha de cumplimiento
              <input
                className="input"
                type="date"
                value={accion.fechaCumplimiento}
                onChange={(e) => {
                  const a = { ...accion, fechaCumplimiento: e.target.value };
                  setAccion(a);
                  guardarAccion(a);
                }}
              />
            </label>
            <label className="row small" style={{ alignSelf: 'end' }}>
              <input
                type="checkbox"
                checked={accion.completada}
                onChange={(e) => {
                  const a = { ...accion, completada: e.target.checked };
                  setAccion(a);
                  guardarAccion(a);
                }}
              />
              Acción completada
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
