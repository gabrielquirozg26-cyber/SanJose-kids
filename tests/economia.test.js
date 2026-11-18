import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  prepararCompra, ofertaDelDia, consumirUnidad, iniciarSesionLeccion, premiarEjercicio,
  finalizarSesionLeccion, entregarColeccionable, premiarExamen, premiarRespuestaExamen,
  comprarTitulo, canjearTitulo, protegerRacha, registrarActividadDiaria, modificarVidas,
  normalizarMisiones, avanzarMisiones, reclamarPremioMision, operarUsuario,
} from '../src/utils/economia.js';
import { MISIONES_DIARIAS, MISIONES_SEMANALES } from '../src/data/misiones.js';

const { unidades } = JSON.parse(readFileSync(new URL('../src/data/niveles.json', import.meta.url), 'utf8'));
const definiciones = { diarias: MISIONES_DIARIAS, semanales: MISIONES_SEMANALES };
const hoy = '2026-11-17';
const ahora = Date.parse(hoy + 'T12:00:00Z');
const comun = { id: 'santo-prueba', nombre: 'Santo de prueba', rareza: 'comun' };
const perfil = extra => ({ monedas: 1000, inventario: [], coleccion: [], nivelesCompletados: [], ...extra });
const aplicar = (data, operacion) => ({ ...data, ...(operacion.cambios ?? {}) });

test('cada poción comprada existe después de guardar y se consume solo una', () => {
  let data = perfil();
  data = aplicar(data, prepararCompra(data, 'pocion_sabiduria', { ahora }));
  data = aplicar(data, prepararCompra(data, 'pocion_sabiduria', { ahora }));
  assert.equal(data.monedas, 760);
  assert.deepEqual(data.inventario, ['pocion_sabiduria', 'pocion_sabiduria']);
  data = aplicar(data, consumirUnidad(structuredClone(data), 'pocion_sabiduria'));
  assert.deepEqual(data.inventario, ['pocion_sabiduria']);
});

test('la oferta cobra exactamente el precio anunciado, incluso con saldo inferior al precio normal', () => {
  const oferta = ofertaDelDia(hoy);
  const compra = prepararCompra(perfil({ monedas: oferta.precioOferta }), oferta.id, { oferta: true, ahora });
  assert.equal(compra.resultado.precio, oferta.precioOferta);
  assert.equal(compra.cambios.monedas, 0);
});

test('una oferta de otro día no se puede usar para otro producto', () => {
  assert.throws(() => prepararCompra(perfil(), 'pocion_sabiduria', { oferta: true, ahora }), /oferta cambió/);
});

test('saldo insuficiente, productos desconocidos y precios enviados por UI no permiten cobros arbitrarios', () => {
  const data = perfil({ monedas: 119 });
  assert.throws(() => prepararCompra(data, 'pocion_sabiduria', { ahora, precio: 0 }), /monedas/);
  assert.throws(() => prepararCompra(data, 'objeto-inventado', { ahora }), /disponible/);
  assert.equal(data.monedas, 119);
  assert.deepEqual(data.inventario, []);
});

test('se rechaza la tercera poción del día sin cobrar', () => {
  const data = perfil({ pocionesHoy: 2, ultimaFechaPocion: hoy });
  assert.throws(() => prepararCompra(data, 'pocion_sabiduria', { ahora }), /límite/);
  assert.equal(data.monedas, 1000);
});

test('el límite diario vuelve a cero en la primera compra de otro día', () => {
  const data = perfil({ pocionesHoy: 2, ultimaFechaPocion: '2026-11-16' });
  const compra = prepararCompra(data, 'pocion_sabiduria', { ahora });
  assert.equal(compra.cambios.pocionesHoy, 1);
  assert.equal(compra.cambios.ultimaFechaPocion, hoy);
});

test('un inventario de tres pociones no admite otra unidad', () => {
  const data = perfil({ inventario: Array(3).fill('pocion_sabiduria') });
  assert.throws(() => prepararCompra(data, 'pocion_sabiduria', { ahora }), /lleno/);
});

