import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { firebase } from '../data/firebase';
import { FirestoreUsuarioRepository } from '../data/firestoreRepositorios';
import { correoAUsuario, normalizarUsuario, usuarioACorreo, type Perfil } from '../domain/usuario';

interface AuthValue {
  usuario: User | null;
  /** Nombre visible de la sesión: el nombre de la persona si lo registró; si no, su usuario. */
  nombre: string;
  /** Nombre de usuario (sin el dominio técnico). */
  cuenta: string;
  perfil: Perfil | null;
  cargando: boolean;
  ingresar: (usuario: string, clave: string) => Promise<void>;
  registrar: (usuario: string, clave: string, perfil: Perfil) => Promise<void>;
  salir: () => Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const usuarios = useMemo(() => new FirestoreUsuarioRepository(), []);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(firebase().auth, (u) => {
        setUsuario(u);
        setCargando(false);
      }),
    [],
  );

  // Perfil en tiempo real: al registrarse, el documento se escribe justo después de crear la cuenta.
  useEffect(() => {
    if (!usuario) {
      setPerfil(null);
      return;
    }
    return usuarios.observarPerfil(usuario.uid, setPerfil, () => setPerfil(null));
  }, [usuario, usuarios]);

  const cuenta = correoAUsuario(usuario?.email);

  const value: AuthValue = {
    usuario,
    cuenta,
    nombre: perfil?.nombre || cuenta,
    perfil,
    cargando,
    ingresar: async (u, clave) => {
      await signInWithEmailAndPassword(firebase().auth, usuarioACorreo(u), clave);
    },
    registrar: async (u, clave, datos) => {
      const cred = await createUserWithEmailAndPassword(firebase().auth, usuarioACorreo(u), clave);
      await usuarios.guardarPerfil(cred.user.uid, normalizarUsuario(u), datos);
    },
    salir: () => signOut(firebase().auth),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return v;
}
