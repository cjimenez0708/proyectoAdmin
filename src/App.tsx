import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { Cargando } from './components/ui';
import { RepositoriosProvider } from './data/RepositoriosContext';
import { Empresa } from './pages/Empresa';
import { EvaluacionDetalle } from './pages/EvaluacionDetalle';
import { Evaluaciones } from './pages/Evaluaciones';
import { Estudios } from './pages/Estudios';
import { Indicadores } from './pages/Indicadores';
import { Inicio } from './pages/Inicio';
import { Login } from './pages/Login';
import { PlanMercadeo } from './pages/PlanMercadeo';
import { PlanTrabajo } from './pages/PlanTrabajo';
import { Proyecto } from './pages/Proyecto';

function Rutas() {
  const { usuario, cargando } = useAuth();
  if (cargando) return <Cargando texto="Iniciando…" />;
  if (!usuario) return <Login />;
  return (
    <RepositoriosProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="evaluaciones" element={<Evaluaciones />} />
          <Route path="evaluaciones/:id" element={<EvaluacionDetalle />} />
          <Route path="plan-trabajo" element={<PlanTrabajo />} />
          <Route path="indicadores" element={<Indicadores />} />
          <Route path="empresa" element={<Empresa />} />
          <Route path="proyecto" element={<Proyecto />} />
          <Route path="estudios" element={<Estudios />} />
          <Route path="plan-mercadeo" element={<PlanMercadeo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </RepositoriosProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </BrowserRouter>
  );
}