test('no se puede consumir un objeto inexistente ni borrar otros consumibles', () => {
  const data = perfil({ inventario: ['doble_xp', 'escudo_miguel'] });
  assert.equal(consumirUnidad(data, 'pocion_sabiduria').resultado, false);
  assert.deepEqual(consumirUnidad(data, 'escudo_miguel').cambios.inventario, ['doble_xp']);
});

test('un corazón recupera una vida activa, ignorando registros ya regenerados', () => {
  const data = perfil({ vidasPerdidas: [ahora - 86400000, ahora - 1000, ahora - 500] });
  const compra = prepararCompra(data, 'corazon_extra', { ahora });
  assert.equal(compra.cambios.monedas, 850);
  assert.deepEqual(compra.cambios.vidasPerdidas, [ahora - 500]);
});

test('con vidas completas no se cobra un corazón', () => {
  assert.throws(() => prepararCompra(perfil({ vidasPerdidas: [ahora - 86400000] }), 'corazon_extra', { ahora }), /completas/);
});

test('cofre nuevo: el cobro, santo y contador se guardan juntos', () => {
  const compra = prepararCompra(perfil(), 'cofre_madera', { ahora, santo: comun });
  assert.equal(compra.cambios.monedas, 800);
  assert.deepEqual(compra.cambios.coleccion, [comun.id]);
  assert.equal(compra.cambios.cofresAbiertos, 1);
  assert.equal(compra.cambios.cofresMaderaHoy, 1);
});

test('un cofre repetido entrega su compensación sin duplicar el santo', () => {
  const data = perfil({ coleccion: [comun.id] });
  const compra = prepararCompra(data, 'cofre_madera', { ahora, santo: comun });
  assert.equal(compra.cambios.monedas, 850);
  assert.equal(compra.resultado.recompensa.compensacion, 50);
  assert.deepEqual(aplicar(data, compra).coleccion, [comun.id]);
});

test('si no se puede preparar un santo, no se cobra ni se consume el límite', () => {
  const data = perfil();
  assert.throws(() => prepararCompra(data, 'cofre_oro', { ahora }), /cofre/);
  assert.equal(data.monedas, 1000);
  assert.equal(data.cofresOroHoy, undefined);
});

test('un cosmético no se cobra dos veces y los marcos quedan disponibles para equipar', () => {
  let data = perfil();
  data = aplicar(data, prepararCompra(data, 'marco_vitral_azul', { ahora }));
  assert.equal(data.monedas, 650);
  assert.equal(data.marcoEquipado, 'marco_vitral_azul');
  assert.deepEqual(data.marcosDesbloqueados, ['marco_vitral_azul']);
  assert.throws(() => prepararCompra(data, 'marco_vitral_azul', { ahora }), /tienes/);
});

test('Doble XP consume una unidad al comenzar y duplica las monedas reales de esa sesión', () => {
  let data = perfil({ inventario: ['doble_xp', 'doble_xp'] });
  data = aplicar(data, iniciarSesionLeccion(data, 'senal_de_la_cruz', 'sesion-1'));
  assert.deepEqual(data.inventario, ['doble_xp']);
  const premio = premiarEjercicio(data, 'sesion-1', 'verso:0', 4);
  assert.equal(premio.resultado, 8);
  data = aplicar(data, premio);
  assert.equal(data.monedas, 1008);
  assert.equal(premiarEjercicio(data, 'sesion-1', 'verso:0', 4).resultado, 0);
});

test('sin Doble XP no se consume otro objeto ni se multiplican las monedas', () => {
  let data = perfil({ inventario: ['pocion_sabiduria'] });
  data = aplicar(data, iniciarSesionLeccion(data, 'senal_de_la_cruz', 'sesion-1'));
  assert.deepEqual(data.inventario, ['pocion_sabiduria']);
  assert.equal(premiarEjercicio(data, 'sesion-1', 'verso:0', 4).resultado, 4);
});

