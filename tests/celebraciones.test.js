import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoRacha, resumenCompartible, textoParaCompartir } from '../src/utils/celebraciones.js';

test('racha pendiente conserva ayer, hoy completado se reconoce y una racha vencida no se presume activa', () => {
  const perfil = { racha: 6, jugóHoy: '2026-11-17', ultimaPrimeraLeccion: '2026-11-17' };
  assert.equal(estadoRacha(perfil, '2026-11-18').estado, 'pendiente');
  assert.equal(estadoRacha(perfil, '2026-11-18').racha, 6);
  assert.equal(estadoRacha(perfil, '2026-11-20').racha, 0);
  assert.equal(estadoRacha({ ...perfil, jugóHoy: '2026-11-18', ultimaPrimeraLeccion: '2026-11-18' }, '2026-11-18').estado, 'activo');
});
test('la presentación respeta el protector sin consumir inventario ni prolongarlo indefinidamente', () => {
  const perfil = { racha: 8, jugóHoy: '2026-11-16', inventario: ['protector_racha'] };
  assert.equal(estadoRacha(perfil, '2026-11-18').protegida, true);
  assert.equal(estadoRacha(perfil, '2026-11-19').racha, 0);
  assert.deepEqual(perfil.inventario, ['protector_racha']);
  assert.equal(estadoRacha({ ...perfil, inventario: [], rachaProtegidaHasta: '2026-11-18' }, '2026-11-18').racha, 8);
});
test('compartir solo cuenta lecciones únicas conocidas y ofrece reinos realmente completados', () => {
  const unidades = [{ id: 'u1', nombre: 'Pequeñas Luces', lecciones: [{ id: 'a' }, { id: 'b' }] }, { id: 'u2', nombre: 'Otro reino', lecciones: [{ id: 'c' }] }];
  const parcial = resumenCompartible(['a','a','desconocido'], unidades);
  assert.equal(parcial.nivel, 2);
  assert.equal(parcial.lecciones, 1);
  assert.deepEqual(parcial.destacados, []);
  const completo = resumenCompartible(['a','b','a'], unidades);
  assert.equal(completo.reinos, 1);
  assert.equal(completo.destacados[0].titulo, '¡Completé Pequeñas Luces!');
});
test('el mensaje público no expone nombre completo, grupo, saldo ni identificador', () => {
  const texto = textoParaCompartir({ titulo: '¡Mi aventura!', nivel: 3, racha: 2, lecciones: 2, nombre: 'NOMBRE PRIVADO', grupo: 'GRUPO PRIVADO', monedas: 98765, uid: 'UID PRIVADO' });
  assert.match(texto, /Nivel 3/);
  assert.match(texto, /2 lecciones/);
  assert.doesNotMatch(texto, /PRIVADO|98765/);
});
