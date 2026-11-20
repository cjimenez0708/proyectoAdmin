/**
 * Estudio financiero interactivo de Spa Visual.
 * Los valores por defecto salen del estudio técnico (12), organizacional (13) y financiero (16) del documento;
 * los que el documento no define (precio promedio, mezcla con IPL, descuento, tasa y horizonte) son supuestos editables.
 */
export interface SupuestosFinancieros {
  inversion: { concepto: string; monto: number }[];
  imprevistosPct: number;
  horasDia: number;
  duracionSesion: number; // minutos
  diasMes: number;
  ocupacionAnio1: number; // %
  ocupacionDesdeAnio2: number; // %
  precioCuidado: number;
  precioIPL: number;
  mezclaIPL: number; // % de sesiones con IPL
  descuentoPromedio: number; // %
  costoVariablePct: number; // % de las ventas
  gastosFijosMes: number;
  salariosMes: number;
  incluirSalarios: boolean;
  depreciacionAnual: number;
  tasaDescuento: number; // %
  horizonteAnios: number;
}

/** Qué valores vienen del documento y cuáles son supuestos. */
export const ORIGEN: Record<keyof SupuestosFinancieros, 'documento' | 'supuesto'> = {
  inversion: 'documento',
  imprevistosPct: 'documento',
  horasDia: 'documento',
  duracionSesion: 'documento',
  diasMes: 'documento',
  ocupacionAnio1: 'documento',
  ocupacionDesdeAnio2: 'documento',
  precioCuidado: 'supuesto',
  precioIPL: 'documento',
  mezclaIPL: 'supuesto',
  descuentoPromedio: 'supuesto',
  costoVariablePct: 'documento',
  gastosFijosMes: 'documento',
  salariosMes: 'documento',
  incluirSalarios: 'supuesto',
  depreciacionAnual: 'documento',
  tasaDescuento: 'supuesto',
  horizonteAnios: 'supuesto',
};

export const SUPUESTOS_DOCUMENTO: SupuestosFinancieros = {
  inversion: [
    { concepto: 'Equipos especializados de tratamiento', monto: 10_014_300 },
    { concepto: 'Adecuación de espacio e instalaciones', monto: 3_200_000 },
    { concepto: 'Insumos iniciales', monto: 200_000 },
    { concepto: 'Capacitación técnica', monto: 615_000 },
    { concepto: 'Materiales de lanzamiento comercial', monto: 200_000 },
    { concepto: 'Verificaciones y trámites', monto: 100_000 },
  ],
  imprevistosPct: 10,
  horasDia: 4,
  duracionSesion: 55,
  diasMes: 22,
  ocupacionAnio1: 55,
  ocupacionDesdeAnio2: 75,
  precioCuidado: 17_500,
  precioIPL: 35_000,
  mezclaIPL: 25,
  descuentoPromedio: 8,
  costoVariablePct: 15,
  gastosFijosMes: 97_103,
  salariosMes: 1_299_090,
  incluirSalarios: false,
  depreciacionAnual: 1_751_431,
  tasaDescuento: 12,
  horizonteAnios: 5,
};

export interface ResultadoMes {
  sesiones: number;
  ingresos: number;
  costosVariables: number;
  costosFijos: number;
  flujo: number;
}

export interface ResultadoFinanciero {
  sesionesDia: number;
  capacidadMes: number;
  precioNeto: number;
  margenContribucion: number;
  subtotalInversion: number;
  imprevistos: number;
  inversionTotal: number;
  costosFijosMes: number;
  puntoEquilibrio: number; // sesiones al mes
  puntoEquilibrioOcupacion: number; // %
  anio1: ResultadoMes;
  desdeAnio2: ResultadoMes;
  flujosAnuales: number[];
  van: number;
  tir: number | null; // %
  recuperacion: number | null; // años
}

const npv = (tasa: number, inversion: number, flujos: number[]) =>
  -inversion + flujos.reduce((s, f, i) => s + f / Math.pow(1 + tasa, i + 1), 0);

