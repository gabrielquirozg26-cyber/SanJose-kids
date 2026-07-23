// scripts/crearCatequistaAuto.js
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

// ── CONFIGURACIÓN DE GENERACIÓN ────────────────────────────────────────
const DOMAIN = '@sanjosekids.com';
const PASSWORD = 'Catequista2026!';

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

// ── FUNCIONES DE UTILIDAD ──────────────────────────────────────────────

// Función para limpiar nombres (sin tildes, espacios, etc.)
function limpiarNombre(nombre) {
  return nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Generar email automáticamente desde el nombre completo
function generarEmail(nombreCompleto) {
  if (!nombreCompleto || nombreCompleto.trim() === '') {
    return null;
  }

  const partes = nombreCompleto.trim().split(/\s+/);
  const primerNombre = partes[0] || '';
  const primerApellido = partes.length > 1 ? partes[1] : '';

  let emailBase = '';
  if (primerApellido) {
    emailBase = `${limpiarNombre(primerNombre)}.${limpiarNombre(primerApellido)}`;
  } else {
    emailBase = limpiarNombre(primerNombre);
  }

  return `${emailBase}${DOMAIN}`;
}

// Obtener semana actual
function obtenerSemanaActual() {
  const d = new Date();
  const dia = d.getDay() || 7;
  d.setDate(d.getDate() - dia + 1);
  return d.toISOString().split('T')[0];
}

// ── FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────
async function crearCatequistaAuto() {
  console.log('\n' + '='.repeat(60));
  console.log('👨‍🏫  CREAR CATEQUISTA AUTOMÁTICO - SAN JOSEKIDS');
  console.log('='.repeat(60) + '\n');

  try {
    // ── MODO DE OPERACIÓN ──
    console.log('📌 Selecciona modo de operación:');
    console.log('   1. Crear un solo catequista (interactivo)');
    console.log('   2. Crear múltiples catequistas en lote (desde lista)');
    
    const modo = await pregunta('\n✅ Selecciona opción (1-2): ');

    if (modo === '1') {
      await crearCatequistaIndividual();
    } else if (modo === '2') {
      await crearCatequistasLote();
    } else {
      console.log('❌ Opción inválida.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
  }

  rl.close();
}

// ── CREAR UN SOLO CATEQUISTA ──────────────────────────────────────────
async function crearCatequistaIndividual() {
  console.log('\n📝 Ingresa los datos del catequista:');

  // ── NOMBRE COMPLETO ──
  const nombre = await pregunta('📝 Nombre completo: ');
  if (!nombre) {
    console.log('❌ El nombre es obligatorio.');
    return;
  }

  // ── GENERAR EMAIL AUTOMÁTICAMENTE ──
  const email = generarEmail(nombre);
  if (!email) {
    console.log('❌ No se pudo generar un email válido.');
    return;
  }

  console.log(`📧 Email generado: ${email}`);

  // ── GRUPO ──
  console.log('\n📚 Grupos disponibles:');
  gruposDisponibles.forEach((g, i) => {
    console.log(`   ${i + 1}. ${g}`);
  });

  const grupoIndex = await pregunta('\n✅ Selecciona el grupo (1-5): ');
  const grupo = gruposDisponibles[parseInt(grupoIndex) - 1];
  if (!grupo) {
    console.log('❌ Grupo inválido.');
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
  console.log(`   🔑 Contraseña: ${PASSWORD}`);
  console.log(`   📚 Grupo:      ${grupo}`);
  console.log(`   👤 Rol:        ${rol}`);
  console.log('='.repeat(60) + '\n');

  const confirmar = await pregunta('✅ ¿Crear este catequista? (s/n): ');
  if (confirmar.toLowerCase() !== 's') {
    console.log('❌ Cancelado.');
    return;
  }

  // ── CREAR USUARIO ───────────────────────────────────────────────────
  await procesarCreacionCatequista(nombre, email, PASSWORD, grupo, rol);
}

// ── CREAR MÚLTIPLES CATEQUISTAS EN LOTE ──────────────────────────────
async function crearCatequistasLote() {
  console.log('\n📋 Ingresa los nombres de los catequistas (uno por línea):');
  console.log('📌 Escribe "FIN" o presiona Enter dos veces para terminar.\n');

  const nombres = [];
  let linea;

  while (true) {
    linea = await pregunta('> ');
    if (linea.toUpperCase() === 'FIN' || linea === '') {
      if (nombres.length === 0) {
        console.log('❌ No se ingresaron nombres.');
        return;
      }
      break;
    }
    if (linea.trim()) {
      nombres.push(linea.trim());
    }
  }

  console.log(`\n📋 Se procesarán ${nombres.length} catequistas.`);

  // ── GRUPO (aplicar a todos) ──
  console.log('\n📚 Grupos disponibles:');
  gruposDisponibles.forEach((g, i) => {
    console.log(`   ${i + 1}. ${g}`);
  });

  const grupoIndex = await pregunta('\n✅ Selecciona el grupo para todos (1-5): ');
  const grupo = gruposDisponibles[parseInt(grupoIndex) - 1];
  if (!grupo) {
    console.log('❌ Grupo inválido.');
    return;
  }

  // ── ROL (aplicar a todos) ──
  console.log('\n👤 Roles disponibles:');
  console.log('   1. Catequista');
  console.log('   2. Coordinador');

  const rolIndex = await pregunta('\n✅ Selecciona el rol para todos (1-2): ');
  const rol = parseInt(rolIndex) === 2 ? 'coordinador' : 'catequista';

  // ── CONFIRMACIÓN ──
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE LOTE:');
  console.log('='.repeat(60));
  console.log(`   👤 Cantidad:   ${nombres.length} catequistas`);
  console.log(`   📧 Dominio:    ${DOMAIN}`);
  console.log(`   🔑 Contraseña: ${PASSWORD}`);
  console.log(`   📚 Grupo:      ${grupo}`);
  console.log(`   👤 Rol:        ${rol}`);
  console.log('\n📋 Lista de nombres:');
  nombres.forEach((n, i) => console.log(`   ${i + 1}. ${n}`));
  console.log('='.repeat(60) + '\n');

  const confirmar = await pregunta('✅ ¿Crear estos catequistas? (s/n): ');
  if (confirmar.toLowerCase() !== 's') {
    console.log('❌ Cancelado.');
    return;
  }

  // ── PROCESAR LOTE ───────────────────────────────────────────────────
  console.log('\n⏳ Procesando lote...\n');
  
  let creados = 0;
  let errores = 0;
  const resultados = [];

  for (const nombre of nombres) {
    const email = generarEmail(nombre);
    if (!email) {
      console.log(`   ⏭️ Saltando: ${nombre} (no se pudo generar email)`);
      errores++;
      resultados.push({ nombre, email: 'N/A', estado: 'Error', error: 'Email no generado' });
      continue;
    }

    console.log(`   🔄 Procesando: ${nombre} → ${email}`);
    
    try {
      await procesarCreacionCatequista(nombre, email, PASSWORD, grupo, rol);
      creados++;
      resultados.push({ nombre, email, estado: 'OK' });
      // Pequeña pausa entre creaciones
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`   ❌ Error con ${nombre}:`, error.message);
      errores++;
      resultados.push({ nombre, email, estado: 'Error', error: error.message });
    }
  }

  // ── RESUMEN DE LOTE ──
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE CREACIÓN EN LOTE');
  console.log('='.repeat(60));
  console.log(`✅ Creados: ${creados}`);
  console.log(`❌ Errores: ${errores}`);
  console.log(`📋 Total: ${nombres.length}`);
  
  // Guardar resultados
  const fecha = new Date().toISOString().split('T')[0];
  const archivoResultados = path.join(__dirname, `resultados_catequistas_lote_${fecha}.json`);
  fs.writeFileSync(archivoResultados, JSON.stringify(resultados, null, 2));
  console.log(`\n📄 Detalles guardados en: ${archivoResultados}`);
}

// ── FUNCIÓN PRINCIPAL DE CREACIÓN ─────────────────────────────────────
async function procesarCreacionCatequista(nombre, email, password, grupo, rol) {
  let userRecord;

  // 1. Verificar si el usuario ya existe
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`   ⚠️ El usuario ${email} ya existe. UID: ${userRecord.uid}`);
    
    const sobrescribir = await pregunta('   ¿Quieres sobrescribir sus datos? (s/n): ');
    if (sobrescribir.toLowerCase() !== 's') {
      console.log('   ❌ Operación cancelada para este usuario.');
      return;
    }
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('   ✅ Usuario no existe. Creando nuevo...');
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: nombre.toUpperCase(),
      });
      console.log(`   ✅ Usuario creado. UID: ${userRecord.uid}`);
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
  console.log('   ✅ Documento en Firestore guardado/actualizado');

  // ── MOSTRAR RESULTADO ──────────────────────────────────────────────
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

  return userRecord;
}

// ── EJECUTAR ────────────────────────────────────────────────────────────
crearCatequistaAuto();