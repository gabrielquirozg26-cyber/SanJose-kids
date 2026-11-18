import { obtenerProgreso } from './progreso.js';

// Solo presentación: nunca concede premios ni modifica la racha.
export function estadoRacha(data = {}, hoy) {
  const dias = data.jugóHoy ? Math.round((Date.parse(hoy) - Date.parse(data.jugóHoy)) / 86400000) : Infinity;
  const protegida = data.rachaProtegidaHasta === hoy || (dias === 2 && data.inventario?.includes('protector_racha'));
  const vigente = dias <= 1 || protegida;
  const racha = vigente ? Math.max(0, Number(data.racha) || 0) : 0;
  const hecha = data.ultimaPrimeraLeccion === hoy;
  return { racha, hecha, protegida: protegida && !hecha, estado: hecha ? 'activo' : racha > 0 ? 'pendiente' : 'inicio' };
}

export function resumenCompartible(completados = [], unidades = []) {
  const progreso = obtenerProgreso(completados, unidades);
  const ids = new Set(progreso.leccionesCompletadas);
  const reinos = unidades.filter(u => u.lecciones.length && u.lecciones.every(l => ids.has(l.id)));
  return {
    nivel: progreso.nivelActual, lecciones: ids.size, reinos: reinos.length,
    // El historial no contiene fechas: no se infiere recencia.
    destacados: reinos.map(u => ({ id: u.id, titulo: '¡Completé ' + u.nombre + '!', detalle: 'Un reino más en mi aventura de fe' })),
  };
}

export function textoParaCompartir({ titulo, nivel, racha, lecciones }) {
  return '✨ ' + titulo + '\n⭐ Nivel ' + nivel + ' · 🔥 ' + racha + ' días de racha\n📖 ' + lecciones + ' lecciones aprendidas\nSan JoseKids · Catequesis San José\nhttps://sanjosekids.netlify.app/';
}
