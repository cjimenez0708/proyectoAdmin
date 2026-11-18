import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { validarClave, validarUsuario } from '../domain/usuario';

const MENSAJES: Record<string, string> = {
  'auth/invalid-credential': 'Usuario o contraseña incorrectos.',
  'auth/user-not-found': 'Usuario o contraseña incorrectos.',
  'auth/wrong-password': 'Usuario o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ese usuario ya existe. Elija otro.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espere un momento e intente de nuevo.',
  'auth/network-request-failed': 'No hay conexión con el servidor.',
};

type Modo = 'ingresar' | 'crear';

export function Login() {
  const { ingresar, registrar } = useAuth();
  const [modo, setModo] = useState<Modo>('ingresar');
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const crear = modo === 'crear';

  function cambiarModo(m: Modo) {
    setModo(m);
    setError('');
    setClave('');
    setConfirmacion('');
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError('');
    const invalido = validarUsuario(usuario) ?? validarClave(clave, crear ? confirmacion : undefined);
    if (invalido) {
      setError(invalido);
      return;
    }
    setEnviando(true);
    try {
      if (crear) await registrar(usuario, clave);
      else await ingresar(usuario, clave);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(MENSAJES[code] ?? (crear ? 'No se pudo crear el usuario.' : 'No se pudo iniciar sesión.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <form className="card stack" onSubmit={enviar} noValidate>
        <img src="/logo.jpeg" alt="Clínica Preventiva Visual" />
        <div style={{ textAlign: 'center' }}>
          <h1>Spa Visual</h1>
          <p className="muted small">{crear ? 'Crear usuario' : 'Gestión de la implementación'}</p>
        </div>
        <label className="field">
          Usuario
          <input
            className="input"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </label>
        <label className="field">
          Contraseña
          <input
            className="input"
            type="password"
            autoComplete={crear ? 'new-password' : 'current-password'}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
          {crear && <span className="small">Mínimo 6 caracteres.</span>}
        </label>
        {crear && (
          <label className="field">
            Repetir contraseña
            <input className="input" type="password" autoComplete="new-password" value={confirmacion} onChange={(e) => setConfirmacion(e.target.value)} />
          </label>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn" disabled={enviando} style={{ justifyContent: 'center' }}>
          {enviando ? (crear ? 'Creando…' : 'Ingresando…') : crear ? 'Crear usuario' : 'Ingresar'}
        </button>
        <button type="button" className="btn secondary" style={{ justifyContent: 'center' }} onClick={() => cambiarModo(crear ? 'ingresar' : 'crear')}>
          {crear ? 'Ya tengo usuario' : 'Crear usuario'}
        </button>
      </form>
    </div>
  );
}
