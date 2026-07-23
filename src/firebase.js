// 1. Importamos las funciones necesarias
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ¡Faltaba esta!
import { getAuth } from "firebase/auth";           // ¡Faltaba esta!
import { getStorage } from "firebase/storage";


// Tu configuración (está perfecta)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. Inicializamos la App
const app = initializeApp(firebaseConfig);

// 3. EXPORTAMOS las herramientas para que GameContext las pueda usar
// El error "does not provide an export named 'db'" se quita con esto:
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
