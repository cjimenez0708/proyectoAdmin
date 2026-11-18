import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const NAV = [
  {
    titulo: 'Herramienta',
    links: [
      ['/', 'Inicio'],
      ['/evaluaciones', 'Verificación'],
      ['/plan-trabajo', 'Plan de trabajo'],
      ['/indicadores', 'Indicadores de seguimiento'],
    ],
  },
  {
    titulo: 'Información',
    links: [
      ['/empresa', 'Empresa'],
      ['/proyecto', 'Proyecto Spa Visual'],
      ['/estudios', 'Estudios'],
      ['/plan-mercadeo', 'Plan de mercadeo'],
    ],
  },
];

export function Layout() {
  const { usuario, salir } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setAbierto(false), [pathname]);

  return (
    <div className="shell">
      <header className="topbar">
        <button aria-label="Abrir menú" onClick={() => setAbierto(true)}>
          ☰
        </button>
        <strong>Spa Visual</strong>
      </header>
      {abierto && <div className="backdrop" onClick={() => setAbierto(false)} />}
      <aside className={`sidebar ${abierto ? 'open' : ''}`}>
        <div className="brand">
          <img src="/logo.jpeg" alt="Clínica Preventiva Visual" />
          <div>
            <strong>Spa Visual</strong>
            <span>Clínica Preventiva Visual</span>
          </div>
        </div>
        {NAV.map((g) => (
          <nav className="nav-group" key={g.titulo}>
            <div className="nav-title">{g.titulo}</div>
            {g.links.map(([to, label]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                {label}
              </NavLink>
            ))}
          </nav>
        ))}
        <div className="sidebar-foot">
          <span>{usuario?.email}</span>
          <button className="btn ghost" onClick={() => salir()}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
