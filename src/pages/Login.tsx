import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';

const MENSAJES: Record<string, string> = {
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Espere un momento e intente de nuevo.',
  'auth/network-request-failed': 'No hay conexión con el servidor.',
};

export function Login() {
  const { ingresar } = useAuth();
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await ingresar(correo.trim(), clave);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(MENSAJES[code] ?? 'No se pudo iniciar sesión.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login">
      <form className="card stack" onSubmit={enviar}>
        <img src="/logo.jpeg" alt="Clínica Preventiva Visual" />
        <div style={{ textAlign: 'center' }}>
          <h1>Spa Visual</h1>
          <p className="muted small">Herramienta de apoyo para la implementación</p>
        </div>
        <label className="field">
          Correo electrónico
          <input className="input" type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </label>
        <label className="field">
          Contraseña
          <input className="input" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={enviando} style={{ justifyContent: 'center' }}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
        <p className="small muted" style={{ textAlign: 'center' }}>
          Acceso para la optometrista y dueña y la secretaria. Las cuentas se crean en Firebase Authentication.
        </p>
      </form>
    </div>
  );
}
