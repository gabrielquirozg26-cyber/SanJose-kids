import test from 'node:test';
import assert from 'node:assert/strict';
import { mensajeAcceso } from '../src/utils/mensajeAcceso.js';

test('el acceso distingue problemas de conexión y exceso de intentos', () => {
  assert.match(mensajeAcceso({ code: 'auth/network-request-failed' }), /internet/);
  assert.match(mensajeAcceso({ code: 'auth/too-many-requests' }), /Espera/);
});
test('los errores de credenciales no revelan si una cuenta existe', () => {
  assert.equal(mensajeAcceso({ code: 'auth/wrong-password' }), mensajeAcceso({ code: 'auth/user-not-found' }));
  assert.equal(mensajeAcceso({ code: 'auth/invalid-credential' }), mensajeAcceso({ code: 'auth/user-not-found' }));
});
test('el mensaje visible nunca imprime detalles internos o datos del error recibido', () => {
  const mensaje = mensajeAcceso({ code: 'desconocido', message: 'CLAVE_PRIVADA correo@privado.com' });
  assert.doesNotMatch(mensaje, /CLAVE_PRIVADA|correo@privado/);
  assert.equal(mensajeAcceso(null), mensaje);
});
