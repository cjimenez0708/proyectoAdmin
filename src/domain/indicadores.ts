import type { RegistroMensual } from './types';

/**
 * Indicadores de seguimiento de Spa Visual (apartado 19.2, Tabla 10) y
 * acciones correctivas por área (apartado 19.3).
 */
export type GrupoCorrectivo = 'demanda' | 'retencion' | 'ingresos';

export const ACCIONES_CORRECTIVAS: Record<GrupoCorrectivo, { titulo: string; acciones: string }> = {
  demanda: {
    titulo: 'Demanda baja (sesiones, ocupación o conversión)',
    acciones:
      'Reforzar la recomendación en consulta, intensificar la comunicación con los clientes actuales, ajustar los horarios del spa o aplicar promociones focalizadas.',
  },
  retencion: {
    titulo: 'Baja retención o satisfacción',
    acciones:
      'Revisar los comentarios de las encuestas, ajustar los protocolos de atención y seguimiento y reforzar la capacitación del personal.',
  },
  ingresos: {
    titulo: 'Ingresos o presupuesto fuera de la meta',
    acciones: 'Revisar la estructura de precios y paquetes, limitar los descuentos y controlar el consumo de insumos.',
  },
};

export interface ResultadoIndicador {
  id: string;
  nombre: string;
  formula: string;
  meta: string;
  responsable: string;
  /** null cuando no hay datos suficientes para calcularlo */
  valor: number | null;
  unidad: '' | '%' | '₡' | '/5';
  cumple: boolean | null;
  grupo?: GrupoCorrectivo;
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);

export function calcularIndicadores(r: RegistroMensual): ResultadoIndicador[] {
  const consolidacion = r.mesOperacion >= 10;
  const metaSesiones = consolidacion ? 50 : 36;
  const metaOcupacion = consolidacion ? 75 : 55;

  const ocupacion = pct(r.sesionesRealizadas, r.sesionesDisponibles);
  const conversion = pct(r.pacientesAgendaron, r.pacientesRecomendados);
  const retorno = pct(r.clientesSegundaSesion60d, r.clientesPrimeraVez);
  const satisfaccion = pct(r.encuestasCon4o5, r.encuestasRespondidas);
  const ingresoPromedio = r.sesionesRealizadas > 0 ? Math.round(r.ingresos / r.sesionesRealizadas) : null;
  const presupuesto = pct(r.gastoReal, r.gastoPresupuestado);

  const canales: [string, number][] = [
    ['Consulta', r.nuevosConsulta],
    ['Redes', r.nuevosRedes],
    ['Referidos', r.nuevosReferidos],
    ['Alianzas', r.nuevosAlianzas],
  ];
  const totalNuevos = canales.reduce((s, [, n]) => s + n, 0);
  const mejorCanal = totalNuevos > 0 ? canales.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;

  const geq = (v: number | null, m: number) => (v === null ? null : v >= m);

  return [
    {
      id: 'sesiones',
      nombre: 'Sesiones realizadas',
      formula: 'Número de sesiones atendidas en el mes',
      meta: '36 o más por mes en los primeros seis meses; 50 o más desde el mes 10',
      responsable: 'Secretaria (registro) · Optometrista y dueña (revisión)',
      valor: r.sesionesRealizadas,
      unidad: '',
      cumple: r.sesionesRealizadas >= metaSesiones,
      grupo: 'demanda',
    },
    {
      id: 'ocupacion',
      nombre: 'Ocupación del spa',
      formula: 'Sesiones realizadas / sesiones disponibles × 100',
      meta: '55 % al inicio; 75 % desde el mes 10',
      responsable: 'Secretaria (registro) · Optometrista y dueña (revisión)',
      valor: ocupacion,
      unidad: '%',
      cumple: geq(ocupacion, metaOcupacion),
      grupo: 'demanda',
    },
    {
      id: 'conversion',
      nombre: 'Conversión desde la consulta',
      formula: 'Pacientes que agendan una sesión / pacientes a quienes se recomendó el servicio × 100',
      meta: '30 % o más',
      responsable: 'Optometrista',
      valor: conversion,
      unidad: '%',
      cumple: geq(conversion, 30),
      grupo: 'demanda',
    },
    {
      id: 'retorno',
      nombre: 'Tasa de retorno',
      formula: 'Clientes con una segunda sesión en 60 días / clientes atendidos por primera vez × 100',
      meta: '50 % o más',
      responsable: 'Secretaria',
      valor: retorno,
      unidad: '%',
      cumple: geq(retorno, 50),
      grupo: 'retencion',
    },
    {
      id: 'satisfaccion',
      nombre: 'Satisfacción del cliente',
      formula: 'Clientes que califican el servicio con 4 o 5 de 5 / encuestas respondidas × 100',
      meta: '90 % o más',
      responsable: 'Secretaria',
      valor: satisfaccion,
      unidad: '%',
      cumple: geq(satisfaccion, 90),
      grupo: 'retencion',
    },
    {
      id: 'ingreso',
      nombre: 'Ingreso promedio por sesión',
      formula: 'Ingresos del spa / sesiones realizadas',
      meta: 'Igual o mayor al precio promedio definido (18.2), después de descuentos',
      responsable: 'Secretaria (registro) · Optometrista y dueña (revisión)',
      valor: ingresoPromedio,
      unidad: '₡',
      cumple: r.precioPromedioDefinido > 0 ? geq(ingresoPromedio, r.precioPromedioDefinido) : null,
      grupo: 'ingresos',
    },
    {
      id: 'presupuesto',
      nombre: 'Cumplimiento del presupuesto',
      formula: 'Gasto real / gasto presupuestado × 100',
      meta: 'Desviación máxima de 10 %',
      responsable: 'Optometrista y dueña, con apoyo contable (trimestral)',
      valor: presupuesto,
      unidad: '%',
      cumple: presupuesto === null ? null : Math.abs(presupuesto - 100) <= 10,
      grupo: 'ingresos',
    },
    {
      id: 'canal',
      nombre: 'Clientes nuevos por canal',
      formula: 'Clientes nuevos según el medio por el que conocieron el servicio',
      meta: 'Identificar cada mes el canal más efectivo',
      responsable: 'Secretaria, con el proveedor de mercadeo',
      valor: totalNuevos,
      unidad: '',
      cumple: mejorCanal ? true : null,
      ...(mejorCanal ? { formula: `Canal más efectivo: ${mejorCanal[0]} (${mejorCanal[1]} de ${totalNuevos})` } : {}),
    },
    {
      id: 'resenas',
      nombre: 'Reseñas en Google',
      formula: 'Calificación promedio de las reseñas del servicio',
      meta: '4,5 de 5 o más',
      responsable: 'Secretaria, con el proveedor de mercadeo',
      valor: r.resenasGoogle > 0 ? r.resenasGoogle : null,
      unidad: '/5',
      cumple: r.resenasGoogle > 0 ? r.resenasGoogle >= 4.5 : null,
    },
  ];
}

