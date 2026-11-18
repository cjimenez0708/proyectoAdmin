import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { firebase } from '../data/firebase';
import { correoAUsuario, usuarioACorreo } from '../domain/usuario';

interface AuthValue {
  usuario: User | null;
  /** Nombre de usuario de la sesión actual (sin el dominio técnico). */
  nombre: string;
  cargando: boolean;
  ingresar: (usuario: string, clave: string) => Promise<void>;
  registrar: (usuario: string, clave: string) => Promise<void>;
  salir: () => Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(firebase().auth, (u) => {
        setUsuario(u);
        setCargando(false);
      }),
    [],
  );

  const value: AuthValue = {
    usuario,
    nombre: correoAUsuario(usuario?.email),
    cargando,
    ingresar: async (u, clave) => {
      await signInWithEmailAndPassword(firebase().auth, usuarioACorreo(u), clave);
    },
    registrar: async (u, clave) => {
      await createUserWithEmailAndPassword(firebase().auth, usuarioACorreo(u), clave);
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
