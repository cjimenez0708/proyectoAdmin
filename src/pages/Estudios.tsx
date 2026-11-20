import { useState } from 'react';
import { colones, GraficoBarras, Lista, PageHead, Tabs } from '../components/ui';
import { AMBIENTAL, LEGAL, MERCADO, ORGANIZACIONAL, TECNICO } from '../content/documento';
import { EstudioFinanciero } from './EstudioFinanciero';

type Tab = 'mercado' | 'tecnico' | 'organizacional' | 'legal' | 'financiero';

export function Estudios() {
  const [tab, setTab] = useState<Tab>('mercado');
  return (
    <>
      <PageHead titulo="Estudios" subtitulo="Estudios de mercado, técnico, organizacional, legal, ambiental y financiero de Spa Visual." />
      <Tabs
        activo={tab}
        onChange={setTab}
        items={[
          { id: 'mercado', label: 'Mercado' },
          { id: 'tecnico', label: 'Técnico' },
          { id: 'organizacional', label: 'Organizacional' },
          { id: 'legal', label: 'Legal y ambiental' },
          { id: 'financiero', label: 'Financiero' },
        ]}
      />
      {tab === 'mercado' && <Mercado />}
      {tab === 'tecnico' && <Tecnico />}
      {tab === 'organizacional' && <Organizacional />}
      {tab === 'legal' && <Legal />}
      {tab === 'financiero' && <EstudioFinanciero />}
    </>
  );
}

