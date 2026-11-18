import { describe, expect, it } from 'vitest';
import { AREAS, ENUNCIADOS } from './catalogo';
import { calcularResultado, clasificarNivel, listaParaLanzamiento, planDeTrabajo } from './cumplimiento';
import { crearEvaluacion } from './evaluacionFactory';
import { alertasConsecutivas, calcularIndicadores, registroVacio } from './indicadores';
import type { Evaluacion, Respuesta } from './types';
import { correoAUsuario, usuarioACorreo, validarClave, validarPerfil, validarUsuario } from './usuario';

const todas = (estado: Respuesta['estado']) =>
  Object.fromEntries(ENUNCIADOS.map((e) => [e.id, { estado, evidencia: '' }]));

describe('catálogo', () => {
  it('tiene 39 enunciados en 5 áreas (6+6+14+8+5)', () => {
    expect(ENUNCIADOS).toHaveLength(39);
    expect(AREAS.map((a) => ENUNCIADOS.filter((e) => e.area === a.id).length)).toEqual([6, 6, 14, 8, 5]);
    expect(new Set(ENUNCIADOS.map((e) => e.id)).size).toBe(39);
  });
});

describe('niveles de lectura (17.1)', () => {
  it.each([
    [100, 'lista'],
    [80, 'lista'],
    [79.9, 'ajustes'],
    [60, 'ajustes'],
    [59.9, 'no_preparada'],
    [0, 'no_preparada'],
  ])('%d %% → %s', (p, nivel) => expect(clasificarNivel(p)).toBe(nivel));
});

describe('cálculo de cumplimiento', () => {
  it('los pendientes cuentan en el total pero no como cumplidos', () => {
    const r = calcularResultado({ 'MV-1': { estado: 'cumple', evidencia: '' } });
    const mercado = r.areas.find((a) => a.area.id === 'mercado')!;
    expect(mercado).toMatchObject({ total: 6, cumple: 1, pendiente: 5, porcentaje: 16.7 });
    expect(r.porcentaje).toBe(2.6);
  });

  it('todo cumple → 100 % y listo para lanzar', () => {
    const r = calcularResultado(todas('cumple'));
    expect(r.porcentaje).toBe(100);
    expect(listaParaLanzamiento(todas('cumple')).lista).toBe(true);
  });

  it('sin habilitación sanitaria no se puede lanzar aunque las áreas superen 80 %', () => {
    const resp = todas('cumple');
    resp['LA-1'] = { estado: 'no_cumple', evidencia: '' };
    // legal queda en 4/5 = 80 %
    const res = listaParaLanzamiento(resp);
    expect(res.areasPendientes).toHaveLength(0);
    expect(res.lista).toBe(false);
  });
});

describe('factory y plan de trabajo', () => {
  it('crea evaluación con 39 respuestas pendientes', () => {
    const ev = crearEvaluacion({ etapa: 'preparacion', fecha: '2026-11-18', creadoPor: 'x' });
    expect(Object.keys(ev.respuestas)).toHaveLength(39);
    expect(calcularResultado(ev.respuestas).pendiente).toBe(39);
  });

  it('copia una evaluación base sin compartir referencias', () => {
    const base = todas('cumple');
    const ev = crearEvaluacion({ etapa: 'trimestral', fecha: '2027-03-01', creadoPor: 'x', base });
    ev.respuestas['MV-1'].estado = 'no_cumple';
    expect(base['MV-1'].estado).toBe('cumple');
  });

  it('el plan de trabajo lista solo los "No cumple"', () => {
    const ev: Evaluacion = { id: '1', ...crearEvaluacion({ etapa: 'preparacion', fecha: '2026-11-18', creadoPor: 'x' }) };
    ev.respuestas['TE-3'] = { estado: 'no_cumple', evidencia: '' };
    ev.respuestas['MV-1'] = { estado: 'cumple', evidencia: '' };
    expect(planDeTrabajo(ev).map((i) => i.enunciado.id)).toEqual(['TE-3']);
  });
});

describe('usuario y contraseña', () => {
  it('contraseña mínima de 6 y confirmación idéntica', () => {
    expect(validarClave('12345')).not.toBeNull();
    expect(validarClave('123456')).toBeNull();
    expect(validarClave('123456', '123457')).toBe('Las contraseñas no coinciden.');
    expect(validarClave('123456', '123456')).toBeNull();
  });

  it('nombre y puesto: texto libre pero no vacío', () => {
    expect(validarPerfil({ nombre: '  ', puesto: 'Secretaria' })).toBe('Escriba su nombre.');
    expect(validarPerfil({ nombre: 'Ana', puesto: '' })).toBe('Escriba su puesto.');
    expect(validarPerfil({ nombre: 'María José Ñuñez', puesto: 'Optometrista y dueña' })).toBeNull();
  });

  it('valida el usuario y lo normaliza', () => {
    expect(validarUsuario('ab')).not.toBeNull();
    expect(validarUsuario('con espacio')).not.toBeNull();
    expect(validarUsuario('María')).not.toBeNull();
    expect(validarUsuario('  Secretaria ')).toBeNull();
    expect(correoAUsuario(usuarioACorreo('  Secretaria '))).toBe('secretaria');
  });
});

describe('indicadores (19.2 y 19.3)', () => {
  const mes = (over: Partial<ReturnType<typeof registroVacio>>) => ({ ...registroVacio('2027-01'), ...over });

  it('usa metas de consolidación desde el mes 10', () => {
    const ini = calcularIndicadores(mes({ mesOperacion: 3, sesionesRealizadas: 40, sesionesDisponibles: 66 }));
    const cons = calcularIndicadores(mes({ mesOperacion: 10, sesionesRealizadas: 40, sesionesDisponibles: 66 }));
    expect(ini.find((i) => i.id === 'sesiones')!.cumple).toBe(true);
    expect(cons.find((i) => i.id === 'sesiones')!.cumple).toBe(false);
    expect(ini.find((i) => i.id === 'ocupacion')!.valor).toBe(60.6);
  });

  it('presupuesto: desviación máxima de 10 %', () => {
    const ok = calcularIndicadores(mes({ gastoReal: 109, gastoPresupuestado: 100 }));
    const mal = calcularIndicadores(mes({ gastoReal: 85, gastoPresupuestado: 100 }));
    expect(ok.find((i) => i.id === 'presupuesto')!.cumple).toBe(true);
    expect(mal.find((i) => i.id === 'presupuesto')!.cumple).toBe(false);
  });

  it('alerta solo tras dos meses consecutivos fuera de meta', () => {
    const malo = mes({ sesionesRealizadas: 10, sesionesDisponibles: 66 });
    const bueno = mes({ sesionesRealizadas: 40, sesionesDisponibles: 66 });
    expect(alertasConsecutivas([bueno, malo])).toHaveLength(0);
    const alertas = alertasConsecutivas([malo, malo]);
    expect(alertas.map((a) => a.grupo)).toContain('demanda');
  });
});
