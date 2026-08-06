// 1. Importamos las funciones necesarias
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ¡Faltaba esta!
import { getAuth } from "firebase/auth";           // ¡Faltaba esta!
import { getStorage } from "firebase/storage";


// Tu configuración (está perfecta)
const firebaseConfig = {
  apiKey: "AIzaSyA5f4_wk0n6ar0ni1W5t0AdT3uj7-1fpCU",
  authDomain: "san-josekids.firebaseapp.com",
  projectId: "san-josekids",
  storageBucket: "san-josekids.firebasestorage.app",
  messagingSenderId: "1093498868735",
  appId: "1:1093498868735:web:1e3d18cc07ca676ad64dca",
  measurementId: "G-HFF706EJV0"
};



// 2. Inicializamos la App
const app = initializeApp(firebaseConfig);

// 3. EXPORTAMOS las herramientas para que GameContext las pueda usar
// El error "does not provide an export named 'db'" se quita con esto:
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