test('recargar y reabrir la misma lección conserva el Doble XP sin gastar una segunda unidad', () => {
  let data = perfil({ inventario: ['doble_xp', 'doble_xp'] });
  data = aplicar(data, iniciarSesionLeccion(data, 'senal_de_la_cruz', 'sesion-1'));
  const reapertura = iniciarSesionLeccion(data, 'senal_de_la_cruz', 'sesion-2');
  assert.equal(reapertura.cambios, undefined);
  assert.equal(reapertura.resultado.id, 'sesion-1');
  assert.equal(reapertura.resultado.multiplicador, 2);
  assert.equal(data.inventario.length, 1);
});

test('repetir una lección recupera un título pendiente omitido, sin duplicar la recompensa', () => {
  let data = perfil({ nivelesCompletados: ['senal_de_la_cruz'], ultimaPrimeraLeccion: hoy });
  data = aplicar(data, iniciarSesionLeccion(data, 'senal_de_la_cruz', 'sesion-1'));
  const resultado = finalizarSesionLeccion(data, { sesionId: 'sesion-1', leccion: unidades[0].lecciones[0], unidades, santo: comun, tituloId: 'titulo-prueba', hoy });
  assert.deepEqual(resultado.cambios.logrosPendientes.map(t => t.id), ['titulo-prueba']);
  assert.equal(resultado.resultado.recompensa, undefined);
  assert.equal(resultado.cambios.monedas, 1000);
});

test('otra pestaña no puede seguir cobrando con una sesión reemplazada', () => {
  const data = aplicar(perfil(), iniciarSesionLeccion(perfil(), 'senal_de_la_cruz', 'nueva'));
  assert.throws(() => premiarEjercicio(data, 'antigua', 'verso:0', 25), /otra pestaña/);
});

function finalizar(data, extra = {}) {
  return finalizarSesionLeccion(data, { sesionId: 'sesion-1', leccion: unidades[0].lecciones[0],
    unidades, santo: comun, hoy, definiciones, ...extra });
}

test('la primera finalización paga cofre y bonus diario en el mismo guardado que el progreso', () => {
  let data = perfil();
  data = aplicar(data, iniciarSesionLeccion(data, 'senal_de_la_cruz', 'sesion-1'));
  const premio = finalizar(data);
  assert.equal(premio.cambios.nivelActual, 2);
  assert.equal(premio.cambios.monedas, 1050);
  assert.deepEqual(premio.cambios.coleccion, [comun.id]);
  assert.equal(premio.cambios.ultimaPrimeraLeccion, hoy);
  data = aplicar(data, premio);
  assert.equal(finalizar(data).cambios, undefined);
  assert.throws(() => premiarEjercicio(data, 'sesion-1', 'verso:0', 25), /terminó/);
});

test('repetir una lección no entrega otro cofre, bono de concepto ni bonus diario ya cobrado', () => {
  let data = perfil({ nivelesCompletados: ['senal_de_la_cruz'], ultimaPrimeraLeccion: hoy, jugóHoy: hoy });
  data = aplicar(data, iniciarSesionLeccion(data, 'senal_de_la_cruz', 'sesion-1'));
  const resultado = finalizar(data);
  assert.equal(resultado.resultado.primera, false);
  assert.equal(resultado.resultado.recompensa, undefined);
  assert.equal(resultado.cambios.monedas, 1000);
  assert.equal(resultado.cambios.cofresAbiertos, undefined);
});

test('el bono de concepto anunciado se abona una vez y Doble XP lo duplica', () => {
  const leccion = unidades.flatMap(u => u.lecciones).find(l => l.tipo === 'concepto');
  let data = perfil({ inventario: ['doble_xp'], ultimaPrimeraLeccion: hoy, jugóHoy: hoy });
  data = aplicar(data, iniciarSesionLeccion(data, leccion.id, 'sesion-1'));
  const premio = finalizar(data, { leccion });
  assert.equal(premio.resultado.bonus, 200);
  assert.equal(premio.cambios.monedas, 1200);
  data = aplicar(data, premio);
  assert.equal(finalizar(data, { leccion }).cambios, undefined);
});

