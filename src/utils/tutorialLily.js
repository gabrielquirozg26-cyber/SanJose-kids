export const VERSION_TUTORIAL = 'lily-2026-11-18-v1';
const LANZAMIENTO = Date.parse('2026-11-18T00:00:00Z');
const memoria = new Map();
export const claveTutorial = uid => 'sanjosekids:tutorial-lily:' + uid;

export const PASOS_COMPLETOS = [
  { id: 'hola', tab: 'mapa', titulo: '¡Hola! Soy Lily', texto: 'Voy a enseñarte tu aventura de fe. Solo miraremos juntos: no gastarás monedas ni empezarás una lección.', icono: '✦' },
  { id: 'mapa', tab: 'mapa', foco: 'continuar', alternativa: 'mapa-progreso', titulo: 'Un paso a la vez', texto: 'En el mapa, ¡Continuar! te lleva a tu siguiente lección. Las que ya terminaste se pueden repasar sin sumar otro nivel.', icono: '🗺️' },
  { id: 'navegar', tab: 'mapa', foco: 'navegacion', titulo: 'Tus caminos están aquí', texto: 'Estos botones te llevan al mapa, álbum, tienda, ranking, misiones y perfil. Siempre puedes volver al mapa.', icono: '🧭' },
  { id: 'racha', tab: 'mapa', foco: 'racha', titulo: '¡Enciende tu luz de hoy!', texto: 'Completa una lección para cuidar tu racha. Aquí verás si hoy ya jugaste. Si un día no puedes, podemos comenzar otra vez.', icono: '🔥' },
  { id: 'album', tab: 'album', foco: 'album', titulo: 'Amigos para tu aventura', texto: 'Los santos que descubres viven en tu álbum. Toca una carta que tengas para conocer su historia.', icono: '📖' },
  { id: 'cofres', tab: 'album', foco: 'album', titulo: 'Un regalo por descubrir', texto: 'Una lección nueva puede darte un cofre. Elige cuándo abrirlo y descubre a tu nuevo amigo. Si ya lo tienes, recibes monedas.', icono: '🎁' },
  { id: 'misiones', tab: 'misiones', foco: 'misiones', titulo: 'Pequeños retos, grandes pasos', texto: 'Las misiones te proponen metas para hoy y esta semana. Cuando completes una, podrás recoger su premio.', icono: '⭐' },
  { id: 'tienda', tab: 'tienda', foco: 'inventario', titulo: 'Tu mochila de ayudas', texto: 'Aquí ves los objetos que tienes y para qué sirven. En la tienda siempre puedes revisar el precio antes de comprar.', icono: '🎒' },
  { id: 'compartir', tab: 'perfil', foco: 'compartir', titulo: 'Mira lo que aprendí', texto: 'Desde tu perfil puedes preparar una tarjeta con tu nivel, racha y logros. Usa un apodo y compártela con tu familia solo si quieres.', icono: '💛' },
  { id: 'listo', tab: 'mapa', titulo: '¡Ya conoces el camino!', texto: 'Tu aventura es a tu ritmo. Si necesitas mi ayuda, busca “Lily, muéstrame el juego” en tu perfil.', icono: '✨' },
];
export const PASOS_ACTUALIZACION = [
  { id: 'novedades', tab: 'mapa', titulo: '¡Hay nuevas luces por descubrir!', texto: 'Soy Lily. Te mostraré las novedades en un recorrido corto. Tu nivel, monedas y lecciones seguirán como están.', icono: '✦' },
  PASOS_COMPLETOS.find(p => p.id === 'racha'),
  PASOS_COMPLETOS.find(p => p.id === 'cofres'),
  PASOS_COMPLETOS.find(p => p.id === 'compartir'),
  { id: 'listo', tab: 'mapa', titulo: '¡Sigamos tu aventura!', texto: 'Ya conoces la nueva racha, los cofres y tu tarjeta de progreso. Puedes volver a verme desde tu perfil cuando quieras.', icono: '✨' },
];
export const pasosTutorial = modo => modo === 'actualizacion' ? PASOS_ACTUALIZACION : PASOS_COMPLETOS;

function almacenamiento() {
  try { return globalThis.localStorage; } catch { return null; }
}
export function leerTutorial(uid, storage = almacenamiento()) {
  if (!uid) return null;
  if (memoria.has(uid)) return memoria.get(uid);
  try {
    const valor = JSON.parse(storage?.getItem(claveTutorial(uid)) ?? 'null');
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) return valor;
  } catch { /* Navegación privada, almacenamiento lleno o datos antiguos. */ }
  return memoria.get(uid) ?? null;
}
export function guardarTutorial(uid, registro, storage = almacenamiento()) {
  if (!uid) return false;
  memoria.set(uid, registro);
  try { if (!storage) return false; storage.setItem(claveTutorial(uid), JSON.stringify(registro)); return true; }
  catch { return false; }
}
export function modoParaUsuario(perfil = {}, registro) {
  const jugado = perfil.nivelesCompletados?.length || perfil.examenesAprobados?.length || perfil.cofresAbiertos > 0 || perfil.jugóHoy || perfil.ultimaPrimeraLeccion;
  const accesoAnterior = perfil.contrasenaCambiada && Date.parse(perfil.fechaRegistro) < LANZAMIENTO;
  return registro?.introVisto || jugado || perfil.esPrimeraVez === false || accesoAnterior ? 'actualizacion' : 'completo';
}
export function prepararTutorial(perfil, registro) {
  const modo = registro?.version === VERSION_TUTORIAL && ['completo', 'actualizacion'].includes(registro.modo) ? registro.modo : modoParaUsuario(perfil, registro);
  const pasos = pasosTutorial(modo);
  const mismaVersion = registro?.version === VERSION_TUTORIAL;
  const paso = mismaVersion ? Math.max(0, pasos.findIndex(p => p.id === registro.paso)) : 0;
  const pendiente = !mismaVersion || !['completado','omitido','aplazado'].includes(registro.estado);
  return { modo, paso, abierto: pendiente };
}
export function registroTutorial(sesion, estado, anterior) {
  return { version: VERSION_TUTORIAL, modo: sesion.modo, paso: pasosTutorial(sesion.modo)[sesion.paso]?.id, estado,
    introVisto: !!anterior?.introVisto || (sesion.modo === 'completo' && ['completado','omitido'].includes(estado)) };
}
