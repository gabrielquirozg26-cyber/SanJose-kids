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
