import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import type { Evaluacion, NuevaEvaluacion, RegistroMensual } from '../domain/types';
import { registroVacio } from '../domain/indicadores';
import { firebase } from './firebase';
import type { Perfil } from '../domain/usuario';
import type { EvaluacionRepository, IndicadorRepository, UsuarioRepository } from './repositorios';

/**
 * Implementaciones en Cloud Firestore.
 *
 * Modelo de datos:
 *  evaluaciones/{id}   → { nombre, etapa, fecha, creadoPor, creadoEn, actualizadoEn, actualizadoPor,
 *                          respuestas: { [enunciadoId]: { estado, evidencia, accion? } } }
 *  indicadores/{AAAA-MM} → registro mensual de los indicadores de seguimiento (19.2)
 *  usuarios/{uid}      → { usuario, nombre, puesto, creadoEn } de cada persona registrada
 *
 * Las 39 respuestas viven dentro del documento de la evaluación: una sola lectura
 * trae la evaluación completa y cada cambio es una actualización puntual por campo.
 */
const EVALUACIONES = 'evaluaciones';
const INDICADORES = 'indicadores';
const USUARIOS = 'usuarios';

const aEvaluacion = (id: string, d: DocumentData): Evaluacion => ({
  id,
  nombre: d.nombre,
  etapa: d.etapa,
  fecha: d.fecha,
  creadoPor: d.creadoPor,
  respuestas: d.respuestas ?? {},
});

export class FirestoreEvaluacionRepository implements EvaluacionRepository {
  private get db() {
    return firebase().db;
  }

  observarTodas(cb: (evs: Evaluacion[]) => void, onError: (e: Error) => void) {
    const q = query(collection(this.db, EVALUACIONES), orderBy('fecha', 'desc'));
    return onSnapshot(q, (snap) => cb(snap.docs.map((d) => aEvaluacion(d.id, d.data()))), onError);
  }

  observar(id: string, cb: (ev: Evaluacion | null) => void, onError: (e: Error) => void) {
    return onSnapshot(
      doc(this.db, EVALUACIONES, id),
      (d) => cb(d.exists() ? aEvaluacion(d.id, d.data()) : null),
      onError,
    );
  }

  async crear(ev: NuevaEvaluacion) {
    const ref = await addDoc(collection(this.db, EVALUACIONES), {
      ...ev,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp(),
      actualizadoPor: ev.creadoPor,
    });
    return ref.id;
  }

  async actualizarRespuesta(id: string, enunciadoId: string, respuesta: Evaluacion['respuestas'][string], usuario: string) {
    // Firestore no acepta `undefined`: se omite la acción si no existe.
    const limpia = respuesta.accion ? respuesta : { estado: respuesta.estado, evidencia: respuesta.evidencia };
    await updateDoc(doc(this.db, EVALUACIONES, id), {
      [`respuestas.${enunciadoId}`]: limpia,
      actualizadoEn: serverTimestamp(),
      actualizadoPor: usuario,
    });
  }

  async renombrar(id: string, nombre: string) {
    await updateDoc(doc(this.db, EVALUACIONES, id), { nombre, actualizadoEn: serverTimestamp() });
  }

  async eliminar(id: string) {
    await deleteDoc(doc(this.db, EVALUACIONES, id));
  }
}

export class FirestoreUsuarioRepository implements UsuarioRepository {
  private get db() {
    return firebase().db;
  }

  async guardarPerfil(uid: string, usuario: string, perfil: Perfil) {
    await setDoc(doc(this.db, USUARIOS, uid), {
      usuario,
      nombre: perfil.nombre.trim(),
      puesto: perfil.puesto.trim(),
      creadoEn: serverTimestamp(),
    });
  }

  observarPerfil(uid: string, cb: (p: Perfil | null) => void, onError: (e: Error) => void) {
    return onSnapshot(
      doc(this.db, USUARIOS, uid),
      (d) => cb(d.exists() ? { nombre: d.data().nombre, puesto: d.data().puesto } : null),
      onError,
    );
  }
}

export class FirestoreIndicadorRepository implements IndicadorRepository {
  private get db() {
    return firebase().db;
  }

  observarTodos(cb: (rs: RegistroMensual[]) => void, onError: (e: Error) => void) {
    const q = query(collection(this.db, INDICADORES), orderBy('mes', 'asc'));
    return onSnapshot(
      q,
      (snap) => cb(snap.docs.map((d) => ({ ...registroVacio(d.id), ...(d.data() as Partial<RegistroMensual>), id: d.id }))),
      onError,
    );
  }

  async guardar(r: RegistroMensual, usuario: string) {
    const { id: _id, ...datos } = r;
    await setDoc(doc(this.db, INDICADORES, r.mes), { ...datos, actualizadoEn: serverTimestamp(), actualizadoPor: usuario });
  }

  async eliminar(mes: string) {
    await deleteDoc(doc(this.db, INDICADORES, mes));
  }
}
