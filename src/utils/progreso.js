// Se ejecuta dentro de runTransaction para evitar avances duplicados entre sesiones.
export async function registrarProgresoLeccion(transaction, userRef, nivelId) {
  if (!nivelId) throw new Error('La lección necesita un ID');

  const snapshot = await transaction.get(userRef);
  if (!snapshot.exists()) throw new Error('No existe el perfil del estudiante');

  const data = snapshot.data();
  const completados = data.nivelesCompletados ?? [];
  if (completados.includes(nivelId)) return false;

  transaction.update(userRef, {
    nivelActual: (data.nivelActual ?? 1) + 1,
    nivelesCompletados: [...completados, nivelId],
  });
  return true;
}

export function esReinoDesbloqueado(unidades, indice, completados) {
  if (indice < 0 || indice >= unidades.length) return false;
  return unidades.slice(0, indice).every(unidad =>
    unidad.lecciones.every(leccion => completados.includes(leccion.id))
  );
}