export function calcularFinanzas(s: SupuestosFinancieros): ResultadoFinanciero {
  const sesionesDia = Math.max(1, Math.floor((s.horasDia * 60) / Math.max(1, s.duracionSesion)));
  const capacidadMes = sesionesDia * s.diasMes;
  const precioNeto =
    ((1 - s.mezclaIPL / 100) * s.precioCuidado + (s.mezclaIPL / 100) * s.precioIPL) * (1 - s.descuentoPromedio / 100);
  const margenContribucion = precioNeto * (1 - s.costoVariablePct / 100);
  const subtotalInversion = s.inversion.reduce((t, i) => t + (Number(i.monto) || 0), 0);
  const imprevistos = (subtotalInversion * s.imprevistosPct) / 100;
  const inversionTotal = subtotalInversion + imprevistos;
  const costosFijosMes = s.gastosFijosMes + (s.incluirSalarios ? s.salariosMes : 0);

  const mes = (ocupacion: number): ResultadoMes => {
    const sesiones = (capacidadMes * ocupacion) / 100;
    const ingresos = sesiones * precioNeto;
    const costosVariables = (ingresos * s.costoVariablePct) / 100;
    return { sesiones, ingresos, costosVariables, costosFijos: costosFijosMes, flujo: ingresos - costosVariables - costosFijosMes };
  };
  const anio1 = mes(s.ocupacionAnio1);
  const desdeAnio2 = mes(s.ocupacionDesdeAnio2);

  const horizonte = Math.max(1, Math.round(s.horizonteAnios));
  const flujosAnuales = Array.from({ length: horizonte }, (_, i) => 12 * (i === 0 ? anio1.flujo : desdeAnio2.flujo));
  const van = npv(s.tasaDescuento / 100, inversionTotal, flujosAnuales);

  // TIR por bisección (si existe un cambio de signo en el rango).
  let tir: number | null = null;
  if (npv(-0.99, inversionTotal, flujosAnuales) > 0 && npv(10, inversionTotal, flujosAnuales) < 0) {
    let lo = -0.99;
    let hi = 10;
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (npv(mid, inversionTotal, flujosAnuales) > 0) lo = mid;
      else hi = mid;
    }
    tir = lo * 100;
  }

  // Recuperación con interpolación dentro del año en que el acumulado se vuelve positivo.
  let acumulado = -inversionTotal;
  let recuperacion: number | null = null;
  for (let i = 0; i < flujosAnuales.length; i++) {
    const previo = acumulado;
    acumulado += flujosAnuales[i];
    if (acumulado >= 0 && recuperacion === null) recuperacion = i + (flujosAnuales[i] ? -previo / flujosAnuales[i] : 0);
  }

  const puntoEquilibrio = margenContribucion > 0 ? costosFijosMes / margenContribucion : Infinity;
  return {
    sesionesDia,
    capacidadMes,
    precioNeto,
    margenContribucion,
    subtotalInversion,
    imprevistos,
    inversionTotal,
    costosFijosMes,
    puntoEquilibrio,
    puntoEquilibrioOcupacion: (puntoEquilibrio / capacidadMes) * 100,
    anio1,
    desdeAnio2,
    flujosAnuales,
    van,
    tir,
    recuperacion,
  };
}

/** Escenarios pesimista / esperado / optimista: ±15 puntos de ocupación. */
export function escenarios(s: SupuestosFinancieros) {
  const clamp = (v: number) => Math.min(100, Math.max(5, v));
  return [
    { nombre: 'Pesimista', o1: clamp(s.ocupacionAnio1 - 15), o2: clamp(s.ocupacionDesdeAnio2 - 15) },
    { nombre: 'Esperado', o1: s.ocupacionAnio1, o2: s.ocupacionDesdeAnio2 },
    { nombre: 'Optimista', o1: clamp(s.ocupacionAnio1 + 15), o2: clamp(s.ocupacionDesdeAnio2 + 15) },
  ].map((e) => ({ ...e, r: calcularFinanzas({ ...s, ocupacionAnio1: e.o1, ocupacionDesdeAnio2: e.o2 }) }));
}

/** Lectura de viabilidad para mostrar junto a los resultados. */
export function viabilidad(r: ResultadoFinanciero, s: SupuestosFinancieros) {
  const checks = [
    { texto: 'Margen de contribución positivo por sesión', ok: r.margenContribucion > 0 },
    { texto: 'Punto de equilibrio alcanzable con la ocupación meta', ok: r.puntoEquilibrioOcupacion <= s.ocupacionDesdeAnio2 },
    { texto: 'VAN positivo', ok: r.van > 0 },
    { texto: 'TIR mayor que la tasa de descuento', ok: r.tir !== null && r.tir > s.tasaDescuento },
    { texto: 'La inversión se recupera dentro del horizonte', ok: r.recuperacion !== null },
  ];
  const fallas = checks.filter((c) => !c.ok).length;
  const nivel: 'ok' | 'warn' | 'bad' = r.van <= 0 ? 'bad' : fallas === 0 ? 'ok' : 'warn';
  const texto = nivel === 'ok' ? 'Financieramente viable con estos supuestos' : nivel === 'warn' ? 'Viable con reservas' : 'No es viable con estos supuestos';
  return { checks, nivel, texto };
}
