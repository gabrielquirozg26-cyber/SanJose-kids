// scripts/crearCatequistaTest.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Leer el archivo de configuración de Firebase
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

// 🔥 Inicializar Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

async function crearCatequistaTest() {
  console.log('👨‍🏫 Creando catequista de prueba...');
  console.log('='.repeat(60));
  
  const email = '1catequista.test@sanjosekids.com';
  const password = 'Catequista2024!';
  const nombre = 'MARÍA CATEQUISTA';
  const grupo = 'San Francisco de Asís';
  
  try {
    // 1. Verificar si el usuario ya existe
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`⚠️ El usuario ${email} ya existe. UID: ${userRecord.uid}`);
      console.log('   Si quieres recrearlo, elimínalo primero desde Firebase Console.');
      return;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('✅ Usuario no existe. Creando nuevo...');
      } else {
        throw error;
      }
    }
    
    // 2. Crear el usuario en Authentication
    userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: nombre,
    });
    
    console.log(`✅ Usuario creado en Authentication. UID: ${userRecord.uid}`);
    
    // 3. Crear el documento en Firestore (colección 'usuarios')
    const userData = {
      uid: userRecord.uid,
      nombre: nombre,
      email: email,
      grupo: grupo,
      rol: 'catequista',
      monedas: 0,
      nivelActual: 0,
      rango: 'Catequista',
      racha: 0,
      vidas: 99, // Vidas infinitas para catequistas
      vidasPerdidas: [],
      avatar: '👨‍🏫',
      inventario: [],
      coleccion: [],
      nivelesCompletados: [],
      examenesAprobados: [],
      logrosPendientes: [],
      titulosDesbloqueados: [],
      marcosDesbloqueados: [],
      contrasenaCambiada: false,
      esPrimeraVez: false, // Los catequistas no pasan por el flujo de bienvenida
      ultimaPrimeraLeccion: null,
      jugóHoy: null,
      misiones: {
        diaActual: new Date().toISOString().split('T')[0],
        semanaActual: obtenerSemanaActual(),
        diarias: {},
        semanales: {}
      }
    };
    
    await db.collection('usuarios').doc(userRecord.uid).set(userData);
    console.log('✅ Documento creado en Firestore');
    
    // 4. Mostrar resumen
    console.log('='.repeat(60));
    console.log('📊 CATEQUISTA CREADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Contraseña: ${password}`);
    console.log(`🆔 UID: ${userRecord.uid}`);
    console.log(`👤 Nombre: ${nombre}`);
    console.log(`📚 Grupo: ${grupo}`);
    console.log('='.repeat(60));
    console.log('⚠️ GUARDA ESTOS DATOS EN UN LUGAR SEGURO');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error al crear catequista:', error.message);
    console.error('Detalles:', error);
  }
}

// Helper para obtener la semana actual
function obtenerSemanaActual() {
  const d = new Date();
  const dia = d.getDay() || 7;
  d.setDate(d.getDate() - dia + 1);
  return d.toISOString().split('T')[0];
}

// 🚀 Ejecutar
crearCatequistaTest();