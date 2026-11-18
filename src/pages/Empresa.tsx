import { Lista, PageHead } from '../components/ui';
import { EMPRESA } from '../content/documento';

export function Empresa() {
  return (
    <>
      <PageHead titulo={EMPRESA.nombre} subtitulo={`${EMPRESA.razonSocial} · Cédula jurídica ${EMPRESA.cedulaJuridica}`} />
      <div className="grid grid-2">
        <div className="card stack">
          <h2>Información general</h2>
          <p>{EMPRESA.historia}</p>
          <div className="grid grid-2">
            <div className="stat">
              <span>Eslogan</span>
              <b style={{ fontSize: '1rem' }}>{EMPRESA.eslogan}</b>
            </div>
            <div className="stat">
              <span>Ubicación</span>
              <b style={{ fontSize: '0.95rem' }}>{EMPRESA.ubicacion}</b>
            </div>
          </div>
        </div>
        <div className="card stack">
          <h2>Filosofía empresarial</h2>
          <div>
            <h3>Misión</h3>
            <p className="small">{EMPRESA.mision}</p>
          </div>
          <div>
            <h3>Visión</h3>
            <p className="small">{EMPRESA.vision}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-3 section-gap">
        <div className="card">
          <h2>Actividad productiva</h2>
          <div className="section-gap small">
            <Lista items={EMPRESA.actividad} />
          </div>
        </div>
        <div className="card">
          <h2>Soluciones ópticas</h2>
          <div className="section-gap small">
            <Lista items={EMPRESA.soluciones} />
          </div>
        </div>
        <div className="card stack">
          <h2>Industria</h2>
          <p className="small">{EMPRESA.industria}</p>
          <h3>Estructura societaria</h3>
          <div className="small">
            <Lista items={EMPRESA.sociedad} />
          </div>
        </div>
      </div>
    </>
  );
}
