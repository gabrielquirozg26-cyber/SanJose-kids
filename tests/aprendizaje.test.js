import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bancoExamen, seleccionarPreguntas, examenDisponible, logrosDisponibles, mapaNivelATitulo } from '../src/utils/aprendizaje.js';
import { avanzarMisiones, canjearTitulo, reclamarPremioMision } from '../src/utils/economia.js';
import { MISIONES_DIARIAS, MISIONES_SEMANALES } from '../src/data/misiones.js';
const leer = nombre => JSON.parse(readFileSync(new URL('../src/data/' + nombre + '.json', import.meta.url), 'utf8'));
const { unidades } = leer('niveles');
const legado = leer('examen');
const titulos = leer('titulos');
const defs = { diarias: MISIONES_DIARIAS, semanales: MISIONES_SEMANALES };

test('los ocho reinos tienen ocho preguntas válidas, únicas y de sus propias lecciones', () => {
  for (const unidad of unidades) {
    const banco = bancoExamen(unidad, legado);
    assert.ok(banco.length >= 8, unidad.id);
    const preguntas = seleccionarPreguntas(banco, 8, () => 0.4);
    assert.equal(preguntas.length, 8);
    assert.equal(new Set(preguntas.map(p => p.id)).size, 8);
    for (const p of preguntas) {
      assert.ok(p.opciones.includes(p.correcta), p.id);
      assert.equal(new Set(p.opciones).size, p.opciones.length, p.id);
      assert.ok(unidad.lecciones.some(l => l.id === p.leccionId), p.id);
    }
    assert.equal(new Set(preguntas.map(p => p.leccionId)).size, unidad.lecciones.length);
  }
});
test('un examen desconocido o con lecciones pendientes permanece bloqueado', () => {
  assert.equal(examenDisponible(unidades, 'unidad1', []), false);
  assert.equal(examenDisponible(unidades, 'u1', [unidades[0].lecciones[0].id]), false);
  const primera = unidades[0].lecciones.map(l => l.id);
  assert.equal(examenDisponible(unidades, 'u1', primera), true);
  assert.equal(examenDisponible(unidades, 'u2', unidades[1].lecciones.map(l => l.id)), false);
});
test('todos los títulos de aprendizaje tienen una lección real y se recuperan sin duplicar canjes', () => {
  const ids = unidades.flatMap(u => u.lecciones.map(l => l.id));
  assert.equal(new Set(Object.values(mapaNivelATitulo)).size, titulos.porNivel.length);
  for (const id of Object.keys(mapaNivelATitulo)) assert.ok(ids.includes(id), id);
  const perfil = { nivelesCompletados: ids, monedas: 123 };
  const disponibles = logrosDisponibles(perfil);
  assert.equal(disponibles.length, titulos.porNivel.length);
  const titulo = titulos.porNivel[0];
  const canje = canjearTitulo({ ...perfil, logrosPendientes: disponibles }, titulo);
  assert.equal(canje.cambios.monedas, undefined);
  const actualizado = { ...perfil, ...canje.cambios };
  assert.equal(logrosDisponibles(actualizado).some(l => l.id === titulo.id), false);
  assert.equal(canjearTitulo(actualizado, titulo).resultado, false);
});
test('una misión con progreso parcial no permite reclamar y no acepta incrementos negativos', () => {
  const cambios = avanzarMisiones({}, defs, 'lecciones', 1, '2026-11-17').cambios;
  assert.equal(reclamarPremioMision(cambios, defs, 'diarias', 'd1', '2026-11-17').resultado, false);
  assert.equal(avanzarMisiones(cambios, defs, 'lecciones', -1, '2026-11-17').resultado, false);
});
test('cinco días sueltos no completan la racha semanal y repetir un día no suma', () => {
  let perfil = {};
  for (const dia of ['16', '17', '19', '20', '21']) {
    perfil = { ...perfil, ...avanzarMisiones(perfil, defs, 'racha_semanal', 1, '2026-11-' + dia).cambios };
  }
  assert.equal(perfil.misiones.semanales.s4.progreso, 3);
  assert.equal(avanzarMisiones(perfil, defs, 'racha_semanal', 1, '2026-11-21').resultado, false);
  assert.equal(reclamarPremioMision(perfil, defs, 'semanales', 's4', '2026-11-21').resultado, false);
});
test('cinco días consecutivos habilitan un solo premio y la semana siguiente reinicia', () => {
  let perfil = { monedas: 10 };
  for (const dia of ['16', '17', '18', '19', '20']) {
    perfil = { ...perfil, ...avanzarMisiones(perfil, defs, 'racha_semanal', 1, '2026-11-' + dia).cambios };
  }
  const premio = reclamarPremioMision(perfil, defs, 'semanales', 's4', '2026-11-20');
  assert.equal(premio.cambios.monedas, 310);
  assert.equal(reclamarPremioMision({ ...perfil, ...premio.cambios }, defs, 'semanales', 's4', '2026-11-20').resultado, false);
  const siguiente = avanzarMisiones(perfil, defs, 'racha_semanal', 1, '2026-11-23');
  assert.equal(siguiente.cambios.misiones.semanales.s4.progreso, 1);
});
