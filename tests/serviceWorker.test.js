import test from 'node:test';
import assert from 'node:assert/strict';
import { clearDevelopmentServiceWorker } from '../src/utils/serviceWorker.js';

const origin = 'http://localhost:5173';

test('retira el worker local anterior y solo sus cachés conocidos', async () => {
  const deleted = [];
  let unregistered = 0;
  const changed = await clearDevelopmentServiceWorker({
    getRegistrations: async () => [{
      scope: `${origin}/`, active: { scriptURL: `${origin}/sw.js` },
      unregister: async () => { unregistered++; return true; },
    }],
  }, { delete: async name => { deleted.push(name); return true; } }, origin);
  assert.equal(changed, true);
  assert.equal(unregistered, 1);
  assert.deepEqual(deleted.sort(), ['static-v1', 'dynamic-v1', 'san-josekids-v1'].sort());
});

test('sin worker anterior no borra cachés ni solicita otra recarga', async () => {
  const changed = await clearDevelopmentServiceWorker({ getRegistrations: async () => [] }, {
    delete: async () => assert.fail('No debe borrar cachés'),
  }, origin);
  assert.equal(changed, false);
});

test('no retira workers de otra aplicación, origen o ruta', async () => {
  const registrations = [
    { scope: `${origin}/otra/`, active: { scriptURL: `${origin}/otra/sw.js` } },
    { scope: `${origin}/`, active: { scriptURL: `${origin}/otro-worker.js` } },
    { scope: 'https://ejemplo.test/', active: { scriptURL: 'https://ejemplo.test/sw.js' } },
  ].map(registration => ({ ...registration, unregister: async () => assert.fail('Worker ajeno') }));
  assert.equal(await clearDevelopmentServiceWorker({ getRegistrations: async () => registrations }, {
    delete: async () => assert.fail('Caché ajena'),
  }, origin), false);
});

test('la limpieza funciona aunque CacheStorage no esté disponible', async () => {
  assert.equal(await clearDevelopmentServiceWorker({
    getRegistrations: async () => [{
      scope: `${origin}/`, active: { scriptURL: `${origin}/sw.js` }, unregister: async () => true,
    }],
  }, undefined, origin), true);
});
