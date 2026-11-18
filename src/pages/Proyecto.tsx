import { Lista, PageHead } from '../components/ui';
import { PROYECTO } from '../content/documento';

export function Proyecto() {
  return (
    <>
      <PageHead titulo="Proyecto Spa Visual" subtitulo="Nueva línea de servicios para el cuidado del ojo seco, los orzuelos y el cansancio visual." />
      <div className="card stack">
        <h2>Descripción</h2>
        <p>{PROYECTO.descripcion}</p>
        <p className="small muted">{PROYECTO.alcance}</p>
      </div>
      <div className="grid grid-3 section-gap">
        {PROYECTO.servicios.map((s) => (
          <div className="card" key={s.nombre}>
            <h2>{s.nombre}</h2>
            <div className="section-gap small">
              <Lista items={s.procedimientos} />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-2 section-gap">
        <div className="card stack">
          <h2>Objetivo general</h2>
          <p>{PROYECTO.objetivoGeneral}</p>
          <h3>Objetivos específicos</h3>
          <ol className="small" style={{ margin: 0, paddingLeft: '1.2rem' }}>
            {PROYECTO.objetivosEspecificos.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ol>
        </div>
        <div className="card stack">
          <h2>Oportunidad de mercado</h2>
          <div className="small">
            <Lista items={PROYECTO.oportunidades} />
          </div>
        </div>
      </div>
    </>
  );
}
