import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');

function worker(origin) {
  const handlers = {};
  const deleted = [];
  const navigated = [];
  const calls = { unregister: 0, skipWaiting: 0, cacheOpen: 0 };
  const self = {
    location: new URL(origin),
    addEventListener: (event, handler) => { handlers[event] = handler; },
    skipWaiting: async () => { calls.skipWaiting++; },
    registration: { unregister: async () => { calls.unregister++; return true; } },
    clients: { matchAll: async () => [{ url: origin + '/', navigate: async url => navigated.push(url) }] },
  };
  const caches = {
    delete: async name => { deleted.push(name); return true; },
    open: async () => { calls.cacheOpen++; return { add: async () => {} }; },
    match: async () => 'respuesta-cacheada',
  };
  runInNewContext(source, { self, caches, URL, console, Promise });
  return { handlers, deleted, navigated, calls };
}

test('el worker nuevo se retira en localhost aunque main.jsx siga siendo el antiguo', async () => {
  const w = worker('http://localhost:5173');
  let task;
  w.handlers.install({ waitUntil: promise => { task = promise; } });
  await task;
  assert.equal(w.calls.skipWaiting, 1);
  assert.equal(w.calls.cacheOpen, 0);
  w.handlers.activate({ waitUntil: promise => { task = promise; } });
  await task;
  assert.equal(w.calls.unregister, 1);
  assert.deepEqual(w.deleted.sort(), ['static-v1', 'dynamic-v1', 'san-josekids-v1'].sort());
  assert.deepEqual(w.navigated, ['http://localhost:5173/']);
});

test('localhost nunca recibe módulos viejos desde el worker actualizado', () => {
  const w = worker('http://localhost:5173');
  w.handlers.fetch({ respondWith: () => assert.fail('Debe dejar que la red responda') });
});

test('la instalación y la caché de producción conservan su comportamiento', async () => {
  const w = worker('https://ejemplo.test');
  let task;
  w.handlers.install({ waitUntil: promise => { task = promise; } });
  await task;
  assert.equal(w.calls.cacheOpen, 1);
  assert.equal(w.calls.unregister, 0);
  let response;
  w.handlers.fetch({ request: { url: 'https://ejemplo.test/assets/app.js' }, respondWith: promise => { response = promise; } });
  assert.equal(await response, 'respuesta-cacheada');
});
