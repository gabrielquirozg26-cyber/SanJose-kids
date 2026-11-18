import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dividirEnTramos, alternarFicha, textoOrdenado } from '../src/utils/ejercicios.js';

test('una oración larga se reparte sin perder palabras ni sus IDs repetidos', () => {
  const palabras = 'Creo en un solo Dios Padre todopoderoso Creador del cielo y de la tierra de todo lo visible y lo invisible'.split(' ');
  const tramos = dividirEnTramos(palabras);
  assert.ok(tramos.length > 1);
  assert.ok(tramos.every(t => t.length <= 6));
  assert.deepEqual(tramos.flat().map(f => f.texto), palabras);
  assert.deepEqual(tramos.flat().map(f => f.id), palabras.map((_,i) => i));
});
test('el límite de caracteres evita bancos demasiado anchos y admite palabras largas completas', () => {
  const tramos = dividirEnTramos(['santificación','todopoderoso','misericordioso','extraordinariamenteprolongada'], 6, 25);
  assert.ok(tramos.every(t => t.length === 1 || t.map(f => f.texto).join(' ').length <= 25));
  assert.equal(tramos.flat().at(-1).texto, 'extraordinariamenteprolongada');
  assert.deepEqual(dividirEnTramos([]), []);
});
test('tocar una ficha seleccionada la quita sin eliminar otra aparición de la misma palabra', () => {
  const fichas = dividirEnTramos(['de','la','de'])[0];
  const seleccion = [0,1,2];
  assert.deepEqual(alternarFicha(seleccion, 0, fichas), [1,2]);
  assert.deepEqual(alternarFicha([1,2], 0, fichas), [1,2,0]);
  assert.deepEqual(alternarFicha(seleccion, 99, fichas), seleccion);
  assert.deepEqual(seleccion, [0,1,2]);
});
test('editar una parte conserva las demás y entrega la oración completa al validador existente', () => {
  const tramos = dividirEnTramos(['uno','dos','tres','cuatro','cinco','seis','siete','ocho']);
  const selecciones = tramos.map(t => t.map(f => f.id));
  const editadas = selecciones.map((ids, i) => i === 0 ? [1,0,...ids.slice(2)] : ids);
  assert.deepEqual(editadas[1], selecciones[1]);
  assert.equal(textoOrdenado(tramos.flat(), editadas.flat()), 'dos uno tres cuatro cinco seis siete ocho');
  assert.equal(textoOrdenado(tramos.flat(), selecciones.flat()), 'uno dos tres cuatro cinco seis siete ocho');
});
test('todos los versos reales conservan su secuencia íntegra al dividirse en partes', () => {
  const niveles = JSON.parse(readFileSync(new URL('../src/data/niveles.json', import.meta.url), 'utf8'));
  for (const leccion of niveles.unidades.flatMap(u => u.lecciones)) {
    for (const verso of leccion.versos ?? []) {
      const palabras = verso.palabrasOrdenar;
      const fichas = dividirEnTramos(palabras).flat();
      assert.deepEqual(fichas.map(f => f.texto), palabras, verso.id);
      assert.equal(new Set(fichas.map(f => f.id)).size, palabras.length, verso.id);
    }
  }
});
