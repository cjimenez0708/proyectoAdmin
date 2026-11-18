import type { Evaluacion, NuevaEvaluacion, RegistroMensual, Respuesta } from '../domain/types';
import type { Perfil } from '../domain/usuario';

/** Función para cancelar una suscripción en tiempo real (patrón Observer). */
export type Cancelar = () => void;

/**
 * Repository: la interfaz de la UI con los datos. La UI no conoce Firestore;
 * solo depende de estos contratos (permite cambiar el almacenamiento o probar con memoria).
 */
export interface EvaluacionRepository {
  observarTodas(cb: (evs: Evaluacion[]) => void, onError: (e: Error) => void): Cancelar;
  observar(id: string, cb: (ev: Evaluacion | null) => void, onError: (e: Error) => void): Cancelar;
  crear(ev: NuevaEvaluacion): Promise<string>;
  actualizarRespuesta(id: string, enunciadoId: string, respuesta: Respuesta, usuario: string): Promise<void>;
  renombrar(id: string, nombre: string): Promise<void>;
  eliminar(id: string): Promise<void>;
}

export interface UsuarioRepository {
  guardarPerfil(uid: string, usuario: string, perfil: Perfil): Promise<void>;
  observarPerfil(uid: string, cb: (p: Perfil | null) => void, onError: (e: Error) => void): Cancelar;
}

export interface IndicadorRepository {
  observarTodos(cb: (rs: RegistroMensual[]) => void, onError: (e: Error) => void): Cancelar;
  guardar(r: RegistroMensual, usuario: string): Promise<void>;
  eliminar(mes: string): Promise<void>;
}
