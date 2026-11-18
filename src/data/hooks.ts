import { useEffect, useState } from 'react';
import type { Evaluacion, RegistroMensual } from '../domain/types';
import { useRepositorios } from './RepositoriosContext';

/** Observer: hooks que se suscriben a cambios en tiempo real y se desuscriben al desmontar. */
interface Estado<T> {
  datos: T;
  cargando: boolean;
  error: string | null;
}

function useSuscripcion<T>(inicial: T, suscribir: (cb: (d: T) => void, err: (e: Error) => void) => () => void, deps: unknown[]) {
  const [estado, setEstado] = useState<Estado<T>>({ datos: inicial, cargando: true, error: null });
  useEffect(() => {
    setEstado((s) => ({ ...s, cargando: true }));
    return suscribir(
      (datos) => setEstado({ datos, cargando: false, error: null }),
      (e) => setEstado((s) => ({ ...s, cargando: false, error: e.message })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return estado;
}

export function useEvaluaciones() {
  const { evaluaciones } = useRepositorios();
  return useSuscripcion<Evaluacion[]>([], (cb, err) => evaluaciones.observarTodas(cb, err), [evaluaciones]);
}

export function useEvaluacion(id: string | undefined) {
  const { evaluaciones } = useRepositorios();
  return useSuscripcion<Evaluacion | null>(
    null,
    (cb, err) => (id ? evaluaciones.observar(id, cb, err) : (cb(null), () => {})),
    [evaluaciones, id],
  );
}

export function useIndicadores() {
  const { indicadores } = useRepositorios();
  return useSuscripcion<RegistroMensual[]>([], (cb, err) => indicadores.observarTodos(cb, err), [indicadores]);
}
