// scripts/crearCatequistaInteractivo.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── CONFIGURACIÓN ────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

// ── INTERFAZ DE CONSOLA ─────────────────────────────────────────────────
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pregunta = (texto) => new Promise((resolve) => {
  rl.question(texto, (respuesta) => {
    resolve(respuesta.trim());
  });
});

const gruposDisponibles = [
  'San Francisco de Asís',
  'San Diego de Alcalá',
  'Santa Clara de Asís',
  'San Antonio de Padua',
  'Santa Rosa de Viterbo',
];

// ── FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────
async function crearCatequistaInteractivo() {
  console.log('\n' + '='.repeat(60));
  console.log('👨‍🏫  CREAR CATEQUISTA - SAN JOSEKIDS');
  console.log('='.repeat(60) + '\n');

  try {
    // ── NOMBRE COMPLETO ──
    const nombre = await pregunta('📝 Nombre completo del catequista: ');
    if (!nombre) {
      console.log('❌ El nombre es obligatorio.');
      rl.close();
      return;
    }

    // ── CORREO ELECTRÓNICO ──
    const email = await pregunta('📧 Correo electrónico: ');
    if (!email || !email.includes('@')) {
      console.log('❌ Correo inválido. Debe contener @');
      rl.close();
      return;
    }

    // ── CONTRASEÑA ──
    const password = await pregunta('🔑 Contraseña (mínimo 8 caracteres): ');
    if (password.length < 8) {
      console.log('❌ La contraseña debe tener al menos 8 caracteres.');
      rl.close();
      return;
    }

    // ── GRUPO ──
    console.log('\n📚 Grupos disponibles:');
    gruposDisponibles.forEach((g, i) => {
      console.log(`   ${i + 1}. ${g}`);
    });

    const grupoIndex = await pregunta('\n✅ Selecciona el grupo (1-5): ');
    const grupo = gruposDisponibles[parseInt(grupoIndex) - 1];
    if (!grupo) {
      console.log('❌ Grupo inválido.');
      rl.close();
      return;
    }

    // ── ROL ──
    console.log('\n👤 Roles disponibles:');
    console.log('   1. Catequista');
    console.log('   2. Coordinador');

    const rolIndex = await pregunta('\n✅ Selecciona el rol (1-2): ');
    const rol = parseInt(rolIndex) === 2 ? 'coordinador' : 'catequista';

    // ── CONFIRMACIÓN ──
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE DATOS:');
    console.log('='.repeat(60));
    console.log(`   👤 Nombre:     ${nombre}`);
    console.log(`   📧 Email:      ${email}`);
    console.log(`   🔑 Contraseña: ${'*'.repeat(password.length)}`);
    console.log(`   📚 Grupo:      ${grupo}`);
    console.log(`   👤 Rol:        ${rol}`);
    console.log('='.repeat(60) + '\n');

    const confirmar = await pregunta('✅ ¿Crear este catequista? (s/n): ');
    if (confirmar.toLowerCase() !== 's') {
      console.log('❌ Cancelado.');
      rl.close();
      return;
    }

    // ── CREAR USUARIO ───────────────────────────────────────────────────
    console.log('\n⏳ Creando catequista...');

    // 1. Verificar si el usuario ya existe
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`⚠️ El usuario ${email} ya existe. UID: ${userRecord.uid}`);
      const sobrescribir = await pregunta('¿Quieres sobrescribir sus datos? (s/n): ');
      if (sobrescribir.toLowerCase() !== 's') {
        console.log('❌ Operación cancelada.');
        rl.close();
        return;
      }
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('✅ Usuario no existe. Creando nuevo...');
        userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: nombre,
        });
        console.log(`✅ Usuario creado. UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // 2. Crear/Actualizar documento en Firestore
    const userData = {
      uid: userRecord.uid,
      nombre: nombre.toUpperCase(),
      email: email,
      grupo: grupo,
      rol: rol,
      monedas: 0,
      nivelActual: 0,
      rango: rol === 'coordinador' ? 'Coordinador' : 'Catequista',
      racha: 0,
      vidas: 99,
      vidasPerdidas: [],
      avatar: '👨‍🏫',
      inventario: [],
      coleccion: [],
      nivelesCompletados: [],
      examenesAprobados: [],
      logrosPendientes: [],
      titulosDesbloqueados: [],
      marcosDesbloqueados: [],
      biografia: '',
      santoFavorito: '',
      contrasenaCambiada: false,
      esPrimeraVez: true,
      ultimaPrimeraLeccion: null,
      jugóHoy: null,
      corazonComprasHoy: 0,
      ultimaCompraCorazon: null,
      cofresMaderaHoy: 0,
      cofresPlataHoy: 0,
      cofresOroHoy: 0,
      ultimaFechaCofreMadera: null,
      ultimaFechaCofrePlata: null,
      ultimaFechaCofreOro: null,
      pocionesHoy: 0,
      ultimaFechaPocion: null,
      dobleXpHoy: 0,
      ultimaFechaDobleXp: null,
      protectorRachaHoy: 0,
      ultimaFechaProtectorRacha: null,
      ultimaEvaluacion: null,
      misiones: {
        diaActual: new Date().toISOString().split('T')[0],
        semanaActual: obtenerSemanaActual(),
        diarias: {},
        semanales: {},
      },
    };

    await db.collection('usuarios').doc(userRecord.uid).set(userData, { merge: true });
    console.log('✅ Documento en Firestore guardado/actualizado');

    // ── RESULTADO ───────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('✅ CATEQUISTA CREADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`   🆔 UID:       ${userRecord.uid}`);
    console.log(`   👤 Nombre:    ${nombre}`);
    console.log(`   📧 Email:     ${email}`);
    console.log(`   🔑 Contraseña: ${password}`);
    console.log(`   📚 Grupo:     ${grupo}`);
    console.log(`   👤 Rol:       ${rol}`);
    console.log('='.repeat(60));
    console.log('⚠️  GUARDA ESTOS DATOS EN UN LUGAR SEGURO');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
  }

  rl.close();
}

// ── HELPER ──────────────────────────────────────────────────────────────
function obtenerSemanaActual() {
  const d = new Date();
  const dia = d.getDay() || 7;
  d.setDate(d.getDate() - dia + 1);
  return d.toISOString().split('T')[0];
}

// ── EJECUTAR ────────────────────────────────────────────────────────────
crearCatequistaInteractivo();