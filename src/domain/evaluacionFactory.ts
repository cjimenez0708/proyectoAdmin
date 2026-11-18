import { ENUNCIADOS } from './catalogo';
import type { Etapa, NuevaEvaluacion, Respuesta } from './types';

export const ETAPAS: Record<Etapa, { nombre: string; descripcion: string }> = {
  preparacion: {
    nombre: 'Preparación',
    descripcion: 'Primera verificación, durante la etapa de preparación (meses 1 y 2).',
  },
  prelanzamiento: {
    nombre: 'Antes del lanzamiento',
    descripcion: 'Condición para iniciar la atención: 80 % o más en cada área y habilitación sanitaria aprobada.',
  },
  trimestral: {
    nombre: 'Seguimiento trimestral',
    descripcion: 'Cada tres meses durante el primer año de operación.',
  },
};

export const respuestaVacia = (): Respuesta => ({ estado: 'pendiente', evidencia: '' });

/**
 * Factory: crea una evaluación nueva con los 39 enunciados del catálogo sin calificar.
 * Si se indica una evaluación anterior, copia sus calificaciones como punto de partida
 * (útil para los seguimientos trimestrales).
 */
export function crearEvaluacion(params: {
  etapa: Etapa;
  fecha: string;
  creadoPor: string;
  nombre?: string;
  base?: Record<string, Respuesta>;
}): NuevaEvaluacion {
  const respuestas: Record<string, Respuesta> = {};
  for (const e of ENUNCIADOS) {
    const previa = params.base?.[e.id];
    respuestas[e.id] = previa ? structuredClone(previa) : respuestaVacia();
  }
  return {
    nombre: params.nombre?.trim() || `${ETAPAS[params.etapa].nombre} · ${params.fecha}`,
    etapa: params.etapa,
    fecha: params.fecha,
    creadoPor: params.creadoPor,
    respuestas,
  };
}
