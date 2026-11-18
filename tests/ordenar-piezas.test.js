import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearPiezasOracion, agregarFicha, textoOrdenado } from '../src/utils/ejercicios.js';

test('un verso largo usa piezas breves en un único tablero y conserva toda la oración', () => {
  const palabras = 'Creo en un solo Dios Padre todopoderoso Creador del cielo y de la tierra de todo lo visible y lo invisible'.split(' ');
  const piezas = crearPiezasOracion(palabras);
  assert.ok(piezas.length < palabras.length);
  assert.ok(piezas.every(p => p.texto.split(' ').length <= 3));
  assert.deepEqual(piezas.flatMap(p => p.texto.split(' ')), palabras);
  assert.equal(textoOrdenado(piezas, piezas.map(p => p.id)), palabras.join(' '));
});
test('las oraciones cortas conservan sus palabras individuales y los duplicados tienen identidad propia', () => {
  const piezas = crearPiezasOracion(['En','el','nombre','del','Padre','y','del','Hijo']);
  assert.equal(piezas.length, 8);
  assert.equal(piezas[3].texto, piezas[6].texto);
  assert.notEqual(piezas[3].id, piezas[6].id);
});
test('cada pieza solo se coloca una vez y deshacer permite volver a colocarla', () => {
  const piezas = crearPiezasOracion(['de','la','de']);
  let seleccion = agregarFicha([], 0, piezas);
  assert.deepEqual(agregarFicha(seleccion, 0, piezas), [0]);
  seleccion = agregarFicha(seleccion, 2, piezas);
  assert.equal(textoOrdenado(piezas, seleccion), 'de de');
  seleccion = seleccion.slice(0,-1);
  assert.deepEqual(agregarFicha(seleccion, 2, piezas), [0,2]);
});
test('se permite construir un orden incorrecto para que lo evalúe el validador, sin autocorregir', () => {
  const piezas = crearPiezasOracion('uno dos tres cuatro cinco seis siete ocho nueve diez'.split(' '));
  const ordenInverso = piezas.map(p => p.id).reverse();
  assert.notEqual(textoOrdenado(piezas, ordenInverso), piezas.map(p => p.texto).join(' '));
  assert.equal(textoOrdenado(piezas, ordenInverso).split(' ').length, 10);
});
test('todos los versos reales se reconstruyen íntegros con sus nuevas piezas', () => {
  const niveles = JSON.parse(readFileSync(new URL('../src/data/niveles.json', import.meta.url), 'utf8'));
  for (const leccion of niveles.unidades.flatMap(u => u.lecciones)) {
    for (const verso of leccion.versos ?? []) {
      const piezas = crearPiezasOracion(verso.palabrasOrdenar);
      assert.equal(textoOrdenado(piezas, piezas.map(p => p.id)), verso.palabrasOrdenar.join(' '), verso.id);
      assert.equal(new Set(piezas.map(p => p.id)).size, piezas.length, verso.id);
    }
  }
  assert.deepEqual(crearPiezasOracion([]), []);
});