/**
 * Apartado 19.3: cuando un indicador no alcanza su meta durante dos meses consecutivos,
 * se aplican acciones correctivas según el área afectada.
 * `registros` debe venir ordenado del más antiguo al más reciente.
 */
export function alertasConsecutivas(registros: RegistroMensual[]) {
  if (registros.length < 2) return [];
  const [anterior, actual] = registros.slice(-2).map(calcularIndicadores);
  const fallan = actual.filter((ind) => {
    const prev = anterior.find((p) => p.id === ind.id);
    return ind.cumple === false && prev?.cumple === false;
  });
  const grupos = new Set(fallan.map((f) => f.grupo).filter((g): g is GrupoCorrectivo => !!g));
  return [...grupos].map((g) => ({
    grupo: g,
    ...ACCIONES_CORRECTIVAS[g],
    indicadores: fallan.filter((f) => f.grupo === g).map((f) => f.nombre),
  }));
}

export const registroVacio = (mes: string): RegistroMensual => ({
  id: mes,
  mes,
  mesOperacion: 1,
  sesionesRealizadas: 0,
  sesionesDisponibles: 0,
  pacientesRecomendados: 0,
  pacientesAgendaron: 0,
  clientesPrimeraVez: 0,
  clientesSegundaSesion60d: 0,
  encuestasRespondidas: 0,
  encuestasCon4o5: 0,
  ingresos: 0,
  precioPromedioDefinido: 0,
  gastoReal: 0,
  gastoPresupuestado: 0,
  nuevosConsulta: 0,
  nuevosRedes: 0,
  nuevosReferidos: 0,
  nuevosAlianzas: 0,
  resenasGoogle: 0,
});