test('un examen ya aprobado no concede otro bono de 200 ni otro cofre', () => {
  let data = perfil();
  const premio = premiarExamen(data, 'u1', comun);
  assert.equal(premio.resultado.monedas, 200);
  data = aplicar(data, premio);
  assert.equal(premiarExamen(data, 'u1', comun).resultado.monedas, 0);
  assert.equal(data.monedas, 1200);
  assert.equal(data.cofresAbiertos, 1);
});

test('la misma respuesta de examen no cobra dos veces al reintentar', () => {
  const p = premiarRespuestaExamen(perfil(), 'examen:u1:intento:0', 50, definiciones);
  const data = aplicar(perfil(), p);
  assert.equal(data.monedas, 1050);
  assert.equal(premiarRespuestaExamen(data, 'examen:u1:intento:0', 50, definiciones).resultado, 0);
});

test('el protector cubre un solo día y solo consume una unidad una vez', () => {
  const data = perfil({ racha: 5, jugóHoy: '2026-11-15', inventario: ['protector_racha', 'protector_racha'] });
  const protegido = aplicar(data, protegerRacha(data, hoy));
  assert.equal(protegido.racha, 5);
  assert.equal(protegido.inventario.length, 1);
  assert.equal(protegerRacha(protegido, hoy).cambios, undefined);
  const dia = registrarActividadDiaria(protegido, hoy);
  assert.equal(dia.resultado.racha, 6);
  assert.equal(dia.resultado.monedas, 100);
  assert.equal(registrarActividadDiaria(aplicar(protegido, dia), hoy).resultado, null);
});

test('una ausencia de varios días reinicia la racha sin gastar un protector inútilmente', () => {
  const data = perfil({ racha: 8, jugóHoy: '2026-11-13', inventario: ['protector_racha'] });
  const premio = registrarActividadDiaria(data, hoy);
  assert.equal(premio.resultado.racha, 1);
  assert.equal(premio.resultado.monedas, 50);
  assert.deepEqual(aplicar(data, premio).inventario, ['protector_racha']);
});

test('el bonus de racha usa la racha nueva en el umbral de tres días', () => {
  const premio = registrarActividadDiaria(perfil({ racha: 2, jugóHoy: '2026-11-16' }), hoy);
  assert.deepEqual(premio.resultado, { monedas: 100, racha: 3 });
});

test('canjear una misión marca el cobro y entrega el premio definido, no uno enviado por UI', () => {
  const misiones = normalizarMisiones(null, definiciones, hoy);
  misiones.diarias.d1.progreso = 3;
  let data = perfil({ misiones });
  const premio = reclamarPremioMision(data, definiciones, 'diarias', 'd1', hoy);
  data = aplicar(data, premio);
  assert.equal(data.monedas, 1050);
  assert.equal(data.misiones.diarias.d1.reclamada, true);
  assert.equal(reclamarPremioMision(data, definiciones, 'diarias', 'd1', hoy).resultado, false);
});

test('una misión incompleta o caducada no concede monedas', () => {
  const misiones = normalizarMisiones(null, definiciones, '2026-11-16');
  misiones.diarias.d1.progreso = 3;
  assert.equal(reclamarPremioMision(perfil({ misiones }), definiciones, 'diarias', 'd1', hoy).resultado, false);
  assert.throws(() => reclamarPremioMision(perfil(), definiciones, 'inventado', 'd1', hoy), /Misión/);
});

test('los avances sucesivos de misiones no pisan las monedas ni el progreso anterior', () => {
  let data = perfil();
  data = aplicar(data, avanzarMisiones(data, definiciones, 'monedas', 30, hoy));
  data = aplicar(data, avanzarMisiones(data, definiciones, 'lecciones', 1, hoy));
  data = aplicar(data, avanzarMisiones(data, definiciones, 'monedas', 40, hoy));
  assert.equal(data.misiones.diarias.d2.progreso, 70);
  assert.equal(data.misiones.diarias.d1.progreso, 1);
  assert.equal(data.monedas, 1000);
});

