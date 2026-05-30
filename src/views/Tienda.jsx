import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import TitulosModal from '../components/TitulosModal';

const RAREZA_STYLES = {
  comun: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  raro: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  epico: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  legendario: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
  divino: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
};

const COFRE_STYLES = {
  madera: 'from-amber-800/30 to-amber-600/10 border-amber-600/50',
  plata: 'from-slate-400/30 to-slate-300/10 border-slate-400/50',
  oro: 'from-yellow-400/30 to-amber-300/10 border-yellow-400/50',
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
    comprarTituloLegendario,
  } = useGame();

  const [toast, setToast] = useState(null);
  const [comprando, setComprando] = useState(false);
  const [modalTitulosOpen, setModalTitulosOpen] = useState(false);

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
    <div className="py-6 space-y-6 animate-slide-up">
      {toast && <Toast mensaje={toast} />}

      {/* Header con monedas */}
      <div className="glass-card rounded-3xl p-5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Tu balance</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-4xl animate-float drop-shadow-lg">🪙</span>
          <span className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
            {monedas.toLocaleString()}
          </span>
        </div>
        <p className="text-white/30 text-xs mt-2">¡Invierte en tu fe!</p>
      </div>

      {/* Oferta del día destacada */}
      {ofertaDiaria && (
        <div className="glass-card rounded-3xl p-4 border-2 border-yellow-400/60 bg-gradient-to-r from-yellow-400/20 to-amber-400/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{ofertaDiaria.icono}</span>
              <div>
                <p className="text-yellow-400 font-black text-xs uppercase tracking-wider">🔥 OFERTA DEL DÍA</p>
                <p className="font-black text-white text-sm">{ofertaDiaria.nombre}</p>
                <p className="text-white/40 text-[10px]">{ofertaDiaria.descripcion}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs line-through">{ofertaDiaria.precioOriginal} 🪙</p>
              <button
                onClick={() => {
                  if (ofertaDiaria.id === 'corazon_extra') handleCompra(comprarCorazon, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else if (ofertaDiaria.id === 'tiquete_oro') handleCompra(comprarTiqueteOro, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else if (ofertaDiaria.id === 'pocion_sabiduria') handleCompra(comprarPocion, ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                  else handleCompra(() => comprarItem({ ...ofertaDiaria, precio: ofertaDiaria.precioOferta }), ofertaDiaria.nombre, ofertaDiaria.precioOferta);
                }}
                className="bg-yellow-400 text-blue-900 px-5 py-2 rounded-xl font-black text-sm hover:scale-105 transition-all"
              >
                {ofertaDiaria.precioOferta} 🪙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categorías: Consumibles, Cofres, Personalización */}
      <div className="space-y-8">
        
        {/* ========== CONSUMIBLES ========== */}
        <div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
            <span>⚡</span> Consumibles
          </h3>
          <div className="space-y-3">
            {/* Corazón Extra */}
            <ItemCard
              icon="❤️"
              title="Corazón Extra"
              desc="Recupera 1 vida. Máx 3 por día."
              price={200}
              disabledReason={corazonesCompradosHoy >= 3 ? 'Límite diario' : vidas >= 5 ? 'Vidas completas' : null}
              onBuy={() => handleCompra(comprarCorazon, 'Corazón Extra', 200)}
            />
            {/* Escudo de San Miguel */}
            <ItemCard
              icon="🛡️"
              title="Escudo de San Miguel"
              desc="Te protege de un error en la lección."
              price={100}
              owned={inventario.includes('escudo_miguel')}
              onBuy={() => handleCompra(() => comprarItem({ id: 'escudo_miguel', nombre: 'Escudo de San Miguel', precio: 100 }), 'Escudo de San Miguel', 100)}
            />
            {/* Poción de Sabiduría */}
            <ItemCard
              icon="🧪"
              title="Poción de Sabiduría"
              desc="Elimina opciones incorrectas. Máx 2/día, 3 en inventario."
              price={150}
              disabledReason={pocionesCompradasHoy >= 2 ? 'Límite diario' : (inventario.filter(i => i === 'pocion_sabiduria').length >= 3 ? 'Inventario lleno' : null)}
              onBuy={() => handleCompra(comprarPocion, 'Poción de Sabiduría', 150)}
            />
            {/* Tiquete de Oro */}
            <ItemCard
              icon="🎫"
              title="Tiquete de Oro"
              desc="Abre un cofre de oro instantáneo (1 uso/día)."
              price={350}
              onBuy={() => handleCompra(comprarTiqueteOro, 'Tiquete de Oro', 350)}
            />
          </div>
        </div>

        {/* ========== COFRES MISTERIOSOS ========== */}
        <div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
            <span>🎁</span> Cofres Misteriosos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CofreCard
              tipo="madera"
              nombre="Cofre de Madera"
              icono="📦"
              desc="Santo común o raro"
              precio={250}
              limite={cofresMaderaCompradosHoy}
              max={3}
              onComprar={() => handleCompra(comprarCofreMadera, 'Cofre de Madera', 250)}
            />
            <CofreCard
              tipo="plata"
              nombre="Cofre de Plata"
              icono="🎁"
              desc="Santo raro o legendario"
              precio={350}
              limite={cofresPlataCompradosHoy}
              max={2}
              onComprar={() => handleCompra(comprarCofrePlata, 'Cofre de Plata', 350)}
            />
            <CofreCard
              tipo="oro"
              nombre="Cofre de Oro"
              icono="🏆"
              desc="Santo legendario"
              precio={500}
              limite={cofresOroCompradosHoy}
              max={1}
              onComprar={() => handleCompra(comprarCofreOro, 'Cofre de Oro', 500)}
            />
          </div>
        </div>

        {/* ========== PERSONALIZACIÓN ========== */}
        <div>
          <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
            <span>✨</span> Personalización
          </h3>
          <div className="space-y-3">
            {/* Títulos Legendarios (botón que abre modal) */}
            <div className="glass-card rounded-2xl p-4 border border-purple-500/30 bg-purple-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">👑</span>
                  <div>
                    <p className="font-black text-white text-lg">Títulos Legendarios</p>
                    <p className="text-white/40 text-sm">Adquiere títulos exclusivos para lucir en tu perfil.</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalTitulosOpen(true)}
                  className="px-5 py-2 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 transition-all"
                >
                  Ver títulos
                </button>
              </div>
            </div>

            {/* Otros cosméticos (marcos, aura, títulos de tienda antigua) */}
            {[
              { id: 'titulo_guardian', nombre: 'Título: Guardián del Credo', icono: '⚜️', precio: 500, rareza: 'epico', desc: 'Cambia tu rango visible.' },
              { id: 'titulo_maestro', nombre: 'Título: Maestro de la Fe', icono: '👑', precio: 800, rareza: 'legendario', desc: 'El rango más alto.' },
              { id: 'aura_santidad', nombre: 'Aura de Santidad', icono: '✨', precio: 300, rareza: 'raro', desc: 'Efecto brillante en perfil.' },
              { id: 'marco_vitral_azul', nombre: 'Marco Vitral Azul', icono: '🔵', precio: 250, rareza: 'raro', desc: 'Borde azul para avatar.' },
              { id: 'marco_vitral_dorado', nombre: 'Marco Vitral Dorado', icono: '🟡', precio: 400, rareza: 'epico', desc: 'Borde dorado para avatar.' },
            ].map(item => (
              <ItemCard
                key={item.id}
                icon={item.icono}
                title={item.nombre}
                desc={item.desc}
                price={item.precio}
                rareza={item.rareza}
                owned={inventario.includes(item.id)}
                onBuy={() => handleCompra(() => comprarItem(item), item.nombre, item.precio)}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-white/20 text-[9px] font-black uppercase tracking-[0.3em] pb-4">
        Los objetos cosméticos se aplican automáticamente al comprarlos
      </p>

      {/* Modal de títulos legendarios */}
      <TitulosModal
        isOpen={modalTitulosOpen}
        onClose={() => setModalTitulosOpen(false)}
        onComprar={(titulo) => handleCompra(() => comprarTituloLegendario(titulo.id, titulo.nombre, titulo.rareza, titulo.precio), titulo.nombre, titulo.precio)}
      />
    </div>
  );
};

// Componente auxiliar para tarjetas de items (consumibles y cosméticos)
const ItemCard = ({ icon, title, desc, price, rareza, owned, disabledReason, onBuy }) => {
  const rarezaClass = rareza ? RAREZA_STYLES[rareza] : 'border-white/10 bg-white/5';
  const estaDeshabilitado = disabledReason || owned || (price && false); // si hay reason, deshabilitar
  const motivo = disabledReason || (owned ? '✓ Equipado' : null);

  return (
    <div className={`glass-card rounded-2xl p-4 border ${rarezaClass} transition-all hover:scale-[1.01]`}>
      <div className="flex items-center gap-4">
        <span className="text-5xl">{icon}</span>
        <div className="flex-1">
          <p className="font-black text-white text-lg">{title}</p>
          <p className="text-white/40 text-sm">{desc}</p>
          {motivo && <p className="text-green-400 text-[10px] font-black mt-1">{motivo}</p>}
        </div>
        <button
          onClick={onBuy}
          disabled={!!estaDeshabilitado}
          className="px-5 py-2 rounded-xl font-black text-sm bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-900 hover:scale-105 disabled:bg-white/10 disabled:text-white/30 transition-all"
        >
          {owned ? '✓' : `${price} 🪙`}
        </button>
      </div>
    </div>
  );
};

const CofreCard = ({ tipo, nombre, icono, desc, precio, limite, max, onComprar }) => {
  const estilo = COFRE_STYLES[tipo];
  return (
    <div className={`glass-card rounded-2xl p-4 border bg-gradient-to-br ${estilo} transition-all hover:scale-105`}>
      <div className="text-center">
        <span className="text-5xl">{icono}</span>
        <h4 className="font-black text-white text-lg mt-2">{nombre}</h4>
        <p className="text-white/40 text-xs">{desc}</p>
        <p className="text-yellow-400 font-black text-lg mt-2">{precio} 🪙</p>
        <p className="text-white/30 text-[10px] mt-1">Límite: {limite}/{max} hoy</p>
        <button
          onClick={onComprar}
          disabled={limite >= max || (precio && false)}
          className="mt-3 w-full py-2 rounded-xl font-black text-sm bg-yellow-600 text-white disabled:bg-white/10 disabled:text-white/30"
        >
          {limite >= max ? 'Límite diario' : 'Comprar'}
        </button>
      </div>
    </div>
  );
};

export default Tienda;