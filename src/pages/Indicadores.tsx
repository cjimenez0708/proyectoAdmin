import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Cargando, colones, ErrorDatos, PageHead } from '../components/ui';
import { useIndicadores } from '../data/hooks';
import { useRepositorios } from '../data/RepositoriosContext';
import { alertasConsecutivas, calcularIndicadores, registroVacio, type ResultadoIndicador } from '../domain/indicadores';
import type { RegistroMensual } from '../domain/types';

type CampoNum = Exclude<keyof RegistroMensual, 'id' | 'mes'>;

const GRUPOS: { titulo: string; campos: [CampoNum, string][] }[] = [
  {
    titulo: 'Demanda',
    campos: [
      ['mesOperacion', 'Mes de operación (1 = primer mes)'],
      ['sesionesRealizadas', 'Sesiones realizadas'],
      ['sesionesDisponibles', 'Sesiones disponibles'],
      ['pacientesRecomendados', 'Pacientes a quienes se recomendó'],
      ['pacientesAgendaron', 'Pacientes que agendaron'],
    ],
  },
  {
    titulo: 'Retención y satisfacción',
    campos: [
      ['clientesPrimeraVez', 'Clientes atendidos por primera vez'],
      ['clientesSegundaSesion60d', 'De ellos, con 2.ª sesión en 60 días'],
      ['encuestasRespondidas', 'Encuestas respondidas'],
      ['encuestasCon4o5', 'Encuestas con 4 o 5 de 5'],
      ['resenasGoogle', 'Calificación promedio en Google (0–5)'],
    ],
  },
  {
    titulo: 'Económico',
    campos: [
      ['ingresos', 'Ingresos del spa (₡)'],
      ['precioPromedioDefinido', 'Precio promedio definido (₡)'],
      ['gastoReal', 'Gasto real (₡)'],
      ['gastoPresupuestado', 'Gasto presupuestado (₡)'],
    ],
  },
  {
    titulo: 'Clientes nuevos por canal',
    campos: [
      ['nuevosConsulta', 'Consulta'],
      ['nuevosRedes', 'Redes'],
      ['nuevosReferidos', 'Referidos'],
      ['nuevosAlianzas', 'Alianzas'],
    ],
  },
];

const mesActual = () => new Date().toLocaleDateString('en-CA').slice(0, 7);

function formatear(i: ResultadoIndicador) {
  if (i.valor === null) return '—';
  if (i.unidad === '₡') return colones(i.valor);
  if (i.unidad === '%') return `${i.valor.toLocaleString('es-CR')} %`;
  if (i.unidad === '/5') return `${i.valor.toLocaleString('es-CR')} / 5`;
  return i.valor.toLocaleString('es-CR');
}

export function Indicadores() {
  const { datos, cargando, error } = useIndicadores();
  const { indicadores } = useRepositorios();
  const { usuario } = useAuth();
  const [mes, setMes] = useState(mesActual());
  const [form, setForm] = useState<RegistroMensual>(registroVacio(mesActual()));
  const [estado, setEstado] = useState('');

  const existente = datos.find((d) => d.mes === mes);
  useEffect(() => {
    setForm(existente ?? { ...registroVacio(mes), mesOperacion: (datos.at(-1)?.mesOperacion ?? 0) + 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, existente]);

  if (cargando) return <Cargando />;
  if (error) return <ErrorDatos mensaje={error} />;

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEstado('Guardando…');
    try {
      await indicadores.guardar({ ...form, id: mes, mes }, usuario?.email ?? '');
      setEstado('Guardado');
    } catch (err) {
      setEstado(`Error: ${(err as Error).message}`);
    }
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar el registro de ${mes}?`)) return;
    await indicadores.eliminar(mes);
  }

  const resultados = calcularIndicadores(form);
  const hasta = datos.filter((d) => d.mes <= mes);
  const alertas = alertasConsecutivas(hasta);

  return (
    <>
      <PageHead
        titulo="Indicadores de seguimiento"
        subtitulo="Registro mensual para medir demanda, satisfacción, desempeño económico y avance (apartados 19.2 y 19.3)."
      >
        <label className="field">
          Mes
          <input className="input" type="month" value={mes} onChange={(e) => e.target.value && setMes(e.target.value)} />
        </label>
      </PageHead>

      {datos.length > 0 && (
        <div className="row" style={{ marginBottom: 16 }}>
          <span className="small muted">Meses registrados:</span>
          {datos.map((d) => (
            <button key={d.mes} className={`btn ${d.mes === mes ? '' : 'secondary'}`} style={{ padding: '4px 10px' }} onClick={() => setMes(d.mes)}>
              {d.mes}
            </button>
          ))}
        </div>
      )}

      {alertas.map((a) => (
        <div key={a.grupo} className="notice bad" style={{ marginBottom: 12 }}>
          <strong>{a.titulo}</strong> — {a.indicadores.join(', ')} no alcanzaron la meta dos meses consecutivos.
          <div className="small">Acciones correctivas: {a.acciones}</div>
        </div>
      ))}

      <div className="card">
        <div className="card-head">
          <h2>Resultados de {mes}</h2>
          {!existente && <span className="badge neutral">Sin guardar</span>}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Fórmula</th>
                <th className="num">Valor</th>
                <th>Meta</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((i) => (
                <tr key={i.id}>
                  <td>
                    <strong>{i.nombre}</strong>
                    <div className="small muted">{i.responsable}</div>
                  </td>
                  <td className="small">{i.formula}</td>
                  <td className="num">{formatear(i)}</td>
                  <td className="small">{i.meta}</td>
                  <td>
                    {i.cumple === null ? (
                      <span className="badge neutral">Sin datos</span>
                    ) : i.cumple ? (
                      <span className="badge ok">En meta</span>
                    ) : (
                      <span className="badge bad">Fuera de meta</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted section-gap">
          El indicador «Cumplimiento de la herramienta de verificación» se calcula en la sección Verificación (meta: 80 % o más en cada área).
        </p>
      </div>

      <form className="card" onSubmit={guardar}>
        <div className="card-head">
          <h2>Datos del mes</h2>
          <div className="row">
            {estado && <span className="saving">{estado}</span>}
            {existente && (
              <button type="button" className="btn danger" onClick={eliminar}>
                Eliminar mes
              </button>
            )}
            <button className="btn">Guardar</button>
          </div>
        </div>
        <div className="grid grid-2">
          {GRUPOS.map((g) => (
            <fieldset key={g.titulo} className="stack" style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
              <legend className="small" style={{ fontWeight: 600, color: 'var(--navy)' }}>
                {g.titulo}
              </legend>
              {g.campos.map(([k, label]) => (
                <label className="field" key={k}>
                  {label}
                  <input
                    className="input"
                    type="number"
                    min={k === 'mesOperacion' ? 1 : 0}
                    max={k === 'resenasGoogle' ? 5 : undefined}
                    step={k === 'resenasGoogle' ? 0.1 : 1}
                    value={form[k]}
                    onChange={(e) => {
                      setEstado('');
                      setForm({ ...form, [k]: Number(e.target.value) });
                    }}
                  />
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      </form>
    </>
  );
}
