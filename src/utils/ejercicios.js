export function dividirFrase(texto, palabra) {
  const indice = texto.indexOf(palabra);
  return indice < 0 ? { antes: texto, despues: '' } : {
    antes: texto.slice(0, indice), despues: texto.slice(indice + palabra.length),
  };
}

export const crearFichas = palabras => palabras.map((texto, id) => ({ id, texto }));

export function agregarFicha(seleccion, id, fichas) {
  return seleccion.includes(id) || !fichas.some(f => f.id === id) ? seleccion : [...seleccion, id];
}

export const textoOrdenado = (fichas, seleccion) => seleccion.map(id => fichas.find(f => f.id === id)?.texto ?? '').join(' ');

// Conserva los IDs originales, el orden y todas las palabras, incluidas las repetidas.
export function dividirEnTramos(palabras, maxPalabras = 6, maxCaracteres = 42) {
  const tramos = [];
  let actual = [], caracteres = 0;
  for (const ficha of crearFichas(palabras)) {
    const longitud = ficha.texto.length + (actual.length ? 1 : 0);
    if (actual.length && (actual.length >= maxPalabras || caracteres + longitud > maxCaracteres)) {
      tramos.push(actual); actual = []; caracteres = 0;
    }
    actual.push(ficha); caracteres += ficha.texto.length + (actual.length > 1 ? 1 : 0);
  }
  if (actual.length) tramos.push(actual);
  return tramos;
}

export function alternarFicha(seleccion, id, fichas) {
  if (!fichas.some(f => f.id === id)) return seleccion;
  return seleccion.includes(id) ? seleccion.filter(actual => actual !== id) : [...seleccion, id];
}
