import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { firebase } from '../data/firebase';

interface AuthValue {
  usuario: User | null;
  cargando: boolean;
  ingresar: (correo: string, clave: string) => Promise<void>;
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
    cargando,
    ingresar: async (correo, clave) => {
      await signInWithEmailAndPassword(firebase().auth, correo, clave);
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