function Mercado() {
  return (
    <>
      <div className="card">
        <div className="card-head">
          <h2>Principales hallazgos de la encuesta</h2>
          <span className="small muted">{MERCADO.muestra}</span>
        </div>
        <div className="grid grid-4">
          {MERCADO.claves.map((c) => (
            <div className="stat" key={c.etiqueta}>
              <b>{c.valor}</b>
              <span>{c.etiqueta}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-2 section-gap">
        {MERCADO.graficos.map((g) => (
          <div className="card" key={g.titulo}>
            <h3 style={{ marginBottom: 10 }}>{g.titulo}</h3>
            <GraficoBarras datos={g.datos} />
          </div>
        ))}
      </div>
      <div className="grid grid-2 section-gap">
        <div className="card">
          <h2>Competencia</h2>
          <div className="stack section-gap">
            {MERCADO.competencia.map((c) => (
              <div key={c.nombre}>
                <div className="row">
                  <strong>{c.nombre}</strong>
                  <span className="badge neutral">{c.tipo}</span>
                </div>
                <p className="small muted">{c.detalle}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Segmentación</h2>
          <div className="stack section-gap">
            {MERCADO.segmentos.map((s) => (
              <div key={s.nombre}>
                <div className="row">
                  <strong>{s.nombre}</strong>
                  <span className={`badge ${s.prioridad === 'Principal' ? 'ok' : 'neutral'}`}>{s.prioridad}</span>
                </div>
                <p className="small muted">{s.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-2 section-gap">
        <div className="card">
          <h2>Modalidades de contratación</h2>
          <div className="small section-gap">
            <Lista items={MERCADO.modalidades} />
          </div>
        </div>
        <div className="card">
          <h2>Proceso comercial</h2>
          <ol className="small section-gap" style={{ paddingLeft: '1.2rem' }}>
            {MERCADO.procesoComercial.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

function Tecnico() {
  const totalFijos = TECNICO.gastosFijos.reduce((s, g) => s + g[3], 0);
  const totalPersonal = TECNICO.personal.reduce((s, p) => s + p[4], 0);
  const totalEquipos = TECNICO.equipos.reduce((s, e) => s + e.monto, 0);
  return (
    <>
      <div className="card">
        <h2>Escala del proyecto</h2>
        <div className="grid grid-3 section-gap">
          {TECNICO.escala.map((d) => (
            <div className="stat" key={d.etiqueta}>
              <b>{d.valor}</b>
              <span>{d.etiqueta}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-2 section-gap">
        <div className="card">
          <h2>Proceso productivo</h2>
          <table className="section-gap">
            <thead>
              <tr>
                <th>Etapa</th>
                <th>Encargado</th>
              </tr>
            </thead>
            <tbody>
              {TECNICO.proceso.map(([e, r], i) => (
                <tr key={e}>
                  <td>
                    {i + 1}. {e}
                  </td>
                  <td>{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card stack">
          <h2>Insumos</h2>
          <div className="small">
            <strong>Tratamiento:</strong> {TECNICO.insumos.tratamiento.join(', ')}.
          </div>
          <div className="small">
            <strong>Bioseguridad:</strong> {TECNICO.insumos.bioseguridad.join(', ')}.
          </div>
          <div className="small">
            <strong>Limpieza y desinfección:</strong> {TECNICO.insumos.limpieza.join(', ')}.
          </div>
          <h3>Remodelación</h3>
          <div className="small">
            <Lista items={TECNICO.remodelacion} />
          </div>
        </div>
      </div>
      <div className="card section-gap table-wrap">
        <h2>Inversión en equipo y tecnología</h2>
        <table className="section-gap">
          <thead>
            <tr>
              <th>Equipo</th>
              <th className="num">Valor</th>
              <th className="num">Vida útil</th>
              <th className="num">Depreciación anual</th>
            </tr>
          </thead>
          <tbody>
            {TECNICO.equipos.map((e) => (
              <tr key={e.nombre}>
                <td>{e.nombre}</td>
                <td className="num">{colones(e.monto)}</td>
                <td className="num">{e.vidaUtil} años</td>
                <td className="num">{colones(e.depreciacion)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="num">{colones(totalEquipos)}</td>
              <td />
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="grid grid-2 section-gap">
        <div className="card table-wrap">
          <h2>Gastos fijos (spa cubre 50 %)</h2>
          <table className="section-gap">
            <thead>
              <tr>
                <th>Rubro</th>
                <th className="num">Mensual</th>
                <th className="num">Spa 50 %</th>
                <th className="num">Anual</th>
              </tr>
            </thead>
            <tbody>
              {TECNICO.gastosFijos.map(([n, m, s, a]) => (
                <tr key={n}>
                  <td>{n}</td>
                  <td className="num">{colones(m)}</td>
                  <td className="num">{colones(s)}</td>
                  <td className="num">{colones(a)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Total anual</td>
                <td className="num">{colones(totalFijos)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="card table-wrap">
          <h2>Personal (50 % de la jornada al spa)</h2>
          <table className="section-gap">
            <thead>
              <tr>
                <th>Cargo</th>
                <th className="num">Salario bruto</th>
                <th className="num">50 % spa</th>
                <th className="num">Gasto mensual</th>
                <th className="num">Gasto anual</th>
              </tr>
            </thead>
            <tbody>
              {TECNICO.personal.map(([c, b, s, m, a]) => (
                <tr key={c}>
                  <td>{c}</td>
                  <td className="num">{colones(b)}</td>
                  <td className="num">{colones(s)}</td>
                  <td className="num">{colones(m)}</td>
                  <td className="num">{colones(a)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4}>Total anual</td>
                <td className="num">{colones(totalPersonal)}</td>
              </tr>
            </tfoot>
          </table>
          <p className="small muted section-gap">Gasto mensual incluye cargas sociales y póliza del INS. Costos variables: 15 % de las ventas.</p>
        </div>
      </div>
    </>
  );
}

function Organizacional() {
  return (
    <>
      <div className="grid grid-2">
        <div className="card">
          <h2>Organigrama del spa</h2>
          <div className="section-gap" style={{ display: 'grid', justifyItems: 'center', gap: 0 }}>
            <div className="stat" style={{ textAlign: 'center', minWidth: 220 }}>
              <b style={{ fontSize: '1rem' }}>Optometrista y Esteticista del Spa</b>
            </div>
            <div style={{ width: 2, height: 18, background: 'var(--line)' }} />
            <div style={{ width: '70%', height: 2, background: 'var(--line)' }} />
            <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
              {['Ventas y Asistente Esteticista del Spa', 'Secretario'].map((p) => (
                <div key={p} style={{ display: 'grid', justifyItems: 'center', flex: 1 }}>
                  <div style={{ width: 2, height: 18, background: 'var(--line)' }} />
                  <div className="stat" style={{ textAlign: 'center' }}>
                    <b style={{ fontSize: '0.92rem' }}>{p}</b>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card stack">
          <h2>Procedimientos administrativos</h2>
          {ORGANIZACIONAL.procedimientos.map(([t, d]) => (
            <div key={t}>
              <strong className="small">{t}</strong>
              <p className="small muted">{d}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-3 section-gap">
        {ORGANIZACIONAL.puestos.map((p) => (
          <div className="card stack" key={p.codigo}>
            <div>
              <span className="badge neutral">{p.codigo}</span>
              <h2 style={{ marginTop: 8 }}>{p.nombre}</h2>
            </div>
            <p className="small">{p.objetivo}</p>
            <p className="small muted">
              <strong>Reporta a:</strong> {p.reportaA}
            </p>
            <p className="small muted">
              <strong>Perfil:</strong> {p.formacion}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-2 section-gap">
        <div className="card stack">
          <h2>Figura jurídica</h2>
          <p className="small">{ORGANIZACIONAL.figuraJuridica}</p>
        </div>
        <div className="card stack">
          <h2>Capacitación</h2>
          <p className="small">{ORGANIZACIONAL.capacitacion}</p>
        </div>
      </div>
    </>
  );
}

function Legal() {
  return (
    <>
      <div className="card table-wrap">
        <h2>Estudio legal</h2>
        <table className="section-gap">
          <thead>
            <tr>
              <th>Tema</th>
              <th>Norma o institución</th>
              <th>Qué se debe verificar</th>
            </tr>
          </thead>
          <tbody>
            {LEGAL.map((l) => (
              <tr key={l.tema}>
                <td>
                  <strong>{l.tema}</strong>
                </td>
                <td className="small">{l.norma}</td>
                <td className="small">{l.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card table-wrap">
        <h2>Medidas ambientales</h2>
        <p className="small muted">{AMBIENTAL.normas.join(' · ')}</p>
        <table className="section-gap">
          <thead>
            <tr>
              <th>Aspecto</th>
              <th>Medida de gestión</th>
              <th>Indicador</th>
            </tr>
          </thead>
          <tbody>
            {AMBIENTAL.medidas.map(([a, m, i]) => (
              <tr key={a}>
                <td>
                  <strong>{a}</strong>
                </td>
                <td>{m}</td>
                <td className="small">{i}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
