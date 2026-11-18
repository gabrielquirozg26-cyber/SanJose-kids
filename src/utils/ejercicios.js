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

// Las frases largas usan piezas cortas en un único tablero, sin pasos secundarios.
export function crearPiezasOracion(palabras) {
  if (palabras.length <= 8) return crearFichas(palabras);
  const piezas = [];
  let actual = [], inicio = 0;
  for (let i = 0; i < palabras.length; i++) {
    const texto = [...actual, palabras[i]].join(' ');
    if (actual.length && (actual.length >= 3 || texto.length > 22)) {
      piezas.push({ id: inicio, texto: actual.join(' ') });
      actual = []; inicio = i;
    }
    actual.push(palabras[i]);
  }
  if (actual.length) piezas.push({ id: inicio, texto: actual.join(' ') });
  return piezas;
}
