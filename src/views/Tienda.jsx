import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

// Estilos de rareza
const RAREZA_STYLES = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  divino: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
};

const COFRE_STYLES = {
  madera: 'from-amber-800/30 to-amber-600/10 border-amber-600/50 shadow-amber-600/20',
  plata: 'from-slate-400/30 to-slate-300/10 border-slate-400/50 shadow-slate-400/20',
  oro: 'from-yellow-400/30 to-amber-300/10 border-yellow-400/50 shadow-yellow-400/20',
};

const Toast = ({ mensaje }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl font-black text-sm shadow-2xl animate-slide-up bg-black/80 backdrop-blur border border-white/20">
    {mensaje}
  </div>
);

const Tienda = () => {
  const {
    monedas,
    vidas,
    inventario,
    comprarItem,
    comprarCorazon,
    comprarCofreMadera,
    comprarCofrePlata,
    comprarCofreOro,
    comprarPocion,
    comprarTiqueteOro,
    obtenerOfertaDiaria,
    corazonesCompradosHoy,
    cofresMaderaCompradosHoy,
    cofresPlataCompradosHoy,
    cofresOroCompradosHoy,
    pocionesCompradasHoy,
    setActiveTab,
    desbloquearTitulo,
    titulosDesbloqueados,
    titulosLegendarios,   // ← AHORA SÍ, del contexto (mayúscula)
    comprarTituloLegendario,
  } = useGame();

  const [toast, setToast] = useState(null);
  const [comprando, setComprando] = useState(false);

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCompra = async (func, nombre, precio) => {
    if (comprando) return;
    if (monedas < precio) {
      mostrarToast(`🪙 Necesitas ${precio - monedas} monedas más`);
      return;
    }
    setComprando(true);
    const ok = await func();
    setComprando(false);
    if (ok) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#facc15', '#fff'] });
      mostrarToast(`✅ ${nombre} adquirido`);
    } else {
      mostrarToast(`❌ No se pudo comprar ${nombre}`);
    }
  };

  const ofertaDiaria = obtenerOfertaDiaria();

  return (
    <div className="py-6 space-y-8 animate-slide-up">
      {toast && <Toast mensaje={toast} />}

      {/* HEADER PREMIUM */}
      <div className="glass-card rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Tu balance</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-5xl animate-float drop-shadow-lg">🪙</span>
          <span className="text-6xl font-black bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
            {monedas.toLocaleString()}
          </span>
        </div>
        <p className="text-white/30 text-xs mt-2">¡Gasta con sabiduría, joven catequista!</p>
      </div>

      {/* OFERTA DEL DÍA */}
      {ofertaDiaria && (
        <div className="glass-card rounded-3xl p-5 border-2 border-yellow-400/60 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 shadow-yellow-400/30 transition-all hover:scale-[1.02]">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-yellow-400/30 rounded-full p-1 animate-pulse">
              <span className="text-xl">🔥</span>
            </div>
            <p className="text-yellow-400 font-black text-xs uppercase tracking-widest">Oferta del día</p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-5xl drop-shadow-md">{ofertaDiaria.icono}</span>
              <div>
                <h3 className="font-black text-white text-lg">{ofertaDiaria.nombre}</h3>
                <p className="text-white/40 text-xs">{ofertaDiaria.descripcion}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-sm line-through">{ofertaDiaria.precioOriginal} 🪙</p>
              <button
                onClick={() => {
                  if (ofertaDiaria.id === 'corazon_extra') handleCompra(comprarCorazon, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else if (ofertaDiaria.id === 'tiquete_oro') handleCompra(comprarTiqueteOro, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else if (ofertaDiaria.id === 'pocion_sabiduria') handleCompra(comprarPocion, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else handleCompra(() => comprarItem({ ...ofertaDiaria, precio: ofertaDiaria.precioOferta }), ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                }}
                className="bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 px-6 py-2 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg"
              >
                {ofertaDiaria.precioOferta} 🪙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COFRES MISTERIOSOS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl animate-bounce">🎁</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">Cofres Misteriosos</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { comprar: comprarCofreMadera, style: COFRE_STYLES.madera, nombre: 'Cofre de Madera', icono: '📦', desc: 'Santo común o raro', precio: 250, limite: cofresMaderaCompradosHoy, max: 3, color: 'bg-amber-600' },
            { comprar: comprarCofrePlata, style: COFRE_STYLES.plata, nombre: 'Cofre de Plata', icono: '🎁', desc: 'Santo raro o legendario', precio: 350, limite: cofresPlataCompradosHoy, max: 2, color: 'bg-slate-500' },
            { comprar: comprarCofreOro, style: COFRE_STYLES.oro, nombre: 'Cofre de Oro', icono: '🏆', desc: 'Santo legendario', precio: 500, limite: cofresOroCompradosHoy, max: 1, color: 'bg-yellow-500' },
          ].map((item, idx) => (
            <div key={idx} className={`glass-card rounded-3xl p-5 border bg-gradient-to-br ${item.style} transition-all hover:scale-105 hover:shadow-2xl`}>
              <div className="text-center">
                <span className="text-6xl drop-shadow-md">{item.icono}</span>
                <h4 className="font-black text-white text-xl mt-2">{item.nombre}</h4>
                <p className="text-white/40 text-xs">{item.desc}</p>
                <p className={`font-black text-lg mt-3 ${item.color === 'bg-yellow-500' ? 'text-yellow-400' : 'text-amber-400'}`}>{item.precio} 🪙</p>
                <p className="text-white/30 text-[10px] mt-1">Límite: {item.limite}/{item.max} hoy</p>
                <button
                  onClick={() => handleCompra(item.comprar, item.nombre, item.precio)}
                  disabled={item.limite >= item.max || monedas < item.precio}
                  className={`mt-4 w-full py-2 rounded-xl font-black text-sm transition-all ${
                    item.limite >= item.max ? 'bg-white/10 text-white/30 cursor-not-allowed' : `${item.color} text-white hover:brightness-110 hover:scale-105`
                  }`}
                >
                  {item.limite >= item.max ? 'Límite diario' : 'Comprar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECUPERACIÓN */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">❤️</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-rose-200 bg-clip-text text-transparent">Recuperación</h3>
        </div>
        <div className="space-y-4">
          {/* Corazón Extra */}
          <div className="glass-card rounded-3xl p-4 border border-red-500/30 bg-red-500/5 transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-5">
              <span className="text-6xl">❤️</span>
              <div className="flex-1">
                <h4 className="font-black text-white text-xl">Corazón Extra</h4>
                <p className="text-white/40 text-sm">Recupera 1 vida. Máx 3 por día.</p>
                {vidas >= 5 && <p className="text-green-400 text-[10px] font-black mt-1">✨ Vidas completas ✨</p>}
                {corazonesCompradosHoy >= 3 && <p className="text-orange-400 text-[10px] font-black mt-1">⏰ Límite diario alcanzado</p>}
              </div>
              <button
                onClick={() => handleCompra(comprarCorazon, 'Corazón Extra', 200)}
                disabled={corazonesCompradosHoy >= 3 || vidas >= 5 || monedas < 200}
                className="px-6 py-2 rounded-xl font-black text-base bg-gradient-to-r from-red-500 to-rose-500 text-white hover:scale-105 disabled:bg-white/10 disabled:text-white/30 transition-all"
              >
                {corazonesCompradosHoy >= 3 ? 'Límite' : vidas >= 5 ? 'Completas' : '200 🪙'}
              </button>
            </div>
          </div>

          {/* Escudo de San Miguel */}
          <div className="glass-card rounded-3xl p-4 border border-blue-500/30 bg-blue-500/5 transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-5">
              <span className="text-6xl">🛡️</span>
              <div className="flex-1">
                <h4 className="font-black text-white text-xl">Escudo de San Miguel</h4>
                <p className="text-white/40 text-sm">Te protege de un error en la lección.</p>
                {inventario.includes('escudo_miguel') && <p className="text-green-400 text-[10px] font-black mt-1">✓ Equipado</p>}
              </div>
              <button
                onClick={() => handleCompra(() => comprarItem({ id: 'escudo_miguel', nombre: 'Escudo de San Miguel', precio: 100 }), 'Escudo de San Miguel', 100)}
                disabled={inventario.includes('escudo_miguel') || monedas < 100}
                className="px-6 py-2 rounded-xl font-black text-base bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-105 disabled:bg-white/10 disabled:text-white/30 transition-all"
              >
                {inventario.includes('escudo_miguel') ? '✓ Equipado' : '100 🪙'}
              </button>
            </div>
          </div>

          {/* Poción de Sabiduría */}
          <div className="glass-card rounded-3xl p-4 border border-purple-500/30 bg-purple-500/5 transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-5">
              <span className="text-6xl">🧪</span>
              <div className="flex-1">
                <h4 className="font-black text-white text-xl">Poción de Sabiduría</h4>
                <p className="text-white/40 text-sm">Elimina opciones incorrectas. Máx 2/día, 3 en inventario.</p>
                {pocionesCompradasHoy >= 2 && <p className="text-orange-400 text-[10px] font-black mt-1">⏰ Límite diario</p>}
                {inventario.filter(i => i === 'pocion_sabiduria').length >= 3 && <p className="text-red-400 text-[10px] font-black mt-1">📦 Inventario lleno</p>}
              </div>
              <button
                onClick={() => handleCompra(comprarPocion, 'Poción de Sabiduría', 150)}
                disabled={pocionesCompradasHoy >= 2 || inventario.filter(i => i === 'pocion_sabiduria').length >= 3 || monedas < 150}
                className="px-6 py-2 rounded-xl font-black text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 disabled:bg-white/10 disabled:text-white/30 transition-all"
              >
                {pocionesCompradasHoy >= 2 ? 'Límite' : inventario.filter(i => i === 'pocion_sabiduria').length >= 3 ? 'Lleno' : '150 🪙'}
              </button>
            </div>
          </div>

          {/* Tiquete de Oro */}
          <div className="glass-card rounded-3xl p-4 border border-yellow-500/30 bg-yellow-500/5 transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-5">
              <span className="text-6xl">🎫</span>
              <div className="flex-1">
                <h4 className="font-black text-white text-xl">Tiquete de Oro</h4>
                <p className="text-white/40 text-sm">Abre un cofre de oro instantáneo (1 uso/día).</p>
                {inventario.includes('tiquete_oro') && <p className="text-green-400 text-[10px] font-black mt-1">✓ En inventario</p>}
              </div>
              <button
                onClick={() => handleCompra(comprarTiqueteOro, 'Tiquete de Oro', 350)}
                disabled={monedas < 350}
                className="px-6 py-2 rounded-xl font-black text-base bg-gradient-to-r from-yellow-500 to-amber-500 text-blue-900 hover:scale-105 disabled:bg-white/10 disabled:text-white/30 transition-all"
              >
                {inventario.includes('tiquete_oro') ? '✓ Comprado' : '350 🪙'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PERSONALIZACIÓN */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">✨</span>
          <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Personalización</h3>
        </div>
        <div className="space-y-4">
          {[
            { id: 'titulo_guardian', nombre: 'Título: Guardián del Credo', icono: '⚜️', precio: 500, rareza: 'epico', desc: 'Cambia tu rango visible.' },
            { id: 'titulo_maestro', nombre: 'Título: Maestro de la Fe', icono: '👑', precio: 800, rareza: 'legendario', desc: 'El rango más alto.' },
            { id: 'aura_santidad', nombre: 'Aura de Santidad', icono: '✨', precio: 300, rareza: 'raro', desc: 'Efecto brillante en perfil.' },
            { id: 'marco_vitral_azul', nombre: 'Marco Vitral Azul', icono: '🔵', precio: 250, rareza: 'raro', desc: 'Borde azul para avatar.' },
            { id: 'marco_vitral_dorado', nombre: 'Marco Vitral Dorado', icono: '🟡', precio: 400, rareza: 'epico', desc: 'Borde dorado para avatar.' },
          ].map((item) => (
            <div key={item.id} className={`glass-card rounded-3xl p-4 border ${RAREZA_STYLES[item.rareza]} transition-all hover:scale-[1.02]`}>
              <div className="flex items-center gap-5">
                <span className="text-5xl">{item.icono}</span>
                <div className="flex-1">
                  <h4 className="font-black text-white text-lg">{item.nombre}</h4>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                  {inventario.includes(item.id) && <p className="text-green-400 text-[10px] font-black mt-1">✓ Equipado</p>}
                </div>
                <button
                  onClick={() => handleCompra(() => comprarItem(item), item.nombre, item.precio)}
                  disabled={inventario.includes(item.id) || monedas < item.precio}
                  className="px-6 py-2 rounded-xl font-black text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 disabled:bg-white/10 disabled:text-white/30 transition-all"
                >
                  {inventario.includes(item.id) ? '✓' : `${item.precio} 🪙`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TÍTULOS ÉPICOS (LEGENDARIOS) - solo si existen */}
      {titulosLegendarios && titulosLegendarios.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">👑</span>
            <h3 className="text-white font-black text-sm uppercase tracking-wider bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">Títulos Épicos</h3>
          </div>
          <div className="space-y-4">
            {titulosLegendarios.map(titulo => {
              const yaTiene = titulosDesbloqueados?.some(t => t.id === titulo.id) || false;
              return (
                <div key={titulo.id} className={`glass-card rounded-3xl p-4 border ${RAREZA_STYLES[titulo.rareza]} transition-all hover:scale-[1.02]`}>
                  <div className="flex items-center gap-5">
                    <span className="text-5xl">{titulo.icono}</span>
                    <div className="flex-1">
                      <h4 className="font-black text-white text-lg">{titulo.nombre}</h4>
                      <p className="text-white/40 text-sm">{titulo.descripcion}</p>
                      {yaTiene && <p className="text-green-400 text-[10px] font-black mt-1">✓ Desbloqueado</p>}
                    </div>
                    <button
                      onClick={() => handleCompra(() => comprarTituloLegendario(titulo.id, titulo.nombre, titulo.rareza, titulo.precio), titulo.nombre, titulo.precio)}
                      disabled={yaTiene || monedas < titulo.precio}
                      className="px-6 py-2 rounded-xl font-black text-base bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 disabled:bg-white/10 disabled:text-white/30 transition-all"
                    >
                      {yaTiene ? '✓' : `${titulo.precio} 🪙`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em] pb-6">
        Los objetos se aplican automáticamente al comprarlos
      </p>
    </div>
  );
};

export default Tienda;