import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Singleton: una sola instancia de la app de Firebase, Auth y Firestore para toda la aplicación.
 * La configuración web se lee de variables de entorno (.env.local, ver .env.example).
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let instancia: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function firebase() {
  if (!instancia) {
    if (!config.apiKey || !config.projectId) {
      throw new Error('Falta la configuración de Firebase. Copie .env.example a .env.local y complete los valores.');
    }
    const app = initializeApp(config);
    instancia = { app, auth: getAuth(app), db: getFirestore(app) };
  }
  return instancia;
}
