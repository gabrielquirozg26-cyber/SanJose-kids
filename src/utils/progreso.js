export function obtenerProgreso(completados = [], unidades = []) {
  const catalogo = unidades.flatMap(unidad => unidad.lecciones.map(leccion => leccion.id));
  const validos = new Set(catalogo);
  const leccionesCompletadas = [...new Set(completados)].filter(id => validos.has(id));
  return {
    leccionesCompletadas,
    nivelActual: leccionesCompletadas.length + 1,
    porcentaje: catalogo.length ? leccionesCompletadas.length / catalogo.length * 100 : 0,
  };
}

// Se ejecuta dentro de runTransaction para evitar avances duplicados entre sesiones.
export async function registrarProgresoLeccion(transaction, userRef, nivelId, unidades) {
  if (!nivelId) throw new Error('La lección necesita un ID');
  if (!unidades.some(unidad => unidad.lecciones.some(leccion => leccion.id === nivelId))) {
    throw new Error('La lección no pertenece al recorrido actual');
  }

  const snapshot = await transaction.get(userRef);
  if (!snapshot.exists()) throw new Error('No existe el perfil del estudiante');

  const data = snapshot.data();
  const completados = data.nivelesCompletados ?? [];
  const nueva = !completados.includes(nivelId);
  const siguientes = nueva ? [...completados, nivelId] : completados;
  const { nivelActual } = obtenerProgreso(siguientes, unidades);
  if (!nueva && data.nivelActual === nivelActual) return false;

  transaction.update(userRef, {
    nivelActual,
    ...(nueva ? { nivelesCompletados: siguientes } : {}),
  });
  return nueva;
}

export function esReinoDesbloqueado(unidades, indice, completados) {
  if (indice < 0 || indice >= unidades.length) return false;
  return unidades.slice(0, indice).every(unidad =>
    unidad.lecciones.every(leccion => completados.includes(leccion.id))
  );
}
