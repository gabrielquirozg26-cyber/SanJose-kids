import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';

// ── Configuración de rarezas para estilos visuales ──
const RAREZA_STYLES = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300 shadow-slate-500/20',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300 shadow-blue-500/20',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300 shadow-purple-500/20',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300 shadow-yellow-500/20',
};

const COFRE_STYLES = {
  madera: 'from-amber-800/30 to-amber-600/10 border-amber-600/50 shadow-amber-600/20',
  plata: 'from-slate-400/30 to-slate-300/10 border-slate-400/50 shadow-slate-400/20',
  oro: 'from-yellow-400/30 to-amber-300/10 border-yellow-400/50 shadow-yellow-400/20',
};

const Toast = ({ mensaje, tipo }) => (
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
  } = useGame();

  const [toast, setToast] = useState(null);
  const [comprando, setComprando] = useState(false);

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(null), 2500);
  };

  // ── Handlers de compra con feedback visual ──
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
    <div className="py-6 space-y-6 animate-slide-up">
      {toast && <Toast mensaje={toast} />}

      {/* Header con monedas y balance */}
      <div className="glass-card rounded-3xl p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Tu balance</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-4xl animate-float">🪙</span>
          <span className="text-5xl font-black text-yellow-400 drop-shadow-lg">{monedas.toLocaleString()}</span>
        </div>
        <p className="text-white/30 text-[10px] mt-1">¡Gasta sabiamente, joven catequista!</p>
      </div>

      {/* Oferta del día (destacada) */}
      {ofertaDiaria && (
        <div className="glass-card rounded-3xl p-5 border-2 border-yellow-400/60 bg-gradient-to-r from-yellow-400/15 to-amber-400/15 shadow-yellow-400/30 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl animate-bounce">🔥</span>
            <p className="text-yellow-400 font-black text-xs uppercase tracking-widest">Oferta del día</p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-5xl">{ofertaDiaria.icono}</span>
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
                className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg"
              >
                {ofertaDiaria.precioOferta} 🪙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sección: Cofres Misteriosos */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎁</span>
          <h3 className="text-white/80 font-black text-sm uppercase tracking-wider">Cofres Misteriosos</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Cofre de Madera */}
          <div className={`glass-card rounded-3xl p-4 border bg-gradient-to-br ${COFRE_STYLES.madera} transition-all hover:scale-105 hover:shadow-xl`}>
            <div className="text-center">
              <span className="text-5xl">📦</span>
              <h4 className="font-black text-white text-lg mt-2">Cofre de Madera</h4>
              <p className="text-white/40 text-xs">Contiene un santo común o raro</p>
              <p className="text-amber-400 font-black text-sm mt-2">250 🪙</p>
              <p className="text-white/30 text-[9px] mt-1">Límite: {cofresMaderaCompradosHoy}/3 hoy</p>
              <button
                onClick={() => handleCompra(comprarCofreMadera, 'Cofre de Madera', 250)}
                disabled={cofresMaderaCompradosHoy >= 3 || monedas < 250}
                className={`mt-3 w-full py-2 rounded-xl font-black text-sm transition-all ${
                  cofresMaderaCompradosHoy >= 3 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                {cofresMaderaCompradosHoy >= 3 ? 'Límite diario' : 'Comprar'}
              </button>
            </div>
          </div>
          {/* Cofre de Plata */}
          <div className={`glass-card rounded-3xl p-4 border bg-gradient-to-br ${COFRE_STYLES.plata} transition-all hover:scale-105 hover:shadow-xl`}>
            <div className="text-center">
              <span className="text-5xl">🎁</span>
              <h4 className="font-black text-white text-lg mt-2">Cofre de Plata</h4>
              <p className="text-white/40 text-xs">Santo raro o legendario</p>
              <p className="text-slate-300 font-black text-sm mt-2">350 🪙</p>
              <p className="text-white/30 text-[9px] mt-1">Límite: {cofresPlataCompradosHoy}/2 hoy</p>
              <button
                onClick={() => handleCompra(comprarCofrePlata, 'Cofre de Plata', 350)}
                disabled={cofresPlataCompradosHoy >= 2 || monedas < 350}
                className={`mt-3 w-full py-2 rounded-xl font-black text-sm transition-all ${
                  cofresPlataCompradosHoy >= 2 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-slate-500 text-white hover:bg-slate-400'
                }`}
              >
                {cofresPlataCompradosHoy >= 2 ? 'Límite diario' : 'Comprar'}
              </button>
            </div>
          </div>
          {/* Cofre de Oro */}
          <div className={`glass-card rounded-3xl p-4 border bg-gradient-to-br ${COFRE_STYLES.oro} transition-all hover:scale-105 hover:shadow-xl`}>
            <div className="text-center">
              <span className="text-5xl">🏆</span>
              <h4 className="font-black text-white text-lg mt-2">Cofre de Oro</h4>
              <p className="text-white/40 text-xs">Santo legendario garantizado</p>
              <p className="text-yellow-400 font-black text-sm mt-2">500 🪙</p>
              <p className="text-white/30 text-[9px] mt-1">Límite: {cofresOroCompradosHoy}/1 hoy</p>
              <button
                onClick={() => handleCompra(comprarCofreOro, 'Cofre de Oro', 500)}
                disabled={cofresOroCompradosHoy >= 1 || monedas < 500}
                className={`mt-3 w-full py-2 rounded-xl font-black text-sm transition-all ${
                  cofresOroCompradosHoy >= 1 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-yellow-500 text-blue-900 hover:bg-yellow-400'
                }`}
              >
                {cofresOroCompradosHoy >= 1 ? 'Límite diario' : 'Comprar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Recuperación (consumibles) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">❤️</span>
          <h3 className="text-white/80 font-black text-sm uppercase tracking-wider">Recuperación</h3>
        </div>
        <div className="space-y-3">
          {/* Corazón Extra */}
          <div className="glass-card rounded-3xl p-4 border border-red-500/30 bg-red-500/5 transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-4">
              <span className="text-5xl">❤️</span>
              <div className="flex-1">
                <h4 className="font-black text-white text-lg">Corazón Extra</h4>
                <p className="text-white/40 text-xs">Recupera 1 vida. Máximo 3 por día.</p>
                {vidas >= 5 && <p className="text-green-400 text-[9px] font-black mt-1">Vidas completas</p>}
                {corazonesCompradosHoy >= 3 && <p className="text-orange-400 text-[9px] font-black mt-1">Límite diario alcanzado</p>}
              </div>
              <button
                onClick={() => handleCompra(comprarCorazon, 'Corazón Extra', 200)}
                disabled={corazonesCompradosHoy >= 3 || vidas >= 5 || monedas < 200}
                className="px-5 py-2 rounded-xl font-black text-sm bg-red-500 text-white hover:bg-red-400 disabled:bg-white/5 disabled:text-white/20 transition-all"
              >
                {corazonesCompradosHoy >= 3 ? 'Límite' : vidas >= 5 ? 'Completas' : '200 🪙'}
              </button>
            </div>
          </div>

          {/* Escudo de San Miguel */}
          <div className="glass-card rounded-3xl p-4 border border-blue-500/30 bg-blue-500/5 transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🛡️</span>
              <div className="flex-1">
                <h4 className="font-black text-white text-lg">Escudo de San Miguel</h4>
                <p className="text-white/40 text-xs">Te protege de un error en la lección.</p>
                {inventario.includes('escudo_miguel') && <p className="text-green-400 text-[9px] font-black mt-1">✓ Equipado</p>}
              </div>
              <button
                onClick={() => handleCompra(() => comprarItem({ id: 'escudo_miguel', nombre: 'Escudo de San Miguel', precio: 100 }), 'Escudo de San Miguel', 100)}
                disabled={inventario.includes('escudo_miguel') || monedas < 100}
                className="px-5 py-2 rounded-xl font-black text-sm bg-blue-500 text-white hover:bg-blue-400 disabled:bg-white/5 disabled:text-white/20 transition-all"
              >
                {inventario.includes('escudo_miguel') ? '✓ Equipado' : '100 🪙'}
              </button>
            </div>
          </div>

          {/* Poción de Sabiduría */}
          <div className="glass-card rounded-3xl p-4 border border-purple-500/30 bg-purple-500/5 transition-all hover:scale-[1.01]">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🧪</span>
              <div className="flex-1">
                <h4 className="font-black text-white text-lg">Poción de Sabiduría</h4>
                <p className="text-white/40 text-xs">Elimina opciones incorrectas. Máx 2/día y 3 en inventario.</p>
                {pocionesCompradasHoy >= 2 && <p className="text-orange-400 text-[9px] font-black mt-1">Límite diario alcanzado</p>}
                {inventario.filter(i => i === 'pocion_sabiduria').length >= 3 && <p className="text-red-400 text-[9px] font-black mt-1">Inventario lleno</p>}
              </div>
              <button
                onClick={() => handleCompra(comprarPocion, 'Poción de Sabiduría', 150)}
                disabled={pocionesCompradasHoy >= 2 || inventario.filter(i => i === 'pocion_sabiduria').length >= 3 || monedas < 150}
                className="px-5 py-2 rounded-xl font-black text-sm bg-purple-500 text-white hover:bg-purple-400 disabled:bg-white/5 disabled:text-white/20 transition-all"
              >
                {pocionesCompradasHoy >= 2 ? 'Límite diario' : inventario.filter(i => i === 'pocion_sabiduria').length >= 3 ? 'Lleno' : '150 🪙'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Personalización (cosméticos) */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">✨</span>
          <h3 className="text-white/80 font-black text-sm uppercase tracking-wider">Personalización</h3>
        </div>
        <div className="space-y-3">
          {[
            { id: 'titulo_guardian', nombre: 'Título: Guardián del Credo', icono: '⚜️', precio: 500, rareza: 'epico', desc: 'Cambia tu rango visible.' },
            { id: 'titulo_maestro', nombre: 'Título: Maestro de la Fe', icono: '👑', precio: 800, rareza: 'legendario', desc: 'El rango más alto.' },
            { id: 'aura_santidad', nombre: 'Aura de Santidad', icono: '✨', precio: 300, rareza: 'raro', desc: 'Efecto brillante en perfil.' },
            { id: 'marco_vitral_azul', nombre: 'Marco Vitral Azul', icono: '🔵', precio: 250, rareza: 'raro', desc: 'Borde azul para avatar.' },
            { id: 'marco_vitral_dorado', nombre: 'Marco Vitral Dorado', icono: '🟡', precio: 400, rareza: 'epico', desc: 'Borde dorado para avatar.' },
          ].map((item) => (
            <div key={item.id} className={`glass-card rounded-3xl p-4 border ${RAREZA_STYLES[item.rareza]} transition-all hover:scale-[1.01]`}>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{item.icono}</span>
                <div className="flex-1">
                  <h4 className="font-black text-white text-lg">{item.nombre}</h4>
                  <p className="text-white/40 text-xs">{item.desc}</p>
                  {inventario.includes(item.id) && <p className="text-green-400 text-[9px] font-black mt-1">✓ Equipado</p>}
                </div>
                <button
                  onClick={() => handleCompra(() => comprarItem(item), item.nombre, item.precio)}
                  disabled={inventario.includes(item.id) || monedas < item.precio}
                  className="px-5 py-2 rounded-xl font-black text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 disabled:bg-white/5 disabled:text-white/20 transition-all"
                >
                  {inventario.includes(item.id) ? '✓' : `${item.precio} 🪙`}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] pb-4">
        Los objetos se aplican automáticamente al comprarlos
      </p>
    </div>
  );
};

export default Tienda;