/** Tipos del dominio: Herramienta de apoyo para la implementación de Spa Visual (apartado 17). */

export type AreaId = 'mercado' | 'marca' | 'tecnico' | 'organizacional' | 'legal';

export interface Area {
  id: AreaId;
  nombre: string;
}

export interface Enunciado {
  /** Identificador estable, p. ej. "MV-1" */
  id: string;
  area: AreaId;
  numero: number;
  texto: string;
}

/** Calificación de un enunciado. "pendiente" = aún no se puede confirmar (queda sin calificar). */
export type Estado = 'cumple' | 'no_cumple' | 'pendiente';

/** Acción correctiva registrada para un enunciado que no se cumple (apartado 17.1). */
export interface AccionCorrectiva {
  descripcion: string;
  responsable: string;
  recursos: string;
  fechaCumplimiento: string; // YYYY-MM-DD
  completada: boolean;
}

export interface Respuesta {
  estado: Estado;
  evidencia: string;
  accion?: AccionCorrectiva;
}

/** Momentos de aplicación de la herramienta (apartado 17.1 y 19.3). */
export type Etapa = 'preparacion' | 'prelanzamiento' | 'trimestral';

export interface Evaluacion {
  id: string;
  nombre: string;
  etapa: Etapa;
  fecha: string; // YYYY-MM-DD
  creadoPor: string;
  respuestas: Record<string, Respuesta>;
}

export type NuevaEvaluacion = Omit<Evaluacion, 'id'>;

/** Nivel de lectura del porcentaje de cumplimiento (apartado 17.1). */
export type Nivel = 'lista' | 'ajustes' | 'no_preparada';

export interface ResultadoArea {
  area: Area;
  total: number;
  cumple: number;
  noCumple: number;
  pendiente: number;
  /** Enunciados que cumplen / total de enunciados del área × 100 */
  porcentaje: number;
  nivel: Nivel;
}

export interface ResultadoGeneral {
  areas: ResultadoArea[];
  total: number;
  cumple: number;
  noCumple: number;
  pendiente: number;
  porcentaje: number;
  nivel: Nivel;
}

/** Registro mensual de los indicadores de seguimiento (apartado 19.2). */
export interface RegistroMensual {
  id: string; // YYYY-MM
  mes: string; // YYYY-MM
  mesOperacion: number; // 1 = primer mes de operación del spa
  sesionesRealizadas: number;
  sesionesDisponibles: number;
  pacientesRecomendados: number;
  pacientesAgendaron: number;
  clientesPrimeraVez: number;
  clientesSegundaSesion60d: number;
  encuestasRespondidas: number;
  encuestasCon4o5: number;
  ingresos: number;
  precioPromedioDefinido: number;
  gastoReal: number;
  gastoPresupuestado: number;
  nuevosConsulta: number;
  nuevosRedes: number;
  nuevosReferidos: number;
  nuevosAlianzas: number;
  resenasGoogle: number; // promedio 0–5
}
