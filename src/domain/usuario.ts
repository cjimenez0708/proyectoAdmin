/**
 * Cuentas por nombre de usuario.
 * Firebase Authentication requiere un correo, así que el usuario se convierte internamente
 * en un correo técnico del dominio del proyecto (nunca se envían correos ahí).
 */
const DOMINIO = 'usuarios.proyectoadmin-46d4e.firebaseapp.com';

export const CLAVE_MINIMA = 6;

export const normalizarUsuario = (u: string) => u.trim().toLowerCase();

export const usuarioACorreo = (u: string) => `${normalizarUsuario(u)}@${DOMINIO}`;

export const correoAUsuario = (correo: string | null | undefined) => (correo ?? '').split('@')[0];

/** Devuelve el mensaje de error o null si el usuario es válido. */
export function validarUsuario(u: string): string | null {
  const n = normalizarUsuario(u);
  if (n.length < 3) return 'El usuario debe tener al menos 3 caracteres.';
  if (n.length > 30) return 'El usuario puede tener como máximo 30 caracteres.';
  if (!/^[a-z0-9._-]+$/.test(n)) return 'El usuario solo puede tener letras, números, punto, guion y guion bajo (sin espacios ni tildes).';
  return null;
}

/** Datos de la persona que se registra. Texto libre: solo se exige que no esté vacío. */
export interface Perfil {
  nombre: string;
  puesto: string;
}

export function validarPerfil(p: Perfil): string | null {
  if (!p.nombre.trim()) return 'Escriba su nombre.';
  if (!p.puesto.trim()) return 'Escriba su puesto.';
  return null;
}

export function validarClave(clave: string, confirmacion?: string): string | null {
  if (clave.length < CLAVE_MINIMA) return `La contraseña debe tener al menos ${CLAVE_MINIMA} caracteres.`;
  if (confirmacion !== undefined && clave !== confirmacion) return 'Las contraseñas no coinciden.';
  return null;
}
