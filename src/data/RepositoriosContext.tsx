import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { FirestoreEvaluacionRepository, FirestoreIndicadorRepository } from './firestoreRepositorios';
import type { EvaluacionRepository, IndicadorRepository } from './repositorios';

interface Repos {
  evaluaciones: EvaluacionRepository;
  indicadores: IndicadorRepository;
}

const Ctx = createContext<Repos | null>(null);

/** Inyección de dependencias: los componentes piden los repositorios al contexto, no los construyen. */
export function RepositoriosProvider({ children, repos }: { children: ReactNode; repos?: Repos }) {
  const value = useMemo<Repos>(
    () => repos ?? { evaluaciones: new FirestoreEvaluacionRepository(), indicadores: new FirestoreIndicadorRepository() },
    [repos],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRepositorios() {
  const r = useContext(Ctx);
  if (!r) throw new Error('useRepositorios debe usarse dentro de <RepositoriosProvider>');
  return r;
}
