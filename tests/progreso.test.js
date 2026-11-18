import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registrarProgresoLeccion as registrar, esReinoDesbloqueado, obtenerProgreso } from '../src/utils/progreso.js';

const { unidades } = JSON.parse(readFileSync(new URL('../src/data/niveles.json', import.meta.url), 'utf8'));
const registrarProgresoLeccion = (transaction, ref, id) => registrar(transaction, ref, id, unidades);

function perfilInicial(data = {}) {
  let perfil = { nivelActual: 1, nivelesCompletados: [], monedas: 100, vidas: 5, ...data };
  const escrituras = [];
  const ref = { id: 'estudiante-de-prueba' };
  const transaction = {
    get: async target => {
      assert.equal(target, ref);
      return { exists: () => true, data: () => structuredClone(perfil) };
    },
    update: (target, cambios) => {
      assert.equal(target, ref);
      escrituras.push(cambios);
      perfil = { ...perfil, ...cambios };
    },
  };
  return { transaction, ref, escrituras, perfil: () => perfil };
}

test('la primera finalización avanza una vez y conserva monedas y vidas', async () => {
  const p = perfilInicial();
  assert.equal(await registrarProgresoLeccion(p.transaction, p.ref, 'padre_nuestro'), true);
  assert.deepEqual(p.perfil(), { nivelActual: 2, nivelesCompletados: ['padre_nuestro'], monedas: 100, vidas: 5 });
});

test('repetir una lección con nivel correcto no avanza ni vuelve a escribir', async () => {
  const p = perfilInicial({ nivelActual: 2, nivelesCompletados: ['padre_nuestro'] });
  assert.equal(await registrarProgresoLeccion(p.transaction, p.ref, 'padre_nuestro'), false);
  assert.equal(p.perfil().nivelActual, 2);
  assert.equal(p.escrituras.length, 0);
});

test('caso del perfil: una lección única no muestra nivel 3 por un contador antiguo', () => {
  const data = { nivelActual: 3, nivelesCompletados: ['senal_de_la_cruz'] };
  const progreso = obtenerProgreso(data.nivelesCompletados, unidades);
  assert.equal(progreso.nivelActual, 2);
  assert.equal(progreso.leccionesCompletadas.length, 1);
});

test('repetir corrige el contador histórico sin conceder otra primera finalización', async () => {
  const p = perfilInicial({ nivelActual: 30, nivelesCompletados: ['senal_de_la_cruz'] });
  assert.equal(await registrarProgresoLeccion(p.transaction, p.ref, 'senal_de_la_cruz'), false);
  assert.equal(p.perfil().nivelActual, 2);
  for (let i = 0; i < 10; i++) {
    assert.equal(await registrarProgresoLeccion(p.transaction, p.ref, 'senal_de_la_cruz'), false);
  }
  assert.equal(p.perfil().nivelActual, 2);
  assert.equal(p.escrituras.length, 1);
  assert.equal(p.perfil().monedas, 100);
  assert.equal(p.perfil().vidas, 5);
});

test('una lección nueva calcula el nivel desde el historial único, no desde un contador inflado', async () => {
  const p = perfilInicial({ nivelActual: 99, nivelesCompletados: ['senal_de_la_cruz'] });
  assert.equal(await registrarProgresoLeccion(p.transaction, p.ref, 'padre_nuestro'), true);
  assert.equal(p.perfil().nivelActual, 3);
});

test('duplicados e IDs ajenos no inflan el nivel ni el porcentaje', () => {
  const progreso = obtenerProgreso(['senal_de_la_cruz', 'senal_de_la_cruz', 'antigua-inexistente'], unidades);
  assert.equal(progreso.nivelActual, 2);
  assert.deepEqual(progreso.leccionesCompletadas, ['senal_de_la_cruz']);
  assert.equal(obtenerProgreso(unidades.flatMap(u => u.lecciones.map(l => l.id)), unidades).porcentaje, 100);
});

test('un segundo envío de la finalización no duplica el avance', async () => {
  const p = perfilInicial();
  assert.equal(await registrarProgresoLeccion(p.transaction, p.ref, 'padre_nuestro'), true);
  assert.equal(await registrarProgresoLeccion(p.transaction, p.ref, 'padre_nuestro'), false);
  assert.equal(p.perfil().nivelActual, 2);
  assert.equal(p.escrituras.length, 1);
});

test('las lecciones distintas avanzan y preservan las finalizaciones anteriores', async () => {
  const p = perfilInicial();
  for (const id of ['padre_nuestro', 'ave_maria', 'padre_nuestro']) {
    await registrarProgresoLeccion(p.transaction, p.ref, id);
  }
  assert.equal(p.perfil().nivelActual, 3);
  assert.deepEqual(p.perfil().nivelesCompletados, ['padre_nuestro', 'ave_maria']);
});

test('si falta el perfil o falla la escritura, no se comunica éxito', async () => {
  await assert.rejects(registrarProgresoLeccion({ get: async () => ({ exists: () => false }) }, {}, 'padre_nuestro'));
  const p = perfilInicial();
  p.transaction.update = () => { throw new Error('Escritura rechazada'); };
  await assert.rejects(registrarProgresoLeccion(p.transaction, p.ref, 'padre_nuestro'), /Escritura rechazada/);
});

test('el reino inicial está abierto y los posteriores requieren todas las lecciones previas', () => {
  assert.equal(esReinoDesbloqueado(unidades, 0, []), true);
  const primero = unidades[0].lecciones.map(l => l.id);
  assert.equal(esReinoDesbloqueado(unidades, 1, primero.slice(1)), false);
  assert.equal(esReinoDesbloqueado(unidades, 1, primero), true);
  assert.equal(esReinoDesbloqueado(unidades, 2, primero), false);
});

test('completar un reino posterior no permite saltarse un reino incompleto', () => {
  const segundo = unidades[1].lecciones.map(l => l.id);
  assert.equal(esReinoDesbloqueado(unidades, 2, segundo), false);
});

test('caso de la captura: Guardianes de la Fe en 1/4 mantiene Las Leyes del Reino bloqueado', () => {
  const guardianes = unidades.findIndex(u => u.id === 'u4');
  const leyes = unidades.findIndex(u => u.id === 'u5');
  assert.ok(guardianes >= 0 && leyes > guardianes);
  const completados = unidades.slice(0, guardianes).flatMap(u => u.lecciones.map(l => l.id));
  completados.push(unidades[guardianes].lecciones[0].id);
  assert.equal(esReinoDesbloqueado(unidades, guardianes, completados), true);
  assert.equal(esReinoDesbloqueado(unidades, leyes, completados), false);
});

test('cada reino se abre al completar todo el recorrido anterior', () => {
  const completados = [];
  unidades.forEach((unidad, i) => {
    assert.equal(esReinoDesbloqueado(unidades, i, completados), true);
    if (i + 1 < unidades.length) assert.equal(esReinoDesbloqueado(unidades, i + 1, completados), false);
    completados.push(...unidad.lecciones.map(l => l.id));
  });
  assert.equal(esReinoDesbloqueado(unidades, unidades.length, completados), false);
});
