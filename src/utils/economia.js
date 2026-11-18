import { obtenerProgreso } from './progreso.js';

export const fechaJuego = (ahora = Date.now()) => new Date(ahora).toISOString().slice(0, 10);
export const semanaJuego = (hoy = fechaJuego()) => {
  const fecha = new Date(`${hoy}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() - ((fecha.getUTCDay() || 7) - 1));
  return fecha.toISOString().slice(0, 10);
};

export const PRODUCTOS = {
  corazon_extra: { precio: 150, limite: 3, contador: 'corazonComprasHoy', fecha: 'ultimaCompraCorazon' },
  pocion_sabiduria: { precio: 120, limite: 2, maximo: 3, contador: 'pocionesHoy', fecha: 'ultimaFechaPocion' },
  doble_xp: { precio: 80, limite: 3, contador: 'dobleXpHoy', fecha: 'ultimaFechaDobleXp' },
  protector_racha: { precio: 100, limite: 1, contador: 'protectorRachaHoy', fecha: 'ultimaFechaProtectorRacha' },
  escudo_miguel: { precio: 150, maximo: 1 },
  titulo_guardian: { precio: 800, maximo: 1, rango: 'Guardián del Credo' },
  titulo_maestro: { precio: 1200, maximo: 1, rango: 'Maestro de la Fe' },
  aura_santidad: { precio: 500, maximo: 1 },
  marco_vitral_azul: { precio: 350, maximo: 1 },
  marco_vitral_dorado: { precio: 600, maximo: 1 },
  cofre_madera: { precio: 200, limite: 3, contador: 'cofresMaderaHoy', fecha: 'ultimaFechaCofreMadera', cofre: 'madera' },
  cofre_plata: { precio: 300, limite: 2, contador: 'cofresPlataHoy', fecha: 'ultimaFechaCofrePlata', cofre: 'plata', compensacionMinima: 100 },
  cofre_oro: { precio: 450, limite: 1, contador: 'cofresOroHoy', fecha: 'ultimaFechaCofreOro', cofre: 'oro', compensacionMinima: 200 },
};

const OFERTAS = [
  { id: 'corazon_extra', nombre: 'Corazón Extra', icono: '❤️', precioOriginal: 150, descuento: 30, precioOferta: 105 },
  { id: 'doble_xp', nombre: 'Doble XP', icono: '⚡', precioOriginal: 80, descuento: 25, precioOferta: 60 },
  { id: 'protector_racha', nombre: 'Protector de Racha', icono: '🔥', precioOriginal: 100, descuento: 20, precioOferta: 80 },
  { id: 'pocion_sabiduria', nombre: 'Poción de Sabiduría', icono: '🧪', precioOriginal: 120, descuento: 20, precioOferta: 96 },
];
export const ofertaDelDia = (hoy = fechaJuego()) => OFERTAS[Number(hoy.slice(-2)) % OFERTAS.length];
export const comprasDelDia = (data, id, hoy = fechaJuego()) => {
  const producto = PRODUCTOS[id];
  return data?.[producto.fecha] === hoy ? (data[producto.contador] ?? 0) : 0;
};

// Cada callback trabaja con el snapshot actual; nunca con el saldo de una renderización anterior.
export async function operarUsuario(transaction, ref, operacion) {
  const snapshot = await transaction.get(ref);
  if (!snapshot.exists()) throw new Error('No se encontró tu perfil. Vuelve a iniciar sesión.');
  const { cambios = {}, resultado } = operacion(snapshot.data());
  if (Object.keys(cambios).length) transaction.update(ref, cambios);
  return resultado;
}

export function quitarUnaUnidad(inventario = [], id) {
  const indice = inventario.indexOf(id);
  return indice < 0 ? null : [...inventario.slice(0, indice), ...inventario.slice(indice + 1)];
}
export function consumirUnidad(data, id) {
  const inventario = quitarUnaUnidad(data.inventario, id);
  return inventario ? { cambios: { inventario }, resultado: true } : { resultado: false };
}

export const vidasActivas = (data, ahora = Date.now()) =>
  (data.vidasPerdidas ?? []).filter(ts => ahora - ts < 4 * 60 * 60 * 1000).sort((a, b) => a - b);

export function modificarVidas(data, modo, ahora = Date.now()) {
  const activas = vidasActivas(data, ahora);
  let perdidas = activas;
  if (modo === 'restar' && activas.length < 5) perdidas = [...activas, ahora];
  if (modo === 'añadir' && activas.length) perdidas = activas.slice(1);
  const cambiaron = JSON.stringify(perdidas) !== JSON.stringify(data.vidasPerdidas ?? []);
  return { cambios: cambiaron ? { vidasPerdidas: perdidas } : {}, resultado: 5 - perdidas.length };
}

export function entregarColeccionable(data, santo, compensacionMinima = 0) {
  if (!santo?.id) throw new Error('No se pudo preparar el cofre. No se realizó ningún cobro.');
  const repetido = (data.coleccion ?? []).includes(santo.id);
  const compensacion = Math.max(compensacionMinima, { comun: 50, raro: 100, legendario: 200 }[santo.rareza] ?? 50);
  return {
    cambios: {
      cofresAbiertos: (data.cofresAbiertos ?? 0) + 1,
      ...(repetido ? { monedas: (data.monedas ?? 0) + compensacion } : { coleccion: [...(data.coleccion ?? []), santo.id] }),
    },
    resultado: repetido ? { tipo: 'repetido', santo, compensacion } : { tipo: 'nuevo', santo },
  };
}

export function seleccionarSanto(catalogo, tipo, random = Math.random) {
  const probabilidades = { madera: [0, 0.15], plata: [0.1, 0.5], oro: [0.3, 0.5] }[tipo];
  if (!probabilidades) throw new Error('Tipo de cofre inválido.');
  const valor = random();
  const rareza = valor < probabilidades[0] ? 'legendario' : valor < probabilidades[0] + probabilidades[1] ? 'raro' : 'comun';
  const candidatos = catalogo.filter(santo => santo.rareza === rareza);
  if (!candidatos.length) throw new Error('No hay santos disponibles para este cofre.');
  return candidatos[Math.floor(random() * candidatos.length)];
}

export function prepararCompra(data, id, { oferta = false, ahora = Date.now(), santo, definiciones } = {}) {
  const producto = PRODUCTOS[id];
  if (!producto) throw new Error('Este objeto no está disponible en la tienda.');
  const hoy = fechaJuego(ahora);
  const promocion = ofertaDelDia(hoy);
  if (oferta && promocion.id !== id) throw new Error('La oferta cambió. Actualiza la tienda.');
  const precio = oferta ? promocion.precioOferta : producto.precio;
  const compras = producto.limite ? comprasDelDia(data, id, hoy) : 0;
  if (producto.limite && compras >= producto.limite) throw new Error('Alcanzaste el límite de compras de hoy.');
  if ((data.monedas ?? 0) < precio) throw new Error(`Necesitas ${precio - (data.monedas ?? 0)} monedas más.`);
  const inventario = data.inventario ?? [];
  if (producto.maximo && inventario.filter(item => item === id).length >= producto.maximo) {
    throw new Error('Ya tienes este objeto o tu inventario está lleno.');
  }
  let cambios = { monedas: (data.monedas ?? 0) - precio };
  let recompensa;
  if (id === 'corazon_extra') {
    const perdidas = vidasActivas(data, ahora);
    if (!perdidas.length) throw new Error('Tus vidas ya están completas.');
    cambios.vidasPerdidas = perdidas.slice(1);
  } else if (producto.cofre) {
    const entrega = entregarColeccionable({ ...data, ...cambios }, santo, producto.compensacionMinima);
    cambios = { ...cambios, ...entrega.cambios };
    recompensa = entrega.resultado;
  } else {
    cambios.inventario = [...inventario, id];
    if (producto.rango) cambios.rango = producto.rango;
    if (id.startsWith('marco_')) {
      cambios.marcosDesbloqueados = [...new Set([...(data.marcosDesbloqueados ?? []), id])];
      cambios.marcoEquipado = id;
    }
  }
  if (producto.limite) Object.assign(cambios, { [producto.contador]: compras + 1, [producto.fecha]: hoy });
  if (recompensa?.compensacion) cambios = conMisiones(data, cambios, definiciones, [['monedas', recompensa.compensacion]], hoy);
  return { cambios, resultado: { precio, recompensa, tipoCofre: producto.cofre } };
}

export function iniciarSesionLeccion(data, leccionId, sesionId) {
  // Una recarga o un reintento al abrir la misma lección no gasta otro potenciador.
  if (data.sesionLeccion?.leccionId === leccionId && !data.sesionLeccion.finalizada) {
    return { resultado: data.sesionLeccion };
  }
  const inventario = quitarUnaUnidad(data.inventario, 'doble_xp');
  const sesionLeccion = { id: sesionId, leccionId, multiplicador: inventario ? 2 : 1, ejerciciosPagados: [], finalizada: false };
  return { cambios: { sesionLeccion, ...(inventario ? { inventario } : {}) }, resultado: sesionLeccion };
}

export function premiarEjercicio(data, sesionId, clave, base, definiciones) {
  const sesion = data.sesionLeccion;
  if (sesion?.id !== sesionId || sesion.finalizada) throw new Error('Esta lección ya terminó o se abrió en otra pestaña. Vuelve al mapa.');
  if (!Number.isInteger(base) || base < 0 || !clave) throw new Error('Recompensa de ejercicio inválida.');
  if (sesion.ejerciciosPagados.includes(clave)) return { resultado: 0 };
  const monedas = base * sesion.multiplicador;
  return {
    cambios: conMisiones(data, { monedas: (data.monedas ?? 0) + monedas, sesionLeccion: { ...sesion, ejerciciosPagados: [...sesion.ejerciciosPagados, clave] } }, definiciones, [['monedas', monedas]]),
    resultado: monedas,
  };
}

const diasEntre = (desde, hasta) => desde ? Math.round((Date.parse(hasta) - Date.parse(desde)) / 86400000) : Infinity;
export function protegerRacha(data, hoy = fechaJuego()) {
  const dias = diasEntre(data.jugóHoy, hoy);
  if (dias <= 1 || data.rachaProtegidaHasta === hoy || !data.racha) return { resultado: false };
  const inventario = dias === 2 ? quitarUnaUnidad(data.inventario, 'protector_racha') : null;
  return inventario
    ? { cambios: { inventario, rachaProtegidaHasta: hoy }, resultado: true }
    : { cambios: { racha: 0 }, resultado: false };
}

export function registrarActividadDiaria(data, hoy = fechaJuego()) {
  if (data.ultimaPrimeraLeccion === hoy) return { resultado: null };
  const proteccion = protegerRacha(data, hoy).cambios ?? {};
  const actual = { ...data, ...proteccion };
  const dias = diasEntre(actual.jugóHoy, hoy);
  const racha = actual.jugóHoy === hoy ? (actual.racha ?? 1)
    : (dias <= 1 || actual.rachaProtegidaHasta === hoy) ? (actual.racha ?? 0) + 1 : 1;
  const monedas = racha >= 7 ? 200 : racha >= 3 ? 100 : 50;
  return {
    cambios: { ...proteccion, monedas: (data.monedas ?? 0) + monedas, racha, jugóHoy: hoy, ultimaPrimeraLeccion: hoy },
    resultado: { monedas, racha },
  };
}

export function finalizarSesionLeccion(data, { sesionId, leccion, unidades, santo, tituloId, perfecta, definiciones, hoy = fechaJuego() }) {
  const sesion = data.sesionLeccion;
  if (sesion?.id !== sesionId || sesion.leccionId !== leccion.id) throw new Error('La sesión de esta lección cambió. Vuelve al mapa.');
  if (sesion.finalizada) return { resultado: { primera: false, duplicada: true, bonus: sesion.bonusFinal ?? 0 } };
  const primera = !(data.nivelesCompletados ?? []).includes(leccion.id);
  const nivelesCompletados = [...new Set([...(data.nivelesCompletados ?? []), leccion.id])];
  const bonus = primera && leccion.tipo === 'concepto' ? 100 * sesion.multiplicador : 0;
  let cambios = {
    nivelActual: obtenerProgreso(nivelesCompletados, unidades).nivelActual,
    nivelesCompletados, sesionLeccion: { ...sesion, finalizada: true, bonusFinal: bonus },
    monedas: (data.monedas ?? 0) + bonus,
  };
  let recompensa;
  if (primera) {
    const entrega = entregarColeccionable({ ...data, ...cambios }, santo);
    cambios = { ...cambios, ...entrega.cambios };
    recompensa = entrega.resultado;
  }
  // Permite recuperar un título omitido por los IDs antiguos, sin repetir cofres ni monedas.
  if (tituloId && !(data.titulosDesbloqueados ?? []).some(t => t.id === tituloId) && !(data.logrosPendientes ?? []).some(t => t.id === tituloId)) {
    cambios.logrosPendientes = [...(data.logrosPendientes ?? []), { id: tituloId, fecha: `${hoy}T00:00:00.000Z` }];
  }
  const actividad = registrarActividadDiaria({ ...data, ...cambios }, hoy);
  cambios = { ...cambios, ...actividad.cambios };
  cambios = conMisiones(data, cambios, definiciones, [
    ['lecciones', 1], ['niveles', 1, leccion.id], ['perfectas', perfecta ? 1 : 0],
    ['racha', actividad.resultado ? 1 : 0], ['racha_semanal', actividad.resultado ? 1 : 0],
    ['monedas', bonus + (actividad.resultado?.monedas ?? 0) + (recompensa?.compensacion ?? 0)],
  ], hoy);
  return { cambios, resultado: { primera, bonus, recompensa, racha: actividad.resultado } };
}

export function premiarExamen(data, unidad, santo, definiciones) {
  if ((data.examenesAprobados ?? []).includes(unidad)) return { resultado: { monedas: 0 } };
  const entrega = entregarColeccionable({ ...data, monedas: (data.monedas ?? 0) + 200 }, santo);
  return {
    cambios: conMisiones(data, { monedas: (data.monedas ?? 0) + 200, examenesAprobados: [...(data.examenesAprobados ?? []), unidad], ...entrega.cambios }, definiciones,
      [['monedas', 200 + (entrega.resultado.compensacion ?? 0)]]),
    resultado: { monedas: 200, recompensa: entrega.resultado },
  };
}

export function premiarRespuestaExamen(data, clave, base, definiciones) {
  if (!Number.isInteger(base) || base <= 0 || !clave) throw new Error('Recompensa inválida.');
  const pagadas = data.respuestasExamenPagadas ?? [];
  if (pagadas.includes(clave)) return { resultado: 0 };
  return {
    cambios: conMisiones(data, { monedas: (data.monedas ?? 0) + base,
      respuestasExamenPagadas: [...pagadas.slice(-511), clave] }, definiciones, [['monedas', base]]),
    resultado: base,
  };
}

export function comprarTitulo(data, titulo, ahora = Date.now()) {
  if (!titulo || !Number.isInteger(titulo.precio) || titulo.precio <= 0) throw new Error('Título no disponible.');
  if ((data.titulosDesbloqueados ?? []).some(t => t.id === titulo.id)) throw new Error('Ya tienes este título.');
  if ((data.monedas ?? 0) < titulo.precio) throw new Error('No tienes suficientes monedas para este título.');
  const nuevo = { id: titulo.id, nombre: titulo.nombre, rareza: titulo.rareza, fecha: new Date(ahora).toISOString() };
  return {
    cambios: { monedas: (data.monedas ?? 0) - titulo.precio, titulosDesbloqueados: [...(data.titulosDesbloqueados ?? []), nuevo], tituloEquipado: nuevo.id },
    resultado: nuevo,
  };
}

export function canjearTitulo(data, titulo, ahora = Date.now()) {
  if (!titulo || !(data.logrosPendientes ?? []).some(logro => logro.id === titulo.id)) return { resultado: false };
  if ((data.titulosDesbloqueados ?? []).some(t => t.id === titulo.id)) return { resultado: false };
  const nuevo = { id: titulo.id, nombre: titulo.nombre, rareza: titulo.rareza, fecha: new Date(ahora).toISOString() };
  return {
    cambios: {
      titulosDesbloqueados: [...(data.titulosDesbloqueados ?? []), nuevo],
      logrosPendientes: data.logrosPendientes.filter(logro => logro.id !== titulo.id),
      ...(!data.tituloEquipado ? { tituloEquipado: nuevo.id } : {}),
    },
    resultado: nuevo,
  };
}

export function normalizarMisiones(misiones, definiciones, hoy = fechaJuego()) {
  const semana = semanaJuego(hoy);
  const nuevo = { ...misiones, diaActual: hoy, semanaActual: semana,
    nivelesDistintos: misiones?.semanaActual === semana ? (misiones.nivelesDistintos ?? []) : [] };
  for (const grupo of ['diarias', 'semanales']) {
    const mismoPeriodo = grupo === 'diarias' ? misiones?.diaActual === hoy : misiones?.semanaActual === semana;
    nuevo[grupo] = Object.fromEntries(definiciones[grupo].map(def => [def.id,
      mismoPeriodo && misiones?.[grupo]?.[def.id] ? { ...misiones[grupo][def.id] } : { progreso: 0, reclamada: false }]));
  }
  return nuevo;
}

export function conMisiones(data, cambios, definiciones, eventos, hoy = fechaJuego()) {
  if (!definiciones) return cambios;
  let estado = { ...data, ...cambios };
  for (const [tipo, cantidad, leccionId] of eventos) {
    if (!cantidad) continue;
    const avance = avanzarMisiones(estado, definiciones, tipo, cantidad, hoy, leccionId);
    estado = { ...estado, ...avance.cambios };
  }
  return { ...cambios, ...(estado.misiones ? { misiones: estado.misiones } : {}) };
}

export function avanzarMisiones(data, definiciones, tipo, cantidad, hoy = fechaJuego(), leccionId) {
  const misiones = normalizarMisiones(data.misiones, definiciones, hoy);
  if (tipo === 'niveles' && leccionId) {
    const distintos = data.misiones?.semanaActual === misiones.semanaActual ? (data.misiones.nivelesDistintos ?? []) : [];
    if (distintos.includes(leccionId)) return { resultado: false };
    misiones.nivelesDistintos = [...distintos, leccionId];
  } else if (data.misiones?.semanaActual === misiones.semanaActual) {
    misiones.nivelesDistintos = data.misiones.nivelesDistintos ?? [];
  }
  for (const grupo of ['diarias', 'semanales']) {
    for (const def of definiciones[grupo]) {
      const progreso = misiones[grupo][def.id];
      if (def.tipo === tipo && !progreso.reclamada) progreso.progreso = Math.min(def.meta, progreso.progreso + cantidad);
    }
  }
  return { cambios: { misiones }, resultado: true };
}

export function reclamarPremioMision(data, definiciones, grupo, id, hoy = fechaJuego()) {
  const definicion = definiciones[grupo]?.find(m => m.id === id);
  if (!definicion) throw new Error('Misión no disponible.');
  const misiones = normalizarMisiones(data.misiones, definiciones, hoy);
  const mision = misiones[grupo][id];
  if (mision.reclamada || mision.progreso < definicion.meta) return { resultado: false };
  mision.reclamada = true;
  return { cambios: { misiones, monedas: (data.monedas ?? 0) + definicion.recompensa }, resultado: true };
}
