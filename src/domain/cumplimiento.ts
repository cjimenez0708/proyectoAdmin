import { AREAS, ENUNCIADOS, ENUNCIADO_HABILITACION_SANITARIA } from './catalogo';
import type { AccionCorrectiva, Enunciado, Evaluacion, Nivel, Respuesta, ResultadoArea, ResultadoGeneral } from './types';

/**
 * Niveles de lectura del apartado 17.1:
 *  - 80 % o más: área lista para la implementación
 *  - 60 % a 79 %: se puede avanzar con ajustes en un plazo definido
 *  - menos de 60 %: no preparada; resolver incumplimientos antes del lanzamiento
 * Se modela como una tabla de umbrales (orden descendente) para que el criterio quede en un solo lugar.
 */
export const UMBRALES: { minimo: number; nivel: Nivel }[] = [
  { minimo: 80, nivel: 'lista' },
  { minimo: 60, nivel: 'ajustes' },
  { minimo: 0, nivel: 'no_preparada' },
];

export const NIVEL_INFO: Record<Nivel, { etiqueta: string; descripcion: string }> = {
  lista: { etiqueta: 'Lista', descripcion: 'El área está lista para la implementación.' },
  ajustes: {
    etiqueta: 'Avanzar con ajustes',
    descripcion: 'Se puede avanzar, pero con ajustes que deben atenderse en un plazo definido.',
  },
  no_preparada: {
    etiqueta: 'No preparada',
    descripcion: 'Los incumplimientos deben resolverse antes del lanzamiento.',
  },
};

export function clasificarNivel(porcentaje: number): Nivel {
  return (UMBRALES.find((u) => porcentaje >= u.minimo) ?? UMBRALES[UMBRALES.length - 1]).nivel;
}

const estadoDe = (respuestas: Record<string, Respuesta>, id: string) => respuestas[id]?.estado ?? 'pendiente';

const redondear = (n: number) => Math.round(n * 10) / 10;

/** Porcentaje = enunciados que cumplen / total de enunciados (los pendientes cuentan en el total). */
export function calcularResultado(respuestas: Record<string, Respuesta>): ResultadoGeneral {
  const areas: ResultadoArea[] = AREAS.map((area) => {
    const items = ENUNCIADOS.filter((e) => e.area === area.id);
    const cumple = items.filter((e) => estadoDe(respuestas, e.id) === 'cumple').length;
    const noCumple = items.filter((e) => estadoDe(respuestas, e.id) === 'no_cumple').length;
    const porcentaje = items.length ? redondear((cumple / items.length) * 100) : 0;
    return {
      area,
      total: items.length,
      cumple,
      noCumple,
      pendiente: items.length - cumple - noCumple,
      porcentaje,
      nivel: clasificarNivel(porcentaje),
    };
  });
  const total = ENUNCIADOS.length;
  const cumple = areas.reduce((s, a) => s + a.cumple, 0);
  const noCumple = areas.reduce((s, a) => s + a.noCumple, 0);
  const porcentaje = redondear((cumple / total) * 100);
  return { areas, total, cumple, noCumple, pendiente: total - cumple - noCumple, porcentaje, nivel: clasificarNivel(porcentaje) };
}

/**
 * Condición para avanzar desde la etapa de preparación (apartado 19.1, Tabla 9):
 * 80 % o más en cada área de la herramienta y habilitación sanitaria aprobada.
 */
export function listaParaLanzamiento(respuestas: Record<string, Respuesta>) {
  const r = calcularResultado(respuestas);
  const areasPendientes = r.areas.filter((a) => a.porcentaje < 80);
  const habilitacion = estadoDe(respuestas, ENUNCIADO_HABILITACION_SANITARIA) === 'cumple';
  return { lista: areasPendientes.length === 0 && habilitacion, areasPendientes, habilitacion };
}

export interface ItemPlanTrabajo {
  evaluacion: Pick<Evaluacion, 'id' | 'nombre' | 'fecha'>;
  enunciado: Enunciado;
  accion?: AccionCorrectiva;
}

/** Convierte la verificación en un plan de trabajo: cada "No cumple" con su acción correctiva (17.1). */
export function planDeTrabajo(evaluacion: Evaluacion): ItemPlanTrabajo[] {
  return ENUNCIADOS.filter((e) => estadoDe(evaluacion.respuestas, e.id) === 'no_cumple').map((enunciado) => ({
    evaluacion: { id: evaluacion.id, nombre: evaluacion.nombre, fecha: evaluacion.fecha },
    enunciado,
    accion: evaluacion.respuestas[enunciado.id]?.accion,
  }));
}

/** Una acción está incompleta si le falta alguno de los cuatro datos que exige el apartado 17.1. */
export function accionIncompleta(a?: AccionCorrectiva): boolean {
  return !a || !a.descripcion.trim() || !a.responsable.trim() || !a.recursos.trim() || !a.fechaCumplimiento;
}