test('cinco niveles distintos no se consiguen repitiendo cinco veces el mismo', () => {
  let data = perfil();
  for (let i = 0; i < 5; i++) data = aplicar(data, avanzarMisiones(data, definiciones, 'niveles', 1, hoy, 'senal_de_la_cruz'));
  assert.equal(data.misiones.semanales.s2.progreso, 1);
});

test('un título comprado se entrega y cobra una vez; su canje gratuito exige un logro pendiente', () => {
  const titulo = { id: 'titulo-prueba', nombre: 'Prueba', precio: 500, rareza: 'raro' };
  const data = aplicar(perfil(), comprarTitulo(perfil(), titulo, ahora));
  assert.equal(data.monedas, 500);
  assert.equal(data.tituloEquipado, titulo.id);
  assert.throws(() => comprarTitulo(data, titulo, ahora), /tienes/);
  assert.equal(canjearTitulo(perfil(), titulo, ahora).resultado, false);
  const canje = canjearTitulo(perfil({ logrosPendientes: [{ id: titulo.id }] }), titulo, ahora);
  assert.deepEqual(canje.cambios.logrosPendientes, []);
  assert.equal(canje.cambios.monedas, undefined);
});

test('la regeneración y la resta usan vidas actuales sin resucitar registros caducados', () => {
  const data = perfil({ vidasPerdidas: [ahora - 86400000, ahora - 1000] });
  assert.equal(modificarVidas(data, 'regenerar', ahora).resultado, 4);
  assert.equal(modificarVidas(data, 'restar', ahora).resultado, 3);
  assert.equal(modificarVidas(data, 'añadir', ahora).resultado, 5);
});

test('una escritura rechazada no informa éxito ni aplica solo la mitad de la compra', async () => {
  const data = perfil();
  const transaction = {
    get: async () => ({ exists: () => true, data: () => structuredClone(data) }),
    update: () => { throw new Error('permission-denied'); },
  };
  await assert.rejects(operarUsuario(transaction, {}, d => prepararCompra(d, 'pocion_sabiduria', { ahora })), /permission-denied/);
  assert.equal(data.monedas, 1000);
  assert.deepEqual(data.inventario, []);
});

test('dos compras concurrentes compiten por el saldo real y no lo dejan negativo', async () => {
  let data = perfil({ monedas: 150 });
  let cola = Promise.resolve();
  const transact = operacion => {
    const siguiente = cola.then(async () => {
      let cambios;
      const resultado = await operarUsuario({
        get: async () => ({ exists: () => true, data: () => structuredClone(data) }),
        update: (_ref, update) => { cambios = update; },
      }, {}, operacion);
      data = { ...data, ...cambios };
      return resultado;
    });
    cola = siguiente.catch(() => {});
    return siguiente;
  };
  const resultados = await Promise.allSettled([
    transact(d => prepararCompra(d, 'pocion_sabiduria', { ahora })),
    transact(d => prepararCompra(d, 'pocion_sabiduria', { ahora })),
  ]);
  assert.equal(resultados.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(data.monedas, 30);
  assert.equal(data.inventario.length, 1);
});

test('un santo raro o legendario de recompensa conserva su compensación original', () => {
  for (const [rareza, monedas] of [['raro', 100], ['legendario', 200]]) {
    const santo = { ...comun, rareza };
    assert.equal(entregarColeccionable(perfil({ coleccion: [santo.id] }), santo).resultado.compensacion, monedas);
  }
});

test('se mantienen los mínimos de compensación originales de los cofres comprados', () => {
  for (const [id, precio, minimo] of [['cofre_plata', 300, 100], ['cofre_oro', 450, 200]]) {
    const compra = prepararCompra(perfil({ coleccion: [comun.id] }), id, { ahora, santo: comun });
    assert.equal(compra.resultado.recompensa.compensacion, minimo);
    assert.equal(compra.cambios.monedas, 1000 - precio + minimo);
  }
});
