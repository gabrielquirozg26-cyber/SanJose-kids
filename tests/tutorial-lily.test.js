import test from 'node:test';
import assert from 'node:assert/strict';
import { VERSION_TUTORIAL, claveTutorial, leerTutorial, guardarTutorial, modoParaUsuario, prepararTutorial, registroTutorial, pasosTutorial } from '../src/utils/tutorialLily.js';

test('una cuenta nueva recibe la introducción y una cuenta con actividad recibe las novedades', () => {
  assert.equal(modoParaUsuario({ esPrimeraVez: true, fechaRegistro: '2026-11-18T10:00:00Z' }), 'completo');
  assert.equal(modoParaUsuario({ nivelesCompletados: ['senal_cruz'] }), 'actualizacion');
  assert.equal(modoParaUsuario({ examenesAprobados: ['u1'] }), 'actualizacion');
  assert.equal(modoParaUsuario({ esPrimeraVez: false }), 'actualizacion');
  assert.equal(modoParaUsuario({ contrasenaCambiada: true, fechaRegistro: '2026-10-01' }), 'actualizacion');
});
test('se reanuda por identificador de paso y no se reinicia al recargar', () => {
  const sesion = { modo: 'completo', paso: 3 };
  const registro = registroTutorial(sesion, 'pendiente');
  assert.equal(registro.paso, 'racha');
  assert.deepEqual(prepararTutorial({}, registro), { modo: 'completo', paso: 3, abierto: true });
  assert.equal(prepararTutorial({}, { ...registro, paso: 'paso-retirado' }).paso, 0);
});
test('terminar, omitir y posponer evitan reaperturas automáticas en la misma versión', () => {
  for (const estado of ['completado', 'omitido', 'aplazado']) {
    const registro = registroTutorial({ modo: 'completo', paso: 2 }, estado);
    assert.equal(prepararTutorial({}, registro).abierto, false);
  }
  assert.equal(registroTutorial({ modo: 'completo', paso: 2 }, 'aplazado').introVisto, false);
});
test('una versión nueva ofrece solo novedades a quien ya vio la introducción', () => {
  const anterior = { version: 'anterior', estado: 'completado', introVisto: true };
  assert.deepEqual(prepararTutorial({}, anterior), { modo: 'actualizacion', paso: 0, abierto: true });
  const nuevo = registroTutorial({ modo: 'actualizacion', paso: 1 }, 'completado', anterior);
  assert.equal(nuevo.version, VERSION_TUTORIAL);
  assert.equal(nuevo.introVisto, true);
});
test('las preferencias se aíslan por cuenta y un fallo de almacenamiento no rompe el juego', () => {
  const datos = new Map();
  const storage = { getItem: k => datos.get(k), setItem: (k,v) => datos.set(k,v) };
  const registro = registroTutorial({ modo: 'completo', paso: 1 }, 'pendiente');
  assert.equal(guardarTutorial('cuenta-a-test', registro, storage), true);
  assert.deepEqual(JSON.parse(datos.get(claveTutorial('cuenta-a-test'))), registro);
  assert.deepEqual(leerTutorial('cuenta-a-test', storage), registro);
  assert.equal(leerTutorial('cuenta-b-test', storage), null);
  const denegado = { getItem: () => { throw Error('denegado'); }, setItem: () => { throw Error('lleno'); } };
  assert.equal(guardarTutorial('cuenta-privada-test', registro, denegado), false);
  assert.deepEqual(leerTutorial('cuenta-privada-test', denegado), registro);
  assert.equal(leerTutorial('', storage), null);
});
test('datos locales corruptos se recuperan y ambos recorridos cubren las novedades sin acciones del juego', () => {
  assert.equal(leerTutorial('corrupta-test', { getItem: () => '{invalid' }), null);
  assert.equal(prepararTutorial({}, { version: VERSION_TUTORIAL, modo: 'desconocido', paso: 'x' }).modo, 'completo');
  for (const modo of ['completo','actualizacion']) {
    const pasos = pasosTutorial(modo);
    assert.equal(new Set(pasos.map(p => p.id)).size, pasos.length);
    for (const id of ['racha','cofres','compartir']) assert.ok(pasos.some(p => p.id === id));
    assert.equal(pasos.at(-1).id, 'listo');
  }
});
