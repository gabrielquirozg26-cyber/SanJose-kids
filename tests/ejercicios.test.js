import test from 'node:test';
import assert from 'node:assert/strict';
import { agregarFicha, crearFichas, textoOrdenado, dividirFrase } from '../src/utils/ejercicios.js';

test('ordenar conserva palabras repetidas como fichas distintas', () => {
  const fichas = crearFichas(['En', 'el', 'nombre', 'del', 'Padre', 'y', 'del', 'Hijo']);
  let seleccion = [];
  for (const f of fichas) seleccion = agregarFicha(seleccion, f.id, fichas);
  assert.equal(textoOrdenado(fichas, seleccion), 'En el nombre del Padre y del Hijo');
  assert.equal(seleccion.length, 8);
});
test('dos pulsaciones sobre la misma ficha no crean una palabra extra', () => {
  const fichas = crearFichas(['Dios', 'nuestro']);
  const seleccion = agregarFicha([], 0, fichas);
  assert.deepEqual(agregarFicha(seleccion, 0, fichas), [0]);
  assert.deepEqual(agregarFicha(seleccion, 99, fichas), [0]);
});
test('quitar y recolocar una palabra repetida mantiene la otra en su lugar', () => {
  const fichas = crearFichas(['de', 'la', 'de']);
  const seleccion = [0, 1, 2].filter(id => id !== 0);
  assert.equal(textoOrdenado(fichas, seleccion), 'la de');
  assert.equal(textoOrdenado(fichas, agregarFicha(seleccion, 0, fichas)), 'la de de');
  assert.deepEqual(fichas.map(f => f.texto), ['de', 'la', 'de']);
});
test('el hueco de una frase no elimina las apariciones posteriores de la palabra', () => {
  assert.deepEqual(dividirFrase('Dios de Dios, Luz de Luz', 'Dios'), { antes: '', despues: ' de Dios, Luz de Luz' });
  assert.deepEqual(dividirFrase('Santa María, Madre de Dios', 'María'), { antes: 'Santa ', despues: ', Madre de Dios' });
});
test('una palabra ausente no oculta el texto de la oración', () => {
  assert.deepEqual(dividirFrase('Amén.', 'Padre'), { antes: 'Amén.', despues: '' });
});
