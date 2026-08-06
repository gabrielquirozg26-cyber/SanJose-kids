// scripts/generarCredencialesNinos.js
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── CONFIGURACIÓN ────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf8')
);

initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();
const auth = getAuth();

const PASSWORD = 'SanJose2026!';
const gruposDisponibles = [
  'San Francisco de Asís',
  'San Diego de Alcalá',
  'Santa Clara de Asís',
  'San Antonio de Padua',
  'Santa Rosa de Viterbo',
];

// ── FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────
async function generarCredencialesNinos() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 GENERAR CREDENCIALES DE NIÑOS - SAN JOSEKIDS');
  console.log('='.repeat(60) + '\n');

  try {
    // ── MODO DE OPERACIÓN ──
    console.log('📌 Selecciona el origen de los datos:');
    console.log('   1. Desde Firestore (todos los niños existentes)');
    console.log('   2. Desde lista de nombres (crear credenciales para nuevos niños)');
    
    const modo = await pregunta('\n✅ Selecciona opción (1-2): ');

    if (modo === '1') {
      await generarDesdeFirestore();
    } else if (modo === '2') {
      await generarDesdeLista();
    } else {
      console.log('❌ Opción inválida.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  rl.close();
}

// ── GENERAR DESDE FIRESTORE ─────────────────────────────────────────────
async function generarDesdeFirestore() {
  console.log('\n📡 Obteniendo usuarios de Firestore...');

  try {
    const usuariosSnapshot = await db.collection('usuarios')
      .where('rol', '==', 'estudiante')
      .get();

    if (usuariosSnapshot.empty) {
      console.log('❌ No se encontraron niños registrados.');
      return;
    }

    const usuarios = [];
    usuariosSnapshot.forEach(doc => {
      const data = doc.data();
      usuarios.push({
        nombre: data.nombre || 'Sin nombre',
        email: data.email || 'Sin email',
        grupo: data.grupo || 'Sin grupo',
        uid: data.uid
      });
    });

    // Ordenar por grupo y luego por nombre
    usuarios.sort((a, b) => {
      if (a.grupo < b.grupo) return -1;
      if (a.grupo > b.grupo) return 1;
      if (a.nombre < b.nombre) return -1;
      if (a.nombre > b.nombre) return 1;
      return 0;
    });

    console.log(`✅ Encontrados ${usuarios.length} niños en Firestore.`);
    
    // Generar el JSON organizado por grupo
    const credenciales = organizarPorGrupo(usuarios);
    guardarCredenciales(credenciales);

  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error.message);
  }
}

// ── GENERAR DESDE LISTA DE NOMBRES ─────────────────────────────────────
async function generarDesdeLista() {
  console.log('\n📝 Ingresa los nombres de los niños (uno por línea):');
  console.log('📌 Formato: "Nombre Completo, Grupo" (ej: "Juan Pérez, San Francisco de Asís")');
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

  console.log(`\n✅ Procesando ${nombres.length} nombres...`);

  // Procesar los nombres y generar credenciales
  const usuarios = [];
  let errores = 0;

  for (const linea of nombres) {
    // Separar nombre y grupo
    const partes = linea.split(',').map(p => p.trim());
    const nombreCompleto = partes[0];
    const grupo = partes.length > 1 ? partes[1] : null;

    // Validar grupo
    let grupoValido = grupo;
    if (grupoValido && !gruposDisponibles.includes(grupoValido)) {
      console.log(`   ⚠️ Grupo inválido para "${nombreCompleto}": ${grupoValido}`);
      console.log(`   📌 Usando grupo: Sin asignar`);
      grupoValido = 'Sin asignar';
    } else if (!grupoValido) {
      console.log(`   ⚠️ Sin grupo para "${nombreCompleto}"`);
      grupoValido = 'Sin asignar';
    }

    // Generar email
    const email = generarEmail(nombreCompleto);
    if (!email) {
      console.log(`   ❌ No se pudo generar email para: ${nombreCompleto}`);
      errores++;
      continue;
    }

    usuarios.push({
      nombre: nombreCompleto.toUpperCase(),
      email: email,
      grupo: grupoValido,
      contrasena: PASSWORD
    });
  }

  if (usuarios.length === 0) {
    console.log('❌ No se generaron credenciales válidas.');
    return;
  }

  console.log(`✅ Credenciales generadas: ${usuarios.length}`);
  console.log(`❌ Errores: ${errores}`);

  // Ordenar por grupo y luego por nombre
  usuarios.sort((a, b) => {
    if (a.grupo < b.grupo) return -1;
    if (a.grupo > b.grupo) return 1;
    if (a.nombre < b.nombre) return -1;
    if (a.nombre > b.nombre) return 1;
    return 0;
  });

  // Organizar por grupo
  const credenciales = organizarPorGrupo(usuarios);
  guardarCredenciales(credenciales);
}

// ── ORGANIZAR POR GRUPO ────────────────────────────────────────────────
function organizarPorGrupo(usuarios) {
  const porGrupo = {};

  // Agrupar por grupo
  usuarios.forEach(usuario => {
    const grupo = usuario.grupo || 'Sin grupo';
    if (!porGrupo[grupo]) {
      porGrupo[grupo] = [];
    }
    porGrupo[grupo].push({
      nombre: usuario.nombre,
      email: usuario.email,
      contrasena: usuario.contrasena || PASSWORD,
      uid: usuario.uid || null
    });
  });

  return {
    fechaGeneracion: new Date().toISOString(),
    contrasenaGenerica: PASSWORD,
    totalUsuarios: usuarios.length,
    grupos: porGrupo
  };
}

// ── GUARDAR CREDENCIALES ────────────────────────────────────────────────
function guardarCredenciales(credenciales) {
  const fecha = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivo = path.join(__dirname, `credenciales_ninos_${fecha}.json`);
  const archivoTxt = path.join(__dirname, `credenciales_ninos_${fecha}.txt`);

  // Guardar JSON
  fs.writeFileSync(archivo, JSON.stringify(credenciales, null, 2));
  console.log(`\n✅ JSON guardado en: ${archivo}`);

  // Guardar TXT para impresión
  let txtContent = '';
  txtContent += '='.repeat(70) + '\n';
  txtContent += '        CREDENCIALES DE NIÑOS - SAN JOSEKIDS\n';
  txtContent += '='.repeat(70) + '\n';
  txtContent += `Fecha: ${new Date().toLocaleString()}\n`;
  txtContent += `Contraseña genérica: ${PASSWORD}\n`;
  txtContent += `Total de niños: ${credenciales.totalUsuarios}\n`;
  txtContent += '='.repeat(70) + '\n\n';

  // Ordenar grupos alfabéticamente
  const gruposOrdenados = Object.keys(credenciales.grupos).sort();

  gruposOrdenados.forEach(grupo => {
    const usuarios = credenciales.grupos[grupo];
    txtContent += `📚 GRUPO: ${grupo}\n`;
    txtContent += '-'.repeat(70) + '\n';
    txtContent += '  #  | NOMBRE                               | EMAIL\n';
    txtContent += '-'.repeat(70) + '\n';

    usuarios.forEach((usuario, index) => {
      const num = String(index + 1).padStart(3, ' ');
      const nombre = usuario.nombre.padEnd(38, ' ');
      const email = usuario.email || 'Sin email';
      txtContent += `  ${num} | ${nombre} | ${email}\n`;
    });

    txtContent += '\n';
  });

  txtContent += '='.repeat(70) + '\n';
  txtContent += '       INSTRUCCIONES PARA ENTREGAR\n';
  txtContent += '='.repeat(70) + '\n';
  txtContent += `1. Cada niño recibe su correo electrónico.\n`;
  txtContent += `2. La contraseña genérica es: ${PASSWORD}\n`;
  txtContent += `3. Recomendar cambiar la contraseña al primer inicio de sesión.\n`;
  txtContent += `4. Link de acceso: https://sanjosekids.com\n`;
  txtContent += '='.repeat(70) + '\n';

  fs.writeFileSync(archivoTxt, txtContent);
  console.log(`✅ TXT para impresión guardado en: ${archivoTxt}`);

  // Mostrar resumen en consola
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE CREDENCIALES GENERADAS');
  console.log('='.repeat(60));
  console.log(`📋 Total niños: ${credenciales.totalUsuarios}`);
  console.log(`🔑 Contraseña genérica: ${PASSWORD}`);
  console.log(`📚 Grupos: ${Object.keys(credenciales.grupos).length}`);
  
  console.log('\n📋 Distribución por grupo:');
  gruposOrdenados.forEach(grupo => {
    const cantidad = credenciales.grupos[grupo].length;
    console.log(`   📚 ${grupo}: ${cantidad} niños`);
  });

  console.log('\n📄 Archivos generados:');
  console.log(`   📄 JSON: ${path.basename(archivo)}`);
  console.log(`   📄 TXT:  ${path.basename(archivoTxt)}`);
  console.log('\n🎉 ¡Credenciales generadas exitosamente!');
}

// ── FUNCIONES DE UTILIDAD ──────────────────────────────────────────────

// Limpiar nombres (sin tildes, espacios, etc.)
function limpiarNombre(nombre) {
  return nombre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Generar email automáticamente
function generarEmail(nombreCompleto) {
  if (!nombreCompleto || nombreCompleto.trim() === '') {
    return null;
  }

  // Ignorar nombres con palabras clave
  const nombreUpper = nombreCompleto.toUpperCase();
  if (nombreUpper.includes('CONTROL') || 
      nombreUpper.includes('GRUPO:') || 
      nombreUpper.includes('EQUIPO') ||
      nombreUpper.includes('CATEQUESIS') ||
      nombreUpper.includes('CATEQUISTAS') ||
      nombreUpper.includes('No.') ||
      !isNaN(nombreCompleto)) {
    return null;
  }

  const partes = nombreCompleto.trim().split(/\s+/);
  const primerNombre = partes[0] || '';
  const primerApellido = partes.length > 1 ? partes[1] : '';
  const segundoApellido = partes.length > 2 ? partes[2] : '';

  let emailBase = '';
  if (primerApellido && segundoApellido) {
    emailBase = `${limpiarNombre(primerNombre)}.${limpiarNombre(primerApellido)}.${limpiarNombre(segundoApellido)}`;
  } else if (primerApellido) {
    emailBase = `${limpiarNombre(primerNombre)}.${limpiarNombre(primerApellido)}`;
  } else {
    emailBase = limpiarNombre(primerNombre);
  }

  return `${emailBase}@sanjosekids.com`;
}

// ── INTERFAZ DE CONSOLA ─────────────────────────────────────────────────
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pregunta = (texto) => new Promise((resolve) => {
  rl.question(texto, (respuesta) => {
    resolve(respuesta.trim());
  });
});

// ── EJECUTAR ────────────────────────────────────────────────────────────
generarCredencialesNinos();