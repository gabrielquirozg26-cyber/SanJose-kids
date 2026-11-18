export const mapaNivelATitulo = {
  padre_nuestro: 'protector_reino', ave_maria: 'caballero_mariano', gloria: 'luz_eterna',
  angel_de_la_guarda: 'custodio_divino', yo_confieso: 'corazon_purificado',
  acto_de_contricion: 'espiritu_renovado', bajo_tu_amparo: 'hijo_maria',
  credo_apostolico: 'pilar_iglesia', salve: 'reina_misericordia',
  '10_mandamientos': 'guardian_supremo', virtudes_teologales: 'heredero_reino',
  sacramentos: 'elegido_gracia', obras_misericordia: 'manos_esperanza',
  misterios_gozosos: 'luz_nazaret', misterios_dolorosos: 'guerrero_calvario',
  misterios_gloriosos: 'campeon_celestial', misterios_luminosos: 'portador_luz_divina',
};

export function logrosDisponibles(data = {}) {
  const ganados = new Set((data.titulosDesbloqueados ?? []).map(t => t.id));
  const ids = new Set([
    ...(data.logrosPendientes ?? []).map(t => t.id),
    ...(data.nivelesCompletados ?? []).map(id => mapaNivelATitulo[id]).filter(Boolean),
  ]);
  return [...ids].filter(id => !ganados.has(id)).map(id => ({ id }));
}

export function examenDisponible(unidades, id, completados = []) {
  const indice = unidades.findIndex(u => u.id === id);
  return indice >= 0 && unidades.slice(0, indice + 1).every(u =>
    u.lecciones.every(l => completados.includes(l.id)));
}

export function mezclar(elementos, random = Math.random) {
  const copia = [...elementos];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Cada banco sigue las lecciones actuales, sin depender del número de las unidades antiguas.
export function bancoExamen(unidad, legado = {}) {
  if (!unidad) return [];
  const anteriores = Object.values(legado).flatMap(u => u.oraciones ?? []);
  return unidad.lecciones.flatMap(leccion => {
    const anterior = anteriores.find(o => normalizar(o.oracion) === normalizar(leccion.nombre));
    const preguntas = leccion.preguntas ?? anterior?.preguntas ?? (leccion.versos ?? []).map(v => ({
      id: v.id,
      pregunta: `Completa «${leccion.nombre}»: ${v.texto.replace(v.palabraFaltante, '_____')}`,
      opciones: v.opcionesSeleccion,
      correcta: v.palabraFaltante,
      explicacion: v.texto,
    }));
    return preguntas.filter(p => p.pregunta && p.correcta && new Set(p.opciones).size >= 2 && p.opciones.includes(p.correcta))
      .map(p => ({ ...p, id: `${leccion.id}:${p.id}`, leccionId: leccion.id }));
  });
}

export function seleccionarPreguntas(banco, cantidad = 8, random = Math.random) {
  // Una primera vuelta por lección evita que un solo tema monopolice el examen.
  const temas = [...new Set(banco.map(p => p.leccionId))];
  const primeras = mezclar(temas, random).map(id => mezclar(banco.filter(p => p.leccionId === id), random)[0]);
  const ids = new Set(primeras.map(p => p.id));
  return [...primeras, ...mezclar(banco.filter(p => !ids.has(p.id)), random)]
    .slice(0, cantidad).map(p => ({ ...p, opciones: mezclar(p.opciones, random) }));
}
