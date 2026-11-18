import type { Area, AreaId, Enunciado } from './types';

/**
 * Catálogo de la herramienta de verificación, tomado literalmente del documento
 * "Proyecto Final – Gestión – II semestre 2026", apartados 17.2 a 17.4 (39 enunciados).
 */
export const AREAS: Area[] = [
  { id: 'mercado', nombre: 'Mercado y ventas' },
  { id: 'marca', nombre: 'Marca y gestión digital' },
  { id: 'tecnico', nombre: 'Aspectos técnicos' },
  { id: 'organizacional', nombre: 'Aspectos organizacionales' },
  { id: 'legal', nombre: 'Aspectos legales y ambientales' },
];

const TEXTOS: Record<AreaId, string[]> = {
  mercado: [
    'La clínica tiene definido y documentado el recorrido del cliente de Spa Visual, desde el primer contacto hasta el seguimiento posterior.',
    'La clínica dispone de condiciones adecuadas de privacidad, comodidad y atención para brindar la experiencia propuesta.',
    'La clínica tiene definidas las modalidades de contratación de Spa Visual y sus respectivas condiciones comerciales.',
    'La clínica cuenta con una segmentación documentada de los consumidores potenciales y criterios para priorizar sus acciones comerciales.',
    'La clínica dispone de un procedimiento definido para solicitar y gestionar recomendaciones o referidos voluntarios.',
    'La clínica cuenta con un protocolo documentado para el seguimiento posterior de los clientes de Spa Visual.',
  ],
  marca: [
    'La clínica dispone de información clara sobre los servicios, precios y condiciones de Spa Visual.',
    'La clínica tiene aprobada la integración de Spa Visual con su marca e identidad gráfica.',
    'La clínica tiene definidas acciones educativas y reglas para publicar testimonios y colaboraciones.',
    'La clínica tiene identificados los responsables de sus canales digitales y mantiene actualizados sus datos de contacto.',
    'La clínica dispone de un sistema organizado para registrar solicitudes, citas y preferencias de comunicación.',
    'La clínica cuenta con medidas de confidencialidad y autorizaciones que diferencian la atención sanitaria de la promoción comercial.',
  ],
  tecnico: [
    'La clínica posee las instalaciones y la escala del proyecto de spa del ojo seco.',
    'La Clínica Preventiva Visual posee procedimientos clínicos para el spa.',
    'La empresa cuenta con el capital humano suficiente para llevar a cabo el servicio.',
    'La clínica conoce los diferentes equipos e insumos que se necesitan.',
    'Las instalaciones de la empresa se encuentran en una ubicación estratégica, apta y adecuada según su localización macro y micro.',
    'La Clínica Preventiva Visual posee un diagrama del proceso productivo con los pasos bien definidos.',
    'La Clínica Preventiva Visual cuenta con un diagrama de distribución de planta.',
    'La clínica posee conocimiento acerca de la inversión en la dimensión técnica para el spa de ojo seco.',
    'La empresa cuenta con todas las materias primas e insumos para brindar el servicio.',
    'La empresa posee proveedores que le permitan abastecer el inventario de materias primas.',
    'Se permite atender eficientemente la demanda promedio de clientes diarios.',
    'Cuenta con personal capacitado para atención al cliente y manejo de productos.',
    'Utiliza herramientas tecnológicas que automatizan procesos clínicos del spa.',
    'Ofrece una experiencia de servicio cómoda, agradable y limpia.',
  ],
  organizacional: [
    'La empresa cuenta con un manual de puestos definido y comunicado.',
    'La empresa cuenta con un estudio del FODA y una estrategia basada en esta, que le permita conocer los factores internos y externos de la organización.',
    'La clínica tiene un organigrama actualizado con el nuevo servicio del Spa del ojo seco.',
    'La Clínica Preventiva Visual posee procedimientos administrativos.',
    'Los colaboradores del Spa ya poseen un curso que les otorgue el conocimiento y la legalidad para dar la terapia especializada en ojo seco.',
    'Ya se tiene una evaluación interna (EFI) para analizar fortalezas y debilidades, con seguimiento periódico.',
    'Ya se tiene una evaluación externa (EFE) para analizar amenazas y oportunidades del entorno, con seguimiento periódico.',
    'La clínica posee la matriz MECA con estrategias para cada cuadrante del FODA.',
  ],
  legal: [
    'La clínica cuenta con la habilitación sanitaria del Ministerio de Salud para los procedimientos de Spa Visual.',
    'La licencia comercial de la Municipalidad de Curridabat cubre la nueva actividad del spa.',
    'La clínica tiene registrada la nueva actividad ante el Ministerio de Hacienda y emite factura electrónica por los servicios del spa.',
    'El personal del spa está reportado ante la CCSS y cuenta con la póliza de riesgos del trabajo del INS.',
    'La clínica cuenta con un procedimiento para el manejo y la disposición de los residuos generados en las sesiones.',
  ],
};

const PREFIJO: Record<AreaId, string> = {
  mercado: 'MV',
  marca: 'MD',
  tecnico: 'TE',
  organizacional: 'OR',
  legal: 'LA',
};

export const ENUNCIADOS: Enunciado[] = AREAS.flatMap((area) =>
  TEXTOS[area.id].map((texto, i) => ({
    id: `${PREFIJO[area.id]}-${i + 1}`,
    area: area.id,
    numero: i + 1,
    texto,
  })),
);

/** Enunciado de habilitación sanitaria: condición adicional para pasar de la etapa de preparación (19.1). */
export const ENUNCIADO_HABILITACION_SANITARIA = 'LA-1';

export const enunciadosDeArea = (area: AreaId): Enunciado[] =>
  ENUNCIADOS.filter((e) => e.area === area);

export const areaPorId = (id: AreaId): Area => {
  const a = AREAS.find((x) => x.id === id);
  if (!a) throw new Error(`Área desconocida: ${id}`);
  return a;
};
