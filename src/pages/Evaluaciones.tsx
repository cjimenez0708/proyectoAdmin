import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Cargando, ErrorDatos, NivelBadge, PageHead, porcentaje } from '../components/ui';
import { useEvaluaciones } from '../data/hooks';
import { useRepositorios } from '../data/RepositoriosContext';
import { calcularResultado } from '../domain/cumplimiento';
import { crearEvaluacion, ETAPAS } from '../domain/evaluacionFactory';
import type { Etapa } from '../domain/types';

const hoy = () => new Date().toLocaleDateString('en-CA');

export function Evaluaciones() {
  const { datos, cargando, error } = useEvaluaciones();
  const { evaluaciones } = useRepositorios();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<Etapa>('preparacion');
  const [fecha, setFecha] = useState(hoy());
  const [nombre, setNombre] = useState('');
  const [baseId, setBaseId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  async function crear(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setErrorForm('');
    try {
      const base = datos.find((d) => d.id === baseId)?.respuestas;
      const id = await evaluaciones.crear(crearEvaluacion({ etapa, fecha, nombre, creadoPor: usuario?.email ?? '', base }));
      navigate(`/evaluaciones/${id}`);
    } catch (err) {
      setErrorForm((err as Error).message);
      setGuardando(false);
    }
  }

  return (
    <>
      <PageHead
        titulo="Verificación"
        subtitulo="Cada aplicación de la herramienta califica los 39 enunciados como «Cumple», «No cumple» o pendiente, con base en evidencia de la clínica."
      />
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <form className="card stack" onSubmit={crear}>
          <h2>Nueva aplicación</h2>
          <label className="field">
            Momento de aplicación
            <select className="input" value={etapa} onChange={(e) => setEtapa(e.target.value as Etapa)}>
              {(Object.keys(ETAPAS) as Etapa[]).map((k) => (
                <option key={k} value={k}>
                  {ETAPAS[k].nombre}
                </option>
              ))}
            </select>
            <span className="small">{ETAPAS[etapa].descripcion}</span>
          </label>
          <label className="field">
            Fecha
            <input className="input" type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </label>
          <label className="field">
            Nombre (opcional)
            <input className="input" placeholder={`${ETAPAS[etapa].nombre} · ${fecha}`} value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </label>
          {datos.length > 0 && (
            <label className="field">
              Partir de una aplicación anterior
              <select className="input" value={baseId} onChange={(e) => setBaseId(e.target.value)}>
                <option value="">No, empezar con todo pendiente</option>
                {datos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
          {errorForm && <p className="error">{errorForm}</p>}
          <button className="btn" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear y calificar'}
          </button>
        </form>

        <div className="card">
          <h2>Aplicaciones registradas</h2>
          {cargando ? (
            <Cargando />
          ) : error ? (
            <ErrorDatos mensaje={error} />
          ) : datos.length === 0 ? (
            <p className="empty">Todavía no hay aplicaciones.</p>
          ) : (
            <div>
              {datos.map((ev) => {
                const r = calcularResultado(ev.respuestas);
                return (
                  <Link key={ev.id} to={`/evaluaciones/${ev.id}`} className="list-link">
                    <div>
                      <h3>{ev.nombre}</h3>
                      <p className="small muted">
                        {ETAPAS[ev.etapa].nombre} · {ev.fecha} · {r.pendiente} pendientes
                      </p>
                    </div>
                    <div className="row">
                      <strong style={{ color: 'var(--navy)' }}>{porcentaje(r.porcentaje)}</strong>
                      <NivelBadge nivel={r.nivel} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
